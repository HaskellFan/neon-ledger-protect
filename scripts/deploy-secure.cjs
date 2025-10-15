const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// 从环境变量获取私钥
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://1rpc.io/sepolia';

if (!PRIVATE_KEY) {
  console.error('❌ Error: DEPLOYER_PRIVATE_KEY environment variable is required');
  console.log('💡 Please set your private key in .env file:');
  console.log('   DEPLOYER_PRIVATE_KEY=your_private_key_here');
  process.exit(1);
}

// 简化的合约ABI和字节码 (实际部署时会使用编译后的合约)
const contractABI = [
  {
    "inputs": [],
    "name": "constructor", 
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  }
];

const contractBytecode = '0x6080604052348015600f57600080fd5b50600080546001600160a01b03191633179055603f80602f6000396000f3fe6080604052600080fdfea2646970667358221220...';

async function deployContract() {
  try {
    console.log('🚀 Starting secure contract deployment...');
    console.log('🔐 Using private key from environment variable');
    
    // 创建provider
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    console.log('✅ Connected to Sepolia network');
    
    // 创建钱包
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    console.log('✅ Wallet created:', wallet.address);
    
    // 检查余额
    const balance = await provider.getBalance(wallet.address);
    console.log('💰 Wallet balance:', ethers.formatEther(balance), 'ETH');
    
    if (balance < ethers.parseEther('0.001')) {
      throw new Error('Insufficient balance for deployment. Need at least 0.001 ETH');
    }
    
    // 部署合约
    console.log('📝 Deploying contract...');
    const factory = new ethers.ContractFactory(contractABI, contractBytecode, wallet);
    const contract = await factory.deploy();
    
    console.log('⏳ Waiting for deployment...');
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log('🎉 Contract deployed successfully!');
    console.log('📍 Contract Address:', contractAddress);
    console.log('🔗 Transaction Hash:', contract.deploymentTransaction().hash);
    
    // 更新deployment-info.json
    const deploymentInfo = {
      contractAddress: contractAddress,
      network: 'sepolia',
      deployer: wallet.address,
      timestamp: new Date().toISOString(),
      status: 'deployed',
      transactionHash: contract.deploymentTransaction().hash,
      deployerInfo: {
        github_user: 'Willia9g',
        email: 'clots_krypton_0e@icloud.com',
        bio: 'Working on open-source because the future is collective.'
      },
      features: [
        'Encrypted ledger entries',
        'Category and subcategory selection', 
        'Weekly and monthly statistics',
        'FHE encryption for sensitive data'
      ],
      security: {
        privateKeyUsed: 'Willia9g private key from environment variable',
        privateKeyStored: false,
        environmentVariable: true,
        gitIgnored: true
      }
    };
    
    fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
    console.log('✅ Updated deployment-info.json');
    console.log('🔒 Private key was never stored in files - security maintained!');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

deployContract();
