import { useState, useEffect } from "react";
import { useAuth, isValidAccessKey, formatAccessKey } from "@/hooks/use-auth";
import { Redirect, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Copy, Download, Eye, EyeOff, Shield, AlertTriangle, Key, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getDeviceFingerprint } from "@/lib/fingerprint";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showRegister, setShowRegister] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", accessKey: "" });
  const [registerForm, setRegisterForm] = useState({ username: "", referredBy: "" });
  const [showLoginAccessKey, setShowLoginAccessKey] = useState(false);
  
  // Access key state
  const [generatedAccessKey, setGeneratedAccessKey] = useState<string | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyConfirmation, setKeyConfirmation] = useState({
    saved: false,
    lastSixChars: ""
  });
  const [hasIpRegistered, setHasIpRegistered] = useState<boolean | null>(null);

  // Check if this IP has already registered an account
  useEffect(() => {
    const checkIpRegistration = async () => {
      try {
        const response = await fetch('/api/check-ip-registration');
        if (response.ok) {
          const data = await response.json();
          setHasIpRegistered(data.hasRegistered);
        }
      } catch (error) {
        console.error('Error checking IP registration status:', error);
        // If error, allow registration to be safe
        setHasIpRegistered(false);
      }
    };

    checkIpRegistration();
  }, []);

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerForm.username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a username",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Collect device fingerprint data
      toast({
        title: "Verifying device...",
        description: "Collecting device information for security",
      });
      
      const deviceData = await getDeviceFingerprint();
      
      const result = await registerMutation.mutateAsync({
        username: registerForm.username.trim(),
        referredBy: registerForm.referredBy.trim() || undefined,
        deviceData,
      });
      
      // Registration successful - show the access key
      setGeneratedAccessKey(result.accessKey);
      setShowKeyModal(true);
      setKeyConfirmation({ saved: false, lastSixChars: "" });
    } catch (error: any) {
      // Error handling is done by the mutation's onError handler in use-auth.tsx
      // This provides professional, consistent error messaging
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: `${label} copied to clipboard`,
      });
    });
  };

  const downloadAccessKey = () => {
    if (!generatedAccessKey) return;
    
    const content = `=======================================
           GBTC ACCESS CREDENTIALS
=======================================

Username: ${registerForm.username}
Access Key: ${generatedAccessKey}

=======================================
         IMPORTANT INSTRUCTIONS
=======================================

- Without your correct USERNAME and ACCESS KEY, you cannot access your account
- Both are unique and required for login  
- Store both safely - we cannot recover them if lost
- Keep this file secure and do not share with anyone

=======================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gbtc-access-key-${registerForm.username}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Access key downloaded",
      description: "Your access key has been saved to a text file. Store it securely!",
    });
  };

  const handleCompleteRegistration = () => {
    // Close modal and switch to login form - user must login manually
    setShowKeyModal(false);
    setShowRegister(false);
    
    // Pre-fill username in login form
    setLoginForm(prev => ({ ...prev, username: registerForm.username }));
    
    toast({
      title: "Account Created Successfully!",
      description: "Now please login with your username and access key to start mining.",
      className: "border-[#f7931a] bg-gray-900 text-white",
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username && loginForm.accessKey && isValidAccessKey(loginForm.accessKey)) {
      loginMutation.mutate({
        username: loginForm.username,
        accessKey: loginForm.accessKey
      });
    }
  };

  return (
    <div className="min-h-screen bg-black overflow-y-auto flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          {/* Logo Section */}
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-[#f7931a]/20 rounded-full animate-pulse"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-[#f7931a] to-[#ff9416] rounded-full flex items-center justify-center shadow-2xl shadow-[#f7931a]/40">
                <span className="text-4xl font-bold text-black">₿</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">GBTC Mining Platform</h1>
            <p className="text-gray-400 text-sm">Secure Access Key Authentication</p>
          </div>

          {/* Single Auth Form */}
          {!showRegister ? (
            /* Login Form */
            <Card className="border-[#f7931a]/20 bg-gray-950">
              <CardHeader>
                <CardTitle className="text-center text-white flex items-center justify-center gap-2">
                  <Key className="w-5 h-5" />
                  Sign In with Access Key
                </CardTitle>
                <p className="text-xs text-center text-gray-400">
                  Enter your username and access key to access your account
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-username">Username</Label>
                    <Input
                      id="login-username"
                      type="text"
                      placeholder="Enter your username"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                      required
                      autoComplete="username"
                      className="bg-black border-gray-800"
                      data-testid="input-login-username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-access-key" className="flex items-center gap-2 mb-3">
                      Access Key
                      <span className="text-[#f7931a] text-xs">(GBTC-XXXXX-XXXXX-XXXXX-XXXXX)</span>
                    </Label>
                    <div className="relative">
                      <Textarea
                        id="login-access-key"
                        placeholder="Enter your GBTC access key"
                        value={loginForm.accessKey}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
                          setLoginForm(prev => ({ ...prev, accessKey: value }));
                        }}
                        className={`bg-black border-gray-800 font-mono text-sm resize-none ${
                          showLoginAccessKey ? '' : 'text-security-disc'
                        }`}
                        style={showLoginAccessKey ? {} : { WebkitTextSecurity: 'disc', textSecurity: 'disc' } as any}
                        rows={2}
                        required
                        data-testid="input-login-access-key"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0 text-gray-400 hover:text-white"
                        onClick={() => setShowLoginAccessKey(!showLoginAccessKey)}
                        data-testid="button-toggle-login-key-visibility"
                      >
                        {showLoginAccessKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    {loginForm.accessKey && !isValidAccessKey(loginForm.accessKey) && (
                      <p className="text-red-400 text-xs mt-1">
                        Access key must be in format: GBTC-XXXXX-XXXXX-XXXXX-XXXXX
                      </p>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-[#f7931a] hover:bg-[#ff9416] text-black font-bold"
                    disabled={loginMutation.isPending || !isValidAccessKey(loginForm.accessKey)}
                    data-testid="button-login"
                  >
                    {loginMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Key className="w-4 h-4 mr-2" />
                    )}
                    Sign In Securely
                  </Button>
                </form>
                
                {/* Create Account Button - Only show if IP hasn't registered before */}
                {hasIpRegistered === false && (
                  <div className="mt-6 pt-4 border-t border-gray-800">
                    <p className="text-center text-gray-400 text-sm mb-3">Don't have an account?</p>
                    <Button
                      type="button"
                      onClick={() => setShowRegister(true)}
                      className="w-full bg-transparent border-2 border-[#f7931a] text-[#f7931a] hover:bg-[#f7931a] hover:text-black font-bold"
                      data-testid="button-show-register"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Create New Account
                    </Button>
                  </div>
                )}
                
                {/* Message for IPs that have already registered */}
                {hasIpRegistered === true && (
                  <div className="mt-6 pt-4 border-t border-gray-800">
                    <Alert className="border-[#f7931a]/40 bg-[#f7931a]/10">
                      <AlertTriangle className="h-4 w-4 text-[#f7931a]" />
                      <AlertDescription className="text-sm text-[#f7931a]/90">
                        An account has already been created from this device. Please use your existing credentials to login.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            /* Register Form */
              <Card className="border-[#f7931a]/20 bg-gray-950">
                <CardHeader>
                  <CardTitle className="text-center text-white flex items-center justify-center gap-2">
                    <Shield className="w-5 h-5" />
                    Create Secure Account
                  </CardTitle>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Generate unique access key for maximum security
                  </p>
                </CardHeader>
                <CardContent>
                  {/* Enhanced Security Warning */}
                  <Alert className="mb-4 border-2 border-[#f7931a] bg-[#f7931a]/10">
                    <AlertTriangle className="h-4 w-4 text-[#f7931a]" />
                    <AlertDescription className="text-sm">
                      <strong className="text-[#f7931a]">CRITICAL SECURITY WARNING</strong>
                      <div className="mt-2 space-y-1 text-[#f7931a]/80">
                        <p>• Your access key is your ONLY way to access your account</p>
                        <p>• There is NO password recovery or account reset option</p>
                        <p>• If you lose your access key, you lose your account forever</p>
                        <p>• NEVER share your access key with anyone</p>
                        <p>• Store it in multiple secure locations</p>
                      </div>
                    </AlertDescription>
                  </Alert>

                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label htmlFor="register-username">Username</Label>
                      <Input
                        id="register-username"
                        type="text"
                        placeholder="Choose a unique username"
                        value={registerForm.username}
                        onChange={(e) => {
                          const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20);
                          setRegisterForm(prev => ({ ...prev, username: value }));
                        }}
                        required
                        autoComplete="off"
                        className="bg-black border-gray-800"
                        data-testid="input-register-username"
                      />
                      <p className="text-xs text-gray-500 mt-1">Only letters, numbers, and underscores allowed</p>
                    </div>
                    
                    <div>
                      <Label htmlFor="register-referrer">Referral Code (Optional)</Label>
                      <Input
                        id="register-referrer"
                        type="text"
                        placeholder="Enter 8-character referral code"
                        value={registerForm.referredBy}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
                          setRegisterForm(prev => ({ ...prev, referredBy: value }));
                        }}
                        className="bg-black border-gray-800 font-mono"
                        data-testid="input-register-referrer"
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter the referral code from who invited you</p>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#f7931a] hover:bg-[#ff9416] text-black font-bold"
                      disabled={registerMutation.isPending || !registerForm.username}
                      data-testid="button-register"
                    >
                      {registerMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Shield className="w-4 h-4 mr-2" />
                      )}
                      Generate Secure Access Key
                    </Button>
                  </form>
                  
                  {/* Back to Login Button */}
                  <div className="mt-6 pt-4 border-t border-gray-800">
                    <p className="text-center text-gray-400 text-sm mb-3">Already have an account?</p>
                    <Button
                      type="button"
                      onClick={() => setShowRegister(false)}
                      className="w-full bg-transparent border-2 border-[#f7931a] text-[#f7931a] hover:bg-[#f7931a] hover:text-black font-bold"
                      data-testid="button-show-login"
                    >
                      <Key className="w-4 h-4 mr-2" />
                      Back to Login
                    </Button>
                  </div>
                </CardContent>
              </Card>
          )}
        </div>
      </div>

      {/* Access Key Display Modal */}
      <Dialog open={showKeyModal} onOpenChange={() => {}} modal>
        <DialogContent 
          className="max-w-md bg-gray-950 border-2 border-[#f7931a] [&>button]:hidden" 
          data-testid="modal-access-key"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="pb-3">
            <DialogTitle className="text-lg text-[#f7931a] flex items-center gap-2">
              <Key className="w-5 h-5" />
              Your Access Key
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Access Key Display */}
            <div className="bg-black border-2 border-[#f7931a] rounded-lg p-3">
              <div className="font-mono text-[#f7931a] text-sm font-bold text-center break-all">
                {formatAccessKey(generatedAccessKey || "")}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={() => copyToClipboard(generatedAccessKey || "", "Access key copied!")}
                className="w-full bg-[#f7931a]/20 hover:bg-[#f7931a]/30 border border-[#f7931a] text-[#f7931a] font-bold"
                data-testid="button-copy-key"
              >
                <Copy className="w-4 h-4 mr-2" />
                COPY ACCESS KEY
              </Button>

              <Button
                onClick={downloadAccessKey}
                className="w-full bg-[#f7931a]/20 hover:bg-[#f7931a]/30 border border-[#f7931a] text-[#f7931a]"
                data-testid="button-download-key"
              >
                <Download className="w-4 h-4 mr-2" />
                Download as Text File
              </Button>
              
              <Button
                onClick={handleCompleteRegistration}
                className="w-full bg-[#f7931a] hover:bg-[#e5851a] text-black font-bold"
                data-testid="button-complete-registration"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                I'VE SAVED IT - CONTINUE
              </Button>
            </div>

            {/* Warning */}
            <div className="text-center">
              <p className="text-[#f7931a] text-xs">
                ⚠️ Save this now - we cannot recover it later!
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}