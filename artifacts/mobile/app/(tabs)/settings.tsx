import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronRight,
  Copy,
  Download,
  FileSpreadsheet,
  Fingerprint,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  ShieldCheck,
  Upload,
  type LucideIcon,
} from "lucide-react-native";
import {
  getBackup,
  restoreBackup,
  type BackupSnapshot,
} from "@workspace/api-client-react";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import writeXlsxFile from "write-excel-file/browser";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PinSetupSheet, type PinSetupMode } from "@/components/PinSetupSheet";
import { useAppLock } from "@/context/AppLockContext";
import { useShop } from "@/context/ShopContext";
import { useToast } from "@/context/ToastContext";
import { useColors } from "@/hooks/useColors";
import { fmt } from "@/lib/format";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { email, signOut } = useShop();
  const { show } = useToast();
  const qc = useQueryClient();
  const [busy, setBusy] = useState<
    null | "backup" | "restore" | "share" | "excel"
  >(null);
  const {
    settings: lockSettings,
    biometricAvailable,
    biometricLabel,
    setBiometricEnabled,
    lockNow,
  } = useAppLock();
  const [pinSheet, setPinSheet] = useState<{
    visible: boolean;
    mode: PinSetupMode;
  }>({ visible: false, mode: "create" });

  if (!email) return null;

  const lockEnabled = lockSettings.enabled && !!lockSettings.pinHash;

  const haptic = async () => {
    if (Platform.OS !== "web") {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // ignore
      }
    }
  };

  const onToggleLock = (next: boolean) => {
    if (next) {
      setPinSheet({ visible: true, mode: "create" });
    } else {
      setPinSheet({ visible: true, mode: "disable" });
    }
  };

  const onChangePin = () => setPinSheet({ visible: true, mode: "change" });

  const onToggleBiometric = async (next: boolean) => {
    if (next && !biometricAvailable) {
      show("এই ডিভাইসে বায়োমেট্রিক চালু নেই", "error");
      return;
    }
    await setBiometricEnabled(next);
    show(
      next ? `${biometricLabel} চালু হয়েছে` : `${biometricLabel} বন্ধ হয়েছে`,
      "success",
    );
  };

  const onLockNow = async () => {
    await haptic();
    if (!lockEnabled) {
      show("আগে অ্যাপ লক চালু করুন", "error");
      return;
    }
    lockNow();
  };

  const onCopyEmail = async () => {
    await haptic();
    await Clipboard.setStringAsync(email);
    show("ইমেইল কপি হয়েছে", "success");
  };

  const onBackup = async () => {
    if (!email) return;
    setBusy("backup");
    try {
      const data = (await getBackup(email)) as BackupSnapshot;
      const json = JSON.stringify(data, null, 2);
      const filename = `fabricghar-backup-${Date.now()}.json`;

      if (Platform.OS === "web") {
        await Clipboard.setStringAsync(json);
        show("ব্যাকআপ ক্লিপবোর্ডে কপি হয়েছে", "success");
      } else {
        const uri = `${FileSystem.cacheDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(uri, json);
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(uri, {
            mimeType: "application/json",
            dialogTitle: "ব্যাকআপ সংরক্ষণ করুন",
            UTI: "public.json",
          });
        } else {
          show(`ফাইল সংরক্ষিত: ${filename}`, "success");
        }
      }
    } catch {
      show("ব্যাকআপ ব্যর্থ হয়েছে", "error");
    } finally {
      setBusy(null);
    }
  };

  const onExportExcel = async () => {
    if (!email) return;
    setBusy("excel");
    try {
      const data = (await getBackup(email)) as BackupSnapshot;

      const bold = { fontWeight: "bold" as const };

      const productSheet = [
        [
          { value: "নাম", ...bold },
          { value: "ক্যাটাগরি", ...bold },
          { value: "ক্রয় মূল্য", ...bold },
          { value: "বিক্রয় মূল্য", ...bold },
          { value: "স্টক", ...bold },
        ],
        ...(data.products ?? []).map((p) => [
          { value: p.name ?? "" },
          { value: p.cat ?? "" },
          { value: Number(p.buy) || 0 },
          { value: Number(p.sell) || 0 },
          { value: Number(p.stock) || 0 },
        ]),
      ];

      const salesSheet = [
        [
          { value: "তারিখ", ...bold },
          { value: "পণ্য", ...bold },
          { value: "পরিমাণ", ...bold },
          { value: "একক মূল্য", ...bold },
          { value: "ক্রয় মূল্য", ...bold },
          { value: "ছাড়", ...bold },
          { value: "মোট", ...bold },
          { value: "লাভ", ...bold },
          { value: "নোট", ...bold },
        ],
        ...(data.sales ?? []).map((s) => {
          const d = new Date(s.date);
          return [
            { value: isNaN(d.getTime()) ? s.date : d.toISOString().slice(0, 10) },
            { value: s.pname ?? "" },
            { value: Number(s.qty) || 0 },
            { value: Number(s.price) || 0 },
            { value: Number(s.buy) || 0 },
            { value: Number(s.disc) || 0 },
            { value: Number(s.total) || 0 },
            { value: Number(s.profit) || 0 },
            { value: s.note ?? "" },
          ];
        }),
      ];

      const expenseSheet = [
        [
          { value: "তারিখ", ...bold },
          { value: "ক্যাটাগরি", ...bold },
          { value: "পরিমাণ", ...bold },
          { value: "নোট", ...bold },
        ],
        ...(data.expenses ?? []).map((e) => {
          const d = new Date(e.date);
          return [
            { value: isNaN(d.getTime()) ? e.date : d.toISOString().slice(0, 10) },
            { value: e.cat ?? "" },
            { value: Number(e.amount) || 0 },
            { value: e.note ?? "" },
          ];
        }),
      ];

      const filename = `fabricghar-${new Date().toISOString().slice(0, 10)}.xlsx`;

      const result = await writeXlsxFile([
        { data: productSheet, sheet: "পণ্য" },
        { data: salesSheet, sheet: "বিক্রয়" },
        { data: expenseSheet, sheet: "খরচ" },
      ]);
      const blob = await result.toBlob();

      if (Platform.OS === "web") {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        show("Excel ফাইল ডাউনলোড হয়েছে", "success");
      } else {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1] ?? "");
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        const uri = `${FileSystem.cacheDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(uri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(uri, {
            mimeType:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            dialogTitle: "Excel ফাইল সংরক্ষণ করুন",
            UTI: "org.openxmlformats.spreadsheetml.sheet",
          });
        } else {
          show(`ফাইল সংরক্ষিত: ${filename}`, "success");
        }
      }
    } catch {
      show("Excel ফাইল তৈরি ব্যর্থ হয়েছে", "error");
    } finally {
      setBusy(null);
    }
  };

  const onRestore = async () => {
    if (!email) return;
    const proceed = () => {
      Alert.alert(
        "ডেটা পুনরুদ্ধার",
        "এটি বর্তমান সব ডেটা মুছে ফেলে ব্যাকআপ থেকে নতুন ডেটা সেট করবে। চালিয়ে যাবেন?",
        [
          { text: "বাতিল", style: "cancel" },
          {
            text: "চালিয়ে যান",
            style: "destructive",
            onPress: async () => {
              setBusy("restore");
              try {
                const result = await DocumentPicker.getDocumentAsync({
                  type: ["application/json", "*/*"],
                  copyToCacheDirectory: true,
                });
                if (result.canceled || !result.assets?.[0]) {
                  setBusy(null);
                  return;
                }
                const uri = result.assets[0].uri;
                const text =
                  Platform.OS === "web"
                    ? await (await fetch(uri)).text()
                    : await FileSystem.readAsStringAsync(uri);
                const parsed = JSON.parse(text) as BackupSnapshot;
                if (
                  !Array.isArray(parsed.products) ||
                  !Array.isArray(parsed.sales)
                ) {
                  show("অবৈধ ব্যাকআপ ফাইল", "error");
                  setBusy(null);
                  return;
                }
                const res = (await restoreBackup(email, parsed)) as {
                  products: number;
                  sales: number;
                };
                await qc.invalidateQueries();
                show(
                  `${fmt(res.products)} পণ্য ও ${fmt(res.sales)} বিক্রয় পুনরুদ্ধার হয়েছে`,
                  "success",
                );
              } catch {
                show("পুনরুদ্ধার ব্যর্থ হয়েছে", "error");
              } finally {
                setBusy(null);
              }
            },
          },
        ],
      );
    };
    proceed();
  };

  const onSignOut = () => {
    Alert.alert(
      "অ্যাকাউন্ট পরিবর্তন",
      "আপনি কি অন্য ইমেইল দিয়ে লগইন করতে চান? ক্লাউড ডেটা মুছে যাবে না।",
      [
        { text: "বাতিল", style: "cancel" },
        {
          text: "লগ আউট",
          style: "destructive",
          onPress: () => {
            signOut();
          },
        },
      ],
    );
  };

  return (
    <View
      style={[
        styles.flex,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + 12,
        },
      ]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brand}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={[styles.brandTitle, { color: colors.accent }]}>
            FabricGhar
          </Text>
          <Text style={[styles.brandTag, { color: colors.mutedForeground }]}>
            কাপড়ের দোকানের সম্পূর্ণ হিসাব
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          ব্যাকআপ ও পুনরুদ্ধার
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <Action
            Icon={Download}
            title="ডেটা ব্যাকআপ"
            subtitle="JSON ফাইল হিসেবে সংরক্ষণ করুন বা শেয়ার করুন"
            onPress={onBackup}
            busy={busy === "backup"}
          />
          <Divider />
          <Action
            Icon={FileSpreadsheet}
            title="Excel/CSV ডাউনলোড"
            subtitle="পণ্য, বিক্রয় ও খরচ - তিনটি শীটে .xlsx ফাইল"
            onPress={onExportExcel}
            busy={busy === "excel"}
          />
          <Divider />
          <Action
            Icon={Upload}
            title="ব্যাকআপ থেকে পুনরুদ্ধার"
            subtitle="JSON ফাইল থেকে ডেটা ফিরিয়ে আনুন"
            onPress={onRestore}
            busy={busy === "restore"}
            tone="warn"
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          নিরাপত্তা
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <ToggleRow
            Icon={ShieldCheck}
            title="অ্যাপ লক"
            subtitle={
              lockEnabled
                ? "অ্যাপ খুললেই পিন চাইবে"
                : "৪ অঙ্কের পিন দিয়ে অ্যাপ সুরক্ষিত করুন"
            }
            value={lockEnabled}
            onValueChange={onToggleLock}
          />
          {lockEnabled ? (
            <>
              <Divider />
              <Action
                Icon={KeyRound}
                title="পিন পরিবর্তন করুন"
                subtitle="নতুন ৪ অঙ্কের পিন সেট করুন"
                onPress={onChangePin}
              />
              {biometricAvailable ? (
                <>
                  <Divider />
                  <ToggleRow
                    Icon={Fingerprint}
                    title={`${biometricLabel} আনলক`}
                    subtitle={`পিনের পাশাপাশি ${biometricLabel} দিয়েও আনলক করা যাবে`}
                    value={lockSettings.biometricEnabled}
                    onValueChange={onToggleBiometric}
                  />
                </>
              ) : null}
              <Divider />
              <Action
                Icon={Lock}
                title="এখনই লক করুন"
                subtitle="অ্যাপ এখনই লক করে দিন"
                onPress={onLockNow}
              />
            </>
          ) : null}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          অ্যাকাউন্ট
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <Pressable
            onPress={onCopyEmail}
            style={({ pressed }) => [
              styles.emailRow,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <View
              style={[
                styles.emailIconWrap,
                { backgroundColor: colors.cardElevated },
              ]}
            >
              <Mail size={18} color={colors.accent} />
            </View>
            <View style={styles.emailMid}>
              <Text style={[styles.emailLabel, { color: colors.mutedForeground }]}>
                সাইন-ইন ইমেইল
              </Text>
              <Text style={[styles.emailValue, { color: colors.text }]}>
                {email}
              </Text>
            </View>
            <Copy size={16} color={colors.mutedForeground} />
          </Pressable>
          <Divider />
          <Action
            Icon={LogOut}
            title="অন্য ইমেইল ব্যবহার করুন"
            subtitle="ক্লাউড ডেটা একই ইমেইল দিয়ে আবার দেখা যাবে"
            onPress={onSignOut}
            tone="destructive"
          />
        </View>

        <Text style={[styles.note, { color: colors.mutedForeground }]}>
          একই ইমেইলে যেকোনো ফোন থেকে লগইন করলে একই ডেটা দেখতে পাবেন। যেকোনো একটি
          ফোনে ডেটা পরিবর্তন করলে সব ফোনেই আপডেট হবে।
        </Text>
      </ScrollView>
      <PinSetupSheet
        visible={pinSheet.visible}
        mode={pinSheet.mode}
        onClose={() => setPinSheet((p) => ({ ...p, visible: false }))}
      />
    </View>
  );
}

function ToggleRow({
  Icon,
  title,
  subtitle,
  value,
  onValueChange,
}: {
  Icon: LucideIcon;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
}) {
  const colors = useColors();
  return (
    <View style={styles.actionRow}>
      <View
        style={[
          styles.actionIconWrap,
          { backgroundColor: colors.cardElevated },
        ]}
      >
        <Icon size={18} color={colors.accent} />
      </View>
      <View style={styles.actionMid}>
        <Text style={[styles.actionTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text
          style={[styles.actionSubtitle, { color: colors.mutedForeground }]}
        >
          {subtitle}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.accent }}
        thumbColor={Platform.OS === "android" ? colors.card : undefined}
      />
    </View>
  );
}

function Divider() {
  const colors = useColors();
  return <View style={{ height: 1, backgroundColor: colors.border }} />;
}

function Action({
  Icon,
  title,
  subtitle,
  onPress,
  busy,
  tone,
}: {
  Icon: LucideIcon;
  title: string;
  subtitle: string;
  onPress: () => void;
  busy?: boolean;
  tone?: "warn" | "destructive";
}) {
  const colors = useColors();
  const iconColor =
    tone === "destructive"
      ? colors.destructive
      : tone === "warn"
        ? colors.accent
        : colors.accent;
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      style={({ pressed }) => [
        styles.actionRow,
        { opacity: pressed || busy ? 0.7 : 1 },
      ]}
    >
      <View
        style={[
          styles.actionIconWrap,
          { backgroundColor: colors.cardElevated },
        ]}
      >
        {busy ? (
          <ActivityIndicator color={iconColor} size="small" />
        ) : (
          <Icon size={18} color={iconColor} />
        )}
      </View>
      <View style={styles.actionMid}>
        <Text style={[styles.actionTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text
          style={[styles.actionSubtitle, { color: colors.mutedForeground }]}
        >
          {subtitle}
        </Text>
      </View>
      <ChevronRight size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  brand: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  logo: { width: 72, height: 72 },
  brandTitle: { fontSize: 24, fontWeight: "700" },
  brandTag: { fontSize: 13 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  actionMid: { flex: 1 },
  actionTitle: { fontSize: 14, fontWeight: "600" },
  actionSubtitle: { fontSize: 12, marginTop: 2 },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  emailIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  emailMid: { flex: 1 },
  emailLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "600",
  },
  emailValue: { fontSize: 14, fontWeight: "600", marginTop: 2 },
  note: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 16,
    paddingHorizontal: 8,
    textAlign: "center",
  },
});
