import { Image } from "expo-image";
import { Plus } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SyncStatus } from "@/components/SyncStatus";
import { useColors } from "@/hooks/useColors";
import { bnLongDate } from "@/lib/format";

type Props = {
  onNewSale: () => void;
};

export function Header({ onNewSale }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
          paddingTop: insets.top + 12,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.brand}>
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={[styles.title, { color: colors.accent }]}>
            FabricGhar
          </Text>
        </View>
        <Pressable
          onPress={onNewSale}
          style={({ pressed }) => [
            styles.cta,
            {
              backgroundColor: colors.primary,
              borderRadius: colors.radius - 2,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Plus size={16} color="#000" strokeWidth={3} />
          <Text style={styles.ctaText}>বিক্রয়</Text>
        </Pressable>
      </View>
      <View style={styles.metaRow}>
        <Text style={[styles.date, { color: colors.mutedForeground }]}>
          {bnLongDate(new Date())}
        </Text>
        <SyncStatus />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: { width: 28, height: 28 },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  ctaText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 13,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  date: {
    fontSize: 12,
  },
});
