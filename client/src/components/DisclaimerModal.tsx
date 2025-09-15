import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Shield, Eye, Users, DollarSign, FileText, ArrowRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

interface DisclaimerModalProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function DisclaimerModal({ open, onAccept, onDecline }: DisclaimerModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
    if (isAtBottom) {
      setHasScrolledToBottom(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}} modal>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] bg-gray-950 border-2 border-[#f7931a] [&>button]:hidden overflow-hidden" 
        data-testid="modal-disclaimer"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl text-[#f7931a] flex items-center gap-3">
            <AlertTriangle className="w-8 h-8" />
            Important Disclaimer & Privacy Notice
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea 
          className="max-h-[60vh] pr-4" 
          onScrollCapture={handleScroll}
          data-testid="disclaimer-content"
        >
          <div className="space-y-6">
            {/* Critical Warning */}
            <Alert className="border-2 border-red-500 bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <AlertDescription className="text-red-400 font-semibold">
                <strong>CRITICAL NOTICE:</strong> Please read this entire disclaimer carefully before proceeding. 
                By creating an account, you acknowledge and agree to all terms outlined below.
              </AlertDescription>
            </Alert>

            {/* Project Identity */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-[#f7931a]">
                <Users className="w-5 h-5" />
                <h3 className="text-lg font-bold">Project Identity & Team</h3>
              </div>
              <div className="pl-8 space-y-3 text-gray-300 text-sm leading-relaxed">
                <p>
                  <strong className="text-white">GBTC Mining Platform</strong> is an <strong className="text-[#f7931a]">experimental cryptocurrency simulation project</strong> developed by an anonymous team of cryptocurrency developers and contributors.
                </p>
                <p>
                  <strong className="text-red-400">IMPORTANT:</strong> This platform is <strong className="underline">NOT affiliated with, endorsed by, or connected to</strong>:
                </p>
                <ul className="ml-4 space-y-1 list-disc text-gray-400">
                  <li>Bitcoin Foundation or any Bitcoin official entities</li>
                  <li>Grayscale Investments LLC or Grayscale Bitcoin Trust (GBTC)</li>
                  <li>Any securities entities, financial institutions, or regulatory bodies</li>
                  <li>Any government agencies or official cryptocurrency organizations</li>
                </ul>
                <p>
                  The team behind this project operates <strong className="text-[#f7931a]">completely anonymously</strong> with no single owner. This is a collaborative effort by multiple cryptocurrency developers and contributors worldwide.
                </p>
              </div>
            </div>

            <Separator className="bg-gray-800" />

            {/* KYC & Privacy */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-[#f7931a]">
                <Eye className="w-5 h-5" />
                <h3 className="text-lg font-bold">Identity Verification (KYC) & Privacy</h3>
              </div>
              <div className="pl-8 space-y-3 text-gray-300 text-sm leading-relaxed">
                <Alert className="border-[#f7931a]/40 bg-[#f7931a]/5">
                  <Shield className="h-4 w-4 text-[#f7931a]" />
                  <AlertDescription className="text-[#f7931a]/90">
                    <strong>Privacy-First KYC:</strong> Our identity verification system is designed with your privacy as the top priority.
                  </AlertDescription>
                </Alert>
                <p>
                  <strong className="text-white">What our KYC system does:</strong>
                </p>
                <ul className="ml-4 space-y-1 list-disc text-green-400">
                  <li><strong>Live detection only</strong> - Real-time facial movement verification</li>
                  <li><strong>Embedded data processing</strong> - Creates unique device fingerprints</li>
                  <li><strong>Prevents multiple accounts</strong> - Helps limit multiple accounts per device</li>
                  <li><strong>Minimal data transmission</strong> - Only hashed device fingerprint details and verification hash are sent over secure connection</li>
                </ul>
                <p>
                  <strong className="text-white">What we DO NOT do:</strong>
                </p>
                <ul className="ml-4 space-y-1 list-disc text-red-400">
                  <li><strong>NO photo storage</strong> - We never save, store, or keep any photos</li>
                  <li><strong>NO video recording</strong> - We never record or save any video content</li>
                  <li><strong>NO biometric data storage</strong> - We do not store any biometric information</li>
                  <li><strong>NO data sharing</strong> - We never share your data with third parties</li>
                  <li><strong>NO government reporting</strong> - We do not report to any authorities</li>
                </ul>
                <p className="text-[#f7931a]">
                  The KYC process generates only hashed device fingerprint data and verification hash that cannot be reverse-engineered to identify you personally. These hashed values, along with your IP address and basic device information, are transmitted securely over TLS to our servers solely to prevent the creation of multiple accounts from the same device. No biometric data, photos, or videos are ever stored.
                </p>
              </div>
            </div>

            <Separator className="bg-gray-800" />

            {/* Financial Disclaimer */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-[#f7931a]">
                <DollarSign className="w-5 h-5" />
                <h3 className="text-lg font-bold">Financial Risk Disclosure</h3>
              </div>
              <div className="pl-8 space-y-3 text-gray-300 text-sm leading-relaxed">
                <Alert className="border-2 border-red-500 bg-red-500/10">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <AlertDescription className="text-red-400">
                    <strong>HIGH RISK ACTIVITY:</strong> Cryptocurrency activities involve substantial risk of loss.
                  </AlertDescription>
                </Alert>
                <p>
                  <strong className="text-red-400">CRITICAL FINANCIAL WARNINGS:</strong>
                </p>
                <ul className="ml-4 space-y-2 list-disc text-gray-300">
                  <li><strong className="text-red-400">NO GUARANTEED RETURNS:</strong> We do not promise, guarantee, or offer any financial returns, profits, or monetary gains of any kind.</li>
                  <li><strong className="text-red-400">EXPERIMENTAL NATURE:</strong> This is an experimental platform with no proven track record or guaranteed functionality.</li>
                  <li><strong className="text-red-400">TOTAL LOSS RISK:</strong> You may lose all funds deposited or invested in this platform.</li>
                  <li><strong className="text-red-400">NO FDIC INSURANCE:</strong> Funds are not insured by any government agency or insurance program.</li>
                  <li><strong className="text-red-400">REGULATORY UNCERTAINTY:</strong> Cryptocurrency activities exist in an evolving regulatory environment.</li>
                </ul>
                <div className="bg-red-950/50 border border-red-500 rounded p-3 mt-3">
                  <p className="text-red-300 font-semibold">
                    <strong>YOU PARTICIPATE AT YOUR OWN RISK:</strong> By using this platform, you acknowledge that any funds you deposit, invest, or use are done entirely at your own risk. You accept full responsibility for any losses that may occur.
                  </p>
                </div>
              </div>
            </div>

            <Separator className="bg-gray-800" />

            {/* Legal & Terms */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-[#f7931a]">
                <FileText className="w-5 h-5" />
                <h3 className="text-lg font-bold">Legal Terms & Conditions</h3>
              </div>
              <div className="pl-8 space-y-3 text-gray-300 text-sm leading-relaxed">
                <p>
                  <strong className="text-white">By proceeding, you agree that:</strong>
                </p>
                <ul className="ml-4 space-y-1 list-disc text-gray-300">
                  <li>You are at least 18 years of age and legally capable of entering into agreements</li>
                  <li>You understand this is an experimental platform with inherent risks</li>
                  <li>You will not hold the development team liable for any losses or damages</li>
                  <li>You comply with all applicable laws in your jurisdiction</li>
                  <li>You understand that cryptocurrency activities may be restricted in your area</li>
                  <li>You have read and understood all warnings and disclaimers above</li>
                </ul>
                <div className="bg-gray-900 border border-gray-700 rounded p-3 mt-3">
                  <p className="text-gray-300 text-xs">
                    <strong>Jurisdiction:</strong> This platform operates in a decentralized manner. Users are responsible for ensuring compliance with their local laws and regulations. The anonymous development team cannot provide legal advice or guarantee compliance with any specific jurisdiction's requirements.
                  </p>
                </div>
              </div>
            </div>

            <Separator className="bg-gray-800" />

            {/* Final Acknowledgment */}
            <div className="space-y-4">
              <Alert className="border-[#f7931a]/40 bg-[#f7931a]/5">
                <Shield className="h-4 w-4 text-[#f7931a]" />
                <AlertDescription className="text-[#f7931a]/90 text-sm">
                  <strong>Final Confirmation:</strong> By clicking "I Agree & Continue" below, you confirm that you have read, understood, and agree to all terms, conditions, warnings, and disclaimers outlined in this notice. You acknowledge that you are participating in this experimental platform entirely at your own risk.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </ScrollArea>

        <div className="flex gap-3 pt-4 border-t border-gray-800">
          <Button
            onClick={onDecline}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold"
            data-testid="button-decline-disclaimer"
          >
            I Do Not Agree
          </Button>
          <Button
            onClick={onAccept}
            disabled={!hasScrolledToBottom}
            className={`flex-1 font-bold ${
              hasScrolledToBottom 
                ? "bg-[#f7931a] hover:bg-[#ff9416] text-black" 
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
            data-testid="button-accept-disclaimer"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            {hasScrolledToBottom ? "I Agree & Continue" : "Scroll to Bottom First"}
          </Button>
        </div>

        {!hasScrolledToBottom && (
          <p className="text-xs text-center text-gray-500 mt-2">
            Please scroll through the entire disclaimer to continue
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}