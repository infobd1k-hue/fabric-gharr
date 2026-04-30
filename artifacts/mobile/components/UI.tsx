import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type SectionTitleProps = {
  children: React.ReactNode;
  right?: React.ReactNode;
};

export function SectionTitle({ children, right }: SectionTitleProps) {
  const colors = useColors();
  return (
    <View style={styles.titleRow}>
      <Text style={[styles.title, { color: colors.mutedForeground }]}>
        {children}
      </Text>
      {right}
    </View>
  );
}

type EmptyProps = {
  text: string;
  hint?: string;
};

export function Empty({ text, hint }: EmptyProps) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.empty,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
        {text}
      </Text>
      {hint ? (
        <Text style={[styles.emptyHint, { color: colors.mutedForeground }]}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

type CardProps = { children: React.ReactNode };
export function Card({ children }: CardProps) {
  const colors = useColors();
  return (
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
      {children}
    </View>
  );
}

type BadgeProps = {
  children: React.ReactNode;
  tone: "green" | "red" | "amber" | "blue";
};
export function Badge({ children, tone }: BadgeProps) {
  const colors = useColors();
  const map = {
    green: { bg: "rgba(46,204,113,0.18)", color: colors.success },
    red: { bg: "rgba(231,76,60,0.18)", color: colors.destructive },
    amber: { bg: "rgba(245,166,35,0.18)", color: colors.accent },
    blue: { bg: "rgba(52,152,219,0.18)", color: colors.info },
  } as const;
  const { bg, color } = map[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  empty: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    borderWidth: 1,
    gap: 6,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
  emptyHint: {
    fontSize: 12,
    textAlign: "center",
    opacity: 0.8,
  },
  card: {
    borderWidth: 1,
    overflow: "hidden",
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
