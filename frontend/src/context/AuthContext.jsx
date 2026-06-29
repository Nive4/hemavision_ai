import { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check login status on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // In a real app we might have a /me endpoint, for now we fetch profile to verify token
          const profileRes = await api.get("/profile");
          setProfile(profileRes.data);
          setUser({ email: localStorage.getItem("email") });
        } catch (err) {
          // If token expired or profile doesn't exist, check if we still have user details
          if (err.response && err.response.status === 404) {
            setUser({ email: localStorage.getItem("email") });
          } else {
            logout();
          }
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Standard OAuth2 form request
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await api.post("/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("email", email);
      setUser({ email });

      // Fetch profile if exists
      try {
        const profileRes = await api.get("/profile");
        setProfile(profileRes.data);
      } catch (err) {
        setProfile(null);
      }
      return true;
    } catch (err) {
      throw err.response?.data?.detail || "Login failed";
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password) => {
    setLoading(true);
    try {
      await api.post("/auth/register", { email, password });
      return true;
    } catch (err) {
      throw err.response?.data?.detail || "Registration failed";
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setUser(null);
    setProfile(null);
  };

  const createProfile = async (profileData) => {
    try {
      const res = await api.post("/profile", profileData);
      setProfile(res.data);
      return res.data;
    } catch (err) {
      throw err.response?.data?.detail || "Profile creation failed";
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.put("/profile", profileData);
      setProfile(res.data);
      return res.data;
    } catch (err) {
      throw err.response?.data?.detail || "Profile update failed";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        register,
        logout,
        createProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
