export type ApiError = Error & {
  code?: string;
  statusCode?: number;
};

export function isApiError(error: unknown): error is ApiError {
  return error instanceof Error;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}