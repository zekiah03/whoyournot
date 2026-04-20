import { Answer } from "./scoring";

const KEY = "watashi-no-teigi/v1";

export type SavedSession = {
  sceneIds: number[];
  answers: Answer[];
  index: number;
  startedAt: number;
};

export function saveSession(s: SavedSession): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // ignore storage errors
  }
}

export function loadSession(): SavedSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      Array.isArray(parsed.sceneIds) &&
      Array.isArray(parsed.answers) &&
      typeof parsed.index === "number"
    ) {
      return parsed as SavedSession;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
