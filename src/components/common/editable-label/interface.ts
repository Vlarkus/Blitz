import type { InputRules } from "./types";

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
