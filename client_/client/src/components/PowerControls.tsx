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
        <CyberCard title="POWER_GRID" className="h-full">
            <div className="flex flex-col h-full justify-between gap-3">
                <div className="grid grid-cols-2 gap-3">
                    <CyberButton variant="danger" onClick={() => handleAction('shutdown')} className="py-4 text-sm border-2">
                        <div className="flex flex-col items-center gap-1"><Power size={20} /><span>SHUTDOWN</span></div>
                    </CyberButton>
                    <CyberButton variant="secondary" onClick={() => handleAction('restart')} className="py-4 text-sm">
                        <div className="flex flex-col items-center gap-1"><RefreshCw size={20} /><span>REBOOT</span></div>
                    </CyberButton>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <CyberButton variant="ghost" className="text-[10px] py-2" onClick={() => handleAction('sleep')}><Moon size={14} className="mr-1"/> SLEEP</CyberButton>
                    <CyberButton variant="ghost" className="text-[10px] py-2" onClick={() => handleAction('hibernate')}><HardDrive size={14} className="mr-1"/> HIBERNATE</CyberButton>
                    <CyberButton variant="ghost" className="text-[10px] py-2" onClick={() => handleAction('lock')}><Lock size={14} className="mr-1"/> LOCK</CyberButton>
                    <CyberButton variant="ghost" className="text-[10px] py-2" onClick={() => handleAction('logoff')}><LogOut size={14} className="mr-1"/> LOGOFF</CyberButton>
                </div>
            </div>
        </CyberCard>
    );
};
export default PowerControls;