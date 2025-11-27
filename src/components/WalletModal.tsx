import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { WalletConnect } from './WalletConnect';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface WalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WalletModal = ({ open, onOpenChange }: WalletModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-transparent border-none shadow-none p-0 max-w-md">
        <VisuallyHidden>
          <DialogTitle>Wallet Connection</DialogTitle>
        </VisuallyHidden>
        <WalletConnect onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
};
