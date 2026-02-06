import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { OrderCard } from '@/components/OrderCard';
import { RefundRequestModal } from '@/components/RefundRequestModal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { mockOrders } from '@/data/orders';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle } from 'lucide-react';

const DashboardOrders = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const showSuccess = searchParams.get('success') === 'true';
  const [refundOrderId, setRefundOrderId] = useState<string | null>(null);

  const orders = mockOrders.filter((o) => o.userId === user?.id);
  const selectedOrder = orders.find((o) => o.id === refundOrderId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Orders</h1>
        <p className="text-muted-foreground">View and manage your order history</p>
      </div>

      {showSuccess && (
        <Alert className="border-success/50 bg-success/10">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertTitle className="text-success">Order placed successfully!</AlertTitle>
          <AlertDescription className="text-success/80">
            Your order has been confirmed and is being processed.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onRequestRefund={setRefundOrderId}
          />
        ))}
      </div>

      {selectedOrder && (
        <RefundRequestModal
          open={!!refundOrderId}
          onOpenChange={(open) => !open && setRefundOrderId(null)}
          order={selectedOrder}
        />
      )}
    </div>
  );
};

export default DashboardOrders;
