import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({
  label,
  error,
  hint,
  id,
  options,
  placeholder,
  className = "",
  ...props
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="group flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-bold uppercase tracking-[0.15em] text-ink-60 transition-colors group-focus-within:text-cen-blue"
        >
          {label}
          {props.required && (
            <span className="ml-1 text-red-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <select
        {...props}
        id={selectId}
        className={[
          "rounded-2xl border-2 bg-[#F8FAFC] px-4 py-3 text-sm text-ink outline-none",
          "transition-all duration-200 appearance-none",
          "focus:border-cen-blue focus:shadow-[0_0_0_4px_rgba(125,211,252,0.2)]",
          "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400",
          error ? "border-red-400" : "border-[#E2E8F0]",
          className,
        ].join(" ")}
        aria-describedby={
          error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined
        }
        aria-invalid={error ? "true" : undefined}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && !error && (
        <p id={`${selectId}-hint`} className="text-xs text-[#64748B]">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${selectId}-error`}
          className="animate-slide-down text-xs text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
