import { useGetDashboard } from "@workspace/api-client-react";
import React, { useState, useCallback } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Header } from "@/components/Header";
import { SaleSheet } from "@/components/SaleSheet";
import { Badge, Card, Empty, SectionTitle } from "@/components/UI";
import { useShop } from "@/context/ShopContext";
import { useColors } from "@/hooks/useColors";
import { fmt, tk } from "@/lib/format";

export default function DashboardScreen() {
  const colors = useColors();
  const { email } = useShop();
  const [showSale, setShowSale] = useState(false);

  const dash = useGetDashboard(email ?? "");

  const onRefresh = useCallback(() => {
    dash.refetch();
  }, [dash]);

  const data = dash.data;
  const sales = data?.todaySales ?? [];

  const cards = [
    {
      label: "আজকের বিক্রয়",
      value: tk(data?.todayRevenue ?? 0),
      tone: colors.info,
    },
    {
      label: "আজকের লাভ",
      value: tk(data?.todayProfit ?? 0),
      tone: colors.success,
    },
    {
      label: "মোট বিক্রয়",
      value: tk(data?.totalRevenue ?? 0),
      tone: colors.info,
    },
    {
      label: "মোট লাভ",
      value: tk(data?.totalProfit ?? 0),
      tone: colors.success,
    },
    {
      label: "মোট পণ্য",
      value: `${fmt(data?.productCount ?? 0)} টি`,
      tone: colors.accent,
    },
    {
      label: "কম স্টক",
      value: `${fmt(data?.lowStockCount ?? 0)} টি`,
      tone:
        (data?.lowStockCount ?? 0) > 0 ? colors.destructive : colors.accent,
    },
  ];

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <Header onNewSale={() => setShowSale(true)} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={dash.isFetching && !dash.isLoading}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {dash.isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : (
          <>
            <View style={styles.grid}>
              {cards.map((c) => (
                <View
                  key={c.label}
                  style={[
                    styles.sumCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      borderRadius: colors.radius,
                    },
                  ]}
                >
                  <Text
                    style={[styles.sumLabel, { color: colors.mutedForeground }]}
                  >
                    {c.label}
                  </Text>
                  <Text style={[styles.sumValue, { color: c.tone }]}>
                    {c.value}
                  </Text>
                </View>
              ))}
            </View>

            <SectionTitle>আজকের বিক্রয়</SectionTitle>
            {sales.length === 0 ? (
              <Empty
                text="আজ এখনো কোনো বিক্রয় নেই।"
                hint='উপরের "+ বিক্রয়" বাটনে ক্লিক করুন।'
              />
            ) : (
              <Card>
                {sales.map((s, idx) => (
                  <View
                    key={s.id}
                    style={[
                      styles.saleRow,
                      {
                        borderBottomColor: colors.border,
                        borderBottomWidth: idx === sales.length - 1 ? 0 : 1,
                      },
                    ]}
                  >
                    <View style={styles.saleLeft}>
                      <Text style={[styles.saleName, { color: colors.text }]}>
                        {s.pname}
                      </Text>
                      <Text
                        style={[
                          styles.saleMeta,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        {fmt(s.qty)} পিস × {tk(s.price)}
                        {s.note ? ` · ${s.note}` : ""}
                      </Text>
                    </View>
                    <View style={styles.saleRight}>
                      <Text
                        style={[styles.salePrice, { color: colors.accent }]}
                      >
                        {tk(s.total)}
                      </Text>
                      <Badge tone="green">লাভ: {tk(s.profit)}</Badge>
                    </View>
                  </View>
                ))}
              </Card>
            )}
          </>
        )}
      </ScrollView>

      <SaleSheet visible={showSale} onClose={() => setShowSale(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  loading: {
    paddingVertical: 60,
    alignItems: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 22,
  },
  sumCard: {
    flexBasis: "48%",
    flexGrow: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
  },
  sumLabel: {
    fontSize: 11,
    marginBottom: 6,
  },
  sumValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  saleRow: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    alignItems: "center",
  },
  saleLeft: { flex: 1 },
  saleRight: { alignItems: "flex-end", gap: 4 },
  saleName: {
    fontSize: 14,
    fontWeight: "600",
  },
  saleMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  salePrice: {
    fontSize: 14,
    fontWeight: "700",
  },
});
