import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, FileText, UserCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
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
        className="max-w-xl max-h-[70vh] bg-gray-950 border-2 border-[#f7931a] [&>button]:hidden overflow-hidden" 
        data-testid="modal-disclaimer"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl text-white flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-white" />
            Important Disclaimer & Privacy Notice
          </DialogTitle>
          <DialogDescription className="text-white/80">
            Please read and agree to the terms below to continue
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea 
          className="max-h-[45vh] pr-4" 
          data-testid="disclaimer-content"
        >
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white">
                <FileText className="w-5 h-5 text-white" />
                <h3 className="text-lg font-bold text-white">Legal Terms & Conditions</h3>
              </div>
              <div className="text-white text-sm leading-relaxed">
                <p className="mb-3">
                  By proceeding, you agree that:
                </p>
                <ul className="space-y-1 list-disc ml-4 text-white">
                  <li>You are at least 18 years of age and legally capable of entering into agreements</li>
                  <li>You understand this is an experimental platform with inherent risks</li>
                  <li>You will not hold the development team liable for any losses or damages</li>
                  <li>You comply with all applicable laws in your jurisdiction</li>
                  <li>You understand that cryptocurrency activities may be restricted in your area</li>
                  <li>You have read and understood all warnings and disclaimers above</li>
                </ul>
                
                <div className="mt-4 p-3 bg-gray-900 border border-gray-700 rounded">
                  <p className="text-white text-sm">
                    <strong>Jurisdiction:</strong> This platform operates in a decentralized manner. 
                    Users are responsible for ensuring compliance with their local laws and regulations. The anonymous development team cannot 
                    provide legal advice or guarantee compliance with any specific jurisdiction's requirements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="pt-4 border-t border-gray-800">
          <div className="flex items-center space-x-3 mb-4">
            <Checkbox
              id="agree-checkbox"
              checked={isAgreed}
              onCheckedChange={(checked) => setIsAgreed(checked === true)}
              className="border-white data-[state=checked]:bg-[#f7931a] data-[state=checked]:border-[#f7931a]"
              data-testid="checkbox-agree-disclaimer"
            />
            <label htmlFor="agree-checkbox" className="text-white text-sm flex items-center gap-2 cursor-pointer">
              <UserCheck className="w-4 h-4 text-white" />
              I agree to the terms and conditions above
            </label>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={onDecline}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              data-testid="button-decline-disclaimer"
            >
              I Do Not Agree
            </Button>
            <Button
              onClick={onAccept}
              disabled={!isAgreed}
              className={`flex-1 transition-all duration-200 ${
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