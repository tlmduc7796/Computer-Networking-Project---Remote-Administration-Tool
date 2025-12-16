// File: client/src/components/CyberUI.tsx
//import React from 'react';

// Nút bấm phong cách Cyberpunk
export const CyberButton = ({ children, onClick, variant = 'primary', className = '' }: any) => {
  const baseStyle = "font-display font-bold uppercase tracking-widest px-6 py-3 transition-all duration-100 relative group clip-path-polygon cursor-pointer";
  
  const variants = {
    primary: "bg-[#FCEE0A] text-black hover:bg-white hover:shadow-[0_0_15px_#FCEE0A]",
    secondary: "border border-[#00F0FF] text-[#00F0FF] hover:bg-[#00F0FF] hover:text-black shadow-[0_0_10px_rgba(0,240,255,0.3)]",
    danger: "bg-transparent border border-[#FF003C] text-[#FF003C] hover:bg-[#FF003C] hover:text-black"
  };

  const selectedVariant = variants[variant as keyof typeof variants] || variants.primary;

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyle} ${selectedVariant} ${className}`}
      style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 90% 100%, 0 100%)' }} 
    >
      {children}
      {/* Đường kẻ trang trí nhỏ */}
      <span className="absolute bottom-0 left-0 w-2 h-2 bg-current opacity-50"></span>
    </button>
  );
};

// Card chứa nội dung
export const CyberCard = ({ children, title, className = '' }: any) => {
  return (
    <div className={`relative bg-[#1a1a1a] border-l-2 border-[#FCEE0A] p-1 ${className}`}>
        {/* Decorative corner pieces */}
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00F0FF]"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00F0FF]"></div>
        
        {/* Content Container */}
        <div className="bg-black/90 h-full p-4 relative overflow-hidden">
            {title && (
                <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
                    <h3 className="text-[#FCEE0A] font-bold text-xl uppercase tracking-widest">
                        {title}
                    </h3>
                    <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-[#FF003C] animate-pulse"></div>
                        <div className="w-2 h-2 bg-[#00F0FF]"></div>
                        <div className="w-2 h-2 bg-[#FCEE0A]"></div>
                    </div>
                </div>
            )}
            <div className="relative z-10 font-mono text-gray-300">
                {children}
            </div>
        </div>
    </div>
  );
};