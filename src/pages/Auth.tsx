import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/Header';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

const Auth = () => {
  const navigate = useNavigate();
  const { setUser } = useApp();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [authType, setAuthType] = useState<'email' | 'phone'>('email');

  const handleSendOtp = () => {
    if (authType === 'email' && !email) {
      toast.error('Please enter your email');
      return;
    }
    if (authType === 'phone' && !phone) {
      toast.error('Please enter your phone number');
      return;
    }

    // Mock OTP sending
    setOtpSent(true);
    toast.success(`OTP sent to your ${authType}! Use 123456 for demo.`);
  };

  const handleVerifyOtp = () => {
    if (!otp) {
      toast.error('Please enter OTP');
      return;
    }

    // Mock OTP verification (demo accepts 123456)
    if (otp === '123456') {
      const contact = authType === 'email' ? email : phone;
      
      // Check for admin (demo: admin@bus.com or +9779841234567)
      const isAdmin = contact === 'admin@bus.com' || contact === '+9779841234567';
      
      setUser({
        id: Math.random().toString(36).substr(2, 9),
        contact,
        isAdmin
      });
      
      toast.success('Login successful!');
      navigate('/search');
    } else {
      toast.error('Invalid OTP. Use 123456 for demo.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className="p-8 shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h2>
              <p className="text-muted-foreground">Sign in to book your tickets</p>
            </div>

            <Tabs defaultValue="email" onValueChange={(v) => setAuthType(v as 'email' | 'phone')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="phone">Phone</TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={otpSent}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Demo admin: admin@bus.com
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="phone" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="+977 98XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={otpSent}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Demo admin: +9779841234567
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {otpSent && (
              <div className="space-y-2 mt-4">
                <label className="text-sm font-medium text-foreground">Enter OTP</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Use 123456 for demo
                </p>
              </div>
            )}

            <div className="mt-6 space-y-3">
              {!otpSent ? (
                <Button 
                  onClick={handleSendOtp}
                  className="w-full bg-gradient-to-r from-primary to-accent"
                >
                  Send OTP
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={handleVerifyOtp}
                    className="w-full bg-gradient-to-r from-primary to-accent"
                  >
                    Verify & Sign In
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setOtpSent(false)}
                    className="w-full"
                  >
                    Change {authType === 'email' ? 'Email' : 'Phone'}
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Auth;
