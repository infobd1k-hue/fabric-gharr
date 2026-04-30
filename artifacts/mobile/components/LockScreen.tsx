import { Image } from "expo-image";
import { Fingerprint, Lock, ScanFace } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PinDots, PinKeypad } from "@/components/PinKeypad";
import { useAppLock } from "@/context/AppLockContext";
import { useColors } from "@/hooks/useColors";

const PIN_LENGTH = 4;

export function LockScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    state,
    settings,
    biometricAvailable,
    biometricLabel,
    unlockWithPin,
    unlockWithBiometric,
  } = useAppLock();

  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const shake = useRef(new Animated.Value(0)).current;
  const triedAutoBio = useRef(false);

  const useBiometric =
    biometricAvailable && settings.biometricEnabled && Platform.OS !== "web";

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shake, {
        toValue: 1,
        duration: 70,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shake, {
        toValue: -1,
        duration: 70,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shake, {
        toValue: 1,
        duration: 70,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shake, {
        toValue: 0,
        duration: 70,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // When the PIN reaches required length, attempt unlock.
  useEffect(() => {
    if (pin.length !== PIN_LENGTH) return;
    let cancelled = false;
    (async () => {
      setBusy(true);
      const ok = await unlockWithPin(pin);
      if (cancelled) return;
      if (!ok) {
        setError(true);
        triggerShake();
        setTimeout(() => {
          if (!cancelled) {
            setPin("");
            setError(false);
          }
        }, 600);
      }
      setBusy(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  // Auto-prompt biometric once on mount when allowed.
  useEffect(() => {
    if (!useBiometric) return;
    if (state !== "locked") return;
    if (triedAutoBio.current) return;
    triedAutoBio.current = true;
    unlockWithBiometric();
  }, [useBiometric, state, unlockWithBiometric]);

  const onTapBiometric = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await unlockWithBiometric();
    } finally {
      setBusy(false);
    }
  };

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + 32,
          paddingBottom: insets.bottom + 24,
        },
      ]}
    >
      <View style={styles.top}>
        <Image
          source={require("../assets/images/icon.png")}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={[styles.title, { color: colors.accent }]}>FabricGhar</Text>
        <View
          style={[
            styles.lockBadge,
            {
              backgroundColor: colors.cardElevated,
              borderColor: colors.border,
            },
          ]}
        >
          <Lock size={14} color={colors.mutedForeground} />
          <Text
            style={[styles.lockBadgeText, { color: colors.mutedForeground }]}
          >
            অ্যাপ লক করা আছে
          </Text>
        </View>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          আনলক করতে আপনার ৪ অঙ্কের পিন দিন
        </Text>
      </View>

      <Animated.View
        style={{
          transform: [
            {
              translateX: shake.interpolate({
                inputRange: [-1, 0, 1],
                outputRange: [-12, 0, 12],
              }),
            },
          ],
        }}
      >
        <PinDots filled={pin.length} length={PIN_LENGTH} error={error} />
        {error ? (
          <Text style={[styles.errorText, { color: colors.destructive }]}>
            ভুল পিন, আবার চেষ্টা করুন
          </Text>
        ) : null}
      </Animated.View>

      <View style={styles.bottom}>
        <PinKeypad
          value={pin}
          maxLength={PIN_LENGTH}
          onChange={setPin}
          disabled={busy}
        />
        {useBiometric ? (
          <Pressable
            onPress={onTapBiometric}
            disabled={busy}
            style={({ pressed }) => [
              styles.bioBtn,
              {
                borderColor: colors.border,
                backgroundColor: colors.cardElevated,
                opacity: pressed || busy ? 0.7 : 1,
              },
            ]}
          >
            {biometricLabel === "Face ID" ? (
              <ScanFace size={18} color={colors.accent} />
            ) : (
              <Fingerprint size={18} color={colors.accent} />
            )}
            <Text style={[styles.bioBtnText, { color: colors.text }]}>
              {biometricLabel} দিয়ে আনলক করুন
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  top: {
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  logo: { width: 80, height: 80 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  lockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 4,
  },
  lockBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  sub: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
  },
  errorText: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginTop: -8,
    marginBottom: 8,
  },
  bottom: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 8,
    gap: 16,
  },
  bioBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  bioBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
