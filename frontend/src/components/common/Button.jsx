import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  className = ''
}) => {
  const baseStyle = "px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-lg shadow-teal-500/20 disabled:from-slate-700 disabled:to-slate-800 disabled:opacity-50",
    secondary: "bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/50 hover:border-slate-600",
    danger: "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-lg shadow-red-500/20",
    glass: "bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/10"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
      ) : null}
      {children}
    </button>
  );
};

export default Button;
