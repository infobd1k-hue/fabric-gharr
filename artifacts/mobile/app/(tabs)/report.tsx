import { useGetReport } from "@workspace/api-client-react";
import React, { useState } from "react";
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
import { Empty, SectionTitle } from "@/components/UI";
import { useShop } from "@/context/ShopContext";
import { useColors } from "@/hooks/useColors";
import { bnMonth, fmt, tk } from "@/lib/format";

export default function ReportScreen() {
  const colors = useColors();
  const { email } = useShop();
  const [showSale, setShowSale] = useState(false);

  const r = useGetReport(email ?? "");
  const data = r.data;

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <Header onNewSale={() => setShowSale(true)} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={r.isFetching && !r.isLoading}
            onRefresh={r.refetch}
            tintColor={colors.accent}
          />
        }
      >
        <SectionTitle>হিসাব রিপোর্ট</SectionTitle>

        {r.isLoading || !data ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : (
          <>
            <ReportBlock title="সামগ্রিক হিসাব">
              <Row k="মোট বিক্রয়" v={tk(data.totalRevenue)} tone={colors.info} />
              <Row
                k="মোট খরচ"
                v={tk(data.totalCost)}
                tone={colors.destructive}
                last={false}
              />
              <Row
                k="মোট লাভ"
                v={tk(data.totalProfit)}
                tone={colors.success}
              />
              <Row
                k="লাভের হার"
                v={`${fmt(data.profitMargin)}%`}
                tone={colors.accent}
                last
              />
            </ReportBlock>

            <ReportBlock title="মাস অনুযায়ী">
              {data.byMonth.length === 0 ? (
                <Empty text="কোনো তথ্য নেই" />
              ) : (
                data.byMonth.map((m, i) => (
                  <DualRow
                    key={m.month}
                    keyTop={bnMonth(m.month)}
                    keyBottom={`${fmt(m.count)} টি বিক্রয়`}
                    valTop={tk(m.revenue)}
                    valBottom={`লাভ: ${tk(m.profit)}`}
                    last={i === data.byMonth.length - 1}
                  />
                ))
              )}
            </ReportBlock>

            <ReportBlock title="সেরা পণ্য (লাভ অনুযায়ী)">
              {data.topProducts.length === 0 ? (
                <Empty text="কোনো তথ্য নেই" />
              ) : (
                data.topProducts.map((p, i) => (
                  <DualRow
                    key={p.name}
                    keyTop={p.name}
                    keyBottom={`${fmt(p.qty)} পিস বিক্রি`}
                    valTop={tk(p.revenue)}
                    valBottom={`লাভ: ${tk(p.profit)}`}
                    last={i === data.topProducts.length - 1}
                  />
                ))
              )}
            </ReportBlock>
          </>
        )}
      </ScrollView>

      <SaleSheet visible={showSale} onClose={() => setShowSale(false)} />
    </View>
  );
}

function ReportBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.block,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      <View
        style={[
          styles.blockTitle,
          {
            backgroundColor: colors.cardElevated,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text
          style={[styles.blockTitleText, { color: colors.mutedForeground }]}
        >
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

function Row({
  k,
  v,
  tone,
  last,
}: {
  k: string;
  v: string;
  tone: string;
  last?: boolean;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.row,
        {
          borderBottomColor: colors.border,
          borderBottomWidth: last ? 0 : 1,
        },
      ]}
    >
      <Text style={[styles.rowKey, { color: colors.mutedForeground }]}>
        {k}
      </Text>
      <Text style={[styles.rowVal, { color: tone }]}>{v}</Text>
    </View>
  );
}

function DualRow({
  keyTop,
  keyBottom,
  valTop,
  valBottom,
  last,
}: {
  keyTop: string;
  keyBottom: string;
  valTop: string;
  valBottom: string;
  last?: boolean;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.row,
        {
          borderBottomColor: colors.border,
          borderBottomWidth: last ? 0 : 1,
          alignItems: "flex-start",
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowKey, { color: colors.text, fontWeight: "500" }]}>
          {keyTop}
        </Text>
        <Text style={[styles.rowKeySmall, { color: colors.mutedForeground }]}>
          {keyBottom}
        </Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={[styles.rowVal, { color: colors.info }]}>{valTop}</Text>
        <Text style={[styles.rowKeySmall, { color: colors.success }]}>
          {valBottom}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
  loading: { paddingVertical: 60, alignItems: "center" },
  block: {
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 14,
  },
  blockTitle: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  blockTitleText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  rowKey: {
    fontSize: 14,
  },
  rowKeySmall: {
    fontSize: 11,
    marginTop: 2,
  },
  rowVal: {
    fontSize: 14,
    fontWeight: "700",
  },
});
