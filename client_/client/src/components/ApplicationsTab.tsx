import React, { useState } from 'react';
import { Play, Terminal, Trash2, RefreshCw, Cpu, Activity, Zap } from 'lucide-react';
import { sendCommand } from '../services/socketService';
import { ProcessInfo } from './ProcessManager';
import { CyberButton } from './CyberUI'; // Dùng lại nút chuẩn

interface Props {
    allProcesses: ProcessInfo[];
    onRefresh: () => void;
}

const commonApps = [
    { value: "notepad.exe", label: "Notepad" },
    { value: "calc.exe", label: "Calculator" },
    { value: "cmd.exe", label: "Command Prompt" },
    { value: "explorer.exe", label: "Explorer" },
    { value: "chrome.exe", label: "Chrome" },
];

export function ApplicationsTab({ allProcesses, onRefresh }: Props) {
    const [newAppName, setNewAppName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const applications = allProcesses.filter(p => p.type === 'APP');

    const handleStartApp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAppName.trim()) return;
        setIsLoading(true);
        try {
            await sendCommand('start_app', newAppName);
            setNewAppName("");
            setTimeout(() => { onRefresh(); setIsLoading(false); }, 2000);
        } catch (error) {
            alert("EXECUTION_ERROR: " + error);
            setIsLoading(false);
        }
    };

    const handleKillApp = async (pid: number) => {
        if (!window.confirm(`TERMINATE APPLICATION PID: ${pid}?`)) return;
        try {
            await sendCommand('kill_process', pid);
            setTimeout(onRefresh, 1000);
        } catch (err) { alert(err); }
    };

    return (
        <div className="flex flex-col h-full space-y-4 animate-fade-in pt-2">
            
            {/* --- COMMAND INPUT (TERMINAL STYLE) --- */}
            <div className="bg-black border border-cyber-blue/30 p-1 relative overflow-hidden group">
                {/* Background Decoration */}
                <div className="absolute inset-0 bg-cyber-blue/5 pointer-events-none"></div>
                
                <form onSubmit={handleStartApp} className="flex gap-2 items-center relative z-10 p-1">
                    <div className="text-cyber-blue animate-pulse pl-2"><Terminal size={16} /></div>

                    <div className="flex-1 relative">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-cyber-blue/50 font-mono text-xs">{'>'}</span>
                        <input
                            list="common-apps"
                            type="text"
                            value={newAppName}
                            onChange={(e) => setNewAppName(e.target.value)}
                            placeholder="EXECUTE_NEW_TASK..."
                            className="w-full bg-transparent border-b border-cyber-blue/30 px-4 py-1 text-cyber-blue font-mono text-xs focus:outline-none focus:border-cyber-yellow focus:shadow-[0_10px_20px_-10px_rgba(252,238,10,0.2)] transition-all placeholder-cyber-blue/30 uppercase"
                            disabled={isLoading}
                        />
                        <datalist id="common-apps">
                            {commonApps.map((app) => <option key={app.value} value={app.value}>{app.label}</option>)}
                        </datalist>
                    </div>

                    <CyberButton 
                        onClick={handleStartApp}
                        disabled={isLoading || !newAppName}
                        variant="secondary"
                        className="!py-1 !px-4 text-[10px]"
                    >
                        {isLoading ? 'INIT...' : 'RUN'}
                    </CyberButton>
                </form>
            </div>

            {/* --- APP GRID (CYBERPUNK STYLE) --- */}
            <div className="flex-1 flex flex-col min-h-0 border border-cyber-yellow/20 bg-black/40 relative">
                
                {/* Header Grid */}
                <div className="grid grid-cols-12 gap-2 p-2 bg-cyber-dark border-b border-cyber-yellow/20 text-[10px] font-bold text-cyber-yellow font-mono tracking-widest uppercase sticky top-0 z-10">
                    <div className="col-span-4">APPLICATION_TITLE</div>
                    <div className="col-span-2 text-right">PID_TAG</div>
                    <div className="col-span-2 text-right">CPU_LOAD</div>
                    <div className="col-span-2 text-right">MEM_ALLOC</div>
                    <div className="col-span-2 text-center">OP_CODE</div>
                </div>

                {/* Body Scrollable */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-[1px]">
                    {applications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-cyber-blue/30 font-mono text-xs italic">
                            <Activity size={32} className="mb-2 opacity-50" />
                            <span>{'> NO_ACTIVE_APPLICATIONS'}</span>
                        </div>
                    ) : (
                        applications.map((app, index) => (
                            <div
                                key={app.pid}
                                className={`grid grid-cols-12 gap-2 items-center p-2 text-xs border-b border-gray-800/50 hover:bg-cyber-blue/10 transition-all group font-mono ${index % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}`}
                            >
                                <div className="col-span-4 overflow-hidden">
                                    <div className="text-cyber-blue font-bold flex items-center gap-2 truncate">
                                        <Zap size={10} className="fill-cyber-blue" />
                                        {app.name}
                                    </div>
                                    <div className="text-gray-500 text-[9px] truncate pl-4 italic">
                                        {app.title || "Background Process"}
                                    </div>
                                </div>

                                <div className="col-span-2 text-right text-gray-400">{app.pid}</div>
                                <div className="col-span-2 text-right text-cyber-yellow">{app.cpu}%</div>
                                <div className="col-span-2 text-right text-cyber-blue">{app.mem} MB</div>

                                <div className="col-span-2 flex justify-center">
                                    <button
                                        onClick={() => handleKillApp(app.pid)}
                                        className="text-gray-600 hover:text-cyber-red transition-all p-1 border border-transparent hover:border-cyber-red"
                                        title="TERMINATE"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                
                {/* Decorative Scanlines */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] z-0"></div>
            </div>

            {/* --- STATUS FOOTER --- */}
            <div className="flex justify-between items-center border-t border-gray-800 pt-2 text-[9px] font-mono text-gray-500">
                <div className="flex gap-4">
                    <span className="flex items-center gap-1 text-cyber-blue"><Activity size={10} /> ACTIVE_APPS: {applications.length}</span>
                    <span className="flex items-center gap-1"><Cpu size={10} /> TOTAL_THREADS: {allProcesses.length}</span>
                </div>
                <button onClick={onRefresh} className="hover:text-cyber-yellow flex items-center gap-1 transition-colors uppercase tracking-wider">
                    <RefreshCw size={10} className={isLoading ? 'animate-spin' : ''} /> SYNC_DATA
                </button>
            </div>
        </div>
    );
}