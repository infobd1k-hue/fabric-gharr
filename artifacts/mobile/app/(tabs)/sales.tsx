import { useQueryClient } from "@tanstack/react-query";
import {
  getListProductsQueryKey,
  getListSalesQueryKey,
  useDeleteSale,
  useListSales,
  type Sale,
} from "@workspace/api-client-react";
import { Pencil, Trash2 } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
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
import { useToast } from "@/context/ToastContext";
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
  const { show } = useToast();
  const qc = useQueryClient();
  const [showSale, setShowSale] = useState(false);
  const [editing, setEditing] = useState<Sale | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  const list = useListSales(email ?? "");
  const sales = list.data ?? [];

  const deleteMut = useDeleteSale({
    mutation: {
      onSuccess: async () => {
        if (email) {
          await qc.invalidateQueries({
            queryKey: getListSalesQueryKey(email),
          });
          await qc.invalidateQueries({
            queryKey: getListProductsQueryKey(email),
          });
        }
        await qc.invalidateQueries({
          predicate: (q) => {
            const key = q.queryKey?.[0];
            return (
              typeof key === "string" &&
              (key.includes("dashboard") || key.includes("report"))
            );
          },
        });
        show("বিক্রয় মুছে ফেলা হয়েছে", "success");
      },
      onError: () => show("মুছে ফেলা যায়নি", "error"),
      onSettled: () => setDeletingId(null),
    },
  });

  const onEdit = (s: Sale) => {
    setEditing(s);
    setShowSale(true);
  };

  const onNewSale = () => {
    setEditing(null);
    setShowSale(true);
  };

  const onDelete = (s: Sale) => {
    if (!email) return;
    const run = () => {
      setDeletingId(s.id);
      deleteMut.mutate({ email, id: s.id });
    };
    if (Platform.OS === "web") {
      if (
        window.confirm(
          `"${s.pname}" বিক্রয়টি মুছে ফেলবেন? স্টক পুনরুদ্ধার হবে।`,
        )
      )
        run();
      return;
    }
    Alert.alert(
      "বিক্রয় মুছে ফেলবেন?",
      `"${s.pname}" বিক্রয়টি মুছে গেলে স্টকে ${fmt(s.qty)} পিস ফিরে আসবে।`,
      [
        { text: "বাতিল", style: "cancel" },
        { text: "মুছে ফেলুন", style: "destructive", onPress: run },
      ],
    );
  };

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
      <Header onNewSale={onNewSale} />
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
                  <View style={styles.actionsRow}>
                    <Pressable
                      onPress={() => onEdit(s)}
                      style={({ pressed }) => [
                        styles.editBtn,
                        {
                          backgroundColor: colors.cardElevated,
                          borderColor: colors.border,
                          borderRadius: 6,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <Pencil size={12} color={colors.text} />
                      <Text style={[styles.editText, { color: colors.text }]}>
                        সম্পাদনা
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => onDelete(s)}
                      disabled={deletingId === s.id}
                      style={({ pressed }) => [
                        styles.editBtn,
                        {
                          backgroundColor: colors.cardElevated,
                          borderColor: colors.destructive,
                          borderRadius: 6,
                          opacity:
                            pressed || deletingId === s.id ? 0.6 : 1,
                        },
                      ]}
                    >
                      {deletingId === s.id ? (
                        <ActivityIndicator
                          size="small"
                          color={colors.destructive}
                        />
                      ) : (
                        <>
                          <Trash2
                            size={12}
                            color={colors.destructive}
                            strokeWidth={2.4}
                          />
                          <Text
                            style={[
                              styles.editText,
                              { color: colors.destructive },
                            ]}
                          >
                            মুছুন
                          </Text>
                        </>
                      )}
                    </Pressable>
                  </View>
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

      <SaleSheet
        visible={showSale}
        onClose={() => setShowSale(false)}
        editing={editing}
      />
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
  left: { flex: 1, gap: 4 },
  right: { alignItems: "flex-end", gap: 4 },
  name: { fontSize: 14, fontWeight: "600" },
  meta: { fontSize: 12, marginTop: 2 },
  price: { fontSize: 14, fontWeight: "700" },
  actionsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  editText: { fontSize: 12, fontWeight: "500" },
});
