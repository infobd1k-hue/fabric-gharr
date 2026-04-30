import { useQueryClient } from "@tanstack/react-query";
import {
  getListProductsQueryKey,
  useDeleteProduct,
  useListProducts,
  type Product,
} from "@workspace/api-client-react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react-native";
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
  TextInput,
  View,
} from "react-native";

import { Header } from "@/components/Header";
import { ProductSheet } from "@/components/ProductSheet";
import { SaleSheet } from "@/components/SaleSheet";
import { Badge, Card, Empty, SectionTitle } from "@/components/UI";
import { useShop } from "@/context/ShopContext";
import { useToast } from "@/context/ToastContext";
import { useColors } from "@/hooks/useColors";
import { fmt, tk } from "@/lib/format";

export default function ProductsScreen() {
  const colors = useColors();
  const { email } = useShop();
  const { show } = useToast();
  const qc = useQueryClient();
  const [showProd, setShowProd] = useState(false);
  const [showSale, setShowSale] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const list = useListProducts(email ?? "");
  const allProducts = list.data ?? [];

  const products = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allProducts;
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.cat.toLowerCase().includes(q),
    );
  }, [allProducts, query]);

  const deleteMut = useDeleteProduct({
    mutation: {
      onSuccess: async () => {
        if (email) {
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
        show("পণ্য মুছে ফেলা হয়েছে", "success");
      },
      onError: () => show("মুছে ফেলা যায়নি", "error"),
      onSettled: () => setDeletingId(null),
    },
  });

  const onAdd = () => {
    setEditing(null);
    setShowProd(true);
  };

  const onEdit = (p: Product) => {
    setEditing(p);
    setShowProd(true);
  };

  const onDelete = (p: Product) => {
    if (!email) return;
    const run = () => {
      setDeletingId(p.id);
      deleteMut.mutate({ email, id: p.id });
    };
    if (Platform.OS === "web") {
      if (window.confirm(`"${p.name}" পণ্যটি মুছে ফেলবেন?`)) run();
      return;
    }
    Alert.alert(
      "পণ্য মুছে ফেলবেন?",
      `"${p.name}" স্থায়ীভাবে মুছে যাবে।`,
      [
        { text: "বাতিল", style: "cancel" },
        { text: "মুছে ফেলুন", style: "destructive", onPress: run },
      ],
    );
  };

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
        <SectionTitle
          right={
            <Pressable
              onPress={onAdd}
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
              <Text style={styles.addText}>যোগ করুন</Text>
            </Pressable>
          }
        >
          পণ্য তালিকা
        </SectionTitle>

        <View
          style={[
            styles.searchWrap,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <Search size={16} color={colors.mutedForeground} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="পণ্যের নাম বা ক্যাটাগরি দিয়ে খুঁজুন"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.text }]}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <Pressable
              onPress={() => setQuery("")}
              hitSlop={8}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <X size={16} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>

        {list.isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : allProducts.length === 0 ? (
          <Empty
            text="কোনো পণ্য নেই।"
            hint='উপরের "+ যোগ করুন" বাটনে ক্লিক করুন।'
          />
        ) : products.length === 0 ? (
          <Empty
            text="কিছু পাওয়া যায়নি।"
            hint="অন্য নাম বা ক্যাটাগরি দিয়ে চেষ্টা করুন।"
          />
        ) : (
          <Card>
            {products.map((p, idx) => {
              const tone =
                p.stock <= 0
                  ? "red"
                  : p.stock <= 5
                    ? "amber"
                    : "green";
              return (
                <View
                  key={p.id}
                  style={[
                    styles.row,
                    {
                      borderBottomColor: colors.border,
                      borderBottomWidth: idx === products.length - 1 ? 0 : 1,
                    },
                  ]}
                >
                  <View style={styles.rowLeft}>
                    <Text style={[styles.name, { color: colors.text }]}>
                      {p.name}
                    </Text>
                    <Text
                      style={[
                        styles.meta,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {p.cat} · ক্রয়: {tk(p.buy)}
                    </Text>
                    <View style={styles.actionsRow}>
                      <Pressable
                        onPress={() => onEdit(p)}
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
                        <Text
                          style={[styles.editText, { color: colors.text }]}
                        >
                          সম্পাদনা
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => onDelete(p)}
                        disabled={deletingId === p.id}
                        style={({ pressed }) => [
                          styles.editBtn,
                          {
                            backgroundColor: colors.cardElevated,
                            borderColor: colors.destructive,
                            borderRadius: 6,
                            opacity:
                              pressed || deletingId === p.id ? 0.6 : 1,
                          },
                        ]}
                      >
                        {deletingId === p.id ? (
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
                  <View style={styles.rowRight}>
                    <Text style={[styles.price, { color: colors.accent }]}>
                      {tk(p.sell)}
                    </Text>
                    <Badge tone={tone}>{fmt(p.stock)} পিস</Badge>
                  </View>
                </View>
              );
            })}
          </Card>
        )}
      </ScrollView>

      <ProductSheet
        visible={showProd}
        onClose={() => setShowProd(false)}
        editing={editing}
      />
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
  loading: { paddingVertical: 60, alignItems: "center" },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 4,
    ...Platform.select({
      web: { outlineWidth: 0 } as object,
      default: {},
    }),
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  rowLeft: { flex: 1, gap: 4 },
  rowRight: { alignItems: "flex-end", gap: 6 },
  name: { fontSize: 14, fontWeight: "600" },
  meta: { fontSize: 12 },
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
  price: { fontSize: 14, fontWeight: "700" },
});
