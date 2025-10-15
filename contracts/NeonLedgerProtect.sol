// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { euint32, externalEuint32, euint8, externalEuint8, ebool, FHE } from "@fhevm/solidity/lib/FHE.sol";

contract NeonLedgerProtect is SepoliaConfig {
    using FHE for *;
    
    struct LedgerEntry {
        euint32 amount;
        uint256 timestamp;
        euint8 isIncome;
        euint8 category;
        euint8 subcategory;
        address owner;
        uint256 blockNumber;
    }
    
    mapping(uint256 => LedgerEntry) public ledgerEntries;
    mapping(address => euint32) public userBalance;
    mapping(address => uint256) public userEntryCount;
    
    uint256 public entryCounter;
    
    address public owner;
    
    event EntryCreated(uint256 indexed entryId, address indexed owner);
    event BalanceUpdated(address indexed user);
    
    constructor() {
        owner = msg.sender;
    }
    
    function createLedgerEntry(
        externalEuint32 amount,
        uint256 timestamp,
        externalEuint8 isIncome,
        externalEuint8 category,
        externalEuint8 subcategory,
        bytes calldata inputProof
    ) public returns (uint256) {
        uint256 entryId = entryCounter++;
        
        // Convert external encrypted values to internal
        euint32 internalAmount = FHE.fromExternal(amount, inputProof);
        euint8 internalIsIncome = FHE.fromExternal(isIncome, inputProof);
        euint8 internalCategory = FHE.fromExternal(category, inputProof);
        euint8 internalSubcategory = FHE.fromExternal(subcategory, inputProof);
        
        ledgerEntries[entryId] = LedgerEntry({
            amount: internalAmount,
            timestamp: timestamp,
            isIncome: internalIsIncome,
            category: internalCategory,
            subcategory: internalSubcategory,
            owner: msg.sender,
            blockNumber: block.number
        });
        
        // Update user balance based on income/expense
        // For FHE, we need to handle this differently - store both income and expense separately
        // This is a simplified approach for the ledger system
        // Initialize balance to 0 if it's the first entry for this user
        if (userEntryCount[msg.sender] == 0) {
            userBalance[msg.sender] = internalAmount;
        } else {
            userBalance[msg.sender] = FHE.add(userBalance[msg.sender], internalAmount);
        }
        
        // Update entry count
        userEntryCount[msg.sender]++;
        
        emit EntryCreated(entryId, msg.sender);
        emit BalanceUpdated(msg.sender);
        return entryId;
    }
    
    // Get user's entry count for statistics
    function getUserEntryCount(address user) public view returns (uint256) {
        return userEntryCount[user];
    }
    
    // Get total entry count
    function getTotalEntryCount() public view returns (uint256) {
        return entryCounter;
    }
    
    // Get basic entry info (only non-encrypted data)
    function getEntryInfo(uint256 entryId) public view returns (
        address owner,
        uint256 blockNumber
    ) {
        LedgerEntry storage entry = ledgerEntries[entryId];
        return (
            entry.owner,
            entry.blockNumber
        );
    }
    
    // Get encrypted entry data for decryption
    function getEncryptedEntryData(uint256 entryId) public view returns (
        euint32 amount,
        uint256 timestamp,
        euint8 isIncome,
        euint8 category,
        euint8 subcategory
    ) {
        LedgerEntry storage entry = ledgerEntries[entryId];
        require(entry.owner != address(0), "Entry does not exist");
        require(entry.owner == msg.sender, "Only entry owner can access encrypted data");
        
        return (
            entry.amount,
            entry.timestamp,
            entry.isIncome,
            entry.category,
            entry.subcategory
        );
    }
    
    // Get encrypted user balance for decryption
    function getEncryptedUserBalance(address user) public view returns (euint32) {
        return userBalance[user];
    }
}
