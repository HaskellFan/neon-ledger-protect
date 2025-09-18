import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EmployeeGrid } from "@/components/EmployeeGrid";
import { WalletConnect } from "@/components/WalletConnect";
import { EncryptedLedger } from "@/components/EncryptedLedger";
import { useAccount } from 'wagmi';

const Index = () => {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                Neon Ledger Protect
              </h2>
              <p className="text-muted-foreground">
                Secure financial ledger with fully homomorphic encryption
              </p>
            </div>
            <WalletConnect />
          </div>
        </div>
        
        {isConnected ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-2">Ledger Entries</h3>
                <p className="text-muted-foreground">
                  Create encrypted financial entries with FHE protection
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-2">Financial Reports</h3>
                <p className="text-muted-foreground">
                  Generate private financial reports with encrypted data
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-2">Protection Rules</h3>
                <p className="text-muted-foreground">
                  Set up automated protection rules for your finances
                </p>
              </div>
            </div>
            <EncryptedLedger />
            <div className="mt-8">
              <EmployeeGrid />
            </div>
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