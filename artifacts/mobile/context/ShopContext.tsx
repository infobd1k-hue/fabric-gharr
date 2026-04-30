import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "fabricghar.shopEmail";

type ShopState = {
  email: string | null;
  ready: boolean;
  setEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<ShopState | null>(null);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmailState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => {
        if (cancelled) return;
        if (v) setEmailState(v.toLowerCase());
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setEmail = useCallback(async (next: string) => {
    const norm = next.trim().toLowerCase();
    await AsyncStorage.setItem(STORAGE_KEY, norm);
    setEmailState(norm);
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setEmailState(null);
  }, []);

  const value = useMemo<ShopState>(
    () => ({ email, ready, setEmail, signOut }),
    [email, ready, setEmail, signOut],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShop(): ShopState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useShop must be used inside ShopProvider");
  return v;
}
