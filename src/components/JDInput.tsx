"use client";

interface JDInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

export default function JDInput({
  value,
  onChange,
  placeholder = "Paste the job description here...",
  label = "Job Description",
  disabled = false,
}: JDInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="jd" className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <textarea
        id="jd"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={6}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100"
      />
    </div>
  );
}
