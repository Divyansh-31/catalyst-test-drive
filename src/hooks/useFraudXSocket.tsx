import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { FRAUDX_CONFIG } from '@/config/fraudxConfig';

interface RefundDecisionData {
    deviceId: string;
    requestId: string;
    action: 'approved' | 'blocked';
    message: string;
}

export const useFraudXSocket = () => {
    useEffect(() => {
        // Connect to the FraudX backend
        const socket = io(FRAUDX_CONFIG.SERVER_URL, {
            transports: ['websocket'], // Force WebSocket to bypass ngrok polling issues
            extraHeaders: {
                "ngrok-skip-browser-warning": "true"
            }
        });

        socket.on('connect', () => {
            console.log('Connected to FraudX!');
        });

        socket.on('refund_decision', (data: RefundDecisionData) => {
            console.log('Received decision:', data);

            if (data.action === 'approved') {
                toast.success(
                    <div className="flex flex-col gap-1 w-full">
                        <div className="font-bold text-lg">✅ {data.message}</div>
                        <div className="text-sm opacity-90">Request ID: {data.requestId}</div>
                    </div>,
                    {
                        duration: 8000,
                        className: "p-4 border-l-4 border-l-green-500 bg-green-50 dark:bg-green-900/10",
                        style: { minWidth: '350px', fontSize: '16px' }
                    }
                );
            } else {
                toast.error(
                    <div className="flex flex-col gap-1 w-full">
                        <div className="font-bold text-lg">🚫 {data.message}</div>
                        <div className="text-sm opacity-90">Request ID: {data.requestId}</div>
                    </div>,
                    {
                        duration: 8000,
                        className: "p-4 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/10",
                        style: { minWidth: '350px', fontSize: '16px' }
                    }
                );
            }
        });

        return () => {
            socket.disconnect();
            console.log('🔌 [FraudX] Disconnected from socket server');
        };
    }, []);
};
