import AgentSelector from './components/AgentSelector';
import PowerControls from './components/PowerControls';
import ScreenshotCard from './components/ScreenshotCard'; // Import Screenshot
import UltraviewCard from './components/UltraViewCard';   // Import Ultraview
import WebcamCard from './components/WebcamCard';
import KeyloggerCard from './components/KeyloggerCard';
import ProcessManager from './components/ProcessManager';
import { useSocket } from './contexts/SocketContext';
import { Terminal, Activity, Lock, Eye, Keyboard, Zap, Layers, Video, Monitor } from 'lucide-react';

const SectionDivider = ({ title, icon: Icon }: any) => (
    <div className="flex items-center gap-4 py-2 border-b border-cyber-yellow/20 mt-8 mb-4">
        <div className="p-1 bg-cyber-yellow text-black clip-path-polygon"><Icon size={16} /></div>
        <h3 className="text-cyber-yellow font-display font-bold tracking-[0.2em] text-sm md:text-base uppercase">{title}</h3>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-cyber-yellow/50 to-transparent"></div>
    </div>
);

function App() {
    const { isSystemLocked, isConnected } = useSocket();

    return (
        <div className="min-h-screen bg-cyber-grid text-gray-300 font-mono selection:bg-cyber-yellow selection:text-black flex flex-col scanlines">
            
            {/* Header */}
            <header className="sticky top-0 z-50 bg-cyber-black/95 backdrop-blur border-b border-cyber-yellow/30 px-6 py-3 shadow-neon-yellow">
                <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-4 max-w-6xl">
                    <div className="flex items-center gap-4">
                        <Terminal className="w-6 h-6 text-cyber-yellow animate-pulse" />
                        <h1 className="text-3xl font-display font-black text-white tracking-tighter leading-none">NET_<span className="text-cyber-yellow">WATCH</span></h1>
                    </div>
                    <div className="flex items-center gap-2 text-cyber-blue border border-cyber-blue/30 px-3 py-1 bg-cyber-blue/5 text-xs">
                        <Activity className="w-4 h-4 animate-spin-slow" /> <span>STATUS: {isConnected ? "ONLINE" : "SEARCHING..."}</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 flex-1 flex flex-col relative z-10 max-w-6xl">
                
                <div className="w-full"><AgentSelector /></div>
                
                <SectionDivider title="POWER_GRID" icon={Zap} />
                <div className="w-full"><PowerControls /></div>

                {/* 1. ULTRA VIEW (Hàng Riêng - Cao) */}
                <SectionDivider title="ULTRA_VIEW_CONTROL" icon={Monitor} />
                <div className="w-full h-[600px]">
                    <UltraviewCard />
                </div>

                {/* 2. SCREENSHOT & WEBCAM (Hàng Ngang 2 cột) */}
                <SectionDivider title="SURVEILLANCE_FEED" icon={Eye} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full h-[400px]">
                    <ScreenshotCard /> {/* Chụp ảnh */}
                    <WebcamCard />     {/* Webcam */}
                </div>

                <SectionDivider title="KEYSTROKE_LOGGER" icon={Keyboard} />
                <div className="w-full min-h-[350px]"><KeyloggerCard /></div>

                <SectionDivider title="PROCESS_MONITOR" icon={Layers} />
                <div className="w-full"><ProcessManager /></div>
                
                <div className="h-20"></div>
            </main>

            {isSystemLocked && (
                <div className="fixed inset-0 z-[9999] bg-cyber-black/95 flex flex-col items-center justify-center">
                    <Lock className="w-32 h-32 text-cyber-red mx-auto mb-6 animate-pulse" />
                    <h1 className="text-8xl font-display font-black text-cyber-red tracking-tighter mb-4 glitch">LOCKED</h1>
                </div>
            )}
        </div>
    );
}
export default App;