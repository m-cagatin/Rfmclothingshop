/**
 * Utility functions for API calls with improved error handling and retry logic
 */

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

export interface ApiError extends Error {
  status?: number;
  statusText?: string;
  data?: unknown;
}

/**
 * Create an API error with detailed information
 */
export function createApiError(
  message: string,
  status?: number,
  statusText?: string,
  data?: unknown
): ApiError {
  const error = new Error(message) as ApiError;
  error.status = status;
  error.statusText = statusText;
  error.data = data;
  return error;
}

/**
 * Check if an error is a network error (no connection)
 */
export function isNetworkError(error: Error): boolean {
  return (
    error.message.includes('Failed to fetch') ||
    error.message.includes('Network request failed') ||
    error.message.includes('NetworkError') ||
    error.message.includes('ECONNREFUSED')
  );
}

/**
 * Check if an error is a timeout error
 */
export function isTimeoutError(error: Error): boolean {
  return (
    error.message.includes('timeout') ||
    error.message.includes('timed out') ||
    error.message.includes('ETIMEDOUT')
  );
}

/**
 * Check if an HTTP status code is retryable
 */
export function isRetryableStatus(status: number): boolean {
  // Retry on server errors (5xx) and some client errors
  return status === 408 || status === 429 || status === 503 || status === 504 || status >= 500;
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch with retry logic for network errors and server errors
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = true,
    onRetry,
  } = retryOptions;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // If response is OK or has a non-retryable status, return it
      if (response.ok || !isRetryableStatus(response.status)) {
        return response;
      }

      // Clone response to read error data
      const errorData = await response.clone().json().catch(() => ({}));
      lastError = createApiError(
        `Request failed with status ${response.status}`,
        response.status,
        response.statusText,
        errorData
      );

      // Don't retry if we've exhausted attempts
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = exponentialBackoff ? retryDelay * Math.pow(2, attempt) : retryDelay;
      
      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }

      await sleep(delay);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Only retry on network errors or timeout errors
      const shouldRetry =
        attempt < maxRetries &&
        (isNetworkError(lastError) || isTimeoutError(lastError));

      if (!shouldRetry) {
        throw lastError;
      }

      const delay = exponentialBackoff ? retryDelay * Math.pow(2, attempt) : retryDelay;
      
      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }

      await sleep(delay);
    }
  }

  throw lastError || new Error('Request failed after all retries');
}

/**
 * Get user-friendly error message from an error object
 */
export function getErrorMessage(error: unknown): string {
  if (!error) {
    return 'An unknown error occurred';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    // Network errors
    if (isNetworkError(error)) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }

    // Timeout errors
    if (isTimeoutError(error)) {
      return 'The request took too long. Please try again.';
    }

    // API errors with status codes
    const apiError = error as ApiError;
    if (apiError.status) {
      switch (apiError.status) {
        case 400:
          return 'Invalid request. Please check your input and try again.';
        case 401:
          return 'You need to log in to perform this action.';
        case 403:
          return 'You don\'t have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 409:
          return 'There was a conflict with the current state. Please refresh and try again.';
        case 413:
          return 'The file or data is too large. Please reduce the size and try again.';
        case 422:
          return 'The data provided is invalid. Please check your input.';
        case 429:
          return 'Too many requests. Please wait a moment and try again.';
        case 500:
        case 502:
        case 503:
        case 504:
          return 'Server error. Please try again in a few moments.';
        default:
          return `Request failed: ${error.message}`;
      }
    }

    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Format error for logging/debugging
 */
export function formatErrorForLogging(error: unknown): string {
  if (!error) {
    return 'Unknown error';
  }

  if (error instanceof Error) {
    const apiError = error as ApiError;
    const parts = [
      `Error: ${error.message}`,
      apiError.status ? `Status: ${apiError.status}` : null,
      apiError.statusText ? `Status Text: ${apiError.statusText}` : null,
      apiError.data ? `Data: ${JSON.stringify(apiError.data)}` : null,
      error.stack ? `Stack: ${error.stack}` : null,
    ];

    return parts.filter(Boolean).join('\n');
  }

  return String(error);
}
