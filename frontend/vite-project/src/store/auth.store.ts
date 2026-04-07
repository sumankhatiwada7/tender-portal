import { create } from "zustand";

export type User = {
  id: string;
  name: string;
  email: string;
  role: string[];
  status: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
};

const AUTH_KEY = "tendernepal_auth";
const LEGACY_AUTH_KEY = "queue-system-auth";

function readPersisted() {
  const raw = localStorage.getItem(AUTH_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { user: User; token: string };
      return { user: parsed.user, token: parsed.token };
    } catch {
      localStorage.removeItem(AUTH_KEY);
    }
  }

  const legacyRaw = localStorage.getItem(LEGACY_AUTH_KEY);
  if (!legacyRaw) {
    return { user: null, token: null };
  }

  try {
    const parsed = JSON.parse(legacyRaw) as {
      token: string;
      user: { id: string; name: string; email: string; role: string; status?: string };
    };
    return {
      token: parsed.token,
      user: {
        id: parsed.user.id,
        name: parsed.user.name,
        email: parsed.user.email,
        role: [parsed.user.role],
        status: parsed.user.status ?? "approved",
      },
    };
  } catch {
    localStorage.removeItem(LEGACY_AUTH_KEY);
    return { user: null, token: null };
  }
}

const persisted = readPersisted();

export const useAuthStore = create<AuthState>((set) => ({
  user: persisted.user,
  token: persisted.token,
  isAuthenticated: !!persisted.token,
  setAuth: (user, token) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ user, token }));
    localStorage.setItem(
      LEGACY_AUTH_KEY,
      JSON.stringify({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role[0] ?? "business",
          status: user.status,
        },
      }),
    );
    set({ user, token, isAuthenticated: !!token });
  },
  logout: () => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(LEGACY_AUTH_KEY);
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export const authStorageKey = AUTH_KEY;
