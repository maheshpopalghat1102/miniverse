
import { getAccessToken, setAccessToken } from "./accessToken";

const BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5001/api/v1"
).replace(/\/$/, "");

let refreshPromise = null;

export async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.accessToken) {
          throw new Error(data.message || "Your session has expired. Please sign in again.");
        }
        setAccessToken(data.accessToken);
        return data.accessToken;
      })
      .finally(() => { refreshPromise = null; });
  }

  return refreshPromise;
}

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function buildUrl(endpoint, params = {}) {
  const url = new URL(
    `${BASE_URL}/${endpoint.replace(/^\/+/, "")}`
  );

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => url.searchParams.append(key, item));
    } else {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => ({}));
  }

  return response.text().catch(() => "");
}

async function request(endpoint, options = {}) {
  const {
    params,
    body,
    headers = {},
    ...fetchOptions
  } = options;

  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  const url = buildUrl(endpoint, params);
  const makeRequest = () => fetch(url, {
    credentials: "include",
    ...fetchOptions,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {}),
      ...headers,
    },
    body:
      body === undefined
        ? undefined
        : isFormData || typeof body === "string"
          ? body
          : JSON.stringify(body),
  });

  let response = await makeRequest();
  const isAuthEndpoint = [
    "/auth/login", "/auth/register", "/auth/refresh", "/auth/verify-email",
    "/auth/forgot-password", "/auth/reset-password",
  ].some((path) => endpoint.startsWith(path));
  if (response.status === 401 && getAccessToken() && !isAuthEndpoint) {
    try {
      await refreshAccessToken();
      response = await makeRequest();
    } catch {
      setAccessToken(null);
    }
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`;

    throw new ApiError(message, response.status, data);
  }

  return data;
}

const api = {
  get(endpoint, params = {}, options = {}) {
    return request(endpoint, {
      ...options,
      method: "GET",
      params,
    });
  },

  post(endpoint, body = {}, options = {}) {
    return request(endpoint, {
      ...options,
      method: "POST",
      body,
    });
  },

  put(endpoint, body = {}, options = {}) {
    return request(endpoint, {
      ...options,
      method: "PUT",
      body,
    });
  },

  patch(endpoint, body = {}, options = {}) {
    return request(endpoint, {
      ...options,
      method: "PATCH",
      body,
    });
  },

  delete(endpoint, options = {}) {
    const { body, ...fetchOptions } = options;
    return request(endpoint, {
      ...fetchOptions,
      method: "DELETE",
      ...(body === undefined ? {} : { body }),
    });
  },

  upload(endpoint, formData, options = {}) {
    if (!(formData instanceof FormData)) {
      throw new TypeError("Upload requires a FormData object.");
    }

    return request(endpoint, {
      ...options,
      method: "POST",
      body: formData,
    });
  },

  uploadPut(endpoint, formData, options = {}) {
    if (!(formData instanceof FormData)) {
      throw new TypeError("Upload requires a FormData object.");
    }

    return request(endpoint, {
      ...options,
      method: "PUT",
      body: formData,
    });
  },
};

export default api;
