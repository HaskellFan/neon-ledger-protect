import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WalletConnect } from "@/components/WalletConnect";
import { EncryptedLedger } from "@/components/EncryptedLedger";
import { useAccount } from 'wagmi';

const Index = () => {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        
        {isConnected ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-2">Encrypted Entries</h3>
                <p className="text-muted-foreground">
                  Create encrypted financial entries with FHE protection
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-2">Statistics</h3>
                <p className="text-muted-foreground">
                  View weekly, monthly, and total entry statistics
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-2">Categories</h3>
                <p className="text-muted-foreground">
                  Organize entries with two-level category system
                </p>
              </div>
            </div>
            <EncryptedLedger contractAddress="0x37a9317f785C251900D2376c6b0439705143cFE9" />
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-4">Connect Your Wallet</h3>
            <p className="text-muted-foreground mb-6">
              Connect your wallet to access encrypted financial ledger features
            </p>
            <WalletConnect />
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;