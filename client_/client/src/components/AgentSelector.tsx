import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext'; // Đảm bảo đường dẫn đúng
import { Agent } from '../types'; 
import { CyberCard, CyberButton } from './CyberUI'; // Đảm bảo đường dẫn đúng tới CyberUI
import { Wifi, Activity, Terminal, ShieldAlert, Zap, Search, Loader2 } from 'lucide-react';

interface AgentSelectorProps {
  onSelectAgent?: (agentId: string) => void;
}

const AgentSelector: React.FC<AgentSelectorProps> = ({ onSelectAgent }) => {
  const { socket, isConnected, agents, selectedAgentId, selectAgent, connectToIp, startScan, isScanning } = useSocket();
  const [manualIP, setManualIP] = useState("127.0.0.1");

  // Nếu chưa kết nối Server (SignalR), hiển thị màn hình đăng nhập Server
  if (!isConnected) {
    return (
      <CyberCard title="SERVER_UPLINK_REQUIRED">
        <div className="flex flex-col gap-4 py-4">
            <div className="flex items-center gap-2 text-cyber-red animate-pulse mb-2">
                <ShieldAlert />
                <span className="font-bold tracking-widest">NO CARRIER SIGNAL</span>
            </div>
            
            <div className="flex gap-4">
                <input 
                    type="text" 
                    value={manualIP}
                    onChange={(e) => setManualIP(e.target.value)}
                    className="bg-black border border-cyber-blue/50 text-cyber-blue px-4 py-2 w-full font-mono focus:outline-none focus:shadow-[0_0_15px_#00F0FF]"
                    placeholder="ENTER SERVER IP..."
                />
                <CyberButton onClick={() => connectToIp(manualIP)} variant="primary">
                    <Zap className="w-4 h-4 mr-2" /> CONNECT
                </CyberButton>
            </div>

            <div className="border-t border-gray-800 my-2"></div>

            <CyberButton onClick={startScan} disabled={isScanning} variant="secondary" className="w-full">
                {isScanning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                {isScanning ? "SCANNING FREQUENCIES..." : "AUTO SCAN NETWORK"}
            </CyberButton>
        </div>
      </CyberCard>
    );
  }

  // Nếu đã kết nối Server, hiển thị danh sách Agent (Máy trạm)
  return (
    <div className="space-y-6">
      {/* Header trạng thái */}
      <div className="flex items-center justify-between border-b border-cyber-blue/30 pb-4">
        <div className="flex items-center space-x-3">
          <Terminal className="w-8 h-8 text-cyber-yellow animate-pulse" />
          <div>
            <h2 className="text-2xl font-display font-bold text-cyber-yellow tracking-widest">NET_WATCH</h2>
            <p className="text-xs text-cyber-blue font-mono">AVAILABLE TARGETS: {agents.length}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 font-mono text-sm">
           <span className="text-cyber-blue">SECURE_LINK: ESTABLISHED</span>
           <div className="w-3 h-3 bg-cyber-blue shadow-[0_0_10px_#00F0FF] rotate-45"></div>
        </div>
      </div>

      {/* Grid danh sách máy trạm */}
      {agents.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-700 bg-black/50">
           <Loader2 className="w-12 h-12 text-gray-600 mx-auto mb-4 animate-spin" />
           <p className="text-gray-500 font-mono text-xl">SCANNING FOR TARGETS...</p>
           <p className="text-gray-700 text-sm mt-2">Waiting for connection handshake</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => {
            const isSelected = selectedAgentId === agent.id;
            
            return (
                <CyberCard key={agent.id} title={`UNIT: ${agent.name}`} className={`transition-all duration-300 ${isSelected ? 'ring-2 ring-cyber-yellow scale-[1.02]' : 'hover:scale-[1.01]'}`}>
                    <div className="space-y-4 relative">
                        {/* Background ID */}
                        <div className="absolute top-0 right-0 text-[3rem] font-bold text-white/5 font-display -z-10 select-none">
                        {agent.id.slice(-2)}
                        </div>

                        <div className="flex items-center space-x-3 text-cyber-blue border-b border-white/10 pb-2">
                            <Wifi className="w-5 h-5" />
                            <span className="text-lg tracking-wider font-mono truncate" title={agent.id}>
                                ID: {agent.id.substring(0, 8)}...
                            </span>
                        </div>
                        
                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-px bg-cyber-blue/20 border border-cyber-blue/30 text-xs font-mono">
                            <div className="bg-cyber-black/90 p-2 text-gray-400">OS SYSTEM</div>
                            <div className="bg-cyber-black/90 p-2 text-right text-white">WIN_11</div>
                            <div className="bg-cyber-black/90 p-2 text-gray-400">STATUS</div>
                            <div className="bg-cyber-black/90 p-2 text-right text-cyber-blue font-bold animate-pulse">ONLINE</div>
                        </div>

                        {/* NÚT KẾT NỐI (JACK IN) */}
                        {isSelected ? (
                             <div className="w-full py-2 bg-cyber-yellow text-black font-bold text-center font-display tracking-widest border border-cyber-yellow cursor-default shadow-[0_0_15px_#FCEE0A]">
                                 CONNECTED
                             </div>
                        ) : (
                            <CyberButton 
                                onClick={() => {
                                    selectAgent(agent.id);
                                    if(onSelectAgent) onSelectAgent(agent.id);
                                }} 
                                variant="secondary" 
                                className="w-full group-hover:bg-cyber-blue group-hover:text-black"
                            >
                                <div className="flex items-center justify-center space-x-2">
                                <Activity className="w-4 h-4" />
                                <span>JACK IN {'>'}</span>
                                </div>
                            </CyberButton>
                        )}
                    </div>
                </CyberCard>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AgentSelector; // Export Default quan trọng