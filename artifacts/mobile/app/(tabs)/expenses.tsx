import { useQueryClient } from "@tanstack/react-query";
import {
  getListExpensesQueryKey,
  useDeleteExpense,
  useListExpenses,
} from "@workspace/api-client-react";
import { Plus, Trash2 } from "lucide-react-native";
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

import { ExpenseSheet } from "@/components/ExpenseSheet";
import { FormSelect } from "@/components/FormControls";
import { Header } from "@/components/Header";
import { Badge, Card, Empty, SectionTitle } from "@/components/UI";
import { useShop } from "@/context/ShopContext";
import { useToast } from "@/context/ToastContext";
import { useColors } from "@/hooks/useColors";
import { bnDate, bnMonth, tk } from "@/lib/format";

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  return `${y}-${m}`;
}

export default function ExpensesScreen() {
  const colors = useColors();
  const { email } = useShop();
  const { show } = useToast();
  const qc = useQueryClient();

  const [showSheet, setShowSheet] = useState(false);
  const [filter, setFilter] = useState("");

  const list = useListExpenses(email ?? "");
  const expenses = list.data ?? [];

  const months = useMemo(() => {
    const set = new Set<string>();
    for (const e of expenses) set.add(ymd(new Date(e.date)));
    return [...set].sort().reverse();
  }, [expenses]);

  const monthOptions = useMemo(
    () => [
      { value: "", label: "সব মাস" },
      ...months.map((m) => ({ value: m, label: bnMonth(m) })),
    ],
    [months],
  );

  const filtered = useMemo(() => {
    if (!filter) return expenses;
    return expenses.filter((e) => ymd(new Date(e.date)) === filter);
  }, [expenses, filter]);

  const totalShown = useMemo(
    () => filtered.reduce((acc, e) => acc + Number(e.amount), 0),
    [filtered],
  );

  const today = new Date().toDateString();
  const todayTotal = useMemo(
    () =>
      expenses
        .filter((e) => new Date(e.date).toDateString() === today)
        .reduce((acc, e) => acc + Number(e.amount), 0),
    [expenses, today],
  );

  const delMut = useDeleteExpense({
    mutation: {
      onSuccess: async () => {
        if (email) {
          await qc.invalidateQueries({
            queryKey: getListExpensesQueryKey(email),
          });
        }
        await qc.invalidateQueries({
          predicate: (q) => {
            const key = q.queryKey?.[0];
            return typeof key === "string" && key.includes("dashboard");
          },
        });
        show("খরচ মুছে ফেলা হয়েছে", "success");
      },
      onError: () => {
        show("মুছে ফেলা ব্যর্থ হয়েছে", "error");
      },
    },
  });

  const onDelete = (id: string, label: string) => {
    if (!email) return;
    const doDelete = () => delMut.mutate({ email, id });

    if (Platform.OS === "web") {
      // eslint-disable-next-line no-alert
      const ok = window.confirm(`"${label}" খরচটি মুছে ফেলবেন?`);
      if (ok) doDelete();
      return;
    }
    Alert.alert(
      "খরচ মুছবেন?",
      `"${label}" খরচটি স্থায়ীভাবে মুছে যাবে।`,
      [
        { text: "বাতিল", style: "cancel" },
        { text: "মুছুন", style: "destructive", onPress: doDelete },
      ],
    );
  };

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <Header onNewSale={() => setShowSheet(true)} />
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
        <View style={styles.summaryRow}>
          <View
            style={[
              styles.summary,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
              আজকের খরচ
            </Text>
            <Text style={[styles.summaryValue, { color: colors.destructive }]}>
              {tk(todayTotal)}
            </Text>
          </View>
          <View
            style={[
              styles.summary,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
              {filter ? "মাসের মোট" : "সর্বমোট খরচ"}
            </Text>
            <Text style={[styles.summaryValue, { color: colors.destructive }]}>
              {tk(totalShown)}
            </Text>
          </View>
        </View>

        <SectionTitle
          right={
            <Pressable
              onPress={() => setShowSheet(true)}
              style={({ pressed }) => [
                styles.addBtn,
                {
                  backgroundColor: colors.primary,
                  borderRadius: colors.radius - 2,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Plus size={14} color="#000" strokeWidth={3} />
              <Text style={styles.addBtnText}>নতুন খরচ</Text>
            </Pressable>
          }
        >
          খরচের ইতিহাস
        </SectionTitle>

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
          <Empty
            text="কোনো খরচ পাওয়া যায়নি।"
            hint='উপরের "নতুন খরচ" বাটনে ক্লিক করুন।'
          />
        ) : (
          <Card>
            {filtered.map((e, idx) => (
              <View
                key={e.id}
                style={[
                  styles.row,
                  {
                    borderBottomColor: colors.border,
                    borderBottomWidth: idx === filtered.length - 1 ? 0 : 1,
                  },
                ]}
              >
                <View style={styles.left}>
                  <Text style={[styles.cat, { color: colors.text }]}>
                    {e.cat}
                  </Text>
                  <Text
                    style={[styles.meta, { color: colors.mutedForeground }]}
                  >
                    {bnDate(e.date)}
                    {e.note ? ` · ${e.note}` : ""}
                  </Text>
                </View>
                <View style={styles.right}>
                  <Text
                    style={[styles.amount, { color: colors.destructive }]}
                  >
                    -{tk(e.amount)}
                  </Text>
                  <Pressable
                    onPress={() => onDelete(e.id, e.cat)}
                    hitSlop={8}
                    style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
                  >
                    <Trash2 size={16} color={colors.mutedForeground} />
                  </Pressable>
                </View>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>

      <ExpenseSheet visible={showSheet} onClose={() => setShowSheet(false)} />
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
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 22,
  },
  summary: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
  },
  summaryLabel: {
    fontSize: 11,
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  filter: {
    marginBottom: 12,
  },
  loading: {
    paddingVertical: 60,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    alignItems: "center",
  },
  left: { flex: 1 },
  right: {
    alignItems: "flex-end",
    gap: 6,
    flexDirection: "row",
  },
  cat: {
    fontSize: 14,
    fontWeight: "600",
  },
  meta: {
    fontSize: 12,
    marginTop: 2,
  },
  amount: {
    fontSize: 14,
    fontWeight: "700",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addBtnText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 12,
  },
});
