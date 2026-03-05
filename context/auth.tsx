import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: string;
  email: string;
  name: string;
  hasSetupBusiness: boolean;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  markBusinessSetup: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("autoflow_user");
        if (raw) setUser(JSON.parse(raw));
      } catch {}
      setIsLoading(false);
    })();
  }, []);

  const saveUser = async (u: User) => {
    await AsyncStorage.setItem("autoflow_user", JSON.stringify(u));
    setUser(u);
  };

  const login = async (email: string, _password: string) => {
    const u: User = {
      id: `user_${Date.now()}`,
      email,
      name: email.split("@")[0],
      hasSetupBusiness: false,
    };
    const existing = await AsyncStorage.getItem("autoflow_user");
    if (existing) {
      const parsed = JSON.parse(existing);
      if (parsed.email === email) {
        await saveUser(parsed);
        return;
      }
    }
    await saveUser(u);
  };

  const signup = async (name: string, email: string, _password: string) => {
    const u: User = {
      id: `user_${Date.now()}`,
      email,
      name,
      hasSetupBusiness: false,
    };
    await saveUser(u);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("autoflow_user");
    setUser(null);
  };

  const markBusinessSetup = async () => {
    if (!user) return;
    const updated = { ...user, hasSetupBusiness: true };
    await saveUser(updated);
  };

  const value = useMemo(
    () => ({ user, isLoading, login, signup, logout, markBusinessSetup }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
