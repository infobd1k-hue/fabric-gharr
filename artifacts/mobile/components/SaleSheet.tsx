import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import {
  getListProductsQueryKey,
  getListSalesQueryKey,
  listProducts,
  useCreateSale,
  useUpdateSale,
  type Product,
  type Sale,
} from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";

import {
  Field,
  FieldRow,
  FormDateInput,
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
  editing?: Sale | null;
};

function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function ymdToIso(ymd: string, fallback: Date): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
  if (!m) return fallback.toISOString();
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (
    !year ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return fallback.toISOString();
  }
  const now = new Date();
  const d = new Date(
    year,
    month - 1,
    day,
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
  );
  return Number.isNaN(d.getTime()) ? fallback.toISOString() : d.toISOString();
}

export function SaleSheet({ visible, onClose, editing }: Props) {
  const { email } = useShop();
  const { show } = useToast();
  const qc = useQueryClient();
  const isEdit = !!editing;

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
  const [date, setDate] = useState<string>(toYmd(new Date()));

  useEffect(() => {
    if (!visible) return;
    if (editing) {
      setPid(editing.pid);
      setQty(String(editing.qty));
      setPrice(String(editing.price));
      setDisc(String(editing.disc ?? 0));
      setNote(editing.note ?? "");
      setDate(toYmd(new Date(editing.date)));
      return;
    }
    setQty("1");
    setDisc("0");
    setNote("");
    setDate(toYmd(new Date()));
    const first = products[0];
    if (first) {
      setPid(first.id);
      setPrice(String(first.sell ?? ""));
    } else {
      setPid("");
      setPrice("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, products.length, editing?.id]);

  const onSelectProduct = (id: string) => {
    setPid(id);
    if (isEdit) return;
    const p = products.find((x) => x.id === id);
    if (p) setPrice(String(p.sell ?? ""));
  };

  const total = useMemo(() => {
    const q = Number(qty) || 0;
    const p = Number(price) || 0;
    const d = Number(disc) || 0;
    return Math.max(0, q * p - d);
  }, [qty, price, disc]);

  const invalidate = async () => {
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
  };

  const createMut = useCreateSale({
    mutation: {
      onSuccess: async () => {
        await invalidate();
        show("বিক্রয় সম্পন্ন হয়েছে", "success");
        onClose();
      },
      onError: (err: unknown) => {
        const e = err as { response?: { data?: { error?: string } } };
        show(e?.response?.data?.error ?? "বিক্রয় ব্যর্থ হয়েছে", "error");
      },
    },
  });

  const updateMut = useUpdateSale({
    mutation: {
      onSuccess: async () => {
        await invalidate();
        show("বিক্রয় হালনাগাদ হয়েছে", "success");
        onClose();
      },
      onError: (err: unknown) => {
        const e = err as { response?: { data?: { error?: string } } };
        show(e?.response?.data?.error ?? "হালনাগাদ ব্যর্থ হয়েছে", "error");
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
    if (!isEdit && product && product.stock < q) {
      show(`স্টকে মাত্র ${fmt(product.stock)} পিস আছে`, "error");
      return;
    }
    const fallbackDate = editing ? new Date(editing.date) : new Date();
    const data = {
      pid,
      qty: q,
      price: p,
      disc: d,
      note: note.trim() || undefined,
      date: ymdToIso(date, fallbackDate),
    };
    if (isEdit && editing) {
      updateMut.mutate({ email, id: editing.id, data });
    } else {
      createMut.mutate({ email, data });
    }
  };

  if (products.length === 0 && visible) {
    return (
      <Sheet
        visible={visible}
        onClose={onClose}
        title={isEdit ? "বিক্রয় সম্পাদনা" : "নতুন বিক্রয়"}
      >
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

  const busy = createMut.isPending || updateMut.isPending;

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={isEdit ? "বিক্রয় সম্পাদনা" : "নতুন বিক্রয়"}
    >
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
      <Field label="তারিখ">
        <FormDateInput
          value={date}
          onChange={setDate}
          max={toYmd(new Date())}
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
        submitLabel={isEdit ? "সংরক্ষণ ✓" : "বিক্রয় সম্পন্ন ✓"}
        busy={busy}
      />
    </Sheet>
  );
}
