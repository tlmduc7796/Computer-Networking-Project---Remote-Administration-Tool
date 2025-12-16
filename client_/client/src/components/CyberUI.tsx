import React from 'react';

// Nút bấm Cyberpunk chuẩn (Đã fix lỗi tràn chữ)
export const CyberButton = ({ children, onClick, variant = 'primary', className = '', disabled = false }: any) => {
  const baseStyle = "relative font-display font-bold uppercase tracking-widest px-3 py-2 transition-all duration-200 group overflow-hidden flex items-center justify-center cursor-pointer select-none text-xs md:text-sm";
  
  const variants = {
    primary: "bg-cyber-yellow text-black hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "bg-transparent border border-cyber-blue text-cyber-blue hover:bg-cyber-blue hover:text-black shadow-[0_0_10px_rgba(0,240,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed",
    danger: "bg-transparent border border-cyber-red text-cyber-red hover:bg-cyber-red hover:text-black shadow-[0_0_10px_rgba(255,0,60,0.2)] disabled:opacity-50 disabled:cursor-not-allowed",
    ghost: "bg-cyber-dark text-gray-400 hover:text-cyber-yellow border border-gray-800 hover:border-cyber-yellow disabled:opacity-50 disabled:cursor-not-allowed"
  };

  const selectedVariant = variants[variant as keyof typeof variants] || variants.primary;

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${selectedVariant} ${className}`}
      // Clip-path cắt góc chéo dưới phải
      style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 90% 100%, 0 100%)' }} 
    >
      <span className="relative z-10 flex items-center gap-2 whitespace-nowrap truncate max-w-full">
        {children}
      </span>
    </button>
  );
};

// Khung chứa nội dung (Giữ nguyên logic layout)
export const CyberCard = ({ children, title, className = '', noPadding = false }: any) => {
  return (
    <div className={`relative bg-cyber-yellow p-[1px] ${className}`}
         style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}>
        <div className="bg-cyber-black h-full w-full relative overflow-hidden flex flex-col"
             style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 19.5px), calc(100% - 19.5px) 100%, 0 100%)' }}>
            
            {title && (
                <div className="flex items-center justify-between px-4 py-2 border-b border-cyber-yellow/30 bg-cyber-dim backdrop-blur-sm shrink-0">
                    <h3 className="text-cyber-yellow font-display font-bold text-sm md:text-lg tracking-widest uppercase flex items-center gap-2 truncate">
                        <span className="w-2 h-2 bg-cyber-yellow inline-block shrink-0"></span>
                        <span className="truncate">{title}</span>
                    </h3>
                    <div className="flex space-x-1 shrink-0">
                        <div className="w-4 md:w-8 h-1 bg-cyber-blue/50"></div>
                        <div className="w-2 md:w-4 h-1 bg-cyber-red/50"></div>
                        <div className="w-6 md:w-12 h-1 bg-cyber-yellow/50"></div>
                    </div>
                </div>
            )}
            <div className={`relative z-10 flex-1 min-h-0 ${noPadding ? '' : 'p-2 md:p-4'} overflow-auto custom-scrollbar`}>
                {children}
            </div>
        </div>
    </div>
  );
};