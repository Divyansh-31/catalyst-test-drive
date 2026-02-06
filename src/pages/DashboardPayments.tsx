import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Plus } from 'lucide-react';

const DashboardPayments = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Payment Methods</h1>
          <p className="text-muted-foreground">Manage your saved payment methods</p>
        </div>
        <Button className="gradient-primary border-0">
          <Plus className="h-4 w-4 mr-2" />
          Add Card
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Visa ending in 4242</CardTitle>
            <Badge>Default</Badge>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="h-12 w-16 rounded-lg gradient-accent flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                <p className="text-xs text-muted-foreground">Expires 12/26</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm border-dashed">
          <CardContent className="flex items-center justify-center h-full min-h-[120px]">
            <Button variant="ghost" className="text-muted-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Add new card
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPayments;
