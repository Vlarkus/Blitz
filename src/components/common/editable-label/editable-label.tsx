import "./editable-label.scss";
import { useEditableLabel } from "./utils";
import type { EditableLabelProps } from "./interface";

export default function EditableLabel<
  T extends string | number = string | number
>(
  props: EditableLabelProps<T> & {
    /** Max digits before the decimal point (number mode only). If undefined, uncapped. */
    maxIntegerDigits?: number;
    /** Max digits after the decimal point (number mode only). If undefined, uncapped. */
    maxDecimalDigits?: number;
  }
) {
  const {
    value,
    editing,
    buffer,
    beginEdit,
    inputRef,
    onChange,
    onBlur,
    onKeyDown,
    onBeforeInput,
    onPaste,
    className,
    labelClassName,
    inputClassName,
    disabled,
    ariaLabel,
  } = useEditableLabel<T>(props);

  // ---- helpers for digit caps (number mode only) ----
  const isNumberMode = props.inputRules?.type === "number";
  const maxInt = props.maxIntegerDigits;
  const maxDec = props.maxDecimalDigits;

  const countParts = (s: string) => {
    const neg = s.startsWith("-");
    const unsigned = neg ? s.slice(1) : s;
    const [i = "", f = ""] = unsigned.split(".");
    return { neg, i, f };
  };

  const respectsDigitCaps = (s: string) => {
    if (!isNumberMode) return true;
    const { i, f } = countParts(s);
    if (maxInt !== undefined && i.replace(/\D/g, "").length > maxInt)
      return false;
    if (maxDec !== undefined && f.replace(/\D/g, "").length > maxDec)
      return false;
    return true;
  };

  const formatWithCaps = (val: unknown) => {
    // Only apply caps in number mode and for numeric values
    if (!isNumberMode) return String(val);
    const raw = String(val);
    const { neg, i, f } = countParts(raw);

    const cappedI = maxInt !== undefined ? i.slice(0, maxInt) : i;

    const cappedF = maxDec !== undefined ? f.slice(0, maxDec) : f;

    const sign = neg ? "-" : "";
    // Preserve decimal point only if there was one originally or there are fractional digits
    return f.length > 0 || cappedF.length > 0
      ? `${sign}${cappedI}.${cappedF}`
      : `${sign}${cappedI}`;
  };

  // ---- local guards to cap typing/paste (number mode only) ----
  const baseOnBeforeInput = onBeforeInput;
  const baseOnPaste = onPaste;

  // --- replace your handleBeforeInput with this ---
  const handleBeforeInput: React.FormEventHandler<HTMLInputElement> = (e) => {
    if (disabled) return;

    // If we're not enforcing caps for number mode, just pass through.
    if (!isNumberMode || (maxInt === undefined && maxDec === undefined)) {
      baseOnBeforeInput?.(e);
      return;
    }

    // Some browsers / inputs don't provide inputType or data on beforeinput.
    const native = e.nativeEvent as unknown as
      | { data?: string; inputType?: string }
      | undefined;
    const inputType =
      typeof native?.inputType === "string" ? native!.inputType : "";
    const data = typeof native?.data === "string" ? native!.data : "";

    // Allow deletions and non-insertions to proceed.
    if (!data || inputType.startsWith("delete")) {
      baseOnBeforeInput?.(e);
      return;
    }

    const el = e.currentTarget;
    const buf = String(buffer ?? "");
    const start = el.selectionStart ?? buf.length;
    const end = el.selectionEnd ?? start;

    const candidate = buf.slice(0, start) + data + buf.slice(end);

    if (!respectsDigitCaps(candidate)) {
      e.preventDefault();
      return;
    }

    baseOnBeforeInput?.(e);
  };
  // --- end replacement ---

  const handlePaste: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
    if (disabled) return;
    if (!isNumberMode || (maxInt === undefined && maxDec === undefined)) {
      baseOnPaste?.(e);
      return;
    }

    const text = e.clipboardData.getData("text") ?? "";
    if (!text) {
      baseOnPaste?.(e);
      return;
    }

    const el = e.currentTarget;
    const buf = String(buffer ?? "");
    const start = el.selectionStart ?? buf.length;
    const end = el.selectionEnd ?? start;

    // Build a candidate and check caps; block if it would exceed
    const candidate = buf.slice(0, start) + text + buf.slice(end);
    if (!respectsDigitCaps(candidate)) {
      e.preventDefault();
      return;
    }

    baseOnPaste?.(e);
  };

  if (!editing) {
    return (
      <span
        role="button"
        tabIndex={disabled ? -1 : 0}
        className={labelClassName ?? className}
        aria-label={ariaLabel}
        onDoubleClick={beginEdit}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            beginEdit();
          }
        }}
      >
        {formatWithCaps(value)}
      </span>
    );
  }

  // For sizing, reflect the capped buffer preview so width doesn't jump when caps apply
  const bufferForWidth = isNumberMode
    ? formatWithCaps(buffer ?? String(value))
    : buffer ?? String(value);
  const ch = Math.max(2, bufferForWidth.length);

  return (
    <span className={className} aria-label={ariaLabel}>
      <input
        ref={inputRef}
        className={inputClassName ?? "el-input"}
        type="text"
        value={buffer}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        onBeforeInput={handleBeforeInput}
        onPaste={handlePaste}
        inputMode={isNumberMode ? "decimal" : undefined}
        disabled={disabled}
        style={{ width: `${ch + 1}ch`, fontStyle: "italic" }}
      />
    </span>
  );
}
