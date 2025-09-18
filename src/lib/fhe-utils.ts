import { createPublicClient, http, parseEther } from 'viem';
import { sepolia } from 'wagmi/chains';

// FHE utility functions for encrypted data handling
export class FHEUtils {
  private static client = createPublicClient({
    chain: sepolia,
    transport: http(import.meta.env.VITE_RPC_URL || 'https://1rpc.io/sepolia'),
  });

  // Convert regular values to encrypted format for FHE operations
  static async encryptValue(value: number): Promise<string> {
    // This would typically interact with the FHE relayer
    // For now, we'll return a placeholder encrypted value
    return `encrypted_${value}_${Date.now()}`;
  }

  // Decrypt FHE values (this would be done off-chain in a real implementation)
  static async decryptValue(encryptedValue: string): Promise<number> {
    // This would typically interact with the FHE relayer
    // For now, we'll extract the original value from our placeholder
    const match = encryptedValue.match(/encrypted_(\d+)_/);
    return match ? parseInt(match[1]) : 0;
  }

  // Create encrypted transaction data
  static async createEncryptedTransaction(
    amount: number,
    isIncome: boolean,
    description: string
  ) {
    const encryptedAmount = await this.encryptValue(amount);
    const encryptedTimestamp = await this.encryptValue(Date.now());
    const encryptedIsIncome = await this.encryptValue(isIncome ? 1 : 0);

    return {
      amount: encryptedAmount,
      timestamp: encryptedTimestamp,
      isIncome: encryptedIsIncome,
      description,
    };
  }

  // Generate financial report with encrypted data
  static async generateEncryptedReport(
    totalIncome: number,
    totalExpense: number,
    netWorth: number,
    isPrivate: boolean
  ) {
    const encryptedIncome = await this.encryptValue(totalIncome);
    const encryptedExpense = await this.encryptValue(totalExpense);
    const encryptedNetWorth = await this.encryptValue(netWorth);
    const encryptedIsPrivate = await this.encryptValue(isPrivate ? 1 : 0);

    return {
      totalIncome: encryptedIncome,
      totalExpense: encryptedExpense,
      netWorth: encryptedNetWorth,
      isPrivate: encryptedIsPrivate,
      reportHash: `report_${Date.now()}`,
    };
  }

  // Create protection rule with encrypted threshold
  static async createEncryptedRule(threshold: number, ruleType: string) {
    const encryptedThreshold = await this.encryptValue(threshold);

    return {
      threshold: encryptedThreshold,
      ruleType,
    };
  }

  // Check if value exceeds encrypted threshold
  static async checkThreshold(value: number, encryptedThreshold: string): Promise<boolean> {
    const threshold = await this.decryptValue(encryptedThreshold);
    return value > threshold;
  }
}

// Contract interaction utilities
export const contractUtils = {
  // Get contract address from environment
  getContractAddress: (): string => {
    return import.meta.env.VITE_CONTRACT_ADDRESS || '';
  },

  // Get FHE relayer URL
  getRelayerUrl: (): string => {
    return import.meta.env.VITE_FHE_RELAYER_URL || '';
  },

  // Format address for display
  formatAddress: (address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  },

  // Validate Ethereum address
  isValidAddress: (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  },
};
