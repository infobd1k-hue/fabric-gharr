import * as Crypto from "expo-crypto";

const APP_SALT = "fabricghar.applock.v1";

export async function hashPin(
  pin: string,
  scope: string,
): Promise<string> {
  const payload = `${APP_SALT}|${scope}|${pin}`;
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    payload,
  );
}

export function isValidPin(pin: string): boolean {
  return /^\d{4,6}$/.test(pin);
}
