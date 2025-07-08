// contexts/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Always send cookies
const axiosConfig = {
  headers: { "Content-Type": "application/json" },
  withCredentials: true
};

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [initialized, setInitialized] = useState(false);

  async function checkSession() {
    try {
      const { data } = await axios.get(
        `${BACKEND_URL}/auth/user`,
        axiosConfig
      );
      // if 200 OK comes back:
      if (data.authSuccess) {
        setUser(data.user);
        setAuthSuccess(true);
      }
      
    } catch (err) {
      // 401 or network error
      setUser(null);
      setAuthSuccess(false);
    } finally {
      setInitialized(true);
    }
  }
  
  // 1️⃣ On mount, check current session
  useEffect(() => {
    checkSession();
  }, []);


  // 2️⃣ Authentication methods
  const register = async (credentials) => {
    const {displayName, email, password, confirmPassword} = credentials;
    const response = await axios.post(
      `${BACKEND_URL}/register`,
      { displayName, email, password, confirmPassword },
      axiosConfig
    );
    
    // After successful registration, check session to get user data
    if (response.data.authSuccess) {
      console.log("AuthContext: Registration successful, checking session");
      await checkSession();
    }
    
    return response;
  };

  const localLogin = async (credentials) => {
    const {email, password} = credentials;
    const response = await axios.post(
      `${BACKEND_URL}/login`,
      { email, password },
      axiosConfig
    );
    
    // After successful login, check session to get updated user data
    if (response.data.authSuccess) {
      await checkSession();
    }
    
    return response;
  };

  const socialLogin = (socialStrategy, data = {}) => {
    try {
      return new Promise((resolve) => {
        const popup = window.open(
          `${BACKEND_URL}/auth/${socialStrategy}?state=${JSON.stringify(data)}`,
          "_blank",
          "width=500,height=600"
        );

        const popupChecker = setInterval(() => {
          if (popup.closed) {
            clearInterval(popupChecker);
            window.location.reload();
            resolve({
              authSuccess: false,
              user: null,
            });
          }
        }, 500);

        window.addEventListener("message", (event) => {
          if (event.origin !== BACKEND_URL) return;

          clearInterval(popupChecker);

          if (event.data.authSuccess) {
            setAuthSuccess(true);
            setUser(event.data.user);
            
            // After successful social login, check session to ensure consistency
            checkSession();
            
            resolve({
              authSuccess: true,
              user: event.data.user,
            });
          } else {
            resolve({
              authSuccess: false,
              user: null,
            });
          }
        });
      });
    } catch (error) {
      throw error;
    }
  };


  const logout = async () => {
    const response = await axios.post(
      `${BACKEND_URL}/logout/user`,
      {},
      axiosConfig
    );
    setUser(null);
    setAuthSuccess(false);
    return response.data.logoutSuccess
  };

  // 3️⃣ Only render children once we've checked session
  if (!initialized) {
    // could show a spinner here
    return null;
  }

  const value = {
    user,
    setUser,
    authSuccess,
    setAuthSuccess,
    initialized,
    checkSession, // Expose checkSession for manual refresh
    register,
    localLogin,
    socialLogin,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be inside AuthProvider");
  return context;
};