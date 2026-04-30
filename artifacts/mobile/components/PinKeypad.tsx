import { Delete } from "lucide-react-native";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

const KEYS: (string | "back" | "")[] = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "",
  "0",
  "back",
];

type Props = {
  value: string;
  maxLength?: number;
  onChange: (next: string) => void;
  disabled?: boolean;
};

export function PinKeypad({
  value,
  maxLength = 6,
  onChange,
  disabled,
}: Props) {
  const colors = useColors();

  const press = (key: string | "back" | "") => {
    if (disabled) return;
    if (key === "") return;
    if (key === "back") {
      onChange(value.slice(0, -1));
      return;
    }
    if (value.length >= maxLength) return;
    onChange(value + key);
  };

  return (
    <View style={styles.grid}>
      {KEYS.map((key, idx) => {
        const isBack = key === "back";
        const isEmpty = key === "";
        return (
          <View key={`${key}-${idx}`} style={styles.cell}>
            {isEmpty ? (
              <View style={styles.keyPlaceholder} />
            ) : (
              <Pressable
                onPress={() => press(key)}
                disabled={disabled}
                style={({ pressed }) => [
                  styles.key,
                  {
                    backgroundColor: pressed
                      ? colors.cardElevated
                      : colors.card,
                    borderColor: colors.border,
                    opacity: disabled ? 0.5 : 1,
                  },
                ]}
              >
                {isBack ? (
                  <Delete size={22} color={colors.text} />
                ) : (
                  <Text style={[styles.keyText, { color: colors.text }]}>
                    {key}
                  </Text>
                )}
              </Pressable>
            )}
          </View>
        );
      })}
    </View>
  );
}

type DotsProps = {
  filled: number;
  length?: number;
  error?: boolean;
};

export function PinDots({ filled, length = 4, error }: DotsProps) {
  const colors = useColors();
  return (
    <View style={styles.dots}>
      {Array.from({ length }).map((_, i) => {
        const on = i < filled;
        return (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: error
                  ? colors.destructive
                  : on
                    ? colors.accent
                    : "transparent",
                borderColor: error
                  ? colors.destructive
                  : on
                    ? colors.accent
                    : colors.border,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 280,
    alignSelf: "center",
  },
  cell: {
    width: "33.3333%",
    aspectRatio: 1.6,
    padding: 6,
  },
  key: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: { cursor: "pointer" as const },
      default: {},
    }),
  },
  keyPlaceholder: {
    flex: 1,
  },
  keyText: {
    fontSize: 26,
    fontWeight: "600",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
    marginVertical: 24,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 999,
    borderWidth: 2,
  },
});
