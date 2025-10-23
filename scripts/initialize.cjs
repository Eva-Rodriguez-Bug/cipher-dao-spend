const { ethers } = require("hardhat");

async function main() {
  console.log("Initializing CipherDaoSpend contract with initial data...");

  // Get the deployed contract
  const contractAddress = "0xcD9721E22883c376321AC51Ed74486a4226164Ec";
  const CipherDaoSpend = await ethers.getContractFactory("CipherDaoSpend");
  const contract = CipherDaoSpend.attach(contractAddress);

  // Member addresses to initialize
  const memberAddresses = [
    "0x405D14066c01B7f8D53497Ff2597d081A02850dF",
    "0x4139E2023da5F9dC10941596DCbDD2e8e003DcAe",
    "0x415C708dc46B10A81E9Fc752aBF5f5BA8aB0a728",
    "0x43B37bA4b27E113A98Ced7e62D046DEB0385c610",
    "0x447Ec8423140E2e89b5Db658cF0362F67A3502C0",
    "0x44a34dE9cd7Decd2500140d1d511D9223a6e3Ac3",
    "0x44A390045603958A98D0515bED5D9e6a84c6B819",
    "0x454456B945C161Dc018d507a1402EBd7FfF2d043",
    "0x217edde31E42FE76c4F0d0FFeabEcDA56D02C6f0"
  ];

  const roles = ["Core Member", "Contributor", "Advisor", "Developer", "Community Manager"];
  
  console.log("Adding demo members...");
  for (let i = 0; i < memberAddresses.length; i++) {
    const address = memberAddresses[i];
    const role = roles[i % roles.length];
    const votingPower = Math.floor(Math.random() * 1000) + 100; // Random voting power between 100-1100
    
    try {
      const tx = await contract.addDemoMember(address, role, votingPower);
      await tx.wait();
      console.log(`✅ Added demo member ${address} with role "${role}" and voting power ${votingPower}`);
    } catch (error) {
      console.log(`❌ Failed to add demo member ${address}:`, error.message);
    }
  }

  console.log("Adding demo treasury funds...");
  try {
    // Add a small amount for demo (in wei) - no real money
    const demoFunds = ethers.parseEther("0.001"); // 0.001 ETH for demo
    const tx = await contract.depositToTreasury({ value: demoFunds });
    await tx.wait();
    console.log(`✅ Added ${ethers.formatEther(demoFunds)} ETH to treasury (demo)`);
  } catch (error) {
    console.log(`❌ Failed to add demo treasury funds:`, error.message);
  }

  console.log("Creating demo proposals...");
  const sampleProposals = [
    {
      title: "Community Development Grant",
      description: "Allocate funds for community development initiatives and educational programs",
      category: "Community",
      amount: 2000, // 2000 tokens (demo amount)
      beneficiary: memberAddresses[0],
      duration: 7 * 24 * 60 * 60 // 7 days
    },
    {
      title: "Technical Infrastructure Upgrade",
      description: "Upgrade technical infrastructure and security measures",
      category: "Technical",
      amount: 5000, // 5000 tokens (demo amount)
      beneficiary: memberAddresses[1],
      duration: 14 * 24 * 60 * 60 // 14 days
    },
    {
      title: "Marketing Campaign",
      description: "Launch marketing campaign to increase community awareness",
      category: "Marketing",
      amount: 1500, // 1500 tokens (demo amount)
      beneficiary: memberAddresses[2],
      duration: 10 * 24 * 60 * 60 // 10 days
    }
  ];

  for (const proposal of sampleProposals) {
    try {
      console.log(`Creating demo proposal: ${proposal.title}`);
      const tx = await contract.createDemoProposal(
        proposal.title,
        proposal.description,
        proposal.category,
        proposal.amount,
        proposal.beneficiary,
        proposal.duration
      );
      await tx.wait();
      console.log(`✅ Created demo proposal: ${proposal.title}`);
    } catch (error) {
      console.log(`❌ Failed to create demo proposal "${proposal.title}":`, error.message);
    }
  }

  console.log("\n🎉 Demo initialization complete!");
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Demo Members Added: ${memberAddresses.length}`);
  console.log(`Demo Treasury Funds: 0.001 ETH`);
  console.log(`Demo Proposals: ${sampleProposals.length}`);
  console.log(`\n📝 Note: This is a demo setup with sample data for testing purposes.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
