// contexts/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Get token from localStorage
function getToken() {
  return localStorage.getItem('authToken');
}

// Set token in localStorage
function setToken(token) {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
}

// Create axios config with token in headers
export function getAxiosConfig() {
  const token = getToken();
  const config = {
    headers: { 
      "Content-Type": "application/json",
    },
    withCredentials: false // Token-based auth doesn't need cookies
  };
  
  // Add token to Authorization header if available
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  return config;
}

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [initialized, setInitialized] = useState(false);

  async function checkSession() {
    try {
      const { data } = await axios.get(
        `${BACKEND_URL}/auth/user`,
        getAxiosConfig()
      );

      //Checking user session/token
      console.log("Auth data: ", data)
      
      // if 200 OK comes back:
      if (data.authSuccess) {
        setUser(data.user);
        setAuthSuccess(true);
      } else {
        // Clear token if auth failed
        setToken(null);
        setUser(null);
        setAuthSuccess(false);
      }
      
    } catch (err) {
      // 401 or network error
      console.error("Auth check failed:", err);
      setToken(null);
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
      getAxiosConfig()
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
      getAxiosConfig()
    );
    
    // After successful login, store token and update user
    if (response.data.authSuccess && response.data.token) {
      setToken(response.data.token);
      setUser(response.data.user);
      setAuthSuccess(true);
    }
    
    console.log("localLogin response: ", response.data.message)
    return response;
  };

  const socialLogin = (socialStrategy, data = null) => {
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

        window.addEventListener("message", async (event) => {
          if (event.origin !== BACKEND_URL) return;

          clearInterval(popupChecker);

          if (event.data.authSuccess) {
            const userData = event.data.user;
            const token = event.data.token;
            
            // Store token (token-based auth)
            if (token) {
              setToken(token);
              setAuthSuccess(true);
              setUser(userData);
              
              // Verify token is working
              await checkSession();
              
              resolve({
                authSuccess: true,
                user: userData,
                token: token,
                requireEmail: false,
                emailNotVerified: false,
                provider: event.data.provider,
              });
            } else {
              // No token provided - this shouldn't happen with token-based auth
              console.error("No token received from OAuth");
              resolve({
                authSuccess: false,
                user: null,
                error: "No token received"
              });
            }
          } else {
            resolve({
              authSuccess: false,
              user: null,
              requireEmail: event.data.requireEmail,
              emailNotVerified: event.data.emailNotVerified,
              provider: event.data.provider,
              profileUrl: event.data.profileUrl,
              message: event.data.message
            });
          }
        });
      });
    } catch (error) {
      throw error;
    }
  };


  const logout = async () => {
    try {
      // Try to logout on server (for session-based auth)
      await axios.post(
        `${BACKEND_URL}/logout/user`,
        {},
        getAxiosConfig()
      );
    } catch (error) {
      // Ignore errors - we'll clear token anyway
      console.log("Logout request failed (may be using token auth):", error);
    }
    
    // Clear token and user data
    setToken(null);
    setUser(null);
    setAuthSuccess(false);
    return true;
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