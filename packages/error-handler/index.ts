export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    // Set the prototype explicitly to maintain the correct prototype chain
    //Object.setPrototypeOf(this, new.target.prototype);

    // Capture the stack trace for debugging
    Error.captureStackTrace(this);
  }
}

// Not found error
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404, true);
  }
}

// Validation error
export class ValidationError extends AppError {
  constructor(message: string = "Invalid request data", details?: any) {
    super(message, 400, true, details);
  }
}

// Authentication error
export class AuthenticationError extends AppError {
  constructor(message: string = "Unauthorized access") {
    super(message, 401);
  }
}

// Authorization error
export class AuthorizationError extends AppError {
  constructor(message: string = "Forbidden access") {
    super(message, 403);
  }
}

// Internal server error
export class InternalServerError extends AppError {
  constructor(message: string = "Internal server error", details?: any) {
    super(message, 500, false, details);
  }
}

// Database error
export class DatabaseError extends AppError {
  constructor(message: string = "Database operation failed", details?: any) {
    super(message, 500, false, details);
  }
}

// Rate limit exceeded error
export class RateLimitExceededError extends AppError {
  constructor(message: string = "Too many requests, please try again later.") {
    super(message, 429, true);
  }
}
