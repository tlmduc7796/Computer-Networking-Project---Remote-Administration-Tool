import React from 'react';
import { Power, RefreshCw, Moon, Lock, LogOut, HardDrive, Zap } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import { sendCommand } from '../services/socketService';
import { CyberButton, CyberCard } from './CyberUI';

const PowerControls = () => {
    const { selectedAgentId } = useSocket();

    const handleAction = (action: string) => {
        if (!selectedAgentId) return alert("❌ NO TARGET SELECTED!");
        if (confirm(`⚠️ EXECUTE: [${action.toUpperCase()}]?`)) {
            sendCommand(action);
        }
    };

    return (
        <CyberCard title="POWER_GRID_CONTROL" className="h-full">
            <div className="flex flex-col gap-4">
                {/* Hàng trên: Các nút hành động chính (SHUTDOWN/RESTART) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CyberButton variant="danger" onClick={() => handleAction('shutdown')} className="py-6 text-xl border-2 hover:bg-cyber-red/20">
                        <div className="flex flex-row items-center gap-3">
                            <Power size={28} />
                            <span className="font-bold">SYSTEM SHUTDOWN</span>
                        </div>
                    </CyberButton>

                    <CyberButton variant="secondary" onClick={() => handleAction('restart')} className="py-6 text-xl border-2">
                        <div className="flex flex-row items-center gap-3">
                            <RefreshCw size={28} />
                            <span className="font-bold">SYSTEM REBOOT</span>
                        </div>
                    </CyberButton>
                </div>

                {/* Hàng dưới: Các nút phụ (Chia làm 4 cột) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <CyberButton variant="ghost" className="py-3" onClick={() => handleAction('sleep')}>
                        <Moon size={16} className="mr-2"/> SLEEP
                    </CyberButton>
                    <CyberButton variant="ghost" className="py-3" onClick={() => handleAction('hibernate')}>
                        <HardDrive size={16} className="mr-2"/> HIBERNATE
                    </CyberButton>
                    <CyberButton variant="ghost" className="py-3" onClick={() => handleAction('lock')}>
                        <Lock size={16} className="mr-2"/> LOCK PC
                    </CyberButton>
                    <CyberButton variant="ghost" className="py-3" onClick={() => handleAction('logoff')}>
                        <LogOut size={16} className="mr-2"/> LOGOFF
                    </CyberButton>
                </div>
            </div>
        </CyberCard>
    );
};

export default PowerControls;