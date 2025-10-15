// Convert FHE handles to hex string format (参考fhed-shield-secure实现)
const convertHex = (handle: any): string => {
  console.log('Converting handle:', handle, 'type:', typeof handle, 'isUint8Array:', handle instanceof Uint8Array);
  
  let formattedHandle: string;
  if (typeof handle === 'string') {
    formattedHandle = handle.startsWith('0x') ? handle : `0x${handle}`;
  } else if (handle instanceof Uint8Array) {
    formattedHandle = `0x${Array.from(handle).map(b => b.toString(16).padStart(2, '0')).join('')}`;
  } else if (Array.isArray(handle)) {
    // Handle array format
    formattedHandle = `0x${handle.map(b => b.toString(16).padStart(2, '0')).join('')}`;
  } else {
    formattedHandle = `0x${handle.toString()}`;
  }
  
  console.log('Converted handle:', formattedHandle);
  return formattedHandle;
};

// FHE utility functions for encrypted data handling
export class FHEUtils {
  // Create encrypted transaction data
  static async createEncryptedTransaction(
    instance: any,
    contractAddress: string,
    userAddress: string,
    amount: number,
    timestamp: number,
    isIncome: boolean,
    category: number,
    subcategory: number
  ) {
    console.log('Creating encrypted transaction with instance:', !!instance);
    
    // Create encrypted input with transaction data (excluding timestamp - it's not encrypted)
    const input = instance.createEncryptedInput(contractAddress, userAddress);
    input.add32(BigInt(amount));
    // timestamp is NOT encrypted - it's passed as plain uint256 to contract
    input.add8(BigInt(isIncome ? 1 : 0)); // Convert boolean to 0/1 for add8
    input.add8(BigInt(category));
    input.add8(BigInt(subcategory));

    const encryptedInput = await input.encrypt();
    console.log('Encryption successful, handles:', encryptedInput.handles.length);

    return {
      amount: convertHex(encryptedInput.handles[0]),
      timestamp: timestamp, // Return plain timestamp (not encrypted)
      isIncome: convertHex(encryptedInput.handles[1]),
      category: convertHex(encryptedInput.handles[2]),
      subcategory: convertHex(encryptedInput.handles[3]),
      inputProof: convertHex(encryptedInput.inputProof)
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