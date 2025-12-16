
// Nút bấm Cyberpunk chuẩn
export const CyberButton = ({ children, onClick, variant = 'primary', className = '', disabled = false }: any) => {
  const baseStyle = "relative font-display font-bold uppercase tracking-widest px-6 py-3 transition-all duration-200 group overflow-hidden flex items-center justify-center";
  
  // Màu sắc dựa trên variant
  const variants = {
    primary: "bg-cyber-yellow text-black hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "bg-transparent border border-cyber-blue text-cyber-blue hover:bg-cyber-blue hover:text-black shadow-[0_0_10px_rgba(0,240,255,0.2)]",
    danger: "bg-transparent border border-cyber-red text-cyber-red hover:bg-cyber-red hover:text-black shadow-[0_0_10px_rgba(255,0,60,0.2)]",
    ghost: "bg-cyber-dark text-gray-400 hover:text-cyber-yellow border border-gray-800 hover:border-cyber-yellow"
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
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      
      {/* Hiệu ứng trượt khi hover (chỉ cho dạng secondary/danger) */}
      {variant !== 'primary' && (
         <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-10 transition-opacity"></div>
      )}
    </button>
  );
};

// Card chứa nội dung - FIX LỖI VIỀN
export const CyberCard = ({ children, title, className = '', noPadding = false }: any) => {
  return (
    // Lớp ngoài: Màu viền (Yellow)
    <div className={`relative bg-cyber-yellow p-[1px] ${className}`}
         style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}>
        
        {/* Lớp trong: Màu nền (Black/Dark) - Cắt y hệt lớp ngoài nhưng nhỏ hơn 1px để lộ viền */}
        <div className="bg-cyber-black h-full w-full relative overflow-hidden"
             style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 19.5px), calc(100% - 19.5px) 100%, 0 100%)' }}>
            
            {/* Background trang trí bên trong card */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyber-yellow/10 to-transparent pointer-events-none"></div>

            {/* Header của Card */}
            {title && (
                <div className="flex items-center justify-between px-4 py-2 border-b border-cyber-yellow/30 bg-cyber-dim backdrop-blur-sm">
                    <h3 className="text-cyber-yellow font-display font-bold text-lg tracking-widest uppercase flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyber-yellow inline-block"></span>
                        {title}
                    </h3>
                    <div className="flex space-x-1">
                        <div className="w-8 h-1 bg-cyber-blue/50"></div>
                        <div className="w-4 h-1 bg-cyber-red/50"></div>
                        <div className="w-12 h-1 bg-cyber-yellow/50"></div>
                    </div>
                </div>
            )}

            {/* Nội dung chính */}
            <div className={`relative z-10 ${noPadding ? '' : 'p-4'}`}>
                {children}
            </div>
            
            {/* Góc trang trí dưới phải */}
            <div className="absolute bottom-0 right-0 p-1">
                <div className="text-[10px] text-cyber-yellow/40 font-mono">NET_WATCH_V3</div>
            </div>
        </div>
    </div>
  );
};