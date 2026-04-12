export type UserRole = "developer" | "designer" | "product_manager";

export interface MockUser {
  name: string;
  email: string;
  role?: UserRole;
}

const KEY = "ff_user";
const ONBOARDING_KEY = "ff_onboarding_done";

export function setUser(user: MockUser): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(user));
  }
}

export function getUser(): MockUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as MockUser) : null;
  } catch {
    return null;
  }
}

export function clearUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(KEY);
  }
}

export function isOnboardingDone(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ONBOARDING_KEY) === "1";
}

export function markOnboardingDone(): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(ONBOARDING_KEY, "1");
  }
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function nameFromEmail(email: string): string {
  return email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
