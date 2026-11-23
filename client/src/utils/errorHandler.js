
export function getErrorMessage(error, fallback = "Something went wrong.") {
  if (!error) return fallback;

  if (typeof error === "string") {
    return error;
  }

  return (
    error.response?.data?.message ||
    error.data?.message ||
    error.data?.error ||
    error.message ||
    fallback
  );
}

export function getErrorStatus(error) {
  return (
    error?.status ||
    error?.response?.status ||
    error?.statusCode ||
    null
  );
}

export function isNetworkError(error) {
  return (
    error?.name === "TypeError" ||
    error?.code === "ERR_NETWORK" ||
    !navigator.onLine
  );
}

export function isUnauthorizedError(error) {
  return getErrorStatus(error) === 401;
}

export function isForbiddenError(error) {
  return getErrorStatus(error) === 403;
}

export function isNotFoundError(error) {
  return getErrorStatus(error) === 404;
}

export function isValidationError(error) {
  return (
    getErrorStatus(error) === 400 ||
    getErrorStatus(error) === 422
  );
}

export function getValidationErrors(error) {
  const data = error?.data || error?.response?.data;

  if (Array.isArray(data?.errors)) {
    return data.errors.reduce((result, item) => {
      const field = item.path || item.param || "general";

      if (!result[field]) result[field] = [];

      result[field].push(item.msg || item.message || "Invalid value.");

      return result;
    }, {});
  }

  if (data?.errors && typeof data.errors === "object") {
    return data.errors;
  }

  return {};
}

export function handleError(error, options = {}) {
  const {
    fallback = "Something went wrong.",
    onError,
    log = true,
  } = options;

  const message = getErrorMessage(error, fallback);
  const status = getErrorStatus(error);

  if (log && import.meta.env.DEV) {
    console.error("[MiniVerse Error]", error);
  }

  onError?.({
    message,
    status,
    error,
  });

  return {
    message,
    status,
    isNetworkError: isNetworkError(error),
    isUnauthorized: status === 401,
    isForbidden: status === 403,
    isValidationError: isValidationError(error),
    validationErrors: getValidationErrors(error),
  };
}

export function createAppError(message, status = 500, code = "APP_ERROR") {
  const error = new Error(message);

  error.name = "AppError";
  error.status = status;
  error.code = code;

  return error;
}

export default {
  getErrorMessage,
  getErrorStatus,
  isNetworkError,
  isUnauthorizedError,
  isForbiddenError,
  isNotFoundError,
  isValidationError,
  getValidationErrors,
  handleError,
  createAppError,
};
