"use client";
import { useState, useId } from "react";

interface FieldProps {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: "text" | "email" | "password";
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  // Number field props (optional, used when type="number")
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export default function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  min,
  max,
  minLength,
  maxLength,
  step = 1,
  placeholder,
  error: externalError,
  unit,
  disabled = false,
  className = "",
}: FieldProps) {
  const id = useId();
  const [touched, setTouched] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const validate = (val: string): string | null => {
    // Required kontrolü
    if (required && (val === "" || val === null || val === undefined)) {
      return "Bu alan zorunludur.";
    }

    if (val === "") return null;

    // Text validasyonları
    if (type === "text" || type === "password") {
      if (minLength !== undefined && val.length < minLength) {
        return `En az ${minLength} karakter girin.`;
      }
      if (maxLength !== undefined && val.length > maxLength) {
        return `En fazla ${maxLength} karakter girin.`;
      }
    }

    // Email validasyonu
    if (type === "email" && val) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        return "Geçerli bir e-posta adresi girin.";
      }
    }

    // Number validasyonları (when min/max provided for text-like number inputs)
    if (min !== undefined || max !== undefined) {
      const num = Number(val);
      if (!isNaN(num)) {
        if (min !== undefined && num < min) {
          return `Minimum değer: ${min}`;
        }
        if (max !== undefined && num > max) {
          return `Maksimum değer: ${max}`;
        }
      }
    }

    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);

    // Validasyon
    const err = validate(val);
    setLocalError(err);
  };

  const handleBlur = () => {
    setTouched(true);
    const err = validate(String(value));
    setLocalError(err);
  };

  const displayError = touched && (externalError || localError);
  const hasError = displayError ? "input-error" : "";

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium mb-1">
        {label}
        {unit && <span className="text-[var(--muted)] text-xs ml-1">({unit})</span>}
        {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        min={min}
        max={max}
        minLength={minLength}
        maxLength={maxLength}
        step={step}
        placeholder={placeholder}
        disabled={disabled}
        aria-required={required}
        aria-invalid={!!displayError}
        aria-describedby={displayError ? `${id}-error` : undefined}
        className={`input-field ${hasError} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      />
      {displayError && (
        <p id={`${id}-error`} className="error-message" role="alert">
          {externalError || localError}
        </p>
      )}
    </div>
  );
}

// NumberField variant for numeric inputs with proper typing
interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  error?: string;
  unit?: string;
  disabled?: boolean;
  className?: string;
}

export function NumberField({
  label,
  value,
  onChange,
  required = false,
  min,
  max,
  step = 1,
  placeholder,
  error: externalError,
  unit,
  disabled = false,
  className = "",
}: NumberFieldProps) {
  const id = useId();
  const [touched, setTouched] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const validate = (val: number | string): string | null => {
    if (required && (val === "" || val === null || (typeof val === "number" && isNaN(val)))) {
      return "Bu alan zorunludur.";
    }
    if (typeof val === "number" && !isNaN(val)) {
      if (min !== undefined && val < min) return `Minimum değer: ${min}`;
      if (max !== undefined && val > max) return `Maksimum değer: ${max}`;
    }
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      onChange(NaN);
      setLocalError(required ? "Bu alan zorunludur." : null);
      return;
    }
    const num = Number(val);
    onChange(num);
    setLocalError(validate(num));
  };

  const handleBlur = () => {
    setTouched(true);
    setLocalError(validate(value));
  };

  const displayError = touched && (externalError || localError);
  const hasError = displayError ? "input-error" : "";

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium mb-1">
        {label}
        {unit && <span className="text-[var(--muted)] text-xs ml-1">({unit})</span>}
        {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
      </label>
      <input
        id={id}
        name={id}
        type="number"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        disabled={disabled}
        aria-required={required}
        aria-invalid={!!displayError}
        aria-describedby={displayError ? `${id}-error` : undefined}
        className={`input-field ${hasError} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      />
      {displayError && (
        <p id={`${id}-error`} className="error-message" role="alert">
          {externalError || localError}
        </p>
      )}
    </div>
  );
}

// Mini field for inline use
interface MiniFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export function MiniField({ label, value, onChange, min, max, step = 1, disabled }: MiniFieldProps) {
  const id = useId();
  
  return (
    <div className="flex-1">
      <label htmlFor={id} className="block text-xs font-medium text-[var(--muted)] mb-1">
        {label}
      </label>
      <input
        id={id}
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="input-field text-sm"
      />
    </div>
  );
}

// Select field
interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  disabled?: boolean;
}

export function SelectField({ label, value, onChange, options, required, disabled }: SelectFieldProps) {
  const id = useId();
  
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        aria-required={required}
        className="input-field"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
