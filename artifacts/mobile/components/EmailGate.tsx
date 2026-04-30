import { ensureAccount } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { ArrowRight, Mail } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useShop } from "@/context/ShopContext";
import { useToast } from "@/context/ToastContext";
import { useColors } from "@/hooks/useColors";
import { isValidEmail } from "@/lib/format";

export function EmailGate() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setEmail } = useShop();
  const { show } = useToast();

  const [emailValue, setEmailValue] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const norm = emailValue.trim().toLowerCase();
    if (!isValidEmail(norm)) {
      show("সঠিক ইমেইল দিন", "error");
      return;
    }
    setBusy(true);
    try {
      await ensureAccount({ email: norm });
      if (Platform.OS !== "web") {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      }
      await setEmail(norm);
      show("স্বাগতম!", "success");
    } catch {
      show("সংযোগ ব্যর্থ — আবার চেষ্টা করুন", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.flex, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + 32,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        <View style={styles.logoWrap}>
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={[styles.title, { color: colors.accent }]}>
            FabricGhar
          </Text>
          <Text style={[styles.tag, { color: colors.mutedForeground }]}>
            কাপড়ের দোকানের সম্পূর্ণ হিসাব
          </Text>
        </View>

        <View style={styles.formArea}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            আপনার Gmail ঠিকানা
          </Text>
          <View
            style={[
              styles.inputWrap,
              {
                backgroundColor: colors.cardElevated,
                borderColor: colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            <Mail size={18} color={colors.mutedForeground} />
            <TextInput
              value={emailValue}
              onChangeText={setEmailValue}
              placeholder="example@gmail.com"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              style={[styles.input, { color: colors.text }]}
              onSubmitEditing={submit}
              returnKeyType="go"
            />
          </View>
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            একই ইমেইলে যেকোনো ফোনে লগইন করলে একই ডেটা দেখতে পাবেন। আপনার
            অ্যাপ ফোনের ফিঙ্গারপ্রিন্ট/Face ID/পিন দিয়ে সুরক্ষিত থাকবে।
          </Text>

          <Pressable
            onPress={submit}
            disabled={busy}
            style={({ pressed }) => [
              styles.cta,
              {
                backgroundColor: colors.primary,
                borderRadius: colors.radius,
                opacity: pressed || busy ? 0.85 : 1,
              },
            ]}
          >
            {busy ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Text style={styles.ctaText}>প্রবেশ করুন</Text>
                <ArrowRight size={18} color="#000" strokeWidth={2.5} />
              </>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  logoWrap: {
    alignItems: "center",
    marginTop: 24,
    gap: 12,
  },
  logo: { width: 96, height: 96 },
  title: {
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  tag: {
    fontSize: 14,
    textAlign: "center",
  },
  formArea: {
    gap: 12,
    paddingBottom: 24,
  },
  label: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "600",
    marginLeft: 4,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 4,
    borderWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Platform.OS === "android" ? 10 : 0,
  },
  hint: {
    fontSize: 12,
    lineHeight: 18,
    marginHorizontal: 4,
    marginTop: 4,
  },
  cta: {
    marginTop: 8,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },
});
