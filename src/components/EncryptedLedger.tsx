import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { FHEUtils } from '@/lib/fhe-utils';
import { Lock, Database, Eye, EyeOff } from 'lucide-react';

interface EncryptedLedgerProps {
  contractAddress?: string;
}

export const EncryptedLedger: React.FC<EncryptedLedgerProps> = ({ contractAddress }) => {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    isIncome: true,
  });

  const [isEncrypted, setIsEncrypted] = useState(true);
  const [showEncrypted, setShowEncrypted] = useState(false);

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

    try {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
      }

      // Create encrypted transaction data
      const encryptedData = await FHEUtils.createEncryptedTransaction(
        amount,
        formData.isIncome,
        formData.description
      );

      // Prepare contract call
      const contractCall = {
        address: contractAddress as `0x${string}`,
        abi: [
          {
            "inputs": [
              {"name": "amount", "type": "bytes"},
              {"name": "timestamp", "type": "bytes"},
              {"name": "isIncome", "type": "bytes"},
              {"name": "description", "type": "string"},
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
          formData.description,
          '0x' // Placeholder for input proof
        ]
      };

      await writeContract(contractCall);
    } catch (err) {
      console.error('Error creating encrypted entry:', err);
      alert('Failed to create encrypted entry');
    }
  };

  const generateEncryptedReport = async () => {
    if (!isConnected || !contractAddress) {
      alert('Please connect wallet and ensure contract is deployed');
      return;
    }

    try {
      // Generate encrypted financial report
      const encryptedReport = await FHEUtils.generateEncryptedReport(
        1000, // totalIncome
        500,  // totalExpense
        500,  // netWorth
        true  // isPrivate
      );

      const contractCall = {
        address: contractAddress as `0x${string}`,
        abi: [
          {
            "inputs": [
              {"name": "totalIncome", "type": "bytes"},
              {"name": "totalExpense", "type": "bytes"},
              {"name": "netWorth", "type": "bytes"},
              {"name": "isPrivate", "type": "bytes"},
              {"name": "reportHash", "type": "string"}
            ],
            "name": "generateFinancialReport",
            "outputs": [{"name": "", "type": "uint256"}],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        functionName: 'generateFinancialReport',
        args: [
          encryptedReport.totalIncome,
          encryptedReport.totalExpense,
          encryptedReport.netWorth,
          encryptedReport.isPrivate,
          encryptedReport.reportHash
        ]
      };

      await writeContract(contractCall);
    } catch (err) {
      console.error('Error generating encrypted report:', err);
      alert('Failed to generate encrypted report');
    }
  };

  const createProtectionRule = async () => {
    if (!isConnected || !contractAddress) {
      alert('Please connect wallet and ensure contract is deployed');
      return;
    }

    try {
      const threshold = 1000; // Example threshold
      const ruleType = 'expense_limit';

      const encryptedRule = await FHEUtils.createEncryptedRule(threshold, ruleType);

      const contractCall = {
        address: contractAddress as `0x${string}`,
        abi: [
          {
            "inputs": [
              {"name": "threshold", "type": "bytes"},
              {"name": "ruleType", "type": "string"}
            ],
            "name": "createProtectionRule",
            "outputs": [{"name": "", "type": "uint256"}],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        functionName: 'createProtectionRule',
        args: [
          encryptedRule.threshold,
          encryptedRule.ruleType
        ]
      };

      await writeContract(contractCall);
    } catch (err) {
      console.error('Error creating protection rule:', err);
      alert('Failed to create protection rule');
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Encrypted Ledger
          </CardTitle>
          <CardDescription>
            Connect your wallet to access encrypted ledger features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Please connect your wallet to create encrypted ledger entries
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Create Encrypted Entry
          </CardTitle>
          <CardDescription>
            Create a new encrypted ledger entry with FHE protection
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
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter transaction description..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
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
            disabled={isPending || isConfirming}
            className="w-full"
          >
            {isPending ? 'Creating...' : isConfirming ? 'Confirming...' : 'Create Encrypted Entry'}
          </Button>

          {error && (
            <div className="text-red-500 text-sm">
              Error: {error.message}
            </div>
          )}

          {isSuccess && (
            <div className="text-green-500 text-sm">
              Transaction successful! Hash: {hash}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Generate Report</CardTitle>
            <CardDescription>
              Create encrypted financial report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={generateEncryptedReport}
              disabled={isPending || isConfirming}
              className="w-full"
            >
              Generate Encrypted Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Protection Rule</CardTitle>
            <CardDescription>
              Set up encrypted protection rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={createProtectionRule}
              disabled={isPending || isConfirming}
              className="w-full"
            >
              Create Protection Rule
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
