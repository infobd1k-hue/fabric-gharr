import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text } from "react-native";
import {
  getListProductsQueryKey,
  useCreateProduct,
  useDeleteProduct,
  useUpdateProduct,
  type Product,
} from "@workspace/api-client-react";

import {
  Field,
  FieldRow,
  FormInput,
  FormSelect,
  SheetButtons,
} from "@/components/FormControls";
import { Sheet } from "@/components/Sheet";
import { useShop } from "@/context/ShopContext";
import { useToast } from "@/context/ToastContext";
import { useColors } from "@/hooks/useColors";

const CATEGORIES = [
  "3 পিস",
  "শাড়ি",
  "সালোয়ার কামিজ",
  "কুর্তি",
  "পাঞ্জাবি",
  "শার্ট",
  "প্যান্ট",
  "শিশু পোশাক",
  "অন্যান্য",
];

type Props = {
  visible: boolean;
  onClose: () => void;
  editing: Product | null;
};

export function ProductSheet({ visible, onClose, editing }: Props) {
  const { email } = useShop();
  const { show } = useToast();
  const colors = useColors();
  const qc = useQueryClient();

  const invalidateAll = async () => {
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
  };

  const [name, setName] = useState("");
  const [cat, setCat] = useState(CATEGORIES[0] ?? "অন্যান্য");
  const [buy, setBuy] = useState("");
  const [sell, setSell] = useState("");
  const [stock, setStock] = useState("");

  useEffect(() => {
    if (visible) {
      if (editing) {
        setName(editing.name);
        setCat(editing.cat);
        setBuy(String(editing.buy ?? ""));
        setSell(String(editing.sell ?? ""));
        setStock(String(editing.stock ?? ""));
      } else {
        setName("");
        setCat(CATEGORIES[0] ?? "অন্যান্য");
        setBuy("");
        setSell("");
        setStock("");
      }
    }
  }, [visible, editing]);

  const createMut = useCreateProduct({
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
        show("পণ্য যোগ হয়েছে", "success");
        onClose();
      },
      onError: () => show("সংরক্ষণ ব্যর্থ হয়েছে", "error"),
    },
  });

  const updateMut = useUpdateProduct({
    mutation: {
      onSuccess: async () => {
        await invalidateAll();
        show("পরিবর্তন সংরক্ষিত হয়েছে", "success");
        onClose();
      },
      onError: () => show("সংরক্ষণ ব্যর্থ হয়েছে", "error"),
    },
  });

  const deleteMut = useDeleteProduct({
    mutation: {
      onSuccess: async () => {
        await invalidateAll();
        show("পণ্য মুছে ফেলা হয়েছে", "success");
        onClose();
      },
      onError: () => show("মুছে ফেলা যায়নি", "error"),
    },
  });

  const busy = createMut.isPending || updateMut.isPending || deleteMut.isPending;

  const confirmDelete = () => {
    if (!email || !editing) return;
    const id = editing.id;
    const productName = editing.name;
    if (Platform.OS === "web") {
      const yes = window.confirm(`"${productName}" পণ্যটি মুছে ফেলবেন?`);
      if (yes) deleteMut.mutate({ email, id });
      return;
    }
    Alert.alert(
      "পণ্য মুছে ফেলবেন?",
      `"${productName}" পণ্যটি স্থায়ীভাবে মুছে যাবে। এই কাজ ফিরিয়ে আনা যাবে না।`,
      [
        { text: "বাতিল", style: "cancel" },
        {
          text: "মুছে ফেলুন",
          style: "destructive",
          onPress: () => deleteMut.mutate({ email, id }),
        },
      ],
    );
  };

  const submit = () => {
    if (!email) return;
    if (!name.trim()) {
      show("পণ্যের নাম দিন", "error");
      return;
    }
    const data = {
      name: name.trim(),
      cat,
      buy: Number(buy) || 0,
      sell: Number(sell) || 0,
      stock: Number(stock) || 0,
    };
    if (editing) {
      updateMut.mutate({ email, id: editing.id, data });
    } else {
      createMut.mutate({ email, data });
    }
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={editing ? "পণ্য সম্পাদনা" : "নতুন পণ্য যোগ করুন"}
    >
      <Field label="পণ্যের নাম">
        <FormInput
          value={name}
          onChangeText={setName}
          placeholder="যেমন: শাড়ি, কুর্তি, পাঞ্জাবি..."
          autoFocus={!editing}
        />
      </Field>
      <Field label="ক্যাটাগরি">
        <FormSelect
          value={cat}
          onChange={setCat}
          options={CATEGORIES.map((c) => ({ label: c, value: c }))}
        />
      </Field>
      <FieldRow>
        <Field label="ক্রয় মূল্য (৳)" flex={1}>
          <FormInput
            value={buy}
            onChangeText={setBuy}
            keyboardType="numeric"
            placeholder="0"
          />
        </Field>
        <Field label="বিক্রয় মূল্য (৳)" flex={1}>
          <FormInput
            value={sell}
            onChangeText={setSell}
            keyboardType="numeric"
            placeholder="0"
          />
        </Field>
      </FieldRow>
      <Field label="স্টক পরিমাণ">
        <FormInput
          value={stock}
          onChangeText={setStock}
          keyboardType="numeric"
          placeholder="0"
        />
      </Field>
      <SheetButtons
        onCancel={onClose}
        onSubmit={submit}
        submitLabel="সংরক্ষণ করুন"
        busy={busy}
      />
      {editing ? (
        <Pressable
          onPress={confirmDelete}
          disabled={busy}
          style={({ pressed }) => [
            styles.deleteBtn,
            {
              borderColor: colors.destructive,
              borderRadius: colors.radius - 2,
              opacity: pressed || busy ? 0.6 : 1,
            },
          ]}
        >
          <Trash2 size={16} color={colors.destructive} strokeWidth={2.4} />
          <Text style={[styles.deleteText, { color: colors.destructive }]}>
            পণ্য মুছে ফেলুন
          </Text>
        </Pressable>
      ) : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  deleteBtn: {
    marginTop: 14,
    paddingVertical: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  deleteText: {
    fontWeight: "700",
    fontSize: 14,
  },
});
