import AgentSelector from './components/AgentSelector';
import PowerControls from './components/PowerControls';
import ScreenshotCard from './components/ScreenshotCard';
import WebcamCard from './components/WebcamCard';
import KeyloggerCard from './components/KeyloggerCard'; // Giữ file cũ hoặc tạo vỏ bọc CyberCard cho nó
import ProcessManager from './components/ProcessManager'; // Giữ file cũ hoặc tạo vỏ bọc
import { useSocket } from './contexts/SocketContext';
import { Terminal, ShieldCheck, Activity, Lock, Cpu } from 'lucide-react';

function App() {
    const { isSystemLocked, isConnected, selectAgent } = useSocket();

    return (
        <div className="min-h-screen bg-cyber-grid text-gray-300 font-mono selection:bg-cyber-yellow selection:text-black flex flex-col scanlines">
            {/* TOP BAR */}
            <header className="sticky top-0 z-50 bg-cyber-black/90 backdrop-blur border-b border-cyber-yellow/20 px-6 py-3 shadow-[0_5px_30px_rgba(0,0,0,0.8)]">
                <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Terminal className="w-8 h-8 text-cyber-yellow animate-pulse" />
                        <h1 className="text-3xl font-display font-black text-white tracking-tighter leading-none glitch">
                            NET_<span className="text-cyber-yellow">WATCH</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-6 font-mono text-xs">
                         <div className="flex items-center gap-2 text-cyber-blue">
                             <Activity className="w-4 h-4 animate-spin-slow" />
                             <span>UPLINK: {isConnected ? "ESTABLISHED" : "SEARCHING..."}</span>
                         </div>
                    </div>
                </div>
            </header>

            {/* DASHBOARD */}
            <main className="container mx-auto px-4 py-6 flex-1 flex flex-col gap-6 relative z-10">
                <div className="w-full">
                    <AgentSelector onSelectAgent={selectAgent} />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full">
                    {/* LEFT COL */}
                    <div className="xl:col-span-3 flex flex-col gap-6">
                        <div className="flex-1 min-h-[300px]"><PowerControls /></div>
                    </div>
                    {/* CENTER COL */}
                    <div className="xl:col-span-6 flex flex-col gap-6">
                        <div className="h-[400px]"><ScreenshotCard /></div>
                        <div className="h-[250px]"><WebcamCard /></div>
                    </div>
                    {/* RIGHT COL */}
                    <div className="xl:col-span-3 flex flex-col gap-6">
                         <div className="flex-1 bg-black border border-cyber-blue/30 p-2 overflow-hidden min-h-[300px]">
                             {/* Placeholder cho Keylogger cũ - bọc trong div này để không vỡ layout */}
                             <KeyloggerCard />
                         </div>
                    </div>
                </div>
                
                <div className="w-full mt-auto bg-black border border-cyber-yellow/30 p-2">
                    <ProcessManager />
                </div>
            </main>

            {/* LOCK OVERLAY */}
            {isSystemLocked && (
                <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center">
                    <Lock className="w-32 h-32 text-cyber-red mx-auto mb-6 animate-pulse" />
                    <h1 className="text-8xl font-display font-black text-cyber-red tracking-tighter mb-4 glitch">LOCKED</h1>
                </div>
            )}
        </div>
    );
}
export default App;