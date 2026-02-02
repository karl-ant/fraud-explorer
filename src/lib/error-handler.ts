export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export function handleApiError(error: unknown): { message: string; statusCode: number } {
  console.error('API Error:', error)

  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode
    }
  }

  if (error instanceof Error) {
    // Handle specific API errors
    if (error.message.includes('API key')) {
      return {
        message: 'API configuration error. Please check your environment variables.',
        statusCode: 500
      }
    }

    if (error.message.includes('network') || error.message.includes('fetch')) {
      return {
        message: 'Network error. Please check your connection and try again.',
        statusCode: 503
      }
    }

    return {
      message: error.message,
      statusCode: 500
    }
  }

  return {
    message: 'An unexpected error occurred',
    statusCode: 500
  }
}