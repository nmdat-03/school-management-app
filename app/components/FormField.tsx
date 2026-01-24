import {
  FieldError,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";

/* ================= TYPES ================= */

type Option = {
  label: string;
  value: string;
};

type BaseProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  error?: FieldError;
};

/* ================= INPUT ================= */

type InputFieldProps<T extends FieldValues> = BaseProps<T> & {
  type?: React.HTMLInputTypeAttribute;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
};

export function InputField<T extends FieldValues>({
  label,
  name,
  register,
  type = "text",
  inputProps,
  error,
}: InputFieldProps<T>) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-xs text-gray-500">{label}</label>

      <input
        type={type}
        {...register(name)}
        {...inputProps}
        className={`ring-[1.5px] p-2 rounded-md text-sm w-full outline-none
          ${
            error
              ? "ring-red-400 focus:ring-red-400"
              : "ring-gray-300 focus:ring-blue-400"
          }
        `}
      />

      {error?.message && (
        <p className="text-xs text-red-400">{error.message}</p>
      )}
    </div>
  );
}

/* ================= SELECT ================= */

type SelectFieldProps<T extends FieldValues> = BaseProps<T> & {
  options: Option[];
};

export function SelectField<T extends FieldValues>({
  label,
  name,
  register,
  options,
  error,
}: SelectFieldProps<T>) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-xs text-gray-500">{label}</label>

      <select
        {...register(name)}
        className={`ring-[1.5px] p-2 rounded-md text-sm w-full bg-white outline-none
          ${
            error
              ? "ring-red-400 focus:ring-red-400"
              : "ring-gray-300 focus:ring-blue-400"
          }
        `}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error?.message && (
        <p className="text-xs text-red-400">{error.message}</p>
      )}
    </div>
  );
}
