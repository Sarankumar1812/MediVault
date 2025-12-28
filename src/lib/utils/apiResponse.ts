// lib/utils/apiResponse.ts
export class ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errorCode?: string;
  timestamp: string;

  constructor(success: boolean, message: string, data?: T, errorCode?: string) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.errorCode = errorCode;
    this.timestamp = new Date().toISOString();
  }

  static success<T>(message: string, data?: T): ApiResponse<T> {
    return new ApiResponse(true, message, data);
  }

  static error(message: string, errorCode?: string): ApiResponse {
    return new ApiResponse(false, message, undefined, errorCode);
  }

  static validationError(errors: Record<string, string[]>): ApiResponse {
    return new ApiResponse(false, 'Validation failed', { errors }, 'VALIDATION_ERROR');
  }

  static notFound(resource: string): ApiResponse {
    return new ApiResponse(false, `${resource} not found`, undefined, 'NOT_FOUND');
  }

  static unauthorized(message = 'Unauthorized access'): ApiResponse {
    return new ApiResponse(false, message, undefined, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Access forbidden'): ApiResponse {
    return new ApiResponse(false, message, undefined, 'FORBIDDEN');
  }

  static conflict(message = 'Resource already exists'): ApiResponse {
    return new ApiResponse(false, message, undefined, 'CONFLICT');
  }

  static tooManyRequests(message = 'Too many requests'): ApiResponse {
    return new ApiResponse(false, message, undefined, 'RATE_LIMIT');
  }
}

export function sendResponse<T>(response: ApiResponse<T>, status = 200): Response {
  return new Response(JSON.stringify(response), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}