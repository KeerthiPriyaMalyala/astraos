
import { createContext, useContext, useEffect, useState } from "react";
import {
  loginUser,
  registerUser,
  getCurrentUser,
} from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("astraos_user");

      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to read stored user:", error);
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | Restore authentication when application starts
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("astraos_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser();

        if (response?.success && response?.data?.user) {
          setUser(response.data.user);

          localStorage.setItem(
            "astraos_user",
            JSON.stringify(response.data.user)
          );
        }
      } catch (error) {
        console.error("Session restoration failed:", error);

        localStorage.removeItem("astraos_token");
        localStorage.removeItem("astraos_user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | LOGIN
  |--------------------------------------------------------------------------
  */

  const login = async (credentials) => {
    const response = await loginUser(credentials);

    if (response?.success && response?.data) {
      const { user, token } = response.data;

      localStorage.setItem("astraos_token", token);
      localStorage.setItem(
        "astraos_user",
        JSON.stringify(user)
      );

      setUser(user);
    }

    return response;
  };

  /*
  |--------------------------------------------------------------------------
  | REGISTER
  |--------------------------------------------------------------------------
  |
  | Your backend creates public registrations as CITIZEN.
  | We store the returned JWT and user just like login.
  |
  */

  const register = async (userData) => {
    const response = await registerUser(userData);

    if (response?.success && response?.data) {
      const { user, token } = response.data;

      localStorage.setItem("astraos_token", token);
      localStorage.setItem(
        "astraos_user",
        JSON.stringify(user)
      );

      setUser(user);
    }

    return response;
  };

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  const logout = () => {
    localStorage.removeItem("astraos_token");
    localStorage.removeItem("astraos_user");

    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/*
|--------------------------------------------------------------------------
| useAuth Hook
|--------------------------------------------------------------------------
*/

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider"
    );
  }

  return context;
}

