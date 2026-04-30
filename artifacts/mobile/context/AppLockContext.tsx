import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuth from "expo-local-authentication";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState, type AppStateStatus, Platform } from "react-native";

import { useShop } from "@/context/ShopContext";
import { hashPin, isValidPin } from "@/lib/pinHash";

type LockState = "checking" | "locked" | "unlocked";

type Settings = {
  enabled: boolean;
  pinHash: string | null;
  biometricEnabled: boolean;
};

type Ctx = {
  state: LockState;
  settings: Settings;
  biometricAvailable: boolean;
  biometricLabel: string;
  /** Try to unlock with a PIN. Returns true on success. */
  unlockWithPin: (pin: string) => Promise<boolean>;
  /** Try to unlock with biometrics. Returns true on success. */
  unlockWithBiometric: () => Promise<boolean>;
  /** Set up or change the PIN. Pass currentPin if a PIN is already set. */
  setPin: (newPin: string, currentPin?: string) => Promise<void>;
  /** Disable the lock entirely. Requires the current PIN. */
  disableLock: (currentPin: string) => Promise<void>;
  /** Toggle whether biometrics can be used to unlock (PIN is always required as fallback). */
  setBiometricEnabled: (enabled: boolean) => Promise<void>;
  /** Manually re-lock the app (e.g. used by a "lock now" button). */
  lockNow: () => void;
};

const AppLockCtx = createContext<Ctx | null>(null);

const RELOCK_AFTER_MS = 20_000;
const SETTINGS_KEY_PREFIX = "fabricghar.applock.v1.";

const DEFAULT_SETTINGS: Settings = {
  enabled: false,
  pinHash: null,
  biometricEnabled: false,
};

function settingsKey(email: string): string {
  return `${SETTINGS_KEY_PREFIX}${email.toLowerCase()}`;
}

async function loadSettings(email: string): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(settingsKey(email));
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      enabled: !!parsed.enabled,
      pinHash:
        typeof parsed.pinHash === "string" && parsed.pinHash.length > 0
          ? parsed.pinHash
          : null,
      biometricEnabled: !!parsed.biometricEnabled,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

async function saveSettings(email: string, s: Settings): Promise<void> {
  await AsyncStorage.setItem(settingsKey(email), JSON.stringify(s));
}

