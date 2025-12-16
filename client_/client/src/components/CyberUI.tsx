import React from 'react';

// Nút bấm phong cách Cyberpunk
export const CyberButton = ({ children, onClick, variant = 'primary', className = '' }: any) => {
  const baseStyle = "font-display font-bold uppercase tracking-widest px-6 py-3 transition-all duration-100 relative group clip-path-polygon";
  
  const variants = {
    primary: "bg-cyber-yellow text-black hover:bg-white hover:shadow-[0_0_15px_#FCEE0A]",
    secondary: "border border-cyber-blue text-cyber-blue hover:bg-cyber-blue hover:text-black shadow-[0_0_10px_rgba(0,240,255,0.3)]",
    danger: "bg-transparent border border-cyber-red text-cyber-red hover:bg-cyber-red hover:text-black"
  };

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`}
      style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 90% 100%, 0 100%)' }} // Cắt góc dưới phải
    >
      {children}
      {/* Đường kẻ trang trí nhỏ */}
      <span className="absolute bottom-0 left-0 w-2 h-2 bg-current opacity-50"></span>
    </button>
  );
};

// Card chứa nội dung (AgentSelector, Webcam, v.v.)
export const CyberCard = ({ children, title, className = '' }: any) => {
  return (
    <div className={`relative bg-cyber-gray border-l-2 border-cyber-yellow p-1 ${className}`}>
        {/* Decorative corner pieces */}
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyber-blue"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyber-blue"></div>
        
        {/* Content Container */}
        <div className="bg-cyber-black/90 h-full p-4 relative overflow-hidden">
            {/* Scanline background effect */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
            
            {title && (
                <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
                    <h3 className="text-cyber-yellow font-display text-xl uppercase tracking-widest">
                        {title}
                    </h3>
                    <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-cyber-red animate-pulse"></div>
                        <div className="w-2 h-2 bg-cyber-blue"></div>
                        <div className="w-2 h-2 bg-cyber-yellow"></div>
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