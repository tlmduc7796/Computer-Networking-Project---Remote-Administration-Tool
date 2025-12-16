import React, { useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { CyberCard, CyberButton } from './CyberUI';
import { Wifi, Activity, Terminal, ShieldAlert, Zap, Search, Loader2 } from 'lucide-react';

const AgentSelector = ({ onSelectAgent }: any) => {
  const { isConnected, agents, selectedAgentId, selectAgent, connectToIp, startScan, isScanning } = useSocket();
  const [manualIP, setManualIP] = useState("127.0.0.1");

  if (!isConnected) {
    return (
      <CyberCard title="SERVER_UPLINK">
        <div className="flex flex-col gap-3 py-2">
            <div className="flex items-center gap-2 text-cyber-red animate-pulse text-xs">
                <ShieldAlert size={14} /> <span className="font-bold tracking-widest">DISCONNECTED</span>
            </div>
            <div className="flex gap-2">
                <input type="text" value={manualIP} onChange={(e) => setManualIP(e.target.value)}
                    className="bg-black border border-cyber-blue/50 text-cyber-blue px-3 py-2 w-full text-xs font-mono focus:outline-none focus:shadow-[0_0_10px_#00F0FF]" placeholder="SERVER IP" />
                <CyberButton onClick={() => connectToIp(manualIP)} variant="primary" className="py-1 px-3"><Zap size={14} /></CyberButton>
            </div>
            <CyberButton onClick={startScan} disabled={isScanning} variant="secondary" className="w-full text-xs py-2">
                {isScanning ? <Loader2 size={14} className="animate-spin mr-2" /> : <Search size={14} className="mr-2" />}
                {isScanning ? "SCANNING..." : "AUTO SCAN"}
            </CyberButton>
        </div>
      </CyberCard>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-cyber-blue/30 pb-2">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-cyber-yellow animate-pulse" />
          <div>
            <h2 className="text-lg font-display font-bold text-cyber-yellow tracking-widest">NET_WATCH</h2>
            <p className="text-[10px] text-cyber-blue font-mono">TARGETS: {agents.length}</p>
          </div>
        </div>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-gray-700 bg-black/50">
           <Loader2 className="w-8 h-8 text-gray-600 mx-auto mb-2 animate-spin" />
           <p className="text-gray-500 font-mono text-xs">SEARCHING SIGNAL...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => {
            const isSelected = selectedAgentId === agent.id;
            return (
                <CyberCard key={agent.id} title={agent.name} className={`transition-all duration-300 ${isSelected ? 'ring-1 ring-cyber-yellow scale-[1.01]' : 'hover:bg-cyber-dark'}`}>
                    <div className="space-y-3 relative">
                        <div className="flex items-center space-x-2 text-cyber-blue border-b border-white/10 pb-2 text-xs">
                            <Wifi size={14} />
                            <span className="tracking-wider font-mono truncate w-full" title={agent.id}>ID: {agent.id}</span>
                        </div>
                        {isSelected ? (
                             <div className="w-full py-1.5 bg-cyber-yellow text-black font-bold text-center text-xs font-display tracking-widest border border-cyber-yellow">CONNECTED</div>
                        ) : (
                            <CyberButton onClick={() => { selectAgent(agent.id); if(onSelectAgent) onSelectAgent(agent.id); }} variant="secondary" className="w-full py-1.5 text-xs">
                                <div className="flex items-center justify-center space-x-2"><Activity size={14} /><span>JACK IN {'>'}</span></div>
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
export default AgentSelector;