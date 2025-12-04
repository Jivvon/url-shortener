import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { ApiError } from './lib/errors';
import authRoutes from './routes/auth';
import linksRoutes from './routes/links';
import statsRoutes from './routes/stats';

// Define app with proper typing
const app = new Hono<{ Bindings: Env }>();

// ============================================
// Middleware
// ============================================

// CORS - allow requests from frontend
app.use(
  '/api/*',
  cors({
    origin: (origin) => {
      // Allow localhost for development
      if (!origin) return '*';
      if (origin.includes('localhost')) return origin;
      if (origin.includes('snip.lento.dev')) return origin;
      return 'https://snip.lento.dev';
    },
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length'],
    maxAge: 86400,
    credentials: true,
  })
);

// ============================================
// Error Handling
// ============================================

app.onError((err, c) => {
  console.error(`[Error] ${err.message}`, err.stack);

  // Handle ApiError
  if (err instanceof ApiError) {
    return c.json(err.toJSON(), err.statusCode as 400 | 401 | 403 | 404 | 429 | 500);
  }

  // Handle unknown errors
  return c.json(
    {
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error',
      },
    },
    500
  );
});

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: {
        code: 'NOT_FOUND',
        message: 'Endpoint not found',
      },
    },
    404
  );
});

// ============================================
// Health & Info Routes
// ============================================

app.get('/', (c) => {
  return c.text('Snip API');
});

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// API Routes
// ============================================

app.route('/api/auth', authRoutes);
app.route('/api/links', linksRoutes);
// Stats routes are mounted under /api/links/:id/stats
app.route('/api/links', statsRoutes);

export default app;
