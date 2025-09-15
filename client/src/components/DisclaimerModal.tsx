import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Eye, Users, DollarSign, FileText, UserCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

interface DisclaimerModalProps {
  open: boolean;
  onAccept: () => void;
}

export default function DisclaimerModal({ open, onAccept }: DisclaimerModalProps) {
  const [isAgreed, setIsAgreed] = useState(false);

  return (
    <Dialog open={open} onOpenChange={() => {}} modal>
      <DialogContent 
        className="max-w-md max-h-[80vh] bg-gray-950 border-2 border-[#f7931a] [&>button]:hidden overflow-hidden" 
        data-testid="modal-disclaimer"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="pb-3">
          <DialogTitle className="text-xl text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-white" />
            Important Disclaimer & Privacy Notice
          </DialogTitle>
          <DialogDescription className="text-white text-sm">
            Please read and agree to the terms below to continue
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea 
          className="max-h-[50vh] pr-2" 
          data-testid="disclaimer-content"
        >
          <div className="space-y-3 text-xs">
            {/* Critical Warning */}
            <Alert className="border-2 border-red-500 bg-red-900/30 p-2">
              <AlertTriangle className="h-3 w-3 text-red-400" />
              <AlertDescription className="text-red-300 text-xs">
                <strong>⚠️ HIGH RISK WARNING:</strong> Bitcoin mining involves substantial risk of loss. Mining profitability fluctuates dramatically based on Bitcoin price, network difficulty, energy costs, and equipment performance. You may lose your entire investment. Only invest what you can afford to lose.
              </AlertDescription>
            </Alert>

            {/* Project Identity */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3 text-white" />
                <h3 className="text-sm font-bold text-white">Project Identity & Team</h3>
              </div>
              <div className="text-white text-xs pl-5 space-y-1">
                <p><strong>GBTC Mining Platform</strong> is an experimental cryptocurrency simulation project developed by an anonymous team of cryptocurrency developers and contributors worldwide. <strong>NOT affiliated, endorsed, or connected to:</strong></p>
                <ul className="ml-3 list-disc space-y-0.5 text-gray-300">
                  <li>Bitcoin Foundation or Bitcoin official entities</li>
                  <li>Grayscale Investments LLC or Grayscale Bitcoin Trust (GBTC)</li>
                  <li>Any securities entities, financial institutions, or regulatory bodies</li>
                  <li>Government agencies or official cryptocurrency organizations</li>
                </ul>
                <p className="mt-1"><strong>Platform Purpose:</strong> Educational simulation for understanding Bitcoin mining economics. Results are theoretical and do not guarantee real-world mining profitability.</p>
              </div>
            </div>

            <Separator className="bg-gray-800" />

            {/* KYC & Privacy */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="w-3 h-3 text-white" />
                <h3 className="text-sm font-bold text-white">Identity Verification (KYC) & Privacy Policy</h3>
              </div>
              <div className="text-white text-xs pl-5 space-y-1">
                <p><strong>Privacy-First KYC System:</strong> Our identity verification complies with international KYC/AML regulations while protecting your privacy.</p>
                <p><strong>What we do:</strong> Live facial verification, device fingerprinting, IP geolocation, regulatory compliance screening, multi-account prevention.</p>
                <p><strong>What we DON'T store:</strong> No photos, videos, or biometric data. Only hashed device fingerprints and verification tokens are transmitted via encrypted TLS connection.</p>
                <p><strong>Data Protection:</strong> GDPR/CCPA compliant. Data processed under legal basis of contractual necessity. 30-day deletion policy for unused verification data. No sharing with third parties except regulatory requirements.</p>
                <p><strong>Compliance:</strong> Platform implements Bank Secrecy Act (BSA), Anti-Money Laundering (AML), and Counter-Terrorism Financing (CTF) measures where applicable.</p>
              </div>
            </div>

            <Separator className="bg-gray-800" />

            {/* Investment & Financial Risk */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-3 h-3 text-white" />
                <h3 className="text-sm font-bold text-white">Investment Risk & Financial Disclosure</h3>
              </div>
              <div className="text-white text-xs pl-5 space-y-1">
                <Alert className="border border-red-400 bg-red-900/20 p-2 my-2">
                  <AlertDescription className="text-red-300 text-xs">
                    <strong>NOT INVESTMENT ADVICE:</strong> Information provided does not constitute investment, financial, or trading advice. Consult qualified professionals before making financial decisions.
                  </AlertDescription>
                </Alert>
                <p><strong>Critical Financial Risks:</strong></p>
                <ul className="ml-3 list-disc space-y-0.5 text-gray-300">
                  <li><strong>Total Loss Risk:</strong> You may lose all deposited funds</li>
                  <li><strong>Market Volatility:</strong> Cryptocurrency values fluctuate unpredictably</li>
                  <li><strong>Mining Difficulty:</strong> Bitcoin network difficulty adjusts, affecting profitability</li>
                  <li><strong>Energy Costs:</strong> Electricity prices directly impact mining returns</li>
                  <li><strong>Equipment Depreciation:</strong> Mining hardware loses value rapidly</li>
                  <li><strong>Regulatory Risk:</strong> Government regulations may change mining legality</li>
                  <li><strong>No FDIC Insurance:</strong> Funds not protected by government insurance</li>
                  <li><strong>Liquidity Risk:</strong> Inability to exit positions during market stress</li>
                </ul>
                <p><strong>Tax Obligations:</strong> Mining rewards may be taxable income. Users responsible for tax compliance in their jurisdiction.</p>
              </div>
            </div>

            <Separator className="bg-gray-800" />

            {/* Regulatory Compliance */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-3 h-3 text-white" />
                <h3 className="text-sm font-bold text-white">Regulatory Compliance & Legal Framework</h3>
              </div>
              <div className="text-white text-xs pl-5 space-y-1">
                <p><strong>Jurisdictional Compliance:</strong> Platform operates under evolving cryptocurrency regulations. User access may be restricted based on local laws.</p>
                <p><strong>Prohibited Jurisdictions:</strong> Service unavailable in countries where cryptocurrency mining is banned or restricted. Users must verify local compliance.</p>
                <p><strong>US Regulations:</strong> Platform complies with FinCEN MSB requirements, BSA reporting, and state money transmission laws where applicable.</p>
                <p><strong>International Framework:</strong> EU MiCA regulations, UK FCA guidelines, and other international frameworks may apply based on user location.</p>
                <p><strong>Environmental Disclosure:</strong> Mining operations consume significant energy. Platform encourages renewable energy use but cannot guarantee environmental impact.</p>
                <p><strong>Force Majeure:</strong> Platform not liable for disruptions due to regulatory changes, network issues, power outages, or acts of God.</p>
              </div>
            </div>

            <Separator className="bg-gray-800" />

            {/* Legal Terms & Liability */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-3 h-3 text-white" />
                <h3 className="text-sm font-bold text-white">Legal Terms, Liability & User Obligations</h3>
              </div>
              <div className="text-white text-xs pl-5 space-y-1">
                <p><strong>By using this platform, you agree that:</strong></p>
                <ul className="ml-3 list-disc space-y-0.5 text-gray-300">
                  <li>You are 18+ years old and legally competent to enter contracts</li>
                  <li>You understand this is experimental with substantial financial risks</li>
                  <li>You will not hold the development team liable for any losses or damages</li>
                  <li>You comply with all applicable laws in your jurisdiction</li>
                  <li>You understand cryptocurrency activities may be restricted in your area</li>
                  <li>You have conducted your own research and due diligence</li>
                  <li>You will not use the platform for money laundering or illegal activities</li>
                  <li>You accept full responsibility for tax reporting and compliance</li>
                </ul>
                <p><strong>Liability Limitation:</strong> To the fullest extent permitted by law, platform operators disclaim all liability for direct, indirect, incidental, special, consequential, or punitive damages.</p>
                <p><strong>Indemnification:</strong> You agree to indemnify and hold harmless the platform, its affiliates, and contributors from any claims arising from your use of the service.</p>
                <p><strong>Dispute Resolution:</strong> Any disputes subject to binding arbitration under applicable jurisdiction laws. Class action lawsuits waived where permitted.</p>
                <Alert className="border border-amber-500 bg-amber-900/20 p-2 my-2">
                  <AlertDescription className="text-amber-300 text-xs">
                    <strong>Final Acknowledgment:</strong> By proceeding, you confirm you have read, understood, and agree to all terms, risks, and disclaimers. You acknowledge participating entirely at your own risk with full understanding of potential total loss.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="pt-3 border-t border-gray-800">
          <div className="flex items-center space-x-2 mb-3">
            <Checkbox
              id="agree-checkbox"
              checked={isAgreed}
              onCheckedChange={(checked) => setIsAgreed(checked === true)}
              className="border-white data-[state=checked]:bg-[#f7931a] data-[state=checked]:border-[#f7931a] h-4 w-4"
              data-testid="checkbox-agree-disclaimer"
            />
            <label htmlFor="agree-checkbox" className="text-white text-xs flex items-center gap-1 cursor-pointer">
              <UserCheck className="w-3 h-3 text-white" />
              I agree to all terms and conditions above
            </label>
          </div>
          
          <div className="flex justify-center">
            <Button
              onClick={onAccept}
              disabled={!isAgreed}
              className={`px-8 transition-all duration-200 text-xs h-8 font-bold ${
                isAgreed 
                  ? "bg-[#f7931a] hover:bg-[#ff9416] text-black shadow-lg" 
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
              data-testid="button-accept-disclaimer"
            >
              NEXT
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}