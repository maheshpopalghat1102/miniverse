
import cors from "cors";

export function createCorsOptions(clientUrls) {
  if (!Array.isArray(clientUrls) || clientUrls.length === 0) {
    throw new Error("CORS requires at least one allowed frontend URL.");
  }

  return {
    origin(origin, callback) {
      // Allow non-browser requests without an Origin header.
      if (!origin) {
        return callback(null, true);
      }

      if (clientUrls.includes(origin)) {
        return callback(null, true);
      }

      const error = new Error("Origin not allowed by CORS");
      error.statusCode = 403;

      return callback(error);
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS"
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With"
    ],

    optionsSuccessStatus: 204
  };
}

export function createCorsMiddleware(clientUrls) {
  return cors(createCorsOptions(clientUrls));
}
