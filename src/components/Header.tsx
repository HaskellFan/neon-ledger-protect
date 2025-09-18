import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Wallet, Menu, Settings, Database } from "lucide-react";
import { WalletConnect } from "./WalletConnect";

export const Header = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const handleWalletConnect = () => {
    setIsWalletConnected(!isWalletConnected);
  };

  return (
    <header className="bg-surface-elevated border-b border-card-border backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-neon-cyan to-neon-green rounded-lg flex items-center justify-center">
                <img 
                  src="/src/assets/payroll-logo.png" 
                  alt="Payroll Logo" 
                  className="w-8 h-8 object-contain filter brightness-0 invert"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold neon-cyan">
                  Neon Ledger Protect
                </h1>
                <p className="text-muted-foreground text-sm">
                  Secure Financial Ledger with FHE
                </p>
              </div>
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="neon-border-cyan bg-surface text-accent">
              <Lock className="w-3 h-3 mr-1" />
              FHE Protected
            </Badge>
            
            <WalletConnect />

            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-accent">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};