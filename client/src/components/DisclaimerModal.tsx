import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Shield, Eye, Users, DollarSign, FileText, UserCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

interface DisclaimerModalProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function DisclaimerModal({ open, onAccept, onDecline }: DisclaimerModalProps) {
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
            <Alert className="border border-gray-600 bg-gray-900/50 p-2">
              <AlertTriangle className="h-3 w-3 text-white" />
              <AlertDescription className="text-white text-xs">
                <strong>CRITICAL:</strong> Read carefully before proceeding. By creating account, you agree to all terms below.
              </AlertDescription>
            </Alert>

            {/* Project Identity */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3 text-white" />
                <h3 className="text-sm font-bold text-white">Project Identity</h3>
              </div>
              <div className="text-white text-xs pl-5 space-y-1">
                <p><strong>GBTC Mining Platform</strong> is experimental, developed by anonymous team. <strong>NOT affiliated with</strong> Bitcoin Foundation, Grayscale, or any official entities.</p>
              </div>
            </div>

            <Separator className="bg-gray-800" />

            {/* KYC & Privacy */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="w-3 h-3 text-white" />
                <h3 className="text-sm font-bold text-white">KYC & Privacy</h3>
              </div>
              <div className="text-white text-xs pl-5 space-y-1">
                <p><strong>Privacy-First:</strong> Live detection only, no photo/video storage, minimal hashed data transmission.</p>
              </div>
            </div>

            <Separator className="bg-gray-800" />

            {/* Financial Risk */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-3 h-3 text-white" />
                <h3 className="text-sm font-bold text-white">Financial Risk</h3>
              </div>
              <div className="text-white text-xs pl-5 space-y-1">
                <p><strong>HIGH RISK:</strong> No guaranteed returns, experimental platform, total loss possible, no insurance.</p>
              </div>
            </div>

            <Separator className="bg-gray-800" />

            {/* Legal Terms */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-3 h-3 text-white" />
                <h3 className="text-sm font-bold text-white">Legal Terms</h3>
              </div>
              <div className="text-white text-xs pl-5">
                <p className="mb-2">By proceeding, you agree:</p>
                <ul className="space-y-1 list-disc ml-3">
                  <li>You are 18+ and legally capable</li>
                  <li>This is experimental with inherent risks</li>
                  <li>You won't hold team liable for losses</li>
                  <li>You comply with local laws</li>
                  <li>Crypto activities may be restricted in your area</li>
                </ul>
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
          
          <div className="flex gap-2">
            <Button
              onClick={onDecline}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs h-8"
              data-testid="button-decline-disclaimer"
            >
              I Do Not Agree
            </Button>
            <Button
              onClick={onAccept}
              disabled={!isAgreed}
              className={`flex-1 transition-all duration-200 text-xs h-8 font-bold ${
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