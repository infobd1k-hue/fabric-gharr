import { useListSales } from "@workspace/api-client-react";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { FormSelect } from "@/components/FormControls";
import { Header } from "@/components/Header";
import { SaleSheet } from "@/components/SaleSheet";
import { Badge, Card, Empty, SectionTitle } from "@/components/UI";
import { useShop } from "@/context/ShopContext";
import { useColors } from "@/hooks/useColors";
import { bnDate, bnMonth, fmt, tk } from "@/lib/format";

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  return `${y}-${m}`;
}

export default function SalesScreen() {
  const colors = useColors();
  const { email } = useShop();
  const [showSale, setShowSale] = useState(false);
  const [filter, setFilter] = useState("");

  const list = useListSales(email ?? "");
  const sales = list.data ?? [];

  const months = useMemo(() => {
    const set = new Set<string>();
    for (const s of sales) set.add(ymd(new Date(s.date)));
    return [...set].sort().reverse();
  }, [sales]);

  const monthOptions = useMemo(
    () => [
      { value: "", label: "সব মাস" },
      ...months.map((m) => ({ value: m, label: bnMonth(m) })),
    ],
    [months],
  );

  const filtered = useMemo(() => {
    if (!filter) return sales;
    return sales.filter((s) => ymd(new Date(s.date)) === filter);
  }, [sales, filter]);

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <Header onNewSale={() => setShowSale(true)} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={list.isFetching && !list.isLoading}
            onRefresh={list.refetch}
            tintColor={colors.accent}
          />
        }
      >
        <SectionTitle>বিক্রয় ইতিহাস</SectionTitle>
        <View style={styles.filter}>
          <FormSelect
            value={filter}
            onChange={setFilter}
            options={monthOptions}
          />
        </View>

        {list.isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : filtered.length === 0 ? (
          <Empty text="কোনো বিক্রয় পাওয়া যায়নি।" />
        ) : (
          <Card>
            {filtered.map((s, idx) => (
              <View
                key={s.id}
                style={[
                  styles.row,
                  {
                    borderBottomColor: colors.border,
                    borderBottomWidth: idx === filtered.length - 1 ? 0 : 1,
                  },
                ]}
              >
                <View style={styles.left}>
                  <Text style={[styles.name, { color: colors.text }]}>
                    {s.pname}
                  </Text>
                  <Text
                    style={[styles.meta, { color: colors.mutedForeground }]}
                  >
                    {bnDate(s.date)} · {fmt(s.qty)} পিস
                    {s.note ? ` · ${s.note}` : ""}
                  </Text>
                </View>
                <View style={styles.right}>
                  <Text style={[styles.price, { color: colors.accent }]}>
                    {tk(s.total)}
                  </Text>
                  <Badge tone="green">৳{fmt(s.profit)}</Badge>
                </View>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>

      <SaleSheet visible={showSale} onClose={() => setShowSale(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
  loading: { paddingVertical: 60, alignItems: "center" },
  filter: { marginBottom: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  left: { flex: 1 },
  right: { alignItems: "flex-end", gap: 4 },
  name: { fontSize: 14, fontWeight: "600" },
  meta: { fontSize: 12, marginTop: 2 },
  price: { fontSize: 14, fontWeight: "700" },
});
