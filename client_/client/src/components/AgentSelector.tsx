import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext'; // Đảm bảo đường dẫn đúng tới SocketContext của bạn
import { Agent } from '../types'; // Đảm bảo đường dẫn đúng tới file types
import { CyberCard, CyberButton } from './CyberUI'; // Import giao diện Cyberpunk vừa tạo
import { Wifi, Activity, Terminal, ShieldAlert } from 'lucide-react'; // Cần cài: npm install lucide-react

interface AgentSelectorProps {
  onSelectAgent: (agentId: string) => void;
}

const AgentSelector: React.FC<AgentSelectorProps> = ({ onSelectAgent }) => {
  const { socket, isConnected } = useSocket();
  const [connectedAgents, setConnectedAgents] = useState<Agent[]>([]);

  // Lắng nghe sự kiện từ Server để cập nhật danh sách Agent
  useEffect(() => {
    if (!socket) return;

    // Yêu cầu danh sách agent ngay khi vào (nếu cần)
    // socket.emit('get_agents'); 

    const handleAgentList = (agents: Agent[]) => {
      console.log("Agents updated:", agents);
      setConnectedAgents(agents);
    };

    const handleNewAgent = (agent: Agent) => {
      setConnectedAgents(prev => {
        if (prev.find(a => a.id === agent.id)) return prev;
        return [...prev, agent];
      });
    };

    const handleAgentDisconnect = (agentId: string) => {
      setConnectedAgents(prev => prev.filter(a => a.id !== agentId));
    };

    socket.on('agent_list', handleAgentList);
    socket.on('agent_connected', handleNewAgent);
    socket.on('agent_disconnected', handleAgentDisconnect);

    return () => {
      socket.off('agent_list', handleAgentList);
      socket.off('agent_connected', handleNewAgent);
      socket.off('agent_disconnected', handleAgentDisconnect);
    };
  }, [socket]);

  return (
    <div className="p-6">
      {/* Header trạng thái mạng */}
      <div className="flex items-center justify-between mb-8 border-b border-cyber-blue/30 pb-4">
        <div className="flex items-center space-x-3">
          <Terminal className="w-8 h-8 text-cyber-yellow animate-pulse" />
          <div>
            <h2 className="text-2xl font-display font-bold text-cyber-yellow tracking-widest">NET_WATCH</h2>
            <p className="text-xs text-cyber-blue font-mono">SYSTEM MONITORING INTERFACE v2.0.77</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 font-mono text-sm">
           <span className={isConnected ? "text-cyber-blue" : "text-cyber-red"}>
              {isConnected ? "NETWORK: SECURE" : "NETWORK: OFFLINE"}
           </span>
           <div className={`w-3 h-3 ${isConnected ? "bg-cyber-blue shadow-[0_0_10px_#00F0FF]" : "bg-cyber-red"} rotate-45`}></div>
        </div>
      </div>

      {/* Grid danh sách máy trạm */}
      {connectedAgents.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-gray-700 bg-black/50">
           <ShieldAlert className="w-16 h-16 text-gray-600 mx-auto mb-4" />
           <p className="text-gray-500 font-mono text-xl">NO ACTIVE SIGNALS DETECTED...</p>
           <p className="text-gray-700 text-sm mt-2">Waiting for connection handshake</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {connectedAgents.map((agent) => (
            <CyberCard key={agent.id} title={`UNIT: ${agent.name || 'UNKNOWN'}`} className="hover:scale-[1.02] transition-transform duration-300 group">
                <div className="space-y-5 relative">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 text-[4rem] font-bold text-white/5 font-display -z-10 select-none">
                      {agent.id.slice(-2)}
                    </div>

                    <div className="flex items-center space-x-3 text-cyber-blue border-b border-white/10 pb-3">
                        <Wifi className="w-5 h-5" />
                        <span className="text-lg tracking-wider font-mono">{agent.id}</span>
                    </div>
                    
                    {/* Bảng thông số kỹ thuật giả lập */}
                    <div className="grid grid-cols-2 gap-px bg-cyber-blue/20 border border-cyber-blue/30 text-xs font-mono">
                        <div className="bg-cyber-black/90 p-2 text-gray-400">OS SYSTEM</div>
                        <div className="bg-cyber-black/90 p-2 text-right text-white">WIN_11_PRO</div>
                        <div className="bg-cyber-black/90 p-2 text-gray-400">LATENCY</div>
                        <div className="bg-cyber-black/90 p-2 text-right text-cyber-yellow">24ms</div>
                        <div className="bg-cyber-black/90 p-2 text-gray-400">STATUS</div>
                        <div className="bg-cyber-black/90 p-2 text-right text-cyber-blue font-bold animate-pulse">CONNECTED</div>
                    </div>

                    <CyberButton onClick={() => onSelectAgent(agent.id)} variant="secondary" className="w-full mt-2 group-hover:bg-cyber-blue group-hover:text-black">
                        <div className="flex items-center justify-center space-x-2">
                           <Activity className="w-4 h-4" />
                           <span>JACK IN {'>'}</span>
                        </div>
                    </CyberButton>
                </div>
            </CyberCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentSelector;