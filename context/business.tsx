import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface BusinessProfile {
  name: string;
  industry: string;
  description: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  logoColor: string;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  service: string;
  date: string;
  time: string;
  status: "confirmed" | "pending" | "cancelled";
  notes: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: number;
}

export interface SocialPost {
  id: string;
  platform: "instagram" | "twitter" | "facebook" | "linkedin";
  content: string;
  createdAt: number;
  status: "draft" | "published";
}

export interface Analytics {
  visitors: number;
  bookings: number;
  messages: number;
  revenue: number;
  conversionRate: number;
  growth: number;
}

interface BusinessContextValue {
  profile: BusinessProfile | null;
  appointments: Appointment[];
  chatMessages: ChatMessage[];
  socialPosts: SocialPost[];
  analytics: Analytics;
  updateProfile: (p: BusinessProfile) => Promise<void>;
  addAppointment: (a: Omit<Appointment, "id">) => Promise<void>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  addChatMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => Promise<void>;
  addSocialPost: (p: Omit<SocialPost, "id" | "createdAt">) => Promise<void>;
  deleteSocialPost: (id: string) => Promise<void>;
}

const defaultAnalytics: Analytics = {
  visitors: 1284,
  bookings: 47,
  messages: 312,
  revenue: 8640,
  conversionRate: 3.7,
  growth: 14.2,
};

const BusinessContext = createContext<BusinessContextValue | null>(null);

const STORAGE_KEYS = {
  profile: "autoflow_profile",
  appointments: "autoflow_appointments",
  chatMessages: "autoflow_chat",
  socialPosts: "autoflow_social",
};

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [p, a, c, s] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.profile),
          AsyncStorage.getItem(STORAGE_KEYS.appointments),
          AsyncStorage.getItem(STORAGE_KEYS.chatMessages),
          AsyncStorage.getItem(STORAGE_KEYS.socialPosts),
        ]);
        if (p) setProfile(JSON.parse(p));
        if (a) setAppointments(JSON.parse(a));
        if (c) setChatMessages(JSON.parse(c));
        if (s) setSocialPosts(JSON.parse(s));
      } catch {}
    })();
  }, []);

  const updateProfile = async (p: BusinessProfile) => {
    await AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(p));
    setProfile(p);
  };

  const genId = () =>
    `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const addAppointment = async (a: Omit<Appointment, "id">) => {
    const newA = { ...a, id: genId() };
    const updated = [newA, ...appointments];
    await AsyncStorage.setItem(STORAGE_KEYS.appointments, JSON.stringify(updated));
    setAppointments(updated);
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    const updated = appointments.map((a) =>
      a.id === id ? { ...a, ...updates } : a
    );
    await AsyncStorage.setItem(STORAGE_KEYS.appointments, JSON.stringify(updated));
    setAppointments(updated);
  };

  const deleteAppointment = async (id: string) => {
    const updated = appointments.filter((a) => a.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.appointments, JSON.stringify(updated));
    setAppointments(updated);
  };

  const addChatMessage = async (msg: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMsg = { ...msg, id: genId(), timestamp: Date.now() };
    const updated = [...chatMessages, newMsg];
    await AsyncStorage.setItem(STORAGE_KEYS.chatMessages, JSON.stringify(updated));
    setChatMessages(updated);
  };

  const addSocialPost = async (p: Omit<SocialPost, "id" | "createdAt">) => {
    const newP = { ...p, id: genId(), createdAt: Date.now() };
    const updated = [newP, ...socialPosts];
    await AsyncStorage.setItem(STORAGE_KEYS.socialPosts, JSON.stringify(updated));
    setSocialPosts(updated);
  };

  const deleteSocialPost = async (id: string) => {
    const updated = socialPosts.filter((p) => p.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.socialPosts, JSON.stringify(updated));
    setSocialPosts(updated);
  };

  const value = useMemo(
    () => ({
      profile,
      appointments,
      chatMessages,
      socialPosts,
      analytics: defaultAnalytics,
      updateProfile,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      addChatMessage,
      addSocialPost,
      deleteSocialPost,
    }),
    [profile, appointments, chatMessages, socialPosts]
  );

  return (
    <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>
  );
}

export function useBusiness() {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error("useBusiness must be used within BusinessProvider");
  return ctx;
}
