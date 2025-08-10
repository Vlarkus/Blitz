// src/components/editableLabel/types.ts
export type InputRules =
  | {
      type: "text";
      maxLength?: number;
      /** Character class for allowed chars, e.g. "A-Za-z0-9 _-" */
      allowedChars?: string;
    }
  | {
      type: "number";
      min?: number;
      max?: number;
      /** digits after decimal allowed; 0 means integers only */
      decimals?: number;
      /** allow leading negative sign */
      allowNegative?: boolean;
    };

export interface EditableLabelProps<
  T extends string | number = string | number
> {
  value: T;
  /** Called once on Enter or blur if changed */
  onCommit: (next: T) => void;

  /** Input constraints; defaults to text with no limits */
  inputRules?: InputRules;

  // UI/behavior
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  disabled?: boolean;
  ariaLabel?: string;
  /** Commit on blur; default true */
  commitOnBlur?: boolean;
  /** Auto-select contents when entering edit mode; default true */
  autoSelect?: boolean;
}
