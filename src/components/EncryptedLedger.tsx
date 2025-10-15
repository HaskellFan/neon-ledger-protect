import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useZamaInstance } from '@/hooks/useZamaInstance';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { FHEUtils } from '@/lib/fhe-utils';
import { Lock, Database, Eye, EyeOff, TrendingUp, Calendar, DollarSign } from 'lucide-react';

interface EncryptedLedgerProps {
  contractAddress?: string;
}

export const EncryptedLedger: React.FC<EncryptedLedgerProps> = ({ contractAddress }) => {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  const { instance, isLoading: fheLoading, error: fheError } = useZamaInstance();
  const signerPromise = useEthersSigner();

  const [formData, setFormData] = useState({
    amount: '',
    isIncome: true,
    category: '',
    subcategory: '',
  });

  const [isEncrypted, setIsEncrypted] = useState(true);
  const [showEncrypted, setShowEncrypted] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);
  const [statistics, setStatistics] = useState({
    weekly: 0,
    monthly: 0,
    total: 0
  });

  const categories = {
    0: { name: "Food & Dining", subcategories: ["Restaurant", "Groceries", "Coffee", "Fast Food", "Delivery"] },
    1: { name: "Transportation", subcategories: ["Gas", "Public Transit", "Taxi", "Parking", "Maintenance"] },
    2: { name: "Shopping", subcategories: ["Clothing", "Electronics", "Books", "Gifts", "Other"] },
    3: { name: "Entertainment", subcategories: ["Movies", "Games", "Sports", "Music", "Events"] },
    4: { name: "Health & Fitness", subcategories: ["Medical", "Pharmacy", "Gym", "Insurance", "Wellness"] },
    5: { name: "Bills & Utilities", subcategories: ["Electricity", "Water", "Internet", "Phone", "Rent"] },
    6: { name: "Education", subcategories: ["Tuition", "Books", "Courses", "Supplies", "Other"] },
    7: { name: "Travel", subcategories: ["Flights", "Hotels", "Activities", "Food", "Transport"] },
    8: { name: "Income", subcategories: ["Salary", "Freelance", "Investment", "Gift", "Other"] },
    9: { name: "Other", subcategories: ["Miscellaneous", "Donations", "Fees", "Taxes", "Other"] }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const createEncryptedEntry = async () => {
    if (!isConnected || !contractAddress) {
      alert('Please connect wallet and ensure contract is deployed');
      return;
    }

    if (!formData.category || !formData.subcategory) {
      alert('Please select both category and subcategory');
      return;
    }

    if (!instance || !address || !signerPromise) {
      alert('Missing wallet or encryption service');
      return;
    }

    try {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
      }

      console.log('Starting createEncryptedEntry...');
      console.log('Instance:', !!instance);
      console.log('Address:', address);
      console.log('SignerPromise:', !!signerPromise);

      // Create encrypted transaction data using real FHE
      const encryptedData = await FHEUtils.createEncryptedTransaction(
        instance,
        contractAddress,
        address,
        amount,
        formData.isIncome,
        parseInt(formData.category),
        parseInt(formData.subcategory)
      );

      console.log('Encrypted data created:', encryptedData);

      // Prepare contract call
      const contractCall = {
        address: contractAddress as `0x${string}`,
        abi: [
          {
            "inputs": [
              {"name": "amount", "type": "bytes"},
              {"name": "timestamp", "type": "bytes"},
              {"name": "isIncome", "type": "bytes"},
              {"name": "category", "type": "bytes"},
              {"name": "subcategory", "type": "bytes"},
              {"name": "inputProof", "type": "bytes"}
            ],
            "name": "createLedgerEntry",
            "outputs": [{"name": "", "type": "uint256"}],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        functionName: 'createLedgerEntry',
        args: [
          encryptedData.amount,
          encryptedData.timestamp,
          encryptedData.isIncome,
          encryptedData.category,
          encryptedData.subcategory,
          encryptedData.inputProof
        ]
      };

      console.log('Calling writeContract with:', contractCall);
      await writeContract(contractCall);
    } catch (err) {
      console.error('Error creating encrypted entry:', err);
      alert('Failed to create encrypted entry');
    }
  };

  const fetchEntries = async () => {
    if (!isConnected || !contractAddress) return;

    try {
      // This would typically involve reading from the contract
      // For now, we'll simulate with local storage
      const storedEntries = localStorage.getItem('ledgerEntries');
      if (storedEntries) {
        const parsedEntries = JSON.parse(storedEntries);
        setEntries(parsedEntries);
        
        // Calculate statistics
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const weekly = parsedEntries.filter((entry: any) => 
          new Date(entry.timestamp) > weekAgo
        ).length;
        
        const monthly = parsedEntries.filter((entry: any) => 
          new Date(entry.timestamp) > monthAgo
        ).length;
        
        setStatistics({
          weekly,
          monthly,
          total: parsedEntries.length
        });
      }
    } catch (err) {
      console.error('Error fetching entries:', err);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      // Reset form after successful transaction
      setFormData({
        amount: '',
        isIncome: true,
        category: '',
        subcategory: '',
      });
      fetchEntries();
    }
  }, [isSuccess]);

  useEffect(() => {
    fetchEntries();
  }, [isConnected, contractAddress]);

  return (
    <div className="space-y-6">
      {/* Create Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-accent" />
            Create Encrypted Entry
          </CardTitle>
          <CardDescription>
            Add a new encrypted financial entry with FHE protection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="isIncome">Income</Label>
              <Switch
                id="isIncome"
                checked={formData.isIncome}
                onCheckedChange={(checked) => handleInputChange('isIncome', checked)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categories).map(([key, category]) => (
                    <SelectItem key={key} value={key}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subcategory">Subcategory</Label>
              <Select
                value={formData.subcategory}
                onValueChange={(value) => handleInputChange('subcategory', value)}
                disabled={!formData.category}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {formData.category && categories[parseInt(formData.category)]?.subcategories.map((sub, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {sub}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="encrypted"
              checked={isEncrypted}
              onCheckedChange={setIsEncrypted}
            />
            <Label htmlFor="encrypted">FHE Encrypted</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEncrypted(!showEncrypted)}
            >
              {showEncrypted ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>

          <Button
            onClick={createEncryptedEntry}
            disabled={isPending || isConfirming || fheLoading || !formData.category || !formData.subcategory || !instance}
            className="w-full"
          >
            {fheLoading ? 'Initializing FHE...' : isPending ? 'Creating...' : isConfirming ? 'Confirming...' : 'Create Encrypted Entry'}
          </Button>

          {fheError && (
            <div className="text-red-500 text-sm space-y-2">
              <div>FHE Error: {fheError}</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="text-xs"
              >
                Retry FHE Initialization
              </Button>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm">
              Error: {error.message}
            </div>
          )}

          {isSuccess && (
            <div className="text-green-500 text-sm">
              Entry created successfully!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{statistics.weekly}</div>
              <div className="text-sm text-muted-foreground">This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{statistics.monthly}</div>
              <div className="text-sm text-muted-foreground">This Month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{statistics.total}</div>
              <div className="text-sm text-muted-foreground">Total Entries</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-accent" />
            Recent Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No entries yet. Create your first encrypted entry above.
            </div>
          ) : (
            <div className="space-y-2">
              {entries.slice(0, 5).map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${entry.isIncome ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <div className="font-medium">
                        {entry.isIncome ? '+' : '-'}${entry.amount}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {(categories as any)[entry.category]?.name} - {(categories as any)[entry.category]?.subcategories[entry.subcategory]}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};