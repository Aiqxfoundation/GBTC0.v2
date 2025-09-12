import { useState } from "react";
import { useAuth, generateKeypair, isValidPrivateKey } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Copy, Download, Eye, EyeOff, Shield, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const { user, challengeLoginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [loginForm, setLoginForm] = useState({ username: "", privateKey: "" });
  const [registerForm, setRegisterForm] = useState({ username: "", referredBy: "" });
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showLoginPrivateKey, setShowLoginPrivateKey] = useState(false);
  
  // Key generation state
  const [generatedKeys, setGeneratedKeys] = useState<{ publicKey: string; privateKey: string } | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyConfirmation, setKeyConfirmation] = useState({
    saved: false,
    lastSixChars: ""
  });

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const handleGenerateKeys = async () => {
    try {
      console.log("Starting key generation...");
      const keys = await generateKeypair();
      console.log("Keys generated successfully:", keys);
      setGeneratedKeys(keys);
      setShowKeyModal(true);
      setKeyConfirmation({ saved: false, lastSixChars: "" });
    } catch (error) {
      console.error("Key generation error:", error);
      toast({
        title: "Key generation failed",
        description: `Error: ${(error as Error).message}`,
        variant: "destructive",
      });
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

  const downloadPrivateKey = () => {
    if (!generatedKeys) return;
    
    const content = `GBTC Mining Platform - Private Key
⚠️  CRITICAL SECURITY WARNING ⚠️

This is your PRIVATE KEY for GBTC Mining Platform account: ${registerForm.username}

Private Key: ${generatedKeys.privateKey}

🔒 SECURITY INSTRUCTIONS:
• Keep this key absolutely secret - NEVER share it with anyone
• Store it in a secure location (password manager, encrypted file, or offline)
• This key is your ONLY way to access your account
• There is NO password recovery option
• If you lose this key, you will permanently lose access to your account and funds

Account Details:
• Username: ${registerForm.username}
• Public Key: ${generatedKeys.publicKey}
• Generated: ${new Date().toISOString()}

⚠️  If you suspect this key has been compromised, contact support immediately.
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gbtc-private-key-${registerForm.username}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Private key downloaded",
      description: "Your private key has been saved to a text file. Store it securely!",
    });
  };

  const handleCompleteRegistration = () => {
    if (!generatedKeys || !keyConfirmation.saved || keyConfirmation.lastSixChars !== generatedKeys.privateKey.slice(-6)) {
      return;
    }
    
    registerMutation.mutate({
      username: registerForm.username,
      publicKey: generatedKeys.publicKey,
      referredBy: registerForm.referredBy || undefined
    });
    
    setShowKeyModal(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username && loginForm.privateKey && isValidPrivateKey(loginForm.privateKey)) {
      challengeLoginMutation.mutate({
        username: loginForm.username,
        privateKey: loginForm.privateKey
      });
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerForm.username) {
      handleGenerateKeys();
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
            <p className="text-gray-400 text-sm">Secure Keypair Authentication</p>
          </div>

          {/* Auth Tabs */}
          <Tabs defaultValue="register" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-900">
              <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="border-[#f7931a]/20 bg-gray-950">
                <CardHeader>
                  <CardTitle className="text-center text-white flex items-center justify-center gap-2">
                    <Shield className="w-5 h-5" />
                    Sign In with Private Key
                  </CardTitle>
                  <p className="text-xs text-center text-gray-400">
                    Enter your username and private key to access your account
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
                      <Label htmlFor="login-private-key" className="flex items-center gap-2">
                        Private Key
                        <span className="text-red-400 text-xs">(64 hex characters)</span>
                      </Label>
                      <div className="relative">
                        <Textarea
                          id="login-private-key"
                          placeholder="Enter your 64-character private key"
                          value={loginForm.privateKey}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^a-fA-F0-9]/g, '').slice(0, 64);
                            setLoginForm(prev => ({ ...prev, privateKey: value }));
                          }}
                          className={`bg-black border-gray-800 font-mono text-sm resize-none ${
                            showLoginPrivateKey ? '' : 'text-security-disc'
                          }`}
                          style={showLoginPrivateKey ? {} : { WebkitTextSecurity: 'disc', textSecurity: 'disc' } as any}
                          rows={3}
                          required
                          data-testid="input-login-private-key"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0 text-gray-400 hover:text-white"
                          onClick={() => setShowLoginPrivateKey(!showLoginPrivateKey)}
                          data-testid="button-toggle-login-key-visibility"
                        >
                          {showLoginPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                      {loginForm.privateKey && !isValidPrivateKey(loginForm.privateKey) && (
                        <p className="text-red-400 text-xs mt-1">
                          Private key must be exactly 64 hexadecimal characters
                        </p>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-[#f7931a] hover:bg-[#ff9416] text-black font-bold"
                      disabled={challengeLoginMutation.isPending || !isValidPrivateKey(loginForm.privateKey)}
                      data-testid="button-login"
                    >
                      {challengeLoginMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Shield className="w-4 h-4 mr-2" />
                      )}
                      Sign In Securely
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="border-[#f7931a]/20 bg-gray-950">
                <CardHeader>
                  <CardTitle className="text-center text-white flex items-center justify-center gap-2">
                    <Shield className="w-5 h-5" />
                    Create Secure Account
                  </CardTitle>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Generate cryptographic keypair for maximum security
                  </p>
                </CardHeader>
                <CardContent>
                  {/* Enhanced Security Warning */}
                  <Alert className="mb-4 border-red-500/20 bg-red-950/30">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-sm">
                      <strong className="text-red-400">CRITICAL SECURITY WARNING</strong>
                      <div className="mt-2 space-y-1 text-gray-300">
                        <p>• Your private key is your ONLY way to access your account</p>
                        <p>• There is NO password recovery or account reset option</p>
                        <p>• If you lose your private key, you lose your account forever</p>
                        <p>• NEVER share your private key with anyone</p>
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
                      data-testid="button-generate-keys"
                    >
                      {registerMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Shield className="w-4 h-4 mr-2" />
                      )}
                      Generate Cryptographic Keys
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Private Key Display Modal */}
      <Dialog open={showKeyModal} onOpenChange={() => {}}>
        <DialogContent className="max-w-2xl bg-gray-950 border-red-500/20" data-testid="modal-private-key">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Your Private Key - SAVE THIS NOW!
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Critical Warning */}
            <Alert className="border-red-500 bg-red-950/50">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-200">
                <strong>THIS IS YOUR ONLY CHANCE TO SEE YOUR PRIVATE KEY!</strong>
                <br />
                Once you close this window, we cannot recover it for you.
              </AlertDescription>
            </Alert>

            {/* Private Key Display */}
            <div className="space-y-3">
              <Label className="text-red-400 font-semibold">🔐 Your Private Key:</Label>
              <div className="relative">
                <Textarea
                  value={generatedKeys?.privateKey || ""}
                  readOnly
                  className={`bg-black border-yellow-500 font-mono text-yellow-400 text-sm ${
                    showPrivateKey ? '' : 'text-security-disc'
                  }`}
                  style={showPrivateKey ? {} : { WebkitTextSecurity: 'disc', textSecurity: 'disc' } as any}
                  rows={3}
                  data-testid="textarea-private-key"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                    data-testid="button-toggle-key-visibility"
                  >
                    {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                    onClick={() => copyToClipboard(generatedKeys?.privateKey || "", "Private key")}
                    data-testid="button-copy-private-key"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Public Key Display */}
            <div className="space-y-3">
              <Label className="text-green-400 font-semibold">🔓 Your Public Key:</Label>
              <div className="relative">
                <Textarea
                  value={generatedKeys?.publicKey || ""}
                  readOnly
                  className="bg-black border-green-500 font-mono text-green-400 text-sm"
                  rows={2}
                  data-testid="textarea-public-key"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0 text-gray-400 hover:text-white"
                  onClick={() => copyToClipboard(generatedKeys?.publicKey || "", "Public key")}
                  data-testid="button-copy-public-key"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Download Option */}
            <Button
              onClick={downloadPrivateKey}
              className="w-full bg-blue-600 hover:bg-blue-700"
              data-testid="button-download-key"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Private Key as Text File
            </Button>

            {/* Confirmation Steps */}
            <div className="space-y-4 border-t border-gray-700 pt-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="key-saved"
                  checked={keyConfirmation.saved}
                  onCheckedChange={(checked) => 
                    setKeyConfirmation(prev => ({ ...prev, saved: checked as boolean }))
                  }
                  data-testid="checkbox-key-saved"
                />
                <Label htmlFor="key-saved" className="text-sm leading-relaxed">
                  I have safely stored my private key in multiple secure locations 
                  (password manager, encrypted file, and/or written down offline)
                </Label>
              </div>

              {keyConfirmation.saved && (
                <div className="space-y-2">
                  <Label htmlFor="confirm-key" className="text-sm text-yellow-400">
                    Type the last 6 characters of your private key to confirm:
                  </Label>
                  <Input
                    id="confirm-key"
                    type="text"
                    placeholder="Last 6 characters"
                    value={keyConfirmation.lastSixChars}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-fA-F0-9]/g, '').slice(0, 6);
                      setKeyConfirmation(prev => ({ ...prev, lastSixChars: value }));
                    }}
                    className="bg-black border-yellow-500 font-mono text-center"
                    maxLength={6}
                    data-testid="input-confirm-key"
                  />
                </div>
              )}
            </div>

            {/* Complete Registration */}
            <Button
              onClick={handleCompleteRegistration}
              disabled={
                !keyConfirmation.saved || 
                keyConfirmation.lastSixChars !== (generatedKeys?.privateKey.slice(-6) || "") ||
                registerMutation.isPending
              }
              className="w-full bg-[#f7931a] hover:bg-[#ff9416] text-black font-bold"
              data-testid="button-complete-registration"
            >
              {registerMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Complete Registration
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}