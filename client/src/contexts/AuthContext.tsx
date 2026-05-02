import { createContext, useContext, useEffect, useState, ReactNode } from "react";

const API_URL = import.meta.env.VITE_API_URL + "/api" || "http://localhost:5000/api";

interface User {
  id: string;
  email: string;
  displayName: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (token: string, userData: User) => void;
  signOut: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: () => {},
  signOut: () => {},
  updateUser: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUser({
              id: data._id,
              email: data.email,
              displayName: data.displayName
            });
          } else {
            localStorage.removeItem("token");
          }
        } catch (err) {
          console.error(err);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const signIn = (token: string, userData: User) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const signOut = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
