import { Hono } from 'hono';
import {
  getGoogleAuthUrl,
  exchangeCodeForToken,
  fetchGoogleUserInfo,
  authenticateWithGoogle,
  getUserWithPlan,
} from '../services/authService';
import { authMiddleware } from '../middleware/auth';
import { validationError, serverError } from '../lib/errors';

const auth = new Hono<{ Bindings: Env }>();

// ============================================
// GET /api/auth/google/login
// Redirect to Google OAuth
// ============================================

auth.get('/google/login', (c) => {
  const clientId = c.env.GOOGLE_CLIENT_ID;
  const appDomain = c.env.APP_DOMAIN || 'snip.lento.dev';

  if (!clientId) {
    throw serverError('Google OAuth not configured');
  }

  // Generate redirect URI
  const redirectUri = `https://${appDomain}/callback`;

  // Generate state for CSRF protection (optional: could store in KV)
  const state = crypto.randomUUID();

  const authUrl = getGoogleAuthUrl(clientId, redirectUri, state);

  return c.redirect(authUrl, 302);
});

// ============================================
// POST /api/auth/google/callback
// Exchange code for token and authenticate
// ============================================

auth.post('/google/callback', async (c) => {
  const body = await c.req.json<{ code: string; redirect_uri?: string }>();

  if (!body.code) {
    throw validationError('code', 'Authorization code is required');
  }

  const clientId = c.env.GOOGLE_CLIENT_ID;
  const clientSecret = c.env.GOOGLE_CLIENT_SECRET;
  const jwtSecret = c.env.JWT_SECRET;
  const appDomain = c.env.APP_DOMAIN || 'snip.lento.dev';

  if (!clientId || !clientSecret || !jwtSecret) {
    throw serverError('OAuth not configured properly');
  }

  // Use provided redirect_uri or default
  const redirectUri = body.redirect_uri || `https://${appDomain}/callback`;

  try {
    // Exchange code for Google access token
    const googleAccessToken = await exchangeCodeForToken(
      body.code,
      clientId,
      clientSecret,
      redirectUri
    );

    // Fetch user info from Google
    const googleUser = await fetchGoogleUserInfo(googleAccessToken);

    // Authenticate/register user and get JWT
    const result = await authenticateWithGoogle(c.env.DB, googleUser, jwtSecret);

    return c.json({
      token: result.token,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        avatar_url: result.user.avatar_url,
        plan_id: result.user.plan_id,
        url_count_this_month: result.user.url_count_this_month,
        created_at: result.user.created_at,
      },
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    throw serverError('Authentication failed');
  }
});

// ============================================
// GET /api/auth/me
// Get current user info (requires auth)
// ============================================

auth.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId');

  const userWithPlan = await getUserWithPlan(c.env.DB, userId);

  if (!userWithPlan) {
    throw serverError('User not found');
  }

  return c.json({
    user: {
      id: userWithPlan.id,
      email: userWithPlan.email,
      name: userWithPlan.name,
      avatar_url: userWithPlan.avatar_url,
      plan_id: userWithPlan.plan_id,
      url_count_this_month: userWithPlan.url_count_this_month,
      month_reset_at: userWithPlan.month_reset_at,
      created_at: userWithPlan.created_at,
    },
    plan: userWithPlan.plan
      ? {
          id: userWithPlan.plan.id,
          name: userWithPlan.plan.name,
          url_limit: userWithPlan.plan.url_limit,
          stats_retention_days: userWithPlan.plan.stats_retention_days,
          features: userWithPlan.plan.features,
        }
      : null,
  });
});

// ============================================
// POST /api/auth/logout
// Logout (client should delete token)
// ============================================

auth.post('/logout', authMiddleware, (c) => {
  // JWT is stateless, so logout is handled client-side
  // Could implement token blacklisting with KV if needed

  return c.json({ success: true });
});

export default auth;
