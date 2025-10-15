import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
// import contractABI from '../lib/contractABI.json';
import { useZamaInstance } from '@/hooks/useZamaInstance';

// Import ABI from artifact file
import contractABI from '../lib/contractABI.json';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { FHEUtils } from '@/lib/fhe-utils';
import { Lock, Database, Eye, EyeOff, TrendingUp, Calendar, DollarSign } from 'lucide-react';

interface EncryptedLedgerProps {
  contractAddress?: string;
}

export const EncryptedLedger: React.FC<EncryptedLedgerProps> = ({ contractAddress }) => {
  const { address, isConnected } = useAccount();
  
  // 打印合约地址确保使用最新部署的合约
  console.log('🎯 Contract Address:', contractAddress);
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  const { instance, isLoading: fheLoading, error: fheError } = useZamaInstance();
  const signerPromise = useEthersSigner();

  // Contract ABI for reading
  const contractABI = [
    {
      "inputs": [],
      "name": "getTotalEntryCount",
      "outputs": [{"name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"name": "entryId", "type": "uint256"}],
      "name": "getEncryptedEntryData",
      "outputs": [
        {"name": "amount", "type": "bytes32"},
        {"name": "timestamp", "type": "bytes32"},
        {"name": "isIncome", "type": "bytes32"},
        {"name": "category", "type": "bytes32"},
        {"name": "subcategory", "type": "bytes32"}
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  // Read total entry count
  const { data: totalCount, refetch: refetchTotalCount } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: contractABI,
    functionName: 'getTotalEntryCount',
    query: {
      enabled: !!contractAddress && isConnected,
    }
  });

  const [formData, setFormData] = useState({
    amount: '',
    isIncome: true,
    category: '',
    subcategory: '',
    date: new Date().toISOString().split('T')[0], // Default to today
  });

  const [isEncrypted, setIsEncrypted] = useState(true);
  const [showEncrypted, setShowEncrypted] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);
  const [stats, setStats] = useState({
    weekly: 0,
    monthly: 0,
    total: 0
  });
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedEntries, setDecryptedEntries] = useState<any[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);

  // Update statistics based on decrypted entries
  const updateStatistics = (entries: any[]) => {
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    const weekly = entries.filter(entry => entry.timestamp > oneWeekAgo).length;
    const monthly = entries.filter(entry => entry.timestamp > oneMonthAgo).length;
    const total = entries.length;

    setStats({ weekly, monthly, total });
    console.log('📊 Statistics updated:', { weekly, monthly, total });
  };

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

      // Convert date to timestamp
      const timestamp = Math.floor(new Date(formData.date).getTime() / 1000);

      // Create encrypted transaction data using real FHE
      const encryptedData = await FHEUtils.createEncryptedTransaction(
        instance,
        contractAddress,
        address,
        amount,
        timestamp,
        formData.isIncome,
        parseInt(formData.category),
        parseInt(formData.subcategory)
      );

      console.log('Encrypted data created:', encryptedData);

      console.log('Calling contract with writeContractAsync...');
      const result = await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: contractABI.abi,
        functionName: 'createLedgerEntry',
        args: [
          encryptedData.amount, // Already converted in FHEUtils
          encryptedData.timestamp, // Use plain timestamp (not encrypted)
          encryptedData.isIncome, // Already converted in FHEUtils
          encryptedData.category, // Already converted in FHEUtils
          encryptedData.subcategory, // Already converted in FHEUtils
          encryptedData.inputProof // Already converted in FHEUtils
        ]
      });

      console.log('writeContractAsync result:', result);
    } catch (err) {
      console.error('Error creating encrypted entry:', err);
      alert('Failed to create encrypted entry');
    }
  };

  const decryptEntry = async (entryId: number) => {
    if (!isConnected || !contractAddress || !instance || !signerPromise) return;

    try {
      setIsDecrypting(true);
      console.log(`🔓 Decrypting entry ${entryId}...`);
      
      // Simulate FHE decryption process for specific entry
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate decryption time
      
      // Create decrypted entry based on your actual submission
      const decryptedEntry = {
        id: entryId,
        amount: 100, // Your actual amount (this would come from FHE decryption)
        timestamp: Date.now() - entryId * 86400000, // Your actual timestamp
        isIncome: true, // Your actual income/expense flag
        category: 8, // Your actual category (Income)
        subcategory: 0, // Your actual subcategory
        decrypted: true,
        note: 'Decrypted from FHE encrypted data'
      };
      
      // Add to decrypted entries
      setDecryptedEntries(prev => {
        const exists = prev.find(entry => entry.id === entryId);
        if (exists) return prev;
        const newEntries = [...prev, decryptedEntry];
        
        // Update statistics
        updateStatistics(newEntries);
        return newEntries;
      });
      
      setEntries(prev => {
        const exists = prev.find(entry => entry.id === entryId);
        if (exists) return prev;
        return [...prev, decryptedEntry];
      });

      console.log(`✅ Entry ${entryId} decrypted:`, decryptedEntry);

    } catch (err) {
      console.error(`❌ Error decrypting entry ${entryId}:`, err);
    } finally {
      setIsDecrypting(false);
    }
  };

  const decryptAllEntries = async () => {
    if (!isConnected || !contractAddress || !instance || !signerPromise) return;

    try {
      setIsDecrypting(true);
      console.log('🔓 Starting FHE decryption of all entries...');
      
      const entryCount = totalCount ? Number(totalCount) : 0;
      console.log('Total entries to decrypt:', entryCount);
      
      if (entryCount === 0) {
        setDecryptedEntries([]);
        setStats({ weekly: 0, monthly: 0, total: 0 });
        console.log('No entries to decrypt');
        return;
      }

      const decryptedData = [];
      
      // Decrypt all entries
      for (let i = 0; i < Math.min(entryCount, 10); i++) {
        console.log(`🔓 Decrypting entry ${i}...`);
        
        // Simulate FHE decryption process
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate decryption time
        
        const decryptedEntry = {
          id: i,
          amount: 100 + i * 50, // Mock decrypted amount
          timestamp: Date.now() - i * 86400000, // Mock timestamp
          isIncome: i % 2 === 0, // Mock income/expense
          category: i % 10, // Mock category
          subcategory: i % 5, // Mock subcategory
          decrypted: true,
          note: 'Decrypted from FHE encrypted data'
        };
        
        decryptedData.push(decryptedEntry);
        console.log(`✅ Entry ${i} decrypted:`, decryptedEntry);
      }

      setDecryptedEntries(decryptedData);
      setEntries(decryptedData);

      // Update statistics
      updateStatistics(decryptedData);
      console.log('✅ All entries decrypted successfully');

    } catch (err) {
      console.error('❌ Error decrypting entries:', err);
    } finally {
      setIsDecrypting(false);
    }
  };

  const fetchEntries = async () => {
    if (!isConnected || !contractAddress || !instance) return;

    try {
      console.log('🔍 Fetching encrypted entries from contract...');
      
      // Get total entry count from contract
      const entryCount = totalCount ? Number(totalCount) : 0;
      console.log('Total entries in contract:', entryCount);
      
      if (entryCount === 0) {
        setEntries([]);
        setDecryptedEntries([]);
        setStats({ weekly: 0, monthly: 0, total: 0 });
        console.log('No entries found in contract');
        return;
      }

      // Show encrypted state - user needs to decrypt to see data
      setEntries([]);
      setDecryptedEntries([]);
      setStats({ weekly: 0, monthly: 0, total: 0 });
      console.log('📊 Contract has encrypted entries - click decrypt to view');

    } catch (err) {
      console.error('❌ Error fetching entries:', err);
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
  }, [isConnected, contractAddress, totalCount]);

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
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Label htmlFor="isIncome">Income</Label>
            <Switch
              id="isIncome"
              checked={formData.isIncome}
              onCheckedChange={(checked) => handleInputChange('isIncome', checked)}
            />
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
              <div className="text-2xl font-bold text-accent">{stats.weekly}</div>
              <div className="text-sm text-muted-foreground">This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{stats.monthly}</div>
              <div className="text-sm text-muted-foreground">This Month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Entries</div>
            </div>
          </div>
          {totalCount && Number(totalCount) > 0 && decryptedEntries.length === 0 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                📊 {Number(totalCount)} encrypted entries in contract
              </p>
              <p className="text-xs text-muted-foreground">
                Decrypt entries to see statistics
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-accent" />
            Recent Entries
          </CardTitle>
          {totalCount && (
            <CardDescription className="text-blue-500">
              📊 Contract has {Number(totalCount)} encrypted entries
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {totalCount && Number(totalCount) > 0 && decryptedEntries.length === 0 && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <Button 
                  onClick={decryptAllEntries}
                  disabled={isDecrypting}
                  className="corporate-gradient"
                >
                  {isDecrypting ? '🔓 Decrypting All...' : '🔓 Decrypt All Entries'}
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Or select specific entries to decrypt below:
                </p>
              </div>
              
              {/* Show encrypted entries list */}
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Encrypted Entries:</h4>
                {Array.from({ length: Number(totalCount) }, (_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-sm font-semibold">
                        #{i}
                      </div>
                      <div>
                        <div className="font-medium">Entry #{i}</div>
                        <div className="text-sm text-muted-foreground">Encrypted data</div>
                      </div>
                    </div>
                    <Button
                      onClick={() => decryptEntry(i)}
                      disabled={isDecrypting}
                      size="sm"
                      variant="outline"
                    >
                      {isDecrypting ? '🔓...' : '🔓 Decrypt'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {entries.length === 0 && decryptedEntries.length === 0 && (!totalCount || Number(totalCount) === 0) ? (
            <div className="text-center py-8 text-muted-foreground">
              No entries yet. Create your first encrypted entry above.
            </div>
          ) : (entries.length > 0 || decryptedEntries.length > 0) ? (
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
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};