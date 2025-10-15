const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying NeonLedgerProtect contract...");

  // Get the contract factory
  const NeonLedgerProtect = await ethers.getContractFactory("NeonLedgerProtect");

  // Deploy the contract
  const neonLedgerProtect = await NeonLedgerProtect.deploy();

  // Wait for deployment to complete
  await neonLedgerProtect.waitForDeployment();

  const contractAddress = await neonLedgerProtect.getAddress();
  console.log("✅ NeonLedgerProtect deployed to:", contractAddress);

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "(Chain ID:", network.chainId, ")");

  // Get deployer address
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer:", deployer.address);

  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer balance:", ethers.formatEther(balance), "ETH");

  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    status: "deployed",
    transactionHash: neonLedgerProtect.deploymentTransaction()?.hash,
    deployerInfo: {
      github_user: "Willia9g",
      email: "clots_krypton_0e@icloud.com",
      bio: "Working on open-source because the future is collective."
    },
    features: [
      "Encrypted ledger entries",
      "Category and subcategory selection", 
      "Weekly and monthly statistics",
      "FHE encryption for sensitive data"
    ],
    security: {
      privateKeyUsed: "Willia9g private key from environment variable",
      privateKeyStored: false,
      environmentVariable: true,
      gitIgnored: true
    }
  };

  const fs = require('fs');
  fs.writeFileSync(
    'deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("📄 Deployment info saved to deployment-info.json");
  console.log("🎉 Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
