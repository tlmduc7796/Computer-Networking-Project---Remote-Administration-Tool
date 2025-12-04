import { useState } from 'react';
import { Video, Mic, Download, StopCircle, WifiOff } from 'lucide-react';

export default function WebcamCard() {
    // --- PHẦN NÃO (LOGIC CŨ) ---
    const [isRecording, setIsRecording] = useState(false);

    // Vì Server chưa hỗ trợ, ta giả lập hành động bật/tắt để test UI
    const toggleRecording = () => {
        setIsRecording(!isRecording);
    };

    // --- PHẦN ÁO (GIAO DIỆN BOLT.AI) ---
    return (
        <div className="glass-panel p-6 rounded-lg h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-green-500 neon-glow-green tracking-wider flex items-center gap-2">
                    <Video className="w-5 h-5" /> {'> WEBCAM_FEED_'}
                </h2>
                <div className="flex items-center gap-2">
                    {isRecording ? (
                        <>
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,1)]" />
                            <span className="text-red-500 text-xs font-bold neon-glow-red">REC</span>
                        </>
                    ) : (
                        <>
                            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                            <span className="text-yellow-500 text-xs">STANDBY</span>
                        </>
                    )}
                </div>
            </div>

            {/* Màn hình Camera (Terminal Window) */}
            <div className="terminal-window p-2 rounded-lg mb-4 relative group flex-1 bg-black min-h-[200px] flex items-center justify-center overflow-hidden">

                {/* Khi đang "Ghi hình" (Giả lập) */}
                {isRecording ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-gray-900">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-green-500/5 animate-pulse" />
                        <div className="text-center z-10">
                            <Video className="w-12 h-12 text-green-500/40 mx-auto mb-3 animate-pulse" />
                            <p className="text-green-500/60 text-sm font-mono">{'[SIMULATED FEED ACTIVE]'}</p>
                        </div>
                        {/* Overlay REC */}
                        <div className="absolute top-2 right-2 bg-black/80 neon-border-red px-2 py-1 text-xs text-red-500 font-bold animate-pulse">
                            REC 00:00:00
                        </div>
                        {/* Scan line */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent animate-pulse" />
                    </div>
                ) : (
                    // Khi tắt (Hiệu ứng nhiễu sóng)
                    <div className="relative w-full h-full flex items-center justify-center bg-black">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-black to-red-500/5" />
                        <div className="text-center z-10">
                            <WifiOff className="w-12 h-12 text-red-500/20 mx-auto mb-4" />
                            <div className="text-4xl font-bold text-red-500/20 mb-2">NO SIGNAL</div>
                            <p className="text-red-500/50 text-xs font-mono">SERVER_MODULE_NOT_FOUND</p>
                        </div>

                        {/* SVG Filter tạo nhiễu hạt (Static Noise) */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                            <svg className="w-full h-full">
                                <filter id="noise">
                                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
                                </filter>
                                <rect width="100%" height="100%" filter="url(#noise)" />
                            </svg>
                        </div>
                    </div>
                )}

                <div className="absolute top-2 left-2 bg-black/80 neon-border-cyan px-2 py-1 text-xs text-cyan-500">
                    {isRecording ? '720p @30fps' : 'OFFLINE'}
                </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={toggleRecording}
                    className={`flex-1 px-4 py-3 rounded transition-all duration-300 flex items-center justify-center gap-2 font-bold ${isRecording
                            ? 'bg-black neon-border-red hover:bg-red-950/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                            : 'bg-black neon-border-green hover:bg-green-950/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                        }`}
                >
                    {isRecording ? (
                        <>
                            <StopCircle className="w-5 h-5 text-red-500" />
                            <span className="text-red-500">STOP</span>
                        </>
                    ) : (
                        <>
                            <Video className="w-5 h-5 text-green-500" />
                            <span className="text-green-500">RECORD</span>
                        </>
                    )}
                </button>

                <button className="bg-black neon-border-cyan hover:bg-cyan-950/30 px-4 py-3 rounded transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]" disabled>
                    <Mic className="w-5 h-5 text-cyan-500 opacity-50" />
                </button>

                <button className="bg-black neon-border-green hover:bg-green-950/30 px-4 py-3 rounded transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]" disabled>
                    <Download className="w-5 h-5 text-green-500 opacity-50" />
                </button>
            </div>

            {/* Footer Info */}
            <div className="mt-4 p-2 bg-black border border-green-500/30 rounded text-xs text-green-400 font-mono truncate">
                {'> DEVICE_STATUS: ' + (isRecording ? 'ACTIVE' : 'INACTIVE') + ' | DRIVER: GENERIC_WEBCAM'}
            </div>
        </div>
    );
}