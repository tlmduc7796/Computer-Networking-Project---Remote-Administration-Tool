import { useState, useEffect } from 'react';
import { RefreshCw, Search, Cpu, Layers, Activity, AlertTriangle, XCircle, HardDrive, Zap } from 'lucide-react';
import { ApplicationsTab } from './ApplicationsTab';
import { useSocket } from '../contexts/SocketContext';
import { sendCommand } from '../services/socketService';
import Tabs from './Tabs';
import { CyberCard, CyberButton } from './CyberUI';

export interface ProcessInfo {
    pid: number;
    name: string;
    title: string;
    type: 'APP' | 'PROC';
    cpu: string;
    mem: number;
}

export default function ProcessManager() {
    const [sysStats, setSysStats] = useState({ cpu: 0, ramUsed: 0, ramTotal: 0 });
    const [activeTab, setActiveTab] = useState<'processes' | 'applications'>('processes');
    const [processes, setProcesses] = useState<ProcessInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const { socket, isConnected } = useSocket();

    // Logic Parse Giữ Nguyên
    const parseProcessData = (dataString: string[]): ProcessInfo[] => {
        return dataString.map(str => {
            const typeMatch = str.match(/^\[(APP|PROC)\]/);
            const idMatch = str.match(/ID:(\d+)/);
            const nameMatch = str.match(/Name:(.*?)\s\|/);
            const titleMatch = str.match(/Title:(.*?)\s\|/);
            const cpuMatch = str.match(/CPU:(\d+\.?\d*)/);
            const ramMatch = str.match(/RAM:(\d+)/);

            return {
                type: (typeMatch ? typeMatch[1] : 'PROC') as 'APP' | 'PROC',
                pid: idMatch ? parseInt(idMatch[1]) : 0,
                name: nameMatch ? nameMatch[1].trim() : 'Unknown',
                title: titleMatch ? titleMatch[1].trim() : '',
                cpu: cpuMatch ? cpuMatch[1] : "0.0",
                mem: ramMatch ? parseInt(ramMatch[1]) : 0
            };
        });
    };

    useEffect(() => {
        if (!socket) return;
        socket.on("ReceiveProcessList", (data: string[]) => {
            setProcesses(parseProcessData(data));
            setIsLoading(false);
        });
        socket.on("ReceiveSystemStats", (data: any) => setSysStats(data));
        return () => {
            socket.off("ReceiveProcessList"); socket.off("ReceiveSystemStats"); 
        };
    }, [socket]);

    const handleRefresh = async () => {
        if (!isConnected) return;
        setIsLoading(true);
        try { await sendCommand('list_processes'); } catch (error) { setIsLoading(false); }
    };

    const handleKillProcess = async (pid: number) => {
        if (!window.confirm(`TERMINATE PROCESS PID: ${pid}?`)) return;
        try { await sendCommand('kill_process', pid); setTimeout(handleRefresh, 1000); } catch (error) { alert(error); }
    };

    const filteredProcesses = processes.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.pid.toString().includes(searchTerm)
    );

    const totalMem = sysStats.ramUsed / 1024;
    const cpuPercent = sysStats.cpu;
    const runningApps = processes.filter(p => p.type === 'APP').length;

    // --- SYSTEM MONITOR CONTENT (RESTYLED) ---
    const processesContent = (
        <div className="flex flex-col h-full space-y-3 animate-fade-in pt-2">
            {/* Toolbar */}
            <div className="flex gap-3">
                <div className="relative flex-1 group">
                    <input
                        type="text"
                        placeholder="SEARCH_PID_OR_NAME..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black border border-cyber-yellow/40 px-4 py-2 pl-9 text-cyber-yellow font-mono text-xs focus:outline-none focus:border-cyber-blue focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all placeholder-cyber-yellow/30 uppercase"
                    />
                    <Search className="absolute left-3 top-2 w-4 h-4 text-cyber-yellow/50 group-focus-within:text-cyber-blue transition-colors" />
                </div>
                <CyberButton
                    onClick={handleRefresh}
                    disabled={!isConnected}
                    variant="ghost"
                    className="!py-2 !px-3"
                >
                    <RefreshCw className={`w-4 h-4 text-cyber-yellow ${isLoading ? 'animate-spin' : ''}`} />
                </CyberButton>
            </div>

            {/* Process Grid */}
            <div className="flex-1 min-h-0 border border-cyber-yellow/20 bg-black/40 relative overflow-hidden flex flex-col">
                <div className="grid grid-cols-12 gap-2 p-2 bg-cyber-dark border-b border-cyber-yellow/20 text-[10px] font-bold text-cyber-yellow uppercase font-mono tracking-wider sticky top-0 z-10">
                    <div className="col-span-2">PID</div>
                    <div className="col-span-4">PROCESS_NAME</div>
                    <div className="col-span-2 text-right">CPU</div>
                    <div className="col-span-2 text-right">MEM</div>
                    <div className="col-span-1 text-center">TYPE</div>
                    <div className="col-span-1 text-center">ACT</div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-[1px]">
                    {filteredProcesses.map((proc, index) => (
                        <div
                            key={proc.pid}
                            className={`grid grid-cols-12 gap-2 items-center p-2 text-xs border-b border-gray-800/50 hover:bg-cyber-yellow/10 transition-colors group font-mono ${index % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}`}
                        >
                            <div className="col-span-2 text-cyber-blue">{proc.pid}</div>
                            <div className="col-span-4 overflow-hidden pr-2">
                                <div className="text-gray-300 truncate font-bold group-hover:text-white">{proc.name}</div>
                            </div>
                            <div className="col-span-2 text-right text-cyber-yellow">{proc.cpu}%</div>
                            <div className="col-span-2 text-right text-cyber-blue">{proc.mem} MB</div>
                            <div className="col-span-1 text-center">
                                <span className={`text-[9px] px-1 border ${proc.type === 'APP' ? 'border-cyber-blue text-cyber-blue' : 'border-gray-700 text-gray-500'}`}>
                                    {proc.type}
                                </span>
                            </div>
                            <div className="col-span-1 flex justify-center">
                                <button 
                                    onClick={() => handleKillProcess(proc.pid)} 
                                    className="opacity-50 hover:opacity-100 text-cyber-red transition-all"
                                >
                                    <XCircle size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const tabsData = [
        { id: 'processes', label: 'SYSTEM_MONITOR', icon: <Activity size={16} />, content: processesContent },
        { id: 'applications', label: 'APPLICATIONS', icon: <Layers size={16} />, content: <ApplicationsTab allProcesses={processes} onRefresh={handleRefresh} /> }
    ];

    return (
        <CyberCard title="PROCESS_TASK_MANAGER" className="h-full flex flex-col">
            <div className="flex justify-end mb-2 -mt-2">
                <div className={`text-[10px] font-mono border px-2 py-0.5 flex items-center gap-2 ${isConnected ? 'text-cyber-blue border-cyber-blue/30 bg-cyber-blue/5' : 'text-cyber-red border-cyber-red/30'}`}>
                    UPLINK: 
                    <span className={`font-bold ${isConnected ? 'text-cyber-blue animate-pulse' : 'text-cyber-red'}`}>
                        {isConnected ? 'SECURE' : 'LOST'}
                    </span>
                </div>
            </div>

            <div className="flex-1 min-h-0 relative z-10">
                <Tabs activeTab={activeTab} onTabChange={(id) => setActiveTab(id as any)} tabs={tabsData} />
            </div>

            {/* Footer Stats - HUD Style */}
            <div className="mt-4 grid grid-cols-3 gap-3 h-16 z-10">
                {/* CPU */}
                <div className="bg-cyber-dark border border-cyber-yellow/30 p-2 relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute top-1 right-1 opacity-30 text-cyber-yellow"><Cpu size={20} /></div>
                    <div className="text-[9px] text-gray-500 font-mono tracking-widest uppercase">CPU_LOAD</div>
                    <div className="text-xl font-bold text-cyber-yellow font-display leading-none mt-1">{cpuPercent}%</div>
                    <div className="w-full bg-gray-800 h-1 mt-2 overflow-hidden"><div className="bg-cyber-yellow h-full transition-all duration-500" style={{ width: `${cpuPercent}%` }}></div></div>
                </div>
                {/* RAM */}
                <div className="bg-cyber-dark border border-cyber-blue/30 p-2 relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute top-1 right-1 opacity-30 text-cyber-blue"><HardDrive size={20} /></div>
                    <div className="text-[9px] text-gray-500 font-mono tracking-widest uppercase">MEM_USAGE</div>
                    <div className="text-xl font-bold text-cyber-blue font-display leading-none mt-1">{totalMem.toFixed(1)} GB</div>
                    <div className="w-full bg-gray-800 h-1 mt-2 overflow-hidden"><div className="bg-cyber-blue h-full transition-all duration-500" style={{ width: `${(sysStats.ramUsed / sysStats.ramTotal) * 100}%` }}></div></div>
                </div>
                {/* TASKS */}
                <div className="bg-cyber-dark border border-cyber-red/30 p-2 relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute top-1 right-1 opacity-30 text-cyber-red"><AlertTriangle size={20} /></div>
                    <div className="text-[9px] text-gray-500 font-mono tracking-widest uppercase">TASKS</div>
                    <div className="text-xl font-bold text-cyber-red font-display leading-none mt-1">{runningApps}</div>
                    <div className="w-full bg-gray-800 h-1 mt-2 overflow-hidden"><div className="bg-cyber-red h-full w-full opacity-50 animate-pulse"></div></div>
                </div>
            </div>
        </CyberCard>
    );
}