import {
  Controller,
  Control,
  FieldValues,
  UseFormRegister,
  Path,
} from "react-hook-form";
import Select from "react-select";

/* ================= TYPES ================= */

type Option = {
  label: string;
  value: string;
};

type Error = {
  message?: string;
};

type BaseProps<T extends FieldValues> = {
  label?: string;
  name: Path<T>;
  error?: Error;
  className?: string;
  disabled?: boolean;
};

/* ================= FIELD WRAPPER (NEW) ================= */

type FieldWrapperProps = {
  label?: string;
  error?: Error;
  className?: string;
  children: React.ReactNode;
};

function FieldWrapper({
  label,
  error,
  className,
  children,
}: FieldWrapperProps) {
  return (
    <div className={`flex flex-col gap-2 w-full ${className ?? ""}`}>
      {label && (
        <label className="text-xs text-gray-500">
          {label}
        </label>
      )}

      {children}

      {typeof error?.message === "string" && (
        <p className="text-xs text-red-400">
          {error.message}
        </p>
      )}
    </div>
  );
}

/* ================= INPUT ================= */

type InputFieldProps<T extends FieldValues> =
  BaseProps<T> & {
    register: UseFormRegister<T>;
    type?: React.HTMLInputTypeAttribute;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
    hidden?: boolean;
    defaultValue?: string | number;
  };

export function InputField<T extends FieldValues>({
  label,
  name,
  register,
  defaultValue,
  type = "text",
  hidden,
  inputProps,
  error,
  className,
  disabled,
}: InputFieldProps<T>) {
  if (hidden) {
    return <input type="hidden" {...register(name)} />;
  }

  return (
    <FieldWrapper
      label={label}
      error={error}
      className={className}
    >
      <input
        type={type}
        {...register(name)}
        {...inputProps}
        defaultValue={defaultValue}
        disabled={disabled}
        className={`ring-[1.5px] p-2 rounded-md text-sm w-full outline-none
          ${
            error
              ? "ring-red-400 focus:ring-red-400"
              : "ring-gray-300 focus:ring-blue-400"
          }
        `}
      />
    </FieldWrapper>
  );
}

/* ================= SELECT ================= */

type SelectFieldProps<T extends FieldValues> =
  BaseProps<T> & {
    register: UseFormRegister<T>;
    options: Option[];
    defaultValue?: string | string[];
    selectProps?: React.SelectHTMLAttributes<HTMLSelectElement>;
  };

export function SelectField<T extends FieldValues>({
  label,
  name,
  register,
  defaultValue,
  selectProps,
  options,
  error,
  className,
  disabled,
}: SelectFieldProps<T>) {
  return (
    <FieldWrapper
      label={label}
      error={error}
      className={className}
    >
      <select
        {...register(name)}
        defaultValue={defaultValue}
        {...selectProps}
        disabled={disabled}
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
    </FieldWrapper>
  );
}

/* ================= SEARCHABLE SELECT ================= */

type SearchableSelectFieldProps<T extends FieldValues> =
  BaseProps<T> & {
    control: Control<T>;
    options: Option[];
    placeholder?: string;
  };

export function SearchableSelectField<
  T extends FieldValues
>({
  label,
  name,
  control,
  options,
  error,
  placeholder,
  className,
}: SearchableSelectFieldProps<T>) {
  return (
    <FieldWrapper
      label={label}
      error={error}
      className={className}
    >
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select
            unstyled
            options={options}
            value={options.find(
              (opt) => opt.value === field.value
            )}
            onChange={(val) =>
              field.onChange(val?.value)
            }
            placeholder={placeholder}
            isSearchable
            isClearable
            classNames={{
              control: ({ isFocused }) =>
                `ring-[1.5px] p-2 rounded-md text-sm w-full bg-white transition-colors ${
                  error
                    ? "ring-red-400"
                    : isFocused
                    ? "ring-blue-400"
                    : "ring-gray-300"
                }`,
              placeholder: () =>
                "text-gray-400 text-sm",
              singleValue: () => "text-sm",
              menu: () =>
                "mt-1 rounded-md border border-gray-200 bg-white shadow-sm text-sm",
              option: ({
                isFocused,
                isSelected,
              }) =>
                `px-2 py-1 cursor-pointer ${
                  isSelected
                    ? "bg-blue-100"
                    : isFocused
                    ? "bg-gray-100"
                    : ""
                }`,
            }}
          />
        )}
      />
    </FieldWrapper>
  );
}