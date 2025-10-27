// Contract configuration
export const CONTRACT_CONFIG = {
  // Contract address on Sepolia testnet
  // This should be updated with the actual deployed contract address
  address: "0xA3B76249C79624616107B1e91Ba4016D6638fB6c" as `0x${string}`,
  
  // Contract ABI for CipherDaoSpend
  abi: [
    {
      "inputs": [],
      "name": "proposalCounter",
      "outputs": [
        {"internalType": "uint256", "name": "", "type": "uint256"}
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "memberCounter",
      "outputs": [
        {"internalType": "uint256", "name": "", "type": "uint256"}
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "string", "name": "_title", "type": "string"},
        {"internalType": "string", "name": "_description", "type": "string"},
        {"internalType": "string", "name": "_category", "type": "string"},
        {"internalType": "bytes32", "name": "_amount", "type": "bytes32"},
        {"internalType": "address", "name": "_beneficiary", "type": "address"},
        {"internalType": "uint256", "name": "_duration", "type": "uint256"},
        {"internalType": "bytes", "name": "inputProof", "type": "bytes"}
      ],
      "name": "createProposal",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "uint256", "name": "proposalId", "type": "uint256"},
        {"internalType": "bytes32", "name": "voteChoice", "type": "bytes32"},
        {"internalType": "bytes", "name": "inputProof", "type": "bytes"}
      ],
      "name": "castVote",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "proposalId", "type": "uint256"}],
      "name": "executeProposal",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "proposalId", "type": "uint256"}],
      "name": "getProposalInfo",
      "outputs": [
        {"internalType": "string", "name": "title", "type": "string"},
        {"internalType": "string", "name": "description", "type": "string"},
        {"internalType": "string", "name": "category", "type": "string"},
        {"internalType": "bool", "name": "isActive", "type": "bool"},
        {"internalType": "bool", "name": "isExecuted", "type": "bool"},
        {"internalType": "address", "name": "proposer", "type": "address"},
        {"internalType": "address", "name": "beneficiary", "type": "address"},
        {"internalType": "uint256", "name": "startTime", "type": "uint256"},
        {"internalType": "uint256", "name": "endTime", "type": "uint256"},
        {"internalType": "uint256", "name": "executionTime", "type": "uint256"}
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address", "name": "member", "type": "address"}],
      "name": "getMemberInfo",
      "outputs": [
        {"internalType": "string", "name": "role", "type": "string"},
        {"internalType": "bool", "name": "isActive", "type": "bool"},
        {"internalType": "bool", "name": "isVerified", "type": "bool"},
        {"internalType": "uint256", "name": "joinTime", "type": "uint256"},
        {"internalType": "uint256", "name": "lastActivity", "type": "uint256"}
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "proposalId", "type": "uint256"}],
      "name": "getProposalEncryptedData",
      "outputs": [
        {"internalType": "bytes32", "name": "amount", "type": "bytes32"},
        {"internalType": "bytes32", "name": "votesFor", "type": "bytes32"},
        {"internalType": "bytes32", "name": "votesAgainst", "type": "bytes32"}
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "proposalId", "type": "uint256"}],
      "name": "getProposalData",
      "outputs": [
        {"internalType": "uint256", "name": "proposalId_", "type": "uint256"},
        {"internalType": "uint256", "name": "totalVotes", "type": "uint256"},
        {"internalType": "bool", "name": "isActive", "type": "bool"},
        {"internalType": "bool", "name": "isExecuted", "type": "bool"},
        {"internalType": "string", "name": "title", "type": "string"},
        {"internalType": "string", "name": "description", "type": "string"},
        {"internalType": "string", "name": "category", "type": "string"},
        {"internalType": "address", "name": "proposer", "type": "address"},
        {"internalType": "address", "name": "beneficiary", "type": "address"},
        {"internalType": "uint256", "name": "startTime", "type": "uint256"},
        {"internalType": "uint256", "name": "endTime", "type": "uint256"},
        {"internalType": "uint256", "name": "executionTime", "type": "uint256"}
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address", "name": "member", "type": "address"}],
      "name": "getMemberData",
      "outputs": [
        {"internalType": "uint256", "name": "memberId", "type": "uint256"},
        {"internalType": "uint256", "name": "reputation", "type": "uint256"},
        {"internalType": "bool", "name": "isActive", "type": "bool"},
        {"internalType": "bool", "name": "isVerified", "type": "bool"},
        {"internalType": "string", "name": "role", "type": "string"},
        {"internalType": "address", "name": "wallet", "type": "address"},
        {"internalType": "uint256", "name": "joinTime", "type": "uint256"},
        {"internalType": "uint256", "name": "lastActivity", "type": "uint256"}
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "voteId", "type": "uint256"}],
      "name": "getVoteEncryptedData",
      "outputs": [
        {"internalType": "bytes32", "name": "voteChoice", "type": "bytes32"},
        {"internalType": "bytes32", "name": "votingPower", "type": "bytes32"}
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address", "name": "member", "type": "address"}],
      "name": "getMemberEncryptedData",
      "outputs": [
        {"internalType": "bytes32", "name": "votingPower", "type": "bytes32"}
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTreasuryData",
      "outputs": [
        {"internalType": "uint256", "name": "totalFunds", "type": "uint256"},
        {"internalType": "uint256", "name": "availableFunds", "type": "uint256"},
        {"internalType": "uint256", "name": "lockedFunds", "type": "uint256"},
        {"internalType": "uint256", "name": "totalSpent", "type": "uint256"},
        {"internalType": "address", "name": "treasuryWallet", "type": "address"}
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ] as const,
  
  // Network configuration
  chainId: 11155111, // Sepolia testnet
  
  // Gas settings
  gasLimit: 500000,
  
  // Contract events
  events: {
    ProposalCreated: "ProposalCreated",
    VoteCast: "VoteCast", 
    ProposalExecuted: "ProposalExecuted",
    MemberAdded: "MemberAdded",
    MemberRemoved: "MemberRemoved"
  }
} as const;

// Helper function to get contract address
export const getContractAddress = (): `0x${string}` => {
  return CONTRACT_CONFIG.address;
};

// Helper function to get contract ABI
export const getContractABI = () => {
  return CONTRACT_CONFIG.abi;
};

// Helper function to validate contract address
export const isValidContractAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};
