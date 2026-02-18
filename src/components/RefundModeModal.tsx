import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Car, Plane, Zap, Loader2 } from 'lucide-react';

type MovementMode = 'normal' | 'fast' | 'teleport' | 'geoMismatch';

interface RefundModeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (mode: MovementMode) => void;
    orderId: string;
}

export const RefundModeModal = ({
    open,
    onOpenChange,
    onConfirm,
    orderId,
}: RefundModeModalProps) => {
    const [selectedMode, setSelectedMode] = useState<MovementMode>('normal');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleConfirm = () => {
        setIsProcessing(true);
        onConfirm(selectedMode);
        setTimeout(() => {
            setIsProcessing(false);
            onOpenChange(false);
        }, 500);
    };

    const modes = [
        {
            value: 'normal' as MovementMode,
            label: 'Normal Movement',
            description: 'Car speed (40-60 km/h) - No fraud detection',
            icon: Car,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
        },
        {
            value: 'fast' as MovementMode,
            label: 'Fast Movement',
            description: 'Plane speed (200+ km/h) - Triggers fraud alert',
            icon: Plane,
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-500/10',
        },
        {
            value: 'teleport' as MovementMode,
            label: 'Teleport',
            description: 'Instant jumps across cities - Extreme fraud!',
            icon: Zap,
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
        },
        {
            value: 'geoMismatch' as MovementMode,
            label: 'Geo Mismatch',
            description: 'User location is different from delivery address',
            icon: Zap,
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10',
        },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Choose Movement Simulation</DialogTitle>
                    <DialogDescription>
                        Select how the location pings will move on the FraudX dashboard for order <span className="font-mono text-foreground">{orderId}</span>
                    </DialogDescription>
                </DialogHeader>

                <RadioGroup
                    value={selectedMode}
                    onValueChange={(value) => setSelectedMode(value as MovementMode)}
                    className="space-y-3 my-4"
                >
                    {modes.map((mode) => (
                        <div
                            key={mode.value}
                            className={`flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer ${selectedMode === mode.value
                                ? 'border-primary bg-primary/5'
                                : 'border-border/50 hover:border-border'
                                }`}
                            onClick={() => setSelectedMode(mode.value)}
                        >
                            <RadioGroupItem value={mode.value} id={mode.value} />
                            <div className={`h-10 w-10 rounded-lg ${mode.bgColor} flex items-center justify-center`}>
                                <mode.icon className={`h-5 w-5 ${mode.color}`} />
                            </div>
                            <Label htmlFor={mode.value} className="flex-1 cursor-pointer">
                                <p className="font-medium">{mode.label}</p>
                                <p className="text-xs text-muted-foreground">{mode.description}</p>
                            </Label>
                        </div>
                    ))}
                </RadioGroup>

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => onOpenChange(false)}
                        disabled={isProcessing}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="flex-1 gradient-primary border-0"
                        onClick={handleConfirm}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Starting...
                            </>
                        ) : (
                            'Start Simulation'
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
