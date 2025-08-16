export const ErrorCodes = {
  // AUTH - Authentication & Authorization
  AUTH_TOKEN_REQUIRED: "AUTH_TOKEN_REQUIRED",
  AUTH_TOKEN_INVALID: "AUTH_TOKEN_INVALID",
  AUTH_TOKEN_EXPIRED: "AUTH_TOKEN_EXPIRED",
  AUTH_CREDENTIALS_INVALID: "AUTH_CREDENTIALS_INVALID",
  AUTH_UNAUTHORIZED: "AUTH_UNAUTHORIZED",
  AUTH_INSUFFICIENT_PERMISSIONS: "AUTH_INSUFFICIENT_PERMISSIONS",

  // USER - User validation & operations
  USER_FULLNAME_REQUIRED: "USER_FULLNAME_REQUIRED",
  USER_FULLNAME_TOO_SHORT: "USER_FULLNAME_TOO_SHORT",
  USER_FULLNAME_TOO_LONG: "USER_FULLNAME_TOO_LONG",
  USER_EMAIL_REQUIRED: "USER_EMAIL_REQUIRED",
  USER_EMAIL_INVALID: "USER_EMAIL_INVALID",
  USER_EMAIL_ALREADY_EXISTS: "USER_EMAIL_ALREADY_EXISTS",
  USER_PASSWORD_REQUIRED: "USER_PASSWORD_REQUIRED",
  USER_PASSWORD_TOO_SHORT: "USER_PASSWORD_TOO_SHORT",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  USER_ID_REQUIRED: "USER_ID_REQUIRED",
  USER_ID_INVALID: "USER_ID_INVALID",
  USER_ACCESS_DENIED: "USER_ACCESS_DENIED",
  USER_UPDATE_FIELDS_REQUIRED: "USER_UPDATE_FIELDS_REQUIRED",
  USER_UPDATE_IMAGE_INVALID: "USER_UPDATE_IMAGE_INVALID",
  USER_UPDATE_IMAGE_TOO_BIG: "USER_UPDATE_IMAGE_TOO_BIG",
  USER_UPDATE_IMAGE_FAILED: "USER_UPDATE_IMAGE_FAILED",

  // CHAT - Chat operations
  CHAT_NOT_FOUND: "CHAT_NOT_FOUND",
  CHAT_ID_REQUIRED: "CHAT_ID_REQUIRED",
  CHAT_ID_INVALID: "CHAT_ID_INVALID",
  CHAT_ACCESS_DENIED: "CHAT_ACCESS_DENIED",
  CHAT_ALREADY_EXISTS: "CHAT_ALREADY_EXISTS",

  // MESSAGE - Message operations
  MESSAGE_CONTENT_REQUIRED: "MESSAGE_CONTENT_REQUIRED",
  MESSAGE_TEXT_TOO_LONG: "MESSAGE_TEXT_TOO_LONG",
  MESSAGE_NOT_FOUND: "MESSAGE_NOT_FOUND",
  MESSAGE_ID_REQUIRED: "MESSAGE_ID_REQUIRED",
  MESSAGE_ID_INVALID: "MESSAGE_ID_INVALID",
  MESSAGE_ACCESS_DENIED: "MESSAGE_ACCESS_DENIED",
  MESSAGE_IMAGE_INVALID: "MESSAGE_IMAGE_INVALID",
  MESSAGE_IMAGE_TOO_BIG: "MESSAGE_IMAGE_TOO_BIG",
  MESSAGE_IMAGE_UPLOAD_FAILED: "MESSAGE_IMAGE_UPLOAD_FAILED",

  // VALIDATION - Generic validation errors
  VALIDATION_INVALID_FORMAT: "VALIDATION_INVALID_FORMAT",
  VALIDATION_REQUIRED_FIELD: "VALIDATION_REQUIRED_FIELD",
};

