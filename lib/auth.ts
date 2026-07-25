export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
}

const STORAGE_KEY = "dreamelevate_user";

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null): void {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent("dreamelevate_user_changed", { detail: user }));

    // Sync user data to DB via API
    fetch("/api/user-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    }).catch((err) => console.warn("Failed to sync user to DB:", err));
  } else {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("dreamelevate_user_changed", { detail: null }));
  }
}

export function logoutUser(): void {
  setCurrentUser(null);
}
