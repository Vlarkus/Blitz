// src/components/editableLabel/useEditableLabel.ts
import { useEffect, useMemo, useRef, useState } from "react";
import type { EditableLabelProps } from "./interface";
import type { InputRules } from "./types";

export function useEditableLabel<T extends string | number = string | number>(
  props: EditableLabelProps<T>
) {
  const {
    value,
    onCommit,
    inputRules,
    className,
    labelClassName,
    inputClassName,
    disabled = false,
    ariaLabel,
    commitOnBlur = true,
    autoSelect = true,
  } = props;

  const [editing, setEditing] = useState(false);
  const [buffer, setBuffer] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const rules = useMemo<InputRules>(
    () => inputRules ?? { type: "text" },
    [inputRules]
  );

  // enter edit mode
  const beginEdit = () => {
    if (disabled) return;
    setBuffer(String(value));
    setEditing(true);
  };

  // commit (convert according to rules, soft clamp for numbers)
  const commit = () => {
    let next: any = buffer;

    if (rules.type === "number") {
      // normalize textual edge-cases
      const text = buffer.trim();
      if (text === "" || text === "-" || text === "." || text === "-.") {
        setEditing(false);
        return; // nothing to commit
      }
      let n = Number(text);
      if (!Number.isFinite(n)) {
        setEditing(false);
        return; // store will reject anyway; skip
      }
      if (typeof rules.min === "number") n = Math.max(rules.min, n);
      if (typeof rules.max === "number") n = Math.min(rules.max, n);
      if (typeof rules.decimals === "number") {
        const factor = Math.pow(10, Math.max(0, rules.decimals));
        n = Math.round(n * factor) / factor;
      }
      next = n as number;
    } else {
      // text: apply maxlength on commit too
      if (
        typeof rules.maxLength === "number" &&
        buffer.length > rules.maxLength
      ) {
        next = buffer.slice(0, rules.maxLength);
      }
    }

    if (String(next) !== String(value)) onCommit(next as T);
    setEditing(false);
  };

  const cancel = () => {
    setEditing(false);
  };

  // focus + select on entry
  useEffect(() => {
    if (editing && inputRef.current && autoSelect) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing, autoSelect]);

  // build character-level guards
  const allowTextChar = (ch: string): boolean => {
    if (rules.type !== "text") return true;
    if (!rules.allowedChars) return true;
    const re = new RegExp(`^[${rules.allowedChars}]$`);
    return re.test(ch);
  };

  const nextStringFromBeforeInput = (
    el: HTMLInputElement,
    data: string | null
  ): string => {
    const v = el.value;
    const start = el.selectionStart ?? v.length;
    const end = el.selectionEnd ?? v.length;
    if (data == null) return v; // composition/unknown -> let it through
    return v.slice(0, start) + data + v.slice(end);
  };

  const isNumberStringAllowed = (
    s: string,
    r: Extract<InputRules, { type: "number" }>
  ): boolean => {
    // Allow transitional states: "", "-", ".", "-."
    if (s === "" || s === "-" || s === "." || s === "-.") {
      if (s.includes("-") && r.allowNegative === false) return false;
      if ((r.decimals ?? Infinity) === 0 && s.includes(".")) return false;
      return true;
    }
    // Build regex for final form: optional -, digits, optional . with up to N decimals
    const neg = r.allowNegative === false ? "" : "-?";
    const decs = Math.max(0, r.decimals ?? Infinity);
    const frac =
      decs === 0 ? "" : `(\\.\\d{0,${Number.isFinite(decs) ? decs : ""}})?`;
    const re = new RegExp(`^${neg}\\d+${frac}$`);
    return re.test(s);
  };

  // event handlers
  const onBeforeInput = (e: React.FormEvent<HTMLInputElement>) => {
    const ev = e.nativeEvent as InputEvent;
    const data = ev.data; // inserted text, may be null for deletions/IME
    const el = e.currentTarget;

    // allow deletions/IME by not blocking when data is null
    if (data == null) return;

    const next = nextStringFromBeforeInput(el, data);

    if (rules.type === "text") {
      if (
        typeof rules.maxLength === "number" &&
        next.length > rules.maxLength
      ) {
        e.preventDefault();
        return;
      }
      if (!allowTextChar(data)) {
        e.preventDefault();
        return;
      }
      return;
    }

    // number
    const numRules = rules;
    // forbid multiple dots
    if ((numRules.decimals ?? Infinity) === 0 && data === ".") {
      e.preventDefault();
      return;
    }
    // allow only digits, dot, minus (evaluation handles positions)
    if (!/^[0-9.\-]$/.test(data)) {
      e.preventDefault();
      return;
    }
    // minus only at start
    if (data === "-" && el.selectionStart !== 0) {
      e.preventDefault();
      return;
    }
    if (data === "-" && numRules.allowNegative === false) {
      e.preventDefault();
      return;
    }
    // full-string check incl. decimals count
    if (!isNumberStringAllowed(next, numRules)) {
      e.preventDefault();
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    const el = e.currentTarget;

    if (rules.type === "text") {
      let txt = pasted;
      if (typeof rules.maxLength === "number") {
        const remain = Math.max(0, rules.maxLength - el.value.length);
        txt = txt.slice(0, remain);
      }
      if (rules.allowedChars) {
        const re = new RegExp(`[^${rules.allowedChars}]`, "g");
        txt = txt.replace(re, "");
      }
      e.preventDefault();
      const next = nextStringFromBeforeInput(el, txt);
      setBuffer(next);
      return;
    }

    // number paste
    let txt = pasted.replace(/[^\d.\-]/g, "");
    if ((rules.decimals ?? Infinity) === 0) {
      txt = txt.replace(/\./g, "");
    } else {
      // keep only first dot
      const firstDot = txt.indexOf(".");
      if (firstDot >= 0) {
        txt =
          txt.slice(0, firstDot + 1) +
          txt.slice(firstDot + 1).replace(/\./g, "");
      }
    }
    // keep only first minus at start if allowed
    txt = txt.replace(/-/g, "");
    if (rules.allowNegative !== false && pasted.trim().startsWith("-")) {
      txt = "-" + txt;
    }
    const next = nextStringFromBeforeInput(el, txt);
    e.preventDefault();
    setBuffer(next);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBuffer(e.target.value);
  };

  const onBlur = () => {
    if (commitOnBlur) commit();
    else cancel();
  };

  return {
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
  };
}
