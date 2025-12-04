import { getUserByGoogleId, createUser, getUser, getPlan } from '../lib/db';
import { signToken } from '../lib/jwt';
import type { User, Plan } from '@/types';

// ============================================
// Google OAuth Configuration
// ============================================

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface AuthResult {
  token: string;
  user: UserWithPlan;
}

export interface UserWithPlan extends Omit<User, 'plan_id'> {
  plan_id: User['plan_id'];
  plan?: Plan;
}

// ============================================
// OAuth URL Generation
// ============================================

/**
 * Generate Google OAuth authorization URL
 */
export function getGoogleAuthUrl(
  clientId: string,
  redirectUri: string,
  state?: string
): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'email profile',
    access_type: 'offline',
    prompt: 'select_account',
  });

  if (state) {
    params.set('state', state);
  }

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

// ============================================
// Token Exchange
// ============================================

/**
 * Exchange authorization code for Google access token
 */
export async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<string> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Token exchange failed:', error);
    throw new Error('Failed to exchange code for token');
  }

  const data = await response.json() as { access_token: string };
  return data.access_token;
}

/**
 * Fetch user info from Google using access token
 */
export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user info from Google');
  }

  const userInfo = await response.json() as GoogleUserInfo;
  return userInfo;
}

// ============================================
// User Authentication
// ============================================

/**
 * Authenticate user with Google OAuth code
 * Creates new user if not exists, returns JWT token
 */
export async function authenticateWithGoogle(
  db: D1Database,
  googleUserInfo: GoogleUserInfo,
  jwtSecret: string
): Promise<AuthResult> {
  // Check if user exists
  let user = await getUserByGoogleId(db, googleUserInfo.id);

  if (!user) {
    // Create new user
    user = await createUser(db, {
      google_id: googleUserInfo.id,
      email: googleUserInfo.email,
      name: googleUserInfo.name,
      avatar_url: googleUserInfo.picture || null,
    });
  }

  // Get plan info
  const plan = await getPlan(db, user.plan_id);

  // Generate JWT token
  const token = await signToken(
    {
      userId: user.id,
      email: user.email,
    },
    jwtSecret
  );

  return {
    token,
    user: {
      ...user,
      plan: plan ?? undefined,
    },
  };
}

/**
 * Get current user info with plan details
 */
export async function getUserWithPlan(db: D1Database, userId: string): Promise<UserWithPlan | null> {
  const user = await getUser(db, userId);
  if (!user) return null;

  const plan = await getPlan(db, user.plan_id);

  return {
    ...user,
    plan: plan ?? undefined,
  };
}

/**
 * Check if user can create more URLs this month
 */
export function canCreateUrl(user: User, plan: Plan): boolean {
  // Unlimited plan
  if (plan.url_limit === -1) return true;

  return user.url_count_this_month < plan.url_limit;
}

/**
 * Check if user needs monthly counter reset
 */
export function needsMonthlyReset(user: User): boolean {
  const resetDate = new Date(user.month_reset_at);
  return new Date() >= resetDate;
}

/**
 * Calculate next month reset date
 */
export function getNextMonthResetDate(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString();
}
