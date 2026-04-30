import { useQueryClient } from "@tanstack/react-query";
import {
  getListExpensesQueryKey,
  useCreateExpense,
} from "@workspace/api-client-react";
import React, { useEffect, useState } from "react";

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

type Props = {
  visible: boolean;
  onClose: () => void;
};

const CATEGORY_OPTIONS = [
  { value: "দোকান ভাড়া", label: "দোকান ভাড়া" },
  { value: "বিদ্যুৎ বিল", label: "বিদ্যুৎ বিল" },
  { value: "পরিবহন", label: "পরিবহন" },
  { value: "কর্মচারীর বেতন", label: "কর্মচারীর বেতন" },
  { value: "খাবার", label: "খাবার / চা-নাস্তা" },
  { value: "প্যাকেজিং", label: "প্যাকেজিং" },
  { value: "মেরামত", label: "মেরামত" },
  { value: "অন্যান্য", label: "অন্যান্য" },
];

export function ExpenseSheet({ visible, onClose }: Props) {
  const { email } = useShop();
  const { show } = useToast();
  const qc = useQueryClient();

  const [cat, setCat] = useState<string>(CATEGORY_OPTIONS[0]?.value ?? "");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (visible) {
      setCat(CATEGORY_OPTIONS[0]?.value ?? "");
      setAmount("");
      setNote("");
    }
  }, [visible]);

  const mut = useCreateExpense({
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
        show("খরচ যোগ হয়েছে", "success");
        onClose();
      },
      onError: (err: unknown) => {
        const e = err as { response?: { data?: { error?: string } } };
        show(e?.response?.data?.error ?? "খরচ যোগ ব্যর্থ হয়েছে", "error");
      },
    },
  });

  const submit = () => {
    if (!email) return;
    const a = Number(amount) || 0;
    if (!cat.trim()) {
      show("বিভাগ নির্বাচন করুন", "error");
      return;
    }
    if (a <= 0) {
      show("সঠিক টাকার পরিমাণ দিন", "error");
      return;
    }
    mut.mutate({
      email,
      data: {
        cat: cat.trim(),
        amount: a,
        note: note.trim() || undefined,
      },
    });
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="নতুন খরচ">
      <Field label="খরচের বিভাগ">
        <FormSelect value={cat} onChange={setCat} options={CATEGORY_OPTIONS} />
      </Field>
      <FieldRow>
        <Field label="পরিমাণ (৳)" flex={1}>
          <FormInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="০"
            highlight
          />
        </Field>
      </FieldRow>
      <Field label="নোট">
        <FormInput
          value={note}
          onChangeText={setNote}
          placeholder="বিস্তারিত বা মন্তব্য..."
        />
      </Field>
      <SheetButtons
        onCancel={onClose}
        onSubmit={submit}
        submitLabel="খরচ সংরক্ষণ ✓"
        busy={mut.isPending}
      />
    </Sheet>
  );
}
