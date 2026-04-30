import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import {
  getListProductsQueryKey,
  getListSalesQueryKey,
  listProducts,
  useCreateSale,
  type Product,
} from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";

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
import { fmt } from "@/lib/format";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function SaleSheet({ visible, onClose }: Props) {
  const { email } = useShop();
  const { show } = useToast();
  const qc = useQueryClient();

  const productsQuery = useQuery<Product[]>({
    queryKey: email ? getListProductsQueryKey(email) : ["disabled"],
    queryFn: () => listProducts(email ?? ""),
    enabled: !!email && visible,
  });
  const products: Product[] = productsQuery.data ?? [];

  const [pid, setPid] = useState<string>("");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("");
  const [disc, setDisc] = useState("0");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (visible) {
      setQty("1");
      setDisc("0");
      setNote("");
      const first = products[0];
      if (first) {
        setPid(first.id);
        setPrice(String(first.sell ?? ""));
      } else {
        setPid("");
        setPrice("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, products.length]);

  const onSelectProduct = (id: string) => {
    setPid(id);
    const p = products.find((x) => x.id === id);
    if (p) setPrice(String(p.sell ?? ""));
  };

  const total = useMemo(() => {
    const q = Number(qty) || 0;
    const p = Number(price) || 0;
    const d = Number(disc) || 0;
    return Math.max(0, q * p - d);
  }, [qty, price, disc]);

  const mut = useCreateSale({
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
        show("বিক্রয় সম্পন্ন হয়েছে", "success");
        onClose();
      },
      onError: (err: unknown) => {
        const e = err as { response?: { data?: { error?: string } } };
        show(e?.response?.data?.error ?? "বিক্রয় ব্যর্থ হয়েছে", "error");
      },
    },
  });

  const submit = () => {
    if (!email) return;
    if (!pid) {
      show("পণ্য নির্বাচন করুন", "error");
      return;
    }
    const q = Number(qty) || 0;
    const p = Number(price) || 0;
    const d = Number(disc) || 0;
    if (q <= 0) {
      show("সঠিক পরিমাণ দিন", "error");
      return;
    }
    const product = products.find((x) => x.id === pid);
    if (product && product.stock < q) {
      show(`স্টকে মাত্র ${fmt(product.stock)} পিস আছে`, "error");
      return;
    }
    mut.mutate({
      email,
      data: {
        pid,
        qty: q,
        price: p,
        disc: d,
        note: note.trim() || undefined,
      },
    });
  };

  if (products.length === 0 && visible) {
    return (
      <Sheet visible={visible} onClose={onClose} title="নতুন বিক্রয়">
        <Field label="">
          <></>
        </Field>
        <SheetButtons
          onCancel={onClose}
          onSubmit={onClose}
          submitLabel="ঠিক আছে"
          cancelLabel="বন্ধ করুন"
        />
      </Sheet>
    );
  }

  return (
    <Sheet visible={visible} onClose={onClose} title="নতুন বিক্রয়">
      <Field label="পণ্য">
        <FormSelect
          value={pid}
          onChange={onSelectProduct}
          options={products.map((p) => ({
            value: p.id,
            label: `${p.name} (স্টক: ${fmt(p.stock)})`,
          }))}
        />
      </Field>
      <FieldRow>
        <Field label="পরিমাণ" flex={1}>
          <FormInput
            value={qty}
            onChangeText={setQty}
            keyboardType="numeric"
          />
        </Field>
        <Field label="একক মূল্য (৳)" flex={1}>
          <FormInput
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="ছাড় (৳)" flex={1}>
          <FormInput
            value={disc}
            onChangeText={setDisc}
            keyboardType="numeric"
          />
        </Field>
        <Field label="মোট (৳)" flex={1}>
          <FormInput
            value={fmt(total)}
            editable={false}
            highlight
          />
        </Field>
      </FieldRow>
      <Field label="নোট">
        <FormInput
          value={note}
          onChangeText={setNote}
          placeholder="ক্রেতার নাম বা তথ্য..."
        />
      </Field>
      <SheetButtons
        onCancel={onClose}
        onSubmit={submit}
        submitLabel="বিক্রয় সম্পন্ন ✓"
        busy={mut.isPending}
      />
    </Sheet>
  );
}
