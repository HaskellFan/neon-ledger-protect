import { DollarSign, Shield } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-surface border-t border-card-border mt-12">
      <div className="container mx-auto px-6 py-8">
        {/* Footer info */}
        <div className="text-center text-muted-foreground">
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-success" />
              <span>Encrypted Ledger System</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-accent" />
              <span>FHE Protected</span>
            </div>
          </div>
          <p className="mt-2 text-xs">
            All financial data is encrypted using Fully Homomorphic Encryption
          </p>
        </div>
      </div>
    </footer>
  );
};