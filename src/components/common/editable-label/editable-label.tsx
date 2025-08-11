import "./editable-label.scss";
import { useEditableLabel } from "./utils";
import type { EditableLabelProps } from "./interface";

export default function EditableLabel<
  T extends string | number = string | number
>(props: EditableLabelProps<T>) {
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
        {String(value)}
      </span>
    );
  }

  const ch = Math.max(2, (buffer ?? String(value)).length);
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
        onBeforeInput={onBeforeInput}
        onPaste={onPaste}
        inputMode={props.inputRules?.type === "number" ? "decimal" : undefined}
        disabled={disabled}
        style={{ width: `${ch + 1}ch` }}
      />
    </span>
  );
}
