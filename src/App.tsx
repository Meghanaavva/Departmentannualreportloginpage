import { useState, useEffect, useCallback } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Card } from './components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './components/ui/dialog';
import { RefreshCw, Mail, Phone, HelpCircle, Shield } from 'lucide-react';
import { HomePage } from './components/HomePage';
import { toast } from 'sonner@2.0.3';
import gitamLogo from 'figma:asset/962159bb4aae7f88a8c7a3bbc3b8fa9fa3bd0e9d.png';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaText, setCaptchaText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showContactSupport, setShowContactSupport] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Generate random CAPTCHA with guaranteed numbers
  const generateCaptcha = useCallback(() => {
    const numbers = '0123456789';
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const allChars = numbers + letters;
    
    let result = '';
    
    // Ensure at least 2 numbers are included
    for (let i = 0; i < 2; i++) {
      result += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    // Fill the rest with random characters
    for (let i = 0; i < 3; i++) {
      result += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Shuffle the result to randomize positions
    result = result.split('').sort(() => Math.random() - 0.5).join('');
    
    setCaptchaText(result);
    setCaptcha(''); // Clear the input when CAPTCHA changes
  }, []);

  // Generate CAPTCHA on component mount
  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    // Simple validation
    if (!username || !password || !captcha) {
      setError('Please fill in all fields');
      generateCaptcha(); // Regenerate CAPTCHA on error
      setIsLoading(false);
      return;
    }
    
    if (captcha.toLowerCase() !== captchaText.toLowerCase()) {
      setError('Invalid CAPTCHA. Please try again.');
      generateCaptcha(); // Regenerate CAPTCHA on error
      setIsLoading(false);
      return;
    }
    
    // Open authentication - any credentials work as long as basic requirements are met
    if (username.length >= 1 && password.length >= 4) {
      // Instant redirect to home page after successful login
      setIsLoggedIn(true);
      setUsername('');
      setPassword('');
      setCaptcha('');
      setSuccess('');
      setError('');
      setIsLoading(false);
      generateCaptcha();
      toast.success('Login successful! Welcome to Annual Report Portal.');
    } else {
      setError('Department ID is required and password must be at least 4 characters long.');
      generateCaptcha(); // Regenerate CAPTCHA on error
      setIsLoading(false);
    }
  };

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setCaptcha('');
    setError('');
    setSuccess('');
    setIsLoading(false);
    generateCaptcha();
    toast.success('Logged out successfully.');
  }, [generateCaptcha]);

  // Handle numeric input only for department ID
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    setUsername(value);
  };

  // Handle Forgot Password
  const handleForgotPassword = () => {
    setShowForgotPassword(true);
    setResetEmail('');
  };

  const handlePasswordReset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Please enter your email address.');
      return;
    }
    
    // Mock password reset
    setTimeout(() => {
      toast.success('Password reset instructions have been sent to your email.');
      setShowForgotPassword(false);
      setResetEmail('');
    }, 1000);
  };

  // Handle Contact Support
  const handleContactSupport = () => {
    setShowContactSupport(true);
  };

  // Handle button hover events
  const handleLoginButtonMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isLoading) {
      e.currentTarget.style.backgroundColor = '#C69214';
    }
  };

  const handleLoginButtonMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isLoading) {
      e.currentTarget.style.backgroundColor = '#006D66';
    }
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#006D66';
  };

  // Show HomePage if logged in
  if (isLoggedIn) {
    return <HomePage onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-800 to-teal-900 flex flex-col items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #006D66 0%, #004d45 100%)' }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-teal-950/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0">
          <svg width="300" height="150" viewBox="0 0 300 150" className="text-teal-950/10">
            <path d="M0,150 L0,100 Q50,80 100,100 T200,100 L200,150 Z" fill="currentColor" />
            <path d="M0,150 L0,120 Q30,100 60,120 T120,120 L120,150 Z" fill="currentColor" />
          </svg>
        </div>
      </div>

      <div className="w-full max-w-4xl relative z-10 flex-1 flex flex-col justify-center">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-white mb-2 tracking-wide text-3xl font-semibold">My-GITAM</h1>
          <p className="text-teal-100 text-lg">Department Annual Report System</p>
        </div>

        {/* Login Card */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 p-8 mb-8">
          <div className="flex items-center gap-10">
            {/* Left Side - GITAM Logo */}
            <div className="flex-shrink-0 w-80 h-40 flex items-center justify-center">
              <img
                src={gitamLogo}
                alt="GITAM Deemed to be University Logo"
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 max-w-lg">
              <div className="mb-6">
                <h2 className="mb-2 text-2xl font-semibold" style={{ color: '#006D66' }}>Department Login</h2>
                <p className="text-gray-600 text-base">Annual Report System</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                {/* Username Field */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-700 text-sm font-medium">Department ID</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    className="w-full bg-gray-50 border-gray-200 h-11 text-base"
                    style={{ 
                      borderRadius: '8px',
                      '--tw-ring-color': '#006D66'
                    }}
                    onFocus={handleInputFocus}
                    placeholder="Department ID"
                    maxLength={10}
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 text-sm font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border-gray-200 h-11 text-base"
                    style={{ 
                      borderRadius: '8px',
                      '--tw-ring-color': '#006D66'
                    }}
                    onFocus={handleInputFocus}
                    placeholder="Enter your password"
                    minLength={4}
                    required
                  />
                </div>

                {/* CAPTCHA */}
                <div className="space-y-2">
                  <Label className="text-gray-700 text-sm font-medium">Security Verification</Label>
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-gray-100 to-gray-50 border-2 border-gray-300 px-4 py-3 rounded-lg font-mono text-xl tracking-widest text-gray-800 select-none flex items-center gap-3 shadow-sm">
                      <span className="font-semibold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
                        {captchaText}
                      </span>
                      <button
                        type="button"
                        onClick={generateCaptcha}
                        style={{ color: '#006D66' }}
                        className="hover:opacity-80 transition-colors p-1"
                        title="Generate new CAPTCHA"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                    <Input
                      type="text"
                      value={captcha}
                      onChange={(e) => setCaptcha(e.target.value.replace(/\s/g, ''))} // Remove spaces
                      className="flex-1 bg-gray-50 border-gray-200 h-11 text-base"
                      style={{ 
                        borderRadius: '8px',
                        '--tw-ring-color': '#006D66'
                      }}
                      onFocus={handleInputFocus}
                      placeholder="Enter code above"
                      maxLength={5}
                      required
                    />
                  </div>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full text-white py-3 mt-6 transition-colors disabled:opacity-70 disabled:cursor-not-allowed h-12 text-base font-medium"
                  style={{ 
                    backgroundColor: isLoading ? '#C69214' : '#006D66',
                    borderRadius: '8px'
                  }}
                  onMouseEnter={handleLoginButtonMouseEnter}
                  onMouseLeave={handleLoginButtonMouseLeave}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Authenticating...
                    </div>
                  ) : (
                    'LOGIN'
                  )}
                </Button>
              </form>

              {/* Footer Links */}
              <div className="flex justify-between mt-6">
                <button 
                  onClick={handleForgotPassword}
                  style={{ color: '#006D66' }} 
                  className="hover:opacity-80 transition-colors flex items-center gap-2 text-sm font-medium"
                  type="button"
                >
                  <Shield className="w-4 h-4" />
                  Forgot password
                </button>
                <button 
                  onClick={handleContactSupport}
                  style={{ color: '#006D66' }} 
                  className="hover:opacity-80 transition-colors flex items-center gap-2 text-sm font-medium"
                  type="button"
                >
                  <HelpCircle className="w-4 h-4" />
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer - Fixed at bottom with proper spacing */}
      <div className="w-full text-center py-4 text-teal-100 relative z-10">
        <p className="text-sm">Need help? Contact IT Support • Email: support@gitam.edu</p>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Shield className="w-5 h-5" style={{ color: '#006D66' }} />
              Reset Password
            </DialogTitle>
            <DialogDescription>
              Enter your registered email address to receive password reset instructions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordReset} className="space-y-4 p-4">
            <div>
              <Label htmlFor="resetEmail">Email Address</Label>
              <Input
                id="resetEmail"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Enter your registered email"
                className="mt-2"
                required
              />
            </div>
            <div className="text-sm text-gray-600">
              <p>Enter your registered email address and we'll send you instructions to reset your password.</p>
            </div>
            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowForgotPassword(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 text-white"
                style={{ backgroundColor: '#006D66' }}
              >
                Send Reset Link
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Contact Support Dialog */}
      <Dialog open={showContactSupport} onOpenChange={setShowContactSupport}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5" style={{ color: '#006D66' }} />
              Contact Support
            </DialogTitle>
            <DialogDescription>
              Get help with your GITAM Annual Report Portal account and technical issues.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5" style={{ color: '#006D66' }} />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-gray-600">support@gitam.edu</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5" style={{ color: '#006D66' }} />
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-sm text-gray-600">+91-891-287-4999</p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Office Hours:</strong> Monday to Friday, 9:00 AM - 6:00 PM IST
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => window.open('mailto:support@gitam.edu')}
                className="flex-1"
                type="button"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
              <Button 
                onClick={() => setShowContactSupport(false)}
                className="flex-1 text-white"
                style={{ backgroundColor: '#006D66' }}
                type="button"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}