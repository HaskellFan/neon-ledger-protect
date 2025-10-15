// @ts-ignore
import { createPublicClient, http, parseEther } from 'viem';
// @ts-ignore
import { sepolia } from 'wagmi/chains';
// @ts-ignore
import { createInstance, initSDK, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';

// FHE utility functions for encrypted data handling
export class FHEUtils {
  private static client = createPublicClient({
    chain: sepolia,
    transport: http((import.meta as any).env.VITE_RPC_URL || 'https://1rpc.io/sepolia'),
  });

  private static instance: any = null;

  // Initialize FHE SDK
  static async initFHE() {
    if (!this.instance) {
      try {
        await initSDK();
        this.instance = await createInstance(SepoliaConfig);
      } catch (error) {
        console.error('FHE initialization failed:', error);
        throw error;
      }
    }
    return this.instance;
  }

  // Convert FHE handles to hex string format (32 bytes)
  static convertHex(handle: any): string {
    let formattedHandle: string;
    if (typeof handle === 'string') {
      formattedHandle = handle.startsWith('0x') ? handle : `0x${handle}`;
    } else if (handle instanceof Uint8Array) {
      formattedHandle = `0x${Array.from(handle).map(b => b.toString(16).padStart(2, '0')).join('')}`;
    } else if (Array.isArray(handle)) {
      formattedHandle = `0x${handle.map(b => b.toString(16).padStart(2, '0')).join('')}`;
    } else {
      formattedHandle = `0x${handle.toString()}`;
    }
    
    // Ensure exactly 32 bytes (66 characters including 0x)
    if (formattedHandle.length < 66) {
      formattedHandle = formattedHandle.padEnd(66, '0');
    } else if (formattedHandle.length > 66) {
      formattedHandle = formattedHandle.substring(0, 66);
    }
    
    return formattedHandle;
  }

  // Create encrypted transaction data
  static async createEncryptedTransaction(
    contractAddress: string,
    userAddress: string,
    amount: number,
    isIncome: boolean,
    category: number,
    subcategory: number
  ) {
    const instance = await this.initFHE();
    const input = instance.createEncryptedInput(contractAddress, userAddress);
    
    // Add encrypted values
    input.add32(BigInt(amount));
    input.add32(BigInt(Date.now()));
    input.addBool(isIncome);
    input.add8(BigInt(category));
    input.add8(BigInt(subcategory));
    
    const encryptedInput = await input.encrypt();
    
    return {
      amount: this.convertHex(encryptedInput.handles[0]),
      timestamp: this.convertHex(encryptedInput.handles[1]),
      isIncome: this.convertHex(encryptedInput.handles[2]),
      category: this.convertHex(encryptedInput.handles[3]),
      subcategory: this.convertHex(encryptedInput.handles[4]),
      inputProof: this.convertHex(encryptedInput.inputProof)
    };
  }

  // Decrypt multiple values
  static async decryptMultipleValues(handles: string[]): Promise<number[]> {
    const instance = await this.initFHE();
    const results = [];
    for (const handle of handles) {
      const decrypted = await instance.userDecrypt(handle);
      results.push(decrypted);
    }
    return results;
  }

  // Get category definitions
  static getCategories() {
    return {
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
  }
}