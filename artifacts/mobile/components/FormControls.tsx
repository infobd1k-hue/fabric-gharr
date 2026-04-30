import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Check, ChevronDown } from "lucide-react-native";

import { useColors } from "@/hooks/useColors";

type FieldProps = {
  label: string;
  children: React.ReactNode;
  flex?: number;
};

export function Field({ label, children, flex }: FieldProps) {
  const colors = useColors();
  return (
    <View style={[styles.field, flex ? { flex } : null]}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      {children}
    </View>
  );
}

type RowProps = { children: React.ReactNode };
export function FieldRow({ children }: RowProps) {
  return <View style={styles.row}>{children}</View>;
}

type InputProps = React.ComponentProps<typeof TextInput> & {
  highlight?: boolean;
};
export function FormInput({ highlight, style, ...rest }: InputProps) {
  const colors = useColors();
  return (
    <TextInput
      placeholderTextColor={colors.mutedForeground}
      {...rest}
      style={[
        styles.input,
        {
          backgroundColor: colors.cardElevated,
          borderColor: colors.border,
          color: highlight ? colors.accent : colors.text,
          borderRadius: colors.radius - 2,
          fontWeight: highlight ? "700" : "400",
        },
        style,
      ]}
    />
  );
}

type DateInputProps = {
  value: string;
  onChange: (yyyyMmDd: string) => void;
  max?: string;
  min?: string;
};
export function FormDateInput({ value, onChange, max, min }: DateInputProps) {
  const colors = useColors();
  if (Platform.OS === "web") {
    return (
      <input
        type="date"
        value={value}
        max={max}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        style={{
          backgroundColor: colors.cardElevated,
          borderWidth: 1,
          borderColor: colors.border,
          borderStyle: "solid",
          color: colors.text,
          borderRadius: colors.radius - 2,
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 12,
          paddingRight: 12,
          fontSize: 14,
          fontFamily: "inherit",
          outline: "none",
          colorScheme: "dark",
          width: "100%",
          boxSizing: "border-box",
        }}
      />
    );
  }
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder="YYYY-MM-DD"
      placeholderTextColor={colors.mutedForeground}
      autoCapitalize="none"
      autoCorrect={false}
      keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "default"}
      style={[
        styles.input,
        {
          backgroundColor: colors.cardElevated,
          borderColor: colors.border,
          color: colors.text,
          borderRadius: colors.radius - 2,
        },
      ]}
    />
  );
}

type SelectProps = {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
};
export function FormSelect({
  value,
  onChange,
  options,
  placeholder,
}: SelectProps) {
  const colors = useColors();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.select,
          {
            backgroundColor: colors.cardElevated,
            borderColor: colors.border,
            borderRadius: colors.radius - 2,
          },
        ]}
      >
        <Text
          numberOfLines={1}
          style={{
            color: selected ? colors.text : colors.mutedForeground,
            fontSize: 15,
            flex: 1,
          }}
        >
          {selected?.label ?? placeholder ?? "নির্বাচন করুন"}
        </Text>
        <ChevronDown size={18} color={colors.mutedForeground} />
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
        statusBarTranslucent
      >
        <Pressable
          style={styles.modalBg}
          onPress={() => setOpen(false)}
        >
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            {options.map((opt, idx) => {
              const active = opt.value === value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  style={[
                    styles.option,
                    {
                      borderBottomColor: colors.border,
                      borderBottomWidth: idx === options.length - 1 ? 0 : 1,
                      backgroundColor: active
                        ? colors.cardElevated
                        : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: active ? colors.accent : colors.text,
                      fontSize: 15,
                      fontWeight: active ? "600" : "400",
                      flex: 1,
                    }}
                  >
                    {opt.label}
                  </Text>
                  {active ? (
                    <Check size={18} color={colors.accent} strokeWidth={3} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

type SheetButtonsProps = {
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
  cancelLabel?: string;
  busy?: boolean;
};
export function SheetButtons({
  onCancel,
  onSubmit,
  submitLabel,
  cancelLabel = "বাতিল",
  busy,
}: SheetButtonsProps) {
  const colors = useColors();
  return (
    <View style={styles.buttons}>
      <Pressable
        onPress={onCancel}
        disabled={busy}
        style={({ pressed }) => [
          styles.btnCancel,
          {
            backgroundColor: colors.cardElevated,
            borderColor: colors.border,
            borderRadius: colors.radius - 2,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <Text style={{ color: colors.text, fontSize: 15 }}>{cancelLabel}</Text>
      </Pressable>
      <Pressable
        onPress={onSubmit}
        disabled={busy}
        style={({ pressed }) => [
          styles.btnSubmit,
          {
            backgroundColor: colors.primary,
            borderRadius: colors.radius - 2,
            opacity: pressed || busy ? 0.85 : 1,
          },
        ]}
      >
        <Text style={styles.btnSubmitText}>
          {busy ? "অপেক্ষা করুন..." : submitLabel}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 12 },
  label: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  input: {
    paddingHorizontal: 13,
    paddingVertical: Platform.OS === "ios" ? 13 : 10,
    borderWidth: 1,
    fontSize: 15,
  },
  select: {
    paddingHorizontal: 13,
    paddingVertical: 13,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    borderWidth: 1,
    overflow: "hidden",
    maxHeight: "70%",
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  buttons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  btnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  btnSubmit: {
    flex: 2,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnSubmitText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "700",
  },
});
