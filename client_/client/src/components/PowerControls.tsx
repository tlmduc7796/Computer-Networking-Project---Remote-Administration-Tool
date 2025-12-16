import { Power, RefreshCcw, Moon, Lock, LogOut, Zap } from 'lucide-react';
// SỬA: Tách import ra làm 2 dòng riêng biệt
import { useSocket } from '../contexts/SocketContext'; // useSocket lấy từ Context
import { sendCommand } from '../services/socketService'; // sendCommand lấy từ Service
import { CyberButton, CyberCard } from './CyberUI';

const PowerControls = () => {
    const { selectedAgentId } = useSocket();

    const handleAction = (action: string) => {
        if (!selectedAgentId) return alert("SELECT TARGET SYSTEM FIRST!");
        if (confirm(`EXECUTE PROTOCOL: [${action.toUpperCase()}]?`)) {
            sendCommand(action);
        }
    };

    return (
        <CyberCard title="POWER_MANAGEMENT" className="h-full">
            <div className="grid grid-cols-2 gap-4 h-full">
                {/* Nút to chính: SHUTDOWN */}
                <CyberButton 
                    variant="danger" 
                    onClick={() => handleAction('shutdown')}
                    className="col-span-2 py-6 text-xl border-2 hover:bg-cyber-red hover:text-black transition-all"
                >
                    <Power className="w-6 h-6 mr-2" /> SYSTEM HALT
                </CyberButton>

                {/* Các nút chức năng phụ */}
                <CyberButton variant="secondary" onClick={() => handleAction('restart')}>
                    <RefreshCcw className="w-4 h-4 mr-2" /> REBOOT
                </CyberButton>

                <CyberButton variant="secondary" onClick={() => handleAction('sleep')}>
                    <Moon className="w-4 h-4 mr-2" /> SLEEP
                </CyberButton>

                <CyberButton variant="ghost" onClick={() => handleAction('lock')}>
                    <Lock className="w-4 h-4 mr-2" /> LOCK
                </CyberButton>

                <CyberButton variant="ghost" onClick={() => handleAction('logoff')}>
                    <LogOut className="w-4 h-4 mr-2" /> LOGOFF
                </CyberButton>
            </div>
            
            {/* Status Text giả lập */}
            <div className="mt-4 flex items-center justify-between text-[10px] text-gray-500 font-mono border-t border-gray-800 pt-2">
                <span>VOLTAGE: STABLE</span>
                <span className="flex items-center text-cyber-yellow"><Zap className="w-3 h-3 mr-1"/> AC_CONNECTED</span>
            </div>
        </CyberCard>
    );
};

export default PowerControls;