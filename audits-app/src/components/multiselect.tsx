'use client';

import { useState, useRef, useEffect } from 'react';

interface Option {
  id: string;
  label: string;
}

interface MultiselectProps {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (ids: string[]) => void;
}

export default function Multiselect({ label, options, selected, onChange }: MultiselectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (id: string) => {
    onChange(
      selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id]
    );
  };

  const displayText = selected.length === 0
    ? 'Select auditors...'
    : selected.length === 1
      ? options.find((o) => o.id === selected[0])?.label || '1 selected'
      : `${selected.length} selected`;

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium mb-1 dark:text-gray-300">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full border dark:border-gray-600 rounded px-3 py-2.5 dark:bg-gray-700 dark:text-white text-base text-left flex items-center justify-between"
      >
        <span className={selected.length === 0 ? 'text-gray-400' : ''}>{displayText}</span>
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-700 border dark:border-gray-600 rounded shadow-lg max-h-48 overflow-y-auto">
          {options.length === 0 ? (
            <p className="p-3 text-sm text-gray-500">No users available</p>
          ) : (
            options.map((opt) => (
              <label key={opt.id} className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer text-sm dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={selected.includes(opt.id)}
                  onChange={() => toggle(opt.id)}
                  className="w-4 h-4"
                />
                {opt.label}
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}
