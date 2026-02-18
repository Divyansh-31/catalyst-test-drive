import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Package, Truck, CheckCircle, AlertTriangle, RotateCcw, Square } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import { startRefundPingSimulation, stopPingSimulation, isSimulationActive } from '@/services/fraudxPingService';
import { RefundModeModal } from '@/components/RefundModeModal';

interface OrderCardProps {
  order: Order;
  onRequestRefund: (orderId: string) => void;
}

const statusConfig = {
  processing: { icon: Clock, label: 'Processing', color: 'bg-warning/20 text-warning' },
  confirmed: { icon: Package, label: 'Confirmed', color: 'bg-primary/20 text-primary' },
  shipped: { icon: Truck, label: 'Shipped', color: 'bg-primary/20 text-primary' },
  delivered: { icon: CheckCircle, label: 'Delivered', color: 'bg-success/20 text-success' },
  cancelled: { icon: AlertTriangle, label: 'Cancelled', color: 'bg-destructive/20 text-destructive' },
  refund_requested: { icon: RotateCcw, label: 'Refund Requested', color: 'bg-warning/20 text-warning' },
  refunded: { icon: RotateCcw, label: 'Refunded', color: 'bg-muted text-muted-foreground' },
};

const formatTimeRemaining = (ms: number): string => {
  if (ms <= 0) return 'Expired';

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h left`;
  if (hours > 0) return `${hours}h ${minutes % 60}m left`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s left`;
  return `${seconds}s left`;
};

const getRefundWindowLabel = (type: string): string => {
  switch (type) {
    case 'blinkit':
      return 'Quick Refund (10 min)';
    case 'amazon':
      return 'Standard Return (7 days)';
    default:
      return 'Extended Return (30 days)';
  }
};

export const OrderCard = ({ order, onRequestRefund }: OrderCardProps) => {
  const [timeRemaining, setTimeRemaining] = useState(
    order.refundWindow.expiresAt - Date.now()
  );
  const [showModeModal, setShowModeModal] = useState(false);
  const [simulationRunning, setSimulationRunning] = useState(() => isSimulationActive(order.id));

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;
  const isRefundable = timeRemaining > 0 &&
    !['cancelled', 'refund_requested', 'refunded'].includes(order.status);
  const isUrgent = order.refundWindow.type === 'blinkit' && timeRemaining > 0 && timeRemaining < 300000;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(order.refundWindow.expiresAt - Date.now());
      // Check simulation status periodically
      setSimulationRunning(isSimulationActive(order.id));
    }, 1000);

    return () => clearInterval(timer);
  }, [order.refundWindow.expiresAt, order.id]);

  const handleRefundClick = () => {
    setShowModeModal(true);
  };

  const handleModeConfirm = (mode: 'normal' | 'fast' | 'teleport' | 'geoMismatch') => {
    // Start FraudX ping simulation with selected mode
    startRefundPingSimulation(order.id, mode, order.total);
    setSimulationRunning(true);
    // Call the original refund handler
    onRequestRefund(order.id);
  };

  const handleStopSimulation = () => {
    stopPingSimulation(order.id);
    setSimulationRunning(false);
  };

  return (
    <>
      <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">{order.id}</CardTitle>
            <div className="flex items-center gap-2">
              {simulationRunning && (
                <Badge className="bg-green-500/20 text-green-500 animate-pulse">
                  📡 Sending Pings
                </Badge>
              )}
              <Badge className={status.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Items */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {order.items.map((item) => (
              <div
                key={item.product.id}
                className="flex-shrink-0 h-16 w-16 rounded-lg overflow-hidden bg-muted"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Order details */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {order.items.length} item{order.items.length > 1 ? 's' : ''}
            </span>
            <span className="font-semibold">{formatCurrency(order.total)}</span>
          </div>

          {/* Refund window */}
          <div className={`rounded-lg p-3 ${isUrgent ? 'bg-destructive/10 border border-destructive/30' : 'bg-muted/50'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  {getRefundWindowLabel(order.refundWindow.type)}
                </p>
                <p className={`text-sm font-medium ${isUrgent ? 'text-destructive pulse-urgent' : ''}`}>
                  {formatTimeRemaining(timeRemaining)}
                </p>
              </div>
              <div className="flex gap-2">
                {simulationRunning && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleStopSimulation}
                  >
                    <Square className="h-3 w-3 mr-1 fill-current" />
                    Stop
                  </Button>
                )}
                {isRefundable && !simulationRunning && (
                  <Button
                    variant={isUrgent ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={handleRefundClick}
                  >
                    Request Refund
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <RefundModeModal
        open={showModeModal}
        onOpenChange={setShowModeModal}
        onConfirm={handleModeConfirm}
        orderId={order.id}
      />
    </>
  );
};
