import { useState } from 'react';
import { Camera, Video, RefreshCw } from 'lucide-react';
// SỬA 1: Import useSocket từ đúng nơi (SocketContext)
import { useSocket } from '../contexts/SocketContext';
import { sendCommand } from '../services/socketService';
// SỬA 2: Giữ CyberButton và sẽ dùng nó bên dưới
import { CyberCard, CyberButton } from './CyberUI';

const WebcamCard = () => {
    // SỬA 3: Bỏ 'isConnected' nếu không dùng, chỉ lấy selectedAgentId
    const { selectedAgentId } = useSocket();
    
    const [cameras, setCameras] = useState<string[]>([]);
    const [activeCam, setActiveCam] = useState<number | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);

    const handleGetWebcams = () => {
        if (!selectedAgentId) return alert("Chưa chọn Agent!");
        sendCommand("get_webcams");
        // Giả lập dữ liệu để test giao diện
        setCameras(["Integrated Camera", "USB 2.0 Camera"]);
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
        setImageSrc(null);
    };

    return (
        <CyberCard title="VISUAL_UPLINK">
            <div className="flex flex-col h-full gap-4">
                {/* Màn hình hiển thị Camera */}
                <div className="relative bg-black border border-[#00F0FF]/30 h-64 flex items-center justify-center overflow-hidden group">
                    {imageSrc ? (
                        <img src={imageSrc} alt="Webcam Stream" className="w-full h-full object-contain" />
                    ) : (
                        <div className="text-center">
                            <Camera className={`w-12 h-12 mx-auto mb-2 ${isStreaming ? 'text-[#FF003C] animate-pulse' : 'text-gray-600'}`} />
                            <p className="text-xs text-gray-500 font-mono">
                                {isStreaming ? "WAITING FOR SIGNAL..." : "NO SIGNAL INPUT"}
                            </p>
                        </div>
                    )}
                    
                    {/* Overlay hiệu ứng */}
                    <div className="absolute inset-0 pointer-events-none border-[0.5px] border-[#00F0FF]/10">
                        <div className="absolute top-2 left-2 text-[10px] text-[#00F0FF] animate-pulse">REC ●</div>
                        <div className="absolute top-2 right-2 text-[10px] text-[#00F0FF]">HD 1080P</div>
                        {/* Crosshair */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-[#00F0FF]/20"></div>
                    </div>
                </div>

                {/* Danh sách Camera & Nút điều khiển */}
                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-[#00F0FF] uppercase tracking-wider">Available Inputs</span>
                        {/* SỬA 4: Dùng CyberButton cho nút Scan (dạng nhỏ) */}
                        <button onClick={handleGetWebcams} className="flex items-center space-x-1 text-[10px] bg-[#00F0FF]/10 text-[#00F0FF] px-2 py-1 border border-[#00F0FF]/30 hover:bg-[#00F0FF] hover:text-black transition-all">
                            <RefreshCw className="w-3 h-3" />
                            <span>SCAN DEVICES</span>
                        </button>
                    </div>

                    {cameras.length > 0 ? (
                        <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                            {cameras.map((cam, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-[#1a1a1a] p-2 border border-gray-800 hover:border-[#FCEE0A] transition-colors">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <Video className="w-4 h-4 text-gray-400" />
                                        <span className="text-xs text-gray-300 truncate">{cam}</span>
                                    </div>
                                    
                                    {/* Nút bật/tắt camera */}
                                    {activeCam === idx ? (
                                        <CyberButton onClick={handleStopCam} variant="danger" className="!px-3 !py-1 text-[10px]">
                                            STOP
                                        </CyberButton>
                                    ) : (
                                        <CyberButton onClick={() => handleStartCam(idx)} variant="secondary" className="!px-3 !py-1 text-[10px]">
                                            START
                                        </CyberButton>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 border border-dashed border-gray-700 bg-[#111]">
                            <p className="text-xs text-gray-500">Scan to find devices...</p>
                        </div>
                    )}
                </div>
            </div>
        </CyberCard>
    );
};

export default WebcamCard;