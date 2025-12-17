import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { sendCommand } from '../services/socketService';
import { CyberCard, CyberButton } from './CyberUI';
import { Monitor, MousePointer, Lock, Unlock, Video, VideoOff, Loader2 } from 'lucide-react';

const UltraviewCard = () => {
    const { socket, selectedAgentId } = useSocket();
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [controlEnabled, setControlEnabled] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    // --- 1. NHẬN ẢNH TỪ SERVER ---
    useEffect(() => {
        if (!socket) return;

        const handleStream = (base64: string) => {
            setImageSrc(`data:image/jpeg;base64,${base64}`);
        };

        socket.on("ReceiveScreenshot", handleStream);
        return () => { socket.off("ReceiveScreenshot", handleStream); };
    }, [socket]);

    // --- 2. GỬI LỆNH STREAM ---
    const handleStartStream = () => {
        if (!selectedAgentId) return alert("⚠ TARGET NOT LOCKED!");
        sendCommand("start_screen_stream"); 
        setIsStreaming(true);
    };

    const handleStopStream = () => {
        sendCommand("stop_screen_stream");
        setIsStreaming(false);
        setControlEnabled(false);
        setImageSrc(null);
    };

    // --- 3. GỬI INPUT (CHUỘT/PHÍM) ---
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!controlEnabled || !imgRef.current || !selectedAgentId || !socket) return;
        
        const rect = imgRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        
        socket.invoke("SendMouseMove", { targetId: selectedAgentId, x, y })
              .catch(err => console.error(err));
    };

    const handleMouseClick = (e: React.MouseEvent) => {
        if (!controlEnabled || !selectedAgentId || !socket) return;
        const button = e.button === 0 ? "left" : (e.button === 2 ? "right" : "middle");
        socket.invoke("SendMouseClick", { targetId: selectedAgentId, button })
              .catch(err => console.error(err));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!controlEnabled || !selectedAgentId || !socket) return;
        e.preventDefault(); 
        socket.invoke("SendKeyPress", { targetId: selectedAgentId, key: e.key })
              .catch(err => console.error(err));
    };

    // --- GIAO DIỆN (ĐÃ FIX SCROLLBAR) ---
    return (
        <CyberCard 
            title="ULTRA_VIEW // REMOTE_CONTROL" 
            className="h-full flex flex-col"
            noPadding={true} // <--- QUAN TRỌNG: Tắt padding để tràn viền
        >
            {/* Wrapper chính: Flex column, Full size, Ẩn overflow */}
            <div className="flex flex-col h-full w-full overflow-hidden bg-black">
                
                {/* 1. Control Bar */}
                <div className="flex justify-between items-center px-3 py-2 bg-cyber-dark border-b border-gray-800 shrink-0 z-20 relative">
                    <div className="flex items-center gap-3 font-mono text-xs">
                        <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${isStreaming ? 'bg-cyber-red animate-pulse shadow-[0_0_10px_#FF003C]' : 'bg-gray-600'}`}></div>
                            <span className={isStreaming ? 'text-cyber-red font-bold tracking-wider' : 'text-gray-500'}>
                                {isStreaming ? 'LIVE FEED' : 'STANDBY'}
                            </span>
                        </div>
                        {controlEnabled && (
                            <div className="flex items-center gap-1 text-cyber-yellow border border-cyber-yellow/30 px-2 py-0.5 bg-cyber-yellow/10">
                                <Unlock size={10} /> <span>INPUT: ON</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <CyberButton 
                            onClick={() => setControlEnabled(!controlEnabled)} 
                            disabled={!isStreaming}
                            variant={controlEnabled ? "primary" : "ghost"}
                            className="!py-1 !px-3 text-[10px]"
                        >
                            {controlEnabled ? <Lock size={12} className="mr-2"/> : <MousePointer size={12} className="mr-2"/>}
                            {controlEnabled ? "LOCK" : "CONTROL"}
                        </CyberButton>

                        <CyberButton 
                            onClick={isStreaming ? handleStopStream : handleStartStream} 
                            variant={isStreaming ? "danger" : "secondary"}
                            className="!py-1 !px-3 text-[10px]"
                        >
                            {isStreaming ? <VideoOff size={12} className="mr-2"/> : <Video size={12} className="mr-2"/>}
                            {isStreaming ? "STOP" : "START"}
                        </CyberButton>
                    </div>
                </div>

                {/* 2. Viewport (Tràn viền, không scroll) */}
                <div 
                    className="flex-1 relative overflow-hidden flex items-center justify-center outline-none bg-black w-full h-full"
                    tabIndex={0} 
                    onKeyDown={handleKeyDown}
                    style={{ cursor: controlEnabled ? 'crosshair' : 'default' }}
                >
                    {imageSrc ? (
                        <img 
                            ref={imgRef}
                            src={imageSrc} 
                            alt="Remote Stream" 
                            className="w-full h-full object-contain pointer-events-auto select-none block" // block để tránh gap dưới
                            onMouseMove={handleMouseMove}
                            onMouseDown={handleMouseClick}
                            onContextMenu={(e) => e.preventDefault()}
                        />
                    ) : (
                        <div className="text-center opacity-30 flex flex-col items-center pointer-events-none">
                            {isStreaming ? (
                                <Loader2 className="w-12 h-12 text-cyber-yellow animate-spin mb-2" />
                            ) : (
                                <Monitor className="w-16 h-16 text-gray-700 mb-2" />
                            )}
                            <span className="text-gray-500 font-mono text-[10px] tracking-widest">
                                {isStreaming ? "RECEIVING DATA..." : "NO SIGNAL INPUT"}
                            </span>
                        </div>
                    )}

                    {/* Grid Overlay mờ (Trang trí) */}
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] z-10 opacity-30"></div>
                </div>
            </div>
        </CyberCard>
    );
};

export default UltraviewCard;