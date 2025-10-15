// Convert FHE handles to hex string format (确保恰好32字节)
const convertHex = (handle: any): string => {
  console.log('Converting handle:', handle, 'type:', typeof handle, 'isUint8Array:', handle instanceof Uint8Array);
  
  let hex = '';
  if (handle instanceof Uint8Array) {
    hex = `0x${Array.from(handle).map(b => b.toString(16).padStart(2, '0')).join('')}`;
  } else if (typeof handle === 'string') {
    hex = handle.startsWith('0x') ? handle : `0x${handle}`;
  } else if (Array.isArray(handle)) {
    hex = `0x${handle.map(b => b.toString(16).padStart(2, '0')).join('')}`;
  } else {
    hex = `0x${handle.toString()}`;
  }
  
  // 确保恰好32字节 (66字符包含0x)
  if (hex.length < 66) {
    hex = hex.padEnd(66, '0');
  } else if (hex.length > 66) {
    hex = hex.substring(0, 66);
  }
  
  console.log('Converted handle (32 bytes):', hex);
  return hex;
};

// FHE utility functions for encrypted data handling
export class FHEUtils {
  // Create encrypted transaction data
  static async createEncryptedTransaction(
    instance: any,
    contractAddress: string,
    userAddress: string,
    amount: number,
    isIncome: boolean,
    category: number,
    subcategory: number
  ) {
    console.log('Creating encrypted transaction with instance:', !!instance);
    
    // Create encrypted input with all transaction data
    const input = instance.createEncryptedInput(contractAddress, userAddress);
    input.add32(BigInt(amount));
    // Use seconds timestamp instead of milliseconds to fit in 32-bit integer
    input.add32(BigInt(Math.floor(Date.now() / 1000)));
    input.addBool(isIncome);
    input.add8(BigInt(category));
    input.add8(BigInt(subcategory));

    const encryptedInput = await input.encrypt();
    console.log('Encryption successful, handles:', encryptedInput.handles.length);

    return {
      amount: convertHex(encryptedInput.handles[0]),
      timestamp: convertHex(encryptedInput.handles[1]),
      isIncome: convertHex(encryptedInput.handles[2]),
      category: convertHex(encryptedInput.handles[3]),
      subcategory: convertHex(encryptedInput.handles[4]),
      inputProof: `0x${Array.from(encryptedInput.inputProof).map(b => b.toString(16).padStart(2, '0')).join('')}`
    };
  }

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