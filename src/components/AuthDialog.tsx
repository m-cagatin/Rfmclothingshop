import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2, XCircle } from 'lucide-react';

declare global {
  interface Window {
    google?: any;
  }
}

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE || '';

  // Check if Google script is loaded
  useEffect(() => {
    const checkGoogleLoaded = () => {
      if (window.google?.accounts?.id) {
        setGoogleScriptLoaded(true);
      } else {
        setTimeout(checkGoogleLoaded, 100);
      }
    };
    checkGoogleLoaded();
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    const result = await login(email, password);
    
    setIsLoading(false);
    if (result.success) {
      const { user, isAdmin } = result;
      
      if (isAdmin) {
        toast.success('Welcome Admin!', {
          description: 'Redirecting to admin panel...',
        });
        onClose();
        navigate('/admin/payment-verification');
      } else {
        toast.success('Welcome back!', {
          description: 'You have successfully logged in.',
        });
        onClose();
      }
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm-password') as string;
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    const result = await signup(name, email, phone, password);
    
    setIsLoading(false);
    if (result.success) {
      toast.success('Account created!', {
        description: 'Welcome to RFM. Start shopping now!',
      });
      onClose();
      navigate('/');
    } else {
      setError(result.error || 'Signup failed');
    }
  };

  const handleGoogleSignIn = async () => {
    if (!googleScriptLoaded || !window.google) {
      toast.error('Google Sign-In not ready. Please wait a moment and try again.');
      return;
    }

    setGoogleLoading(true);
    setError('');

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
        scope: 'email profile',
        callback: async (tokenResponse: any) => {
          try {
            console.log('[Google] Got token response');
            
            // Get user info from Google
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`,
              },
            });
            
            const userInfo = await userInfoResponse.json();
            console.log('[Google] User info:', userInfo);
            
            // Create a temporary ID token for backend (using email as identifier)
            // Note: For production, you should use proper OAuth flow
            const res = await fetch(`${API_BASE}/auth/google-oauth`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ 
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture,
                sub: userInfo.sub,
              }),
            });

            const data = await res.json();
            setGoogleLoading(false);

            if (!res.ok) {
              console.error('[Google] Backend error:', data);
              setError(data.error || 'Google sign-in failed');
              toast.error(data.error || 'Google sign-in failed');
              return;
            }

            if (data.success && data.user) {
              const isAdmin = data.user.role === 'admin';
              
              toast.success(`Welcome${isAdmin ? ' Admin' : ''}!`, {
                description: isAdmin ? 'Redirecting to admin panel...' : 'You have successfully signed in.',
              });
              
              onClose();
              
              if (isAdmin) {
                navigate('/admin/payment-verification');
              } else {
                navigate('/');
              }
              
              window.location.reload();
            }
          } catch (err) {
            console.error('[Google] Error:', err);
            setGoogleLoading(false);
            setError('Network error during Google sign-in');
            toast.error('Network error. Please try again.');
          }
        },
      });

      // Request access token - this will show Google account picker
      client.requestAccessToken();
      
    } catch (err) {
      console.error('[Google] Initialization error:', err);
      setGoogleLoading(false);
      setError('Failed to initialize Google Sign-In');
      toast.error('Failed to initialize Google Sign-In');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {/* Loading Overlay */}
        {(isLoading || googleLoading) && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-lg">
            <Loader2 className="size-12 animate-spin text-white mb-4" />
            <p className="text-white font-medium text-lg">
              {googleLoading ? 'Signing in with Google...' : 'Logging you in...'}
            </p>
            <p className="text-white/80 text-sm mt-2">Please wait</p>
          </div>
        )}

        <DialogHeader>
          <DialogTitle>Welcome to RFM</DialogTitle>
          <DialogDescription>
            Sign in to your account or create a new one
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* Login Form */}
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start gap-2">
                  <XCircle className="size-5 shrink-0 mt-0.5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="test@rfm.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="password123"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">Demo Customer: test@rfm.com / password123</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">Demo Admin: admin@rfm.com / admin123</p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-black text-white hover:bg-black/90 transition-transform active:scale-95"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-500">
                  OR CONTINUE WITH
                </span>
              </div>

              <Button
                variant="outline"
                type="button"
                className="w-full transition-transform active:scale-95"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || isLoading}
              >
                {googleLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                {googleLoading ? 'Signing in with Google...' : 'Google'}
              </Button>
            </form>
          </TabsContent>

          {/* Sign Up Form */}
          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start gap-2">
                  <XCircle className="size-5 shrink-0 mt-0.5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email Address</Label>
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-phone">Phone Number</Label>
                <Input
                  id="signup-phone"
                  name="phone"
                  type="tel"
                  placeholder="+63 XXX XXX XXXX"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm">Confirm Password</Label>
                <Input
                  id="signup-confirm"
                  name="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-black text-white hover:bg-black/90 transition-transform active:scale-95"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>

              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-500">
                  OR CONTINUE WITH
                </span>
              </div>

              <Button
                variant="outline"
                type="button"
                className="w-full transition-transform active:scale-95"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || isLoading}
              >
                {googleLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                {googleLoading ? 'Signing up with Google...' : 'Google'}
              </Button>

              <p className="text-center text-xs text-gray-500">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
