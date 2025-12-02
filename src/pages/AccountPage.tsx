import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Mail, Phone, Shield, CheckCircle, ArrowLeft } from 'lucide-react';

export default function AccountPage() {
  const { user, isLoggedIn, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (!isLoggedIn || !user) {
    navigate('/');
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Home
        </Button>

        {/* Profile Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-6">
              <Avatar className="size-24">
                <AvatarImage src={user.profilePicture} alt={user.name} />
                <AvatarFallback className="text-2xl bg-black text-white">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-3xl">{user.name}</CardTitle>
                  {user.googleId && (
                    <Badge variant="secondary" className="gap-1">
                      <img 
                        src="https://www.google.com/favicon.ico" 
                        alt="Google" 
                        className="size-3"
                      />
                      Google Account
                    </Badge>
                  )}
                  {isAdmin && (
                    <Badge variant="destructive" className="gap-1">
                      <Shield className="size-3" />
                      Admin
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-base">
                  Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your personal details and account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="mt-1 p-2 bg-gray-100 rounded-lg">
                <Mail className="size-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Email Address</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-base font-medium">{user.email}</p>
                  {user.emailVerified && (
                    <CheckCircle className="size-4 text-green-600" />
                  )}
                </div>
                {user.emailVerified && (
                  <p className="text-xs text-green-600 mt-1">Verified</p>
                )}
              </div>
            </div>

            {/* Phone */}
            {user.phone && (
              <div className="flex items-start gap-4">
                <div className="mt-1 p-2 bg-gray-100 rounded-lg">
                  <Phone className="size-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Phone Number</p>
                  <p className="text-base font-medium mt-1">{user.phone}</p>
                </div>
              </div>
            )}

            {/* Account Type */}
            <div className="flex items-start gap-4">
              <div className="mt-1 p-2 bg-gray-100 rounded-lg">
                <Shield className="size-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Account Type</p>
                <p className="text-base font-medium mt-1 capitalize">{user.role || 'Customer'}</p>
              </div>
            </div>

            {/* Google Account Info */}
            {user.googleId && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <img 
                    src="https://www.google.com/favicon.ico" 
                    alt="Google" 
                    className="size-4"
                  />
                  <span>This account is linked with Google Sign-In</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Panel Link */}
        {isAdmin && (
          <Card className="mt-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-red-900">Admin Access</h3>
                  <p className="text-sm text-red-700">You have administrative privileges</p>
                </div>
                <Button
                  onClick={() => navigate('/admin/payment-verification')}
                  variant="destructive"
                >
                  <Shield className="mr-2 size-4" />
                  Go to Admin Panel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
