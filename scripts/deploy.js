import { ethers } from "hardhat";

async function main() {
  console.log("Deploying CipherDaoSpend contract...");

  // Get the contract factory
  const CipherDaoSpend = await ethers.getContractFactory("CipherDaoSpend");

  // Deploy the contract with constructor parameters
  const verifier = "0x3c7fae276c590a8df81ed320851c53db4bc39916"; // Admin address
  const treasuryManager = "0x3c7fae276c590a8df81ed320851c53db4bc39916"; // Treasury manager address

  const cipherDaoSpend = await CipherDaoSpend.deploy(verifier, treasuryManager);

  await cipherDaoSpend.waitForDeployment();

  const contractAddress = await cipherDaoSpend.getAddress();

  console.log("CipherDaoSpend deployed to:", contractAddress);
  console.log("Verifier address:", verifier);
  console.log("Treasury manager:", treasuryManager);

  // Verify the contract
  console.log("Waiting for contract to be mined...");
  await cipherDaoSpend.deploymentTransaction().wait(5);

  console.log("Contract deployed successfully!");
  console.log("Contract address:", contractAddress);
  console.log("Network:", network.name);
  console.log("Chain ID:", network.config.chainId);

  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    network: network.name,
    chainId: network.config.chainId,
    verifier,
    treasuryManager,
    deploymentTime: new Date().toISOString()
  };

  import('fs').then(fs => {
    fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("Deployment info saved to deployment-info.json");
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