export function AppLockProvider({ children }: { children: React.ReactNode }) {
  const { ready: shopReady, email } = useShop();
  const [state, setState] = useState<LockState>("checking");
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState("বায়োমেট্রিক");
  const lastBackgroundedAt = useRef<number | null>(null);
  const inFlightBio = useRef(false);

  // Detect biometric capability once.
  useEffect(() => {
    let cancelled = false;
    if (Platform.OS === "web") {
      setBiometricAvailable(false);
      return () => {
        cancelled = true;
      };
    }
    (async () => {
      try {
        const has = await LocalAuth.hasHardwareAsync();
        const enrolled = await LocalAuth.isEnrolledAsync();
        const types = await LocalAuth.supportedAuthenticationTypesAsync();
        if (cancelled) return;
        setBiometricAvailable(has && enrolled);
        if (
          types.includes(LocalAuth.AuthenticationType.FACIAL_RECOGNITION)
        ) {
          setBiometricLabel("Face ID");
        } else if (
          types.includes(LocalAuth.AuthenticationType.FINGERPRINT)
        ) {
          setBiometricLabel("ফিঙ্গারপ্রিন্ট");
        } else {
          setBiometricLabel("বায়োমেট্রিক");
        }
      } catch {
        if (!cancelled) setBiometricAvailable(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load per-email settings and decide initial state.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!shopReady) return;
      if (!email) {
        // No email yet → EmailGate handles UI; don't lock.
        setSettings(DEFAULT_SETTINGS);
        setState("unlocked");
        return;
      }
      const loaded = await loadSettings(email);
      if (cancelled) return;
      setSettings(loaded);
      // Lock only if user has explicitly enabled lock AND has a PIN set.
      if (loaded.enabled && loaded.pinHash) {
        setState("locked");
      } else {
        setState("unlocked");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [shopReady, email]);

  const persist = useCallback(
    async (next: Settings) => {
      setSettings(next);
      if (email) await saveSettings(email, next);
    },
    [email],
  );

  const unlockWithPin = useCallback(
    async (pin: string) => {
      if (!email || !settings.pinHash) return false;
      if (!isValidPin(pin)) return false;
      const candidate = await hashPin(pin, email);
      if (candidate === settings.pinHash) {
        setState("unlocked");
        return true;
      }
      return false;
    },
    [email, settings.pinHash],
  );

  const unlockWithBiometric = useCallback(async () => {
    if (Platform.OS === "web") return false;
    if (!biometricAvailable || !settings.biometricEnabled) return false;
    if (inFlightBio.current) return false;
    inFlightBio.current = true;
    try {
      const result = await LocalAuth.authenticateAsync({
        promptMessage: "FabricGhar আনলক করুন",
        cancelLabel: "পিন ব্যবহার করুন",
        disableDeviceFallback: true,
      });
      if (result.success) {
        setState("unlocked");
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      inFlightBio.current = false;
    }
  }, [biometricAvailable, settings.biometricEnabled]);

  const setPin = useCallback(
    async (newPin: string, currentPin?: string) => {
      if (!email) throw new Error("কোনো অ্যাকাউন্ট সাইন-ইন নেই।");
      if (!isValidPin(newPin)) {
        throw new Error("পিন অবশ্যই ৪-৬ অঙ্কের সংখ্যা হতে হবে।");
      }
      // If a PIN already exists, require it to change.
      if (settings.pinHash) {
        if (!currentPin) {
          throw new Error("পুরোনো পিন দিন।");
        }
        const ok = (await hashPin(currentPin, email)) === settings.pinHash;
        if (!ok) throw new Error("পুরোনো পিন সঠিক নয়।");
      }
      const newHash = await hashPin(newPin, email);
      await persist({
        ...settings,
        enabled: true,
        pinHash: newHash,
      });
    },
    [email, persist, settings],
  );

  const disableLock = useCallback(
    async (currentPin: string) => {
      if (!email) return;
      if (!settings.pinHash) {
        await persist({ ...DEFAULT_SETTINGS });
        return;
      }
      const ok = (await hashPin(currentPin, email)) === settings.pinHash;
      if (!ok) throw new Error("পিন সঠিক নয়।");
      await persist({ ...DEFAULT_SETTINGS });
      setState("unlocked");
    },
    [email, persist, settings.pinHash],
  );

  const setBiometricEnabled = useCallback(
    async (enabled: boolean) => {
      if (enabled && !biometricAvailable) return;
      await persist({ ...settings, biometricEnabled: enabled });
    },
    [biometricAvailable, persist, settings],
  );

  const lockNow = useCallback(() => {
    if (settings.enabled && settings.pinHash) {
      setState("locked");
    }
  }, [settings.enabled, settings.pinHash]);

  // Re-lock after returning from background past idle threshold.
  useEffect(() => {
    if (Platform.OS === "web") return;
    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      if (next === "background" || next === "inactive") {
        lastBackgroundedAt.current = Date.now();
      } else if (next === "active") {
        const t = lastBackgroundedAt.current;
        lastBackgroundedAt.current = null;
        if (
          t &&
          Date.now() - t > RELOCK_AFTER_MS &&
          settings.enabled &&
          settings.pinHash
        ) {
          setState("locked");
        }
      }
    });
    return () => sub.remove();
  }, [settings.enabled, settings.pinHash]);

  const value = useMemo<Ctx>(
    () => ({
      state,
      settings,
      biometricAvailable,
      biometricLabel,
      unlockWithPin,
      unlockWithBiometric,
      setPin,
      disableLock,
      setBiometricEnabled,
      lockNow,
    }),
    [
      state,
      settings,
      biometricAvailable,
      biometricLabel,
      unlockWithPin,
      unlockWithBiometric,
      setPin,
      disableLock,
      setBiometricEnabled,
      lockNow,
    ],
  );

  return <AppLockCtx.Provider value={value}>{children}</AppLockCtx.Provider>;
}

export function useAppLock() {
  const v = useContext(AppLockCtx);
  if (!v) throw new Error("useAppLock must be used within AppLockProvider");
  return v;
}