const ERROR_MAPPINGS = {
  [ErrorCodes.AUTH_TOKEN_REQUIRED]: {
    status: 401,
    message: "Token required",
  },
  [ErrorCodes.AUTH_TOKEN_INVALID]: {
    status: 401,
    message: "Invalid authentication token",
  },
  [ErrorCodes.AUTH_TOKEN_EXPIRED]: {
    status: 401,
    message: "Authentication token expired",
  },
  [ErrorCodes.AUTH_CREDENTIALS_INVALID]: {
    status: 401,
    message: "Invalid credentials",
  },
  [ErrorCodes.AUTH_UNAUTHORIZED]: {
    status: 401,
    message: "Unauthorized access",
  },
  [ErrorCodes.AUTH_INSUFFICIENT_PERMISSIONS]: {
    status: 403,
    message: "Insufficient permissions",
  },

  // USER
  [ErrorCodes.USER_FULLNAME_REQUIRED]: {
    status: 400,
    message: "Full name is required",
  },
  [ErrorCodes.USER_FULLNAME_TOO_SHORT]: {
    status: 400,
    message: "Full name should be at least 3 characters long",
  },
  [ErrorCodes.USER_FULLNAME_TOO_LONG]: {
    status: 400,
    message: "Full name should be at most 50 characters long",
  },
  [ErrorCodes.USER_EMAIL_REQUIRED]: {
    status: 400,
    message: "Email is required",
  },
  [ErrorCodes.USER_EMAIL_INVALID]: {
    status: 400,
    message: "Invalid email",
  },
  [ErrorCodes.USER_EMAIL_ALREADY_EXISTS]: {
    status: 409,
    message: "Email already exists",
  },
  [ErrorCodes.USER_PASSWORD_REQUIRED]: {
    status: 400,
    message: "Password is required",
  },
  [ErrorCodes.USER_PASSWORD_TOO_SHORT]: {
    status: 400,
    message: "Password should be at least 8 characters long",
  },
  [ErrorCodes.USER_NOT_FOUND]: {
    status: 404,
    message: "User not found",
  },
  [ErrorCodes.USER_ID_REQUIRED]: {
    status: 400,
    message: "User Id is required",
  },
  [ErrorCodes.USER_ID_INVALID]: {
    status: 400,
    message: "Invalid user Id",
  },
  [ErrorCodes.USER_ACCESS_DENIED]: {
    status: 403,
    message: "Access denied",
  },
  [ErrorCodes.USER_UPDATE_FIELDS_REQUIRED]: {
    status: 400,
    message: "At least one field is required for update",
  },
  [ErrorCodes.USER_UPDATE_IMAGE_INVALID]: {
    status: 400,
    message: "Invalid image format",
  },
  [ErrorCodes.USER_UPDATE_IMAGE_TOO_BIG]: {
    status: 400,
    message: "Image size exceeds 5 MB",
  },
  [ErrorCodes.USER_UPDATE_IMAGE_FAILED]: {
    status: 500,
    message: "Profile picture upload failed",
  },

  // CHAT
  [ErrorCodes.CHAT_NOT_FOUND]: {
    status: 404,
    message: "Chat not found",
  },
  [ErrorCodes.CHAT_ID_REQUIRED]: {
    status: 400,
    message: "Chat Id is required",
  },
  [ErrorCodes.CHAT_ID_INVALID]: {
    status: 400,
    message: "Invalid chat Id",
  },
  [ErrorCodes.CHAT_ACCESS_DENIED]: {
    status: 403,
    message: "Access denied",
  },
  [ErrorCodes.CHAT_ALREADY_EXISTS]: {
    status: 409,
    message: "Chat already exists",
  },

  // MESSAGE
  [ErrorCodes.MESSAGE_CONTENT_REQUIRED]: {
    status: 400,
    message: "Message content is required",
  },
  [ErrorCodes.MESSAGE_TEXT_TOO_LONG]: {
    status: 400,
    message: "Text should be at most 1000 characters long",
  },
  [ErrorCodes.MESSAGE_NOT_FOUND]: {
    status: 404,
    message: "Message not found",
  },
  [ErrorCodes.MESSAGE_ID_REQUIRED]: {
    status: 400,
    message: "Message Id is required",
  },
  [ErrorCodes.MESSAGE_ID_INVALID]: {
    status: 400,
    message: "Invalid message Id",
  },
  [ErrorCodes.MESSAGE_ACCESS_DENIED]: {
    status: 403,
    message: "Access denied",
  },
  [ErrorCodes.MESSAGE_IMAGE_INVALID]: {
    status: 400,
    message: "Invalid image format",
  },
  [ErrorCodes.MESSAGE_IMAGE_TOO_BIG]: {
    status: 400,
    message: "Image size exceeds 5 MB",
  },
  [ErrorCodes.MESSAGE_IMAGE_UPLOAD_FAILED]: {
    status: 500,
    message: "Image upload failed",
  },

  // VALIDATION
  [ErrorCodes.VALIDATION_INVALID_FORMAT]: {
    status: 400,
    message: "Invalid format",
  },
  [ErrorCodes.VALIDATION_REQUIRED_FIELD]: {
    status: 400,
    message: "This field is required",
  },
};

export class AppError extends Error {
  constructor(code, overrideMessage, metadata = {}) {
    const mapping = ERROR_MAPPINGS[code];
    if (!mapping) {
      throw new Error(`Unknown error code: ${code}`);
    }
    super(overrideMessage || mapping.message);
    this.code = code;
    this.status = mapping.status;
    this.metadata = metadata;
    this.name = "AppError";
  }
}

export function createError(code, overrideMessage, metadata) {
  return new AppError(code, overrideMessage, metadata);
}

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        ...(Object.keys(err.metadata).length > 0 && { metadata: err.metadata }),
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
      },
    });
  }

  // Log unexpected errors
  console.log("Unexpected error:", err);

  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    },
  });
}
