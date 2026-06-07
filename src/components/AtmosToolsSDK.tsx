import React from 'react';

// Atmos Tools design specifications
// - White backgrounds, no shadows, no gradients, no persistent outlines
// - High-contrast text, clear and humble labels
// - Inter sans-serif typeface, responsive and fluid alignment
// - Crisp, flat boundaries, with white and light gray (#f5f5f5 / #f9f9f9) card variations.

export interface AtmosContainerProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function AtmosContainer({ children, className = '', id }: AtmosContainerProps) {
  return (
    <div 
      id={id} 
      className={`w-full min-h-full bg-white text-gray-900 font-sans p-6 md:p-12 flex flex-col ${className}`}
    >
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}

export interface AtmosCardProps {
  children: React.ReactNode;
  variant?: 'white' | 'gray';
  className?: string;
  onClick?: () => void;
  id?: string;
}

export function AtmosCard({ children, variant = 'white', className = '', onClick, id }: AtmosCardProps) {
  const bgClass = variant === 'white' ? 'bg-white' : 'bg-[#f5f5f5]';
  return (
    <div 
      id={id}
      onClick={onClick}
      className={`p-6 rounded-[20px] border border-gray-100 transition-all ${bgClass} ${
        onClick ? 'cursor-pointer hover:bg-gray-50' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

export interface AtmosButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
  id?: string;
}

export function AtmosButton({ variant = 'primary', children, className = '', id, ...props }: AtmosButtonProps) {
  let btnStyle = 'bg-gray-900 text-white hover:bg-black';
  if (variant === 'secondary') {
    btnStyle = 'bg-[#f5f5f5] text-gray-900 hover:bg-gray-200';
  } else if (variant === 'danger') {
    btnStyle = 'bg-red-50 text-red-600 hover:bg-red-100';
  }

  return (
    <button
      id={id}
      className={`px-5 py-2.5 rounded-full font-medium text-sm transition-colors cursor-pointer border-none shadow-none outline-none focus:outline-none flex items-center justify-center gap-2 ${btnStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export interface AtmosInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id?: string;
}

export function AtmosInput({ label, className = '', id, ...props }: AtmosInputProps) {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full bg-[#f9f9f9] border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-950 placeholder:text-gray-400 hover:bg-gray-50 focus:bg-white focus:outline-none focus:border-gray-300 transition-all ${className}`}
        {...props}
      />
    </div>
  );
}

export interface AtmosTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  id?: string;
}

export function AtmosTextArea({ label, className = '', id, ...props }: AtmosTextAreaProps) {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`w-full bg-[#f9f9f9] border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-950 placeholder:text-gray-400 hover:bg-gray-50 focus:bg-white focus:outline-none focus:border-gray-300 resize-none transition-all ${className}`}
        {...props}
      />
    </div>
  );
}

export interface AtmosSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { label: string; value: string }[];
  id?: string;
}

export function AtmosSelect({ label, options, className = '', id, ...props }: AtmosSelectProps) {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className={`w-full bg-[#f9f9f9] border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-950 placeholder:text-gray-400 hover:bg-gray-50 focus:bg-white focus:outline-none focus:border-gray-300 transition-all cursor-pointer appearance-none ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
    </div>
  );
}

export interface AtmosTabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  onChange: (id: string) => void;
  id?: string;
}

export function AtmosTabs({ tabs, activeTab, onChange, id }: AtmosTabsProps) {
  return (
    <div id={id} className="flex border-b border-gray-100 select-none bg-white">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center justify-center gap-2 ${
              isActive
                ? 'border-gray-900 text-gray-900 bg-[#f9f9f9] font-bold'
                : 'border-transparent text-gray-400 hover:text-gray-900 hover:bg-gray-50/50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function AtmosBadge({ children, variant = 'gray', className = '', id }: { children: React.ReactNode; variant?: 'indigo' | 'gray' | 'red'; className?: string; id?: string }) {
  let badgeStyle = 'bg-gray-150 text-gray-600 border-gray-200';
  if (variant === 'indigo') badgeStyle = 'bg-indigo-50 text-indigo-600 border-indigo-100';
  if (variant === 'red') badgeStyle = 'bg-red-50 text-red-600 border-red-100';

  return (
    <span
      id={id}
      className={`text-[10px] uppercase font-mono py-0.5 px-2 rounded-full tracking-widest font-bold border ${badgeStyle} ${className}`}
    >
      {children}
    </span>
  );
}

export interface AtmosHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  extra?: React.ReactNode;
  id?: string;
}

export function AtmosHeader({ title, subtitle, onBack, extra, id }: AtmosHeaderProps) {
  return (
    <div id={id} className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white z-10">
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="p-2 text-gray-500 hover:bg-[#f5f5f5] rounded-full transition-all hover:text-gray-900 cursor-pointer"
            title="Go back"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
        )}
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            {title}
          </h2>
          {subtitle && <p className="text-gray-400 text-xs mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {extra && <div className="flex items-center gap-2">{extra}</div>}
    </div>
  );
}
