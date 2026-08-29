
import axios from "axios";

/*
|--------------------------------------------------------------------------
| AstraOS API Client
|--------------------------------------------------------------------------
| All frontend requests to the Node/Express backend go through this
| Axios instance.
|
| Backend base URL:
| http://localhost:5000/api
|--------------------------------------------------------------------------
*/

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

/*
|--------------------------------------------------------------------------
| REQUEST INTERCEPTOR
|--------------------------------------------------------------------------
| Automatically attach the JWT token to protected backend requests.
|
| Backend auth middleware expects:
| Authorization: Bearer <token>
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("astraos_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/*
|--------------------------------------------------------------------------
| RESPONSE INTERCEPTOR
|--------------------------------------------------------------------------
| If backend returns 401, the JWT is no longer valid.
| Remove stored authentication information.
|--------------------------------------------------------------------------
*/

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("astraos_token");
      localStorage.removeItem("astraos_user");
    }

    return Promise.reject(error);
  }
);

export default api;

