import React from 'react';

// 1. NÚT BẤM (BUTTON)
export const CyberButton = ({ children, onClick, variant = 'primary', className = '', disabled = false }: any) => {
  // Base style: Font đậm, viết hoa, cắt góc, hiệu ứng active bấm xuống nhẹ
  const baseStyle = "relative font-display font-bold uppercase tracking-widest px-4 py-2 transition-all duration-100 group overflow-hidden flex items-center justify-center cursor-pointer select-none text-xs md:text-sm active:translate-y-0.5";
  
  const variants = {
    // Vàng - Đen (Mặc định)
    primary: "bg-cyber-yellow text-black border-2 border-cyber-yellow hover:bg-white hover:border-white hover:shadow-neon-yellow disabled:opacity-50 disabled:cursor-not-allowed",
    
    // Trong suốt viền Xanh (Phụ)
    secondary: "bg-transparent border border-cyber-blue text-cyber-blue hover:bg-cyber-blue hover:text-black hover:shadow-neon-blue disabled:opacity-50 disabled:cursor-not-allowed",
    
    // Trong suốt viền Đỏ (Nguy hiểm)
    danger: "bg-transparent border border-cyber-red text-cyber-red hover:bg-cyber-red hover:text-black hover:shadow-neon-red disabled:opacity-50 disabled:cursor-not-allowed",
    
    // Nút mờ (Ít quan trọng)
    ghost: "bg-cyber-dark text-gray-400 border border-gray-700 hover:text-cyber-yellow hover:border-cyber-yellow hover:bg-cyber-dim disabled:opacity-50 disabled:cursor-not-allowed"
  };

  const selectedVariant = variants[variant as keyof typeof variants] || variants.primary;

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${selectedVariant} ${className}`}
      // Cắt góc chéo 45 độ ở góc dưới bên phải
      style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 90% 100%, 0 100%)' }} 
    >
      {/* Đường kẻ trang trí mờ bên trong nút */}
      <span className="absolute top-0 left-0 w-[2px] h-full bg-current opacity-20"></span>
      
      {/* Nội dung nút (Có xử lý cắt chữ nếu quá dài) */}
      <span className="relative z-10 flex items-center gap-2 whitespace-nowrap truncate max-w-full">
        {children}
      </span>
    </button>
  );
};

// 2. KHUNG CHỨA (CARD)
export const CyberCard = ({ children, title, className = '', noPadding = false }: any) => {
  return (
    // Lớp vỏ ngoài: Màu viền (Vàng)
    <div className={`relative bg-cyber-yellow p-[1px] ${className}`}
         style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}>
        
        {/* Lớp bên trong: Màu nền (Đen/Xám tối) */}
        <div className="bg-cyber-black h-full w-full relative overflow-hidden flex flex-col"
             style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 19.5px), calc(100% - 19.5px) 100%, 0 100%)' }}>
            
            {/* Background họa tiết chéo mờ */}
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(20,20,20,0.5)_10px,rgba(20,20,20,0.5)_20px)] opacity-20 pointer-events-none"></div>

            {title && (
                <div className="flex items-center justify-between px-4 py-2 border-b border-cyber-yellow/20 bg-cyber-dark backdrop-blur-sm shrink-0 relative z-10">
                    {/* Tiêu đề Card */}
                    <h3 className="text-cyber-yellow font-display font-bold text-sm md:text-lg tracking-widest uppercase flex items-center gap-2 truncate drop-shadow-md">
                        <span className="w-3 h-3 bg-cyber-yellow inline-block shrink-0 clip-path-polygon"></span>
                        <span className="truncate">{title}</span>
                    </h3>
                    
                    {/* Thanh trang trí 3 màu (Arasaka style) */}
                    <div className="flex space-x-1 shrink-0 opacity-80">
                        <div className="w-1 h-2 bg-cyber-blue"></div>
                        <div className="w-1 h-2 bg-cyber-red"></div>
                        <div className="w-4 h-2 bg-cyber-yellow"></div>
                    </div>
                </div>
            )}
            
            {/* Nội dung chính của Card */}
            <div className={`relative z-10 flex-1 min-h-0 ${noPadding ? '' : 'p-2 md:p-4'} overflow-auto custom-scrollbar`}>
                {children}
            </div>
            
            {/* Chữ trang trí nhỏ ở góc dưới */}
            <div className="absolute bottom-1 right-6 text-[8px] text-gray-700 font-mono select-none pointer-events-none">
                NET_WATCH_VER_2.77
            </div>
        </div>
    </div>
  );
};