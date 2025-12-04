// ============================================
// Custom Error Classes for API
// ============================================

export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'INVALID_URL'
  | 'CODE_TAKEN'
  | 'PLAN_LIMIT'
  | 'FEATURE_LOCKED'
  | 'RATE_LIMITED'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR';

export interface ErrorDetails {
  field?: string;
  reason?: string;
  [key: string]: unknown;
}

export class ApiError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: ErrorDetails;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number,
    details?: ErrorDetails
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

// ============================================
// Predefined Error Factories
// ============================================

export function unauthorizedError(message = 'Authentication required'): ApiError {
  return new ApiError('UNAUTHORIZED', message, 401);
}

export function forbiddenError(message = 'Access denied'): ApiError {
  return new ApiError('FORBIDDEN', message, 403);
}

export function notFoundError(resource = 'Resource'): ApiError {
  return new ApiError('NOT_FOUND', `${resource} not found`, 404);
}

export function invalidUrlError(reason?: string): ApiError {
  return new ApiError('INVALID_URL', 'The provided URL is not valid', 400, {
    field: 'url',
    reason,
  });
}

export function codeTakenError(code: string): ApiError {
  return new ApiError('CODE_TAKEN', 'This custom code is already taken', 400, {
    field: 'custom_code',
    value: code,
  });
}

export function planLimitError(limit: number, current: number): ApiError {
  return new ApiError(
    'PLAN_LIMIT',
    `You have reached your plan limit of ${limit} URLs this month`,
    403,
    {
      limit,
      current,
    }
  );
}

export function featureLockedError(feature: string): ApiError {
  return new ApiError(
    'FEATURE_LOCKED',
    `This feature is not available on your current plan`,
    403,
    {
      feature,
    }
  );
}

export function rateLimitedError(retryAfter?: number): ApiError {
  return new ApiError(
    'RATE_LIMITED',
    'Too many requests, please try again later',
    429,
    retryAfter ? { retryAfter } : undefined
  );
}

export function validationError(field: string, message: string): ApiError {
  return new ApiError('VALIDATION_ERROR', message, 400, {
    field,
  });
}

export function serverError(message = 'Internal server error'): ApiError {
  return new ApiError('SERVER_ERROR', message, 500);
}
