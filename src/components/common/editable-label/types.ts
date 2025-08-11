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
