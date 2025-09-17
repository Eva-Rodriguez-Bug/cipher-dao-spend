// Contract configuration
export const CONTRACT_CONFIG = {
  // Contract address on Sepolia testnet
  // This should be updated with the actual deployed contract address
  address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x1234567890123456789012345678901234567890" as `0x${string}`,
  
  // Contract ABI for CipherDaoSpend
  abi: [
    {
      "inputs": [
        {"internalType": "string", "name": "_title", "type": "string"},
        {"internalType": "string", "name": "_description", "type": "string"},
        {"internalType": "string", "name": "_category", "type": "string"},
        {"internalType": "uint256", "name": "_amount", "type": "uint256"},
        {"internalType": "address", "name": "_beneficiary", "type": "address"},
        {"internalType": "uint256", "name": "_duration", "type": "uint256"}
      ],
      "name": "createProposal",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "uint256", "name": "proposalId", "type": "uint256"},
        {"internalType": "uint8", "name": "voteChoice", "type": "uint8"},
        {"internalType": "uint256", "name": "votingPower", "type": "uint256"}
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
