import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { PinDots, PinKeypad } from "@/components/PinKeypad";
import { Sheet } from "@/components/Sheet";
import { SheetButtons } from "@/components/FormControls";
import { useAppLock } from "@/context/AppLockContext";
import { useToast } from "@/context/ToastContext";
import { useColors } from "@/hooks/useColors";

const PIN_LENGTH = 4;

export type PinSetupMode = "create" | "change" | "disable";

type Props = {
  visible: boolean;
  mode: PinSetupMode;
  onClose: () => void;
};

type Step = "current" | "new" | "confirm";

export function PinSetupSheet({ visible, mode, onClose }: Props) {
  const colors = useColors();
  const { show } = useToast();
  const { settings, setPin, disableLock } = useAppLock();

  const startingStep: Step =
    mode === "create" ? "new" : "current";

  const [step, setStep] = useState<Step>(startingStep);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (visible) {
      setStep(mode === "create" ? "new" : "current");
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      setBusy(false);
    }
  }, [visible, mode]);

  const title =
    mode === "create"
      ? "নতুন পিন সেট করুন"
      : mode === "change"
        ? "পিন পরিবর্তন করুন"
        : "অ্যাপ লক বন্ধ করুন";

  const stepInfo = (() => {
    if (step === "current") {
      return { label: "বর্তমান পিন দিন", value: currentPin, set: setCurrentPin };
    }
    if (step === "new") {
      return { label: "নতুন পিন দিন", value: newPin, set: setNewPin };
    }
    return { label: "নতুন পিন আবার দিন", value: confirmPin, set: setConfirmPin };
  })();

  const proceed = async () => {
    if (busy) return;

    if (step === "current") {
      if (currentPin.length !== PIN_LENGTH) {
        show("পিন অসম্পূর্ণ", "error");
        return;
      }
      if (mode === "disable") {
        setBusy(true);
        try {
          await disableLock(currentPin);
          show("অ্যাপ লক বন্ধ হয়েছে", "success");
          onClose();
        } catch (e) {
          show((e as Error).message ?? "ব্যর্থ হয়েছে", "error");
          setCurrentPin("");
        } finally {
          setBusy(false);
        }
        return;
      }
      // mode === "change" — verify by attempting later. For now, just move on.
      setStep("new");
      return;
    }

    if (step === "new") {
      if (newPin.length !== PIN_LENGTH) {
        show("পিন অসম্পূর্ণ", "error");
        return;
      }
      setStep("confirm");
      return;
    }

    // step === "confirm"
    if (confirmPin.length !== PIN_LENGTH) {
      show("পিন অসম্পূর্ণ", "error");
      return;
    }
    if (confirmPin !== newPin) {
      show("দুটি পিন মিলছে না", "error");
      setConfirmPin("");
      return;
    }
    setBusy(true);
    try {
      if (mode === "create") {
        await setPin(newPin);
        show("পিন সেট হয়েছে", "success");
      } else {
        // change
        await setPin(newPin, currentPin);
        show("পিন পরিবর্তন হয়েছে", "success");
      }
      onClose();
    } catch (e) {
      show((e as Error).message ?? "ব্যর্থ হয়েছে", "error");
      // If old PIN was wrong, send back to that step.
      setStep(mode === "change" ? "current" : "new");
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
    } finally {
      setBusy(false);
    }
  };

  const submitLabel =
    step === "confirm" || mode === "disable" ? "নিশ্চিত করুন" : "পরবর্তী";

  // Auto-submit "current" for disable as soon as it's full length isn't ideal because user might mistype.
  // Keep submit button as the explicit action.

  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <View style={styles.body}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          {stepInfo.label}
        </Text>
        <PinDots filled={stepInfo.value.length} length={PIN_LENGTH} />
        <PinKeypad
          value={stepInfo.value}
          maxLength={PIN_LENGTH}
          onChange={stepInfo.set}
          disabled={busy}
        />
        {settings.enabled && mode !== "create" ? (
          <Text style={[styles.note, { color: colors.mutedForeground }]}>
            ৪ অঙ্কের সংখ্যা ব্যবহার করুন
          </Text>
        ) : null}
      </View>
      <SheetButtons
        onCancel={onClose}
        onSubmit={proceed}
        submitLabel={submitLabel}
        busy={busy}
      />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  body: {
    alignItems: "center",
    paddingTop: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  note: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 12,
  },
});
