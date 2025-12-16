import AgentSelector from './components/AgentSelector';
import PowerControls from './components/PowerControls';
import ScreenshotCard from './components/ScreenshotCard';
import WebcamCard from './components/WebcamCard';
import KeyloggerCard from './components/KeyloggerCard';
import ProcessManager from './components/ProcessManager';
import { useSocket } from './contexts/SocketContext';
import { Terminal, Activity, Lock, Eye, Keyboard, Zap, Layers, Video } from 'lucide-react';

// Component tiêu đề ngăn cách (Giữ nguyên)
const SectionDivider = ({ title, icon: Icon }: any) => (
    <div className="flex items-center gap-4 py-2 border-b border-cyber-yellow/20 mt-8 mb-4">
        <div className="p-1 bg-cyber-yellow text-black clip-path-polygon">
            <Icon size={16} />
        </div>
        <h3 className="text-cyber-yellow font-display font-bold tracking-[0.2em] text-sm md:text-base uppercase">
            {title}
        </h3>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-cyber-yellow/50 to-transparent"></div>
        <div className="text-[9px] text-gray-500 font-mono hidden md:block">SYS_MODULE_ACTIVE</div>
    </div>
);

function App() {
    const { isSystemLocked, isConnected } = useSocket();

    return (
        <div className="min-h-screen bg-cyber-grid text-gray-300 font-mono selection:bg-cyber-yellow selection:text-black flex flex-col scanlines">
            
            {/* TOP HEADER */}
            <header className="sticky top-0 z-50 bg-cyber-black/95 backdrop-blur border-b border-cyber-yellow/30 px-6 py-3 shadow-neon-yellow">
                {/* SỬA: max-w-6xl (Rộng hơn) */}
                <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-4 max-w-6xl">
                    <div className="flex items-center gap-4">
                        <div className="p-2 border-2 border-cyber-yellow bg-black/50">
                            <Terminal className="w-6 h-6 text-cyber-yellow animate-pulse" />
                        </div>
                        <h1 className="text-3xl font-display font-black text-white tracking-tighter leading-none glitch">
                            NET_<span className="text-cyber-yellow">WATCH</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-6 font-mono text-xs">
                         <div className="flex items-center gap-2 text-cyber-blue border border-cyber-blue/30 px-3 py-1 bg-cyber-blue/5">
                             <Activity className="w-4 h-4 animate-spin-slow" />
                             <span>STATUS: {isConnected ? "ONLINE" : "SEARCHING..."}</span>
                         </div>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT - XẾP DỌC */}
            {/* SỬA: max-w-6xl (Rộng hơn) */}
            <main className="container mx-auto px-4 py-8 flex-1 flex flex-col relative z-10 max-w-6xl">
                
                {/* HÀNG 1: CHỌN MÁY (AGENT SELECTOR) */}
                <div className="w-full">
                    <AgentSelector />
                </div>

                {/* HÀNG 2: POWER GRID (ĐIỀU KHIỂN NGUỒN) */}
                <SectionDivider title="POWER_GRID_SYSTEM" icon={Zap} />
                <div className="w-full">
                    <PowerControls />
                </div>

                {/* HÀNG 3: VISUAL SURVEILLANCE (SCREENSHOT) */}
                <SectionDivider title="VISUAL_FEED_A" icon={Eye} />
                <div className="w-full h-[450px]"> {/* Tăng chiều cao lên xíu cho cân đối */}
                    <ScreenshotCard />
                </div>

                {/* HÀNG 4: WEBCAM UPLINK */}
                <SectionDivider title="VISUAL_FEED_B" icon={Video} />
                <div className="w-full h-[400px]">
                    <WebcamCard />
                </div>

                {/* HÀNG 5: KEYLOGGER */}
                <SectionDivider title="KEYSTROKE_LOGGER" icon={Keyboard} />
                <div className="w-full min-h-[350px]">
                     <KeyloggerCard />
                </div>

                {/* HÀNG 6: PROCESS MANAGER */}
                <SectionDivider title="PROCESS_MONITOR" icon={Layers} />
                <div className="w-full">
                    <ProcessManager />
                </div>

                {/* Footer khoảng trắng */}
                <div className="h-20"></div>
            </main>

            {/* LOCK OVERLAY */}
            {isSystemLocked && (
                <div className="fixed inset-0 z-[9999] bg-cyber-black/95 flex flex-col items-center justify-center">
                    <Lock className="w-32 h-32 text-cyber-red mx-auto mb-6 animate-pulse" />
                    <h1 className="text-8xl font-display font-black text-cyber-red tracking-tighter mb-4 glitch">LOCKED</h1>
                    <p className="text-cyber-red font-mono tracking-[0.5em] border-t border-b border-cyber-red py-4">ADMINISTRATIVE LOCK</p>
                </div>
            )}
        </div>
    );
}

export default App;