import { onlineManager, useIsFetching, useIsMutating } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export function SyncStatus() {
  const colors = useColors();
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const [online, setOnline] = useState(onlineManager.isOnline());

  useEffect(() => {
    return onlineManager.subscribe((isOnline) => {
      setOnline(isOnline);
    });
  }, []);

  let dotColor = colors.success;
  let label = "সিঙ্ক";
  if (!online) {
    dotColor = colors.destructive;
    label = "অফলাইন";
  } else if (isFetching > 0 || isMutating > 0) {
    dotColor = colors.accent;
    label = "সিঙ্ক হচ্ছে";
  }

  return (
    <View style={styles.wrap}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={[styles.label, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
  },
});
