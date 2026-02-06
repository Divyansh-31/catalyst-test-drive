import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Smartphone, MapPin, Fingerprint, CheckCircle } from 'lucide-react';

const DashboardSecurity = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Security</h1>
        <p className="text-muted-foreground">Manage your account security settings</p>
      </div>

      {/* Trust Score */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              FraudX Trust Score
            </CardTitle>
            <Badge className="bg-success/20 text-success border-success/30">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </div>
          <CardDescription>
            Your account has been verified and is in good standing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-full gradient-primary flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">92</span>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Excellent Trust Score</p>
              <p className="text-sm text-muted-foreground">
                Based on your transaction history, device fingerprints, and verification status.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Security Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label className="font-medium">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Require OTP for all transactions
                </p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-accent" />
              </div>
              <div>
                <Label className="font-medium">Location Verification</Label>
                <p className="text-sm text-muted-foreground">
                  Verify unusual location activity
                </p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/20 flex items-center justify-center">
                <Fingerprint className="h-5 w-5 text-success" />
              </div>
              <div>
                <Label className="font-medium">Device Fingerprinting</Label>
                <p className="text-sm text-muted-foreground">
                  Track trusted devices
                </p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Recent Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: 'Login', location: 'San Francisco, CA', time: '2 minutes ago', success: true },
              { action: 'OTP Verified', location: 'San Francisco, CA', time: '5 minutes ago', success: true },
              { action: 'Password Changed', location: 'San Francisco, CA', time: '2 days ago', success: true },
            ].map((event, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">{event.action}</p>
                  <p className="text-xs text-muted-foreground">{event.location}</p>
                </div>
                <div className="text-right">
                  <Badge variant={event.success ? 'default' : 'destructive'} className="mb-1">
                    {event.success ? 'Success' : 'Failed'}
                  </Badge>
                  <p className="text-xs text-muted-foreground">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSecurity;
