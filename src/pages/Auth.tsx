import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/Header';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupFullName, setSignupFullName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/search');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/search');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;

      if (data.session) {
        toast.success('Login successful!');
        navigate('/search');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupEmail || !signupPassword || !signupFullName) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (signupPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            full_name: signupFullName,
            phone: signupPhone,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      if (data.user) {
        toast.success('Account created successfully!');
        // Auto-login after signup
        navigate('/search');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className="p-8 shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Welcome</h2>
              <p className="text-muted-foreground">Sign in or create an account</p>
            </div>

            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        disabled={loading}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        disabled={loading}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="John Doe"
                        value={signupFullName}
                        onChange={(e) => setSignupFullName(e.target.value)}
                        disabled={loading}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        disabled={loading}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Phone Number</label>
                    <Input
                      type="tel"
                      placeholder="+977 98XXXXXXXX"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="At least 6 characters"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        disabled={loading}
                        className="pl-10"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Auth;
