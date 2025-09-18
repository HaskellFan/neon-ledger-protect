// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { euint32, externalEuint32, euint8, ebool, FHE } from "@fhevm/solidity/lib/FHE.sol";

contract NeonLedgerProtect is SepoliaConfig {
    using FHE for *;
    
    struct LedgerEntry {
        euint32 entryId;
        euint32 amount;
        euint32 timestamp;
        ebool isIncome;
        ebool isVerified;
        string description;
        address owner;
        uint256 blockNumber;
    }
    
    struct FinancialReport {
        euint32 reportId;
        euint32 totalIncome;
        euint32 totalExpense;
        euint32 netWorth;
        ebool isPrivate;
        string reportHash;
        address reporter;
        uint256 timestamp;
    }
    
    struct ProtectionRule {
        euint32 ruleId;
        euint32 threshold;
        ebool isActive;
        string ruleType;
        address owner;
        uint256 createdAt;
    }
    
    mapping(uint256 => LedgerEntry) public ledgerEntries;
    mapping(uint256 => FinancialReport) public financialReports;
    mapping(uint256 => ProtectionRule) public protectionRules;
    mapping(address => euint32) public userBalance;
    mapping(address => euint32) public userReputation;
    
    uint256 public entryCounter;
    uint256 public reportCounter;
    uint256 public ruleCounter;
    
    address public owner;
    address public verifier;
    
    event EntryCreated(uint256 indexed entryId, address indexed owner, string description);
    event ReportGenerated(uint256 indexed reportId, address indexed reporter, string reportHash);
    event RuleCreated(uint256 indexed ruleId, address indexed owner, string ruleType);
    event ProtectionTriggered(uint256 indexed ruleId, address indexed owner, string alert);
    event BalanceUpdated(address indexed user, uint32 newBalance);
    event ReputationUpdated(address indexed user, uint32 newReputation);
    
    constructor(address _verifier) {
        owner = msg.sender;
        verifier = _verifier;
    }
    
    function createLedgerEntry(
        externalEuint32 amount,
        externalEuint32 timestamp,
        ebool isIncome,
        string memory description,
        bytes calldata inputProof
    ) public returns (uint256) {
        require(bytes(description).length > 0, "Description cannot be empty");
        
        uint256 entryId = entryCounter++;
        
        // Convert external encrypted values to internal
        euint32 internalAmount = FHE.fromExternal(amount, inputProof);
        euint32 internalTimestamp = FHE.fromExternal(timestamp, inputProof);
        
        ledgerEntries[entryId] = LedgerEntry({
            entryId: FHE.asEuint32(0), // Will be set properly later
            amount: internalAmount,
            timestamp: internalTimestamp,
            isIncome: isIncome,
            isVerified: FHE.asEbool(false),
            description: description,
            owner: msg.sender,
            blockNumber: block.number
        });
        
        // Update user balance based on income/expense
        if (FHE.decrypt(isIncome)) {
            userBalance[msg.sender] = FHE.add(userBalance[msg.sender], internalAmount);
        } else {
            userBalance[msg.sender] = FHE.sub(userBalance[msg.sender], internalAmount);
        }
        
        emit EntryCreated(entryId, msg.sender, description);
        return entryId;
    }
    
    function generateFinancialReport(
        euint32 totalIncome,
        euint32 totalExpense,
        euint32 netWorth,
        ebool isPrivate,
        string memory reportHash
    ) public returns (uint256) {
        require(bytes(reportHash).length > 0, "Report hash cannot be empty");
        
        uint256 reportId = reportCounter++;
        
        financialReports[reportId] = FinancialReport({
            reportId: FHE.asEuint32(0), // Will be set properly later
            totalIncome: totalIncome,
            totalExpense: totalExpense,
            netWorth: netWorth,
            isPrivate: isPrivate,
            reportHash: reportHash,
            reporter: msg.sender,
            timestamp: block.timestamp
        });
        
        emit ReportGenerated(reportId, msg.sender, reportHash);
        return reportId;
    }
    
    function createProtectionRule(
        euint32 threshold,
        string memory ruleType
    ) public returns (uint256) {
        require(bytes(ruleType).length > 0, "Rule type cannot be empty");
        
        uint256 ruleId = ruleCounter++;
        
        protectionRules[ruleId] = ProtectionRule({
            ruleId: FHE.asEuint32(0), // Will be set properly later
            threshold: threshold,
            isActive: FHE.asEbool(true),
            ruleType: ruleType,
            owner: msg.sender,
            createdAt: block.timestamp
        });
        
        emit RuleCreated(ruleId, msg.sender, ruleType);
        return ruleId;
    }
    
    function checkProtectionRules(
        uint256 ruleId,
        euint32 currentValue
    ) public view returns (bool) {
        require(protectionRules[ruleId].owner != address(0), "Rule does not exist");
        require(FHE.decrypt(protectionRules[ruleId].isActive), "Rule is not active");
        
        // Check if current value exceeds threshold
        return FHE.decrypt(FHE.gt(currentValue, protectionRules[ruleId].threshold));
    }
    
    function triggerProtection(
        uint256 ruleId,
        string memory alert
    ) public {
        require(protectionRules[ruleId].owner == msg.sender, "Only rule owner can trigger");
        require(FHE.decrypt(protectionRules[ruleId].isActive), "Rule is not active");
        
        emit ProtectionTriggered(ruleId, msg.sender, alert);
    }
    
    function verifyEntry(uint256 entryId, bool isVerified) public {
        require(msg.sender == verifier, "Only verifier can verify entries");
        require(ledgerEntries[entryId].owner != address(0), "Entry does not exist");
        
        ledgerEntries[entryId].isVerified = FHE.asEbool(isVerified);
    }
    
    function updateUserReputation(address user, euint32 reputation) public {
        require(msg.sender == verifier, "Only verifier can update reputation");
        require(user != address(0), "Invalid user address");
        
        userReputation[user] = reputation;
        emit ReputationUpdated(user, 0); // FHE.decrypt(reputation) - will be decrypted off-chain
    }
    
    function getEntryInfo(uint256 entryId) public view returns (
        uint8 amount,
        uint8 timestamp,
        bool isIncome,
        bool isVerified,
        string memory description,
        address owner,
        uint256 blockNumber
    ) {
        LedgerEntry storage entry = ledgerEntries[entryId];
        return (
            0, // FHE.decrypt(entry.amount) - will be decrypted off-chain
            0, // FHE.decrypt(entry.timestamp) - will be decrypted off-chain
            FHE.decrypt(entry.isIncome),
            FHE.decrypt(entry.isVerified),
            entry.description,
            entry.owner,
            entry.blockNumber
        );
    }
    
    function getReportInfo(uint256 reportId) public view returns (
        uint8 totalIncome,
        uint8 totalExpense,
        uint8 netWorth,
        bool isPrivate,
        string memory reportHash,
        address reporter,
        uint256 timestamp
    ) {
        FinancialReport storage report = financialReports[reportId];
        return (
            0, // FHE.decrypt(report.totalIncome) - will be decrypted off-chain
            0, // FHE.decrypt(report.totalExpense) - will be decrypted off-chain
            0, // FHE.decrypt(report.netWorth) - will be decrypted off-chain
            FHE.decrypt(report.isPrivate),
            report.reportHash,
            report.reporter,
            report.timestamp
        );
    }
    
    function getUserBalance(address user) public view returns (uint8) {
        return 0; // FHE.decrypt(userBalance[user]) - will be decrypted off-chain
    }
    
    function getUserReputation(address user) public view returns (uint8) {
        return 0; // FHE.decrypt(userReputation[user]) - will be decrypted off-chain
    }
    
    function getRuleInfo(uint256 ruleId) public view returns (
        uint8 threshold,
        bool isActive,
        string memory ruleType,
        address owner,
        uint256 createdAt
    ) {
        ProtectionRule storage rule = protectionRules[ruleId];
        return (
            0, // FHE.decrypt(rule.threshold) - will be decrypted off-chain
            FHE.decrypt(rule.isActive),
            rule.ruleType,
            rule.owner,
            rule.createdAt
        );
    }
    
    function deactivateRule(uint256 ruleId) public {
        require(protectionRules[ruleId].owner == msg.sender, "Only rule owner can deactivate");
        protectionRules[ruleId].isActive = FHE.asEbool(false);
    }
    
    function activateRule(uint256 ruleId) public {
        require(protectionRules[ruleId].owner == msg.sender, "Only rule owner can activate");
        protectionRules[ruleId].isActive = FHE.asEbool(true);
    }
}
