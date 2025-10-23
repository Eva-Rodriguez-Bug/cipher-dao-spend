// FHE (Fully Homomorphic Encryption) utilities for Cipher DAO Spend
import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { sepolia } from 'viem/chains';
import { getContractAddress, getContractABI } from './contract';

// Contract address and ABI
export const CONTRACT_ADDRESS = getContractAddress();
export const CONTRACT_ABI = getContractABI();

// FHE Encryption utilities for DAO governance
export class FHEEncryption {
  private static instance: FHEEncryption;
  private zamaInstance: any = null;

  private constructor() {}

  public static getInstance(): FHEEncryption {
    if (!FHEEncryption.instance) {
      FHEEncryption.instance = new FHEEncryption();
    }
    return FHEEncryption.instance;
  }

  // Initialize FHE with Zama instance
  public async initialize(zamaInstance: any): Promise<void> {
    this.zamaInstance = zamaInstance;
  }

  // Encrypt proposal amount
  public async encryptProposalAmount(amount: number, contractAddress: string, userAddress: string): Promise<{ handles: string[], inputProof: string }> {
    if (!this.zamaInstance) {
      throw new Error('FHE not initialized. Call initialize() first.');
    }

    const input = this.zamaInstance.createEncryptedInput(contractAddress, userAddress);
    input.add32(BigInt(amount));
    const encryptedInput = await input.encrypt();
    
    return {
      handles: encryptedInput.handles.map(this.convertToBytes32),
      inputProof: `0x${Array.from(encryptedInput.inputProof).map(b => b.toString(16).padStart(2, '0')).join('')}`
    };
  }

  // Encrypt vote choice and voting power
  public async encryptVoteData(voteChoice: number, votingPower: number, contractAddress: string, userAddress: string): Promise<{ handles: string[], inputProof: string }> {
    if (!this.zamaInstance) {
      throw new Error('FHE not initialized. Call initialize() first.');
    }

    const input = this.zamaInstance.createEncryptedInput(contractAddress, userAddress);
    input.add8(voteChoice);
    input.add32(BigInt(votingPower));
    const encryptedInput = await input.encrypt();
    
    return {
      handles: encryptedInput.handles.map(this.convertToBytes32),
      inputProof: `0x${Array.from(encryptedInput.inputProof).map(b => b.toString(16).padStart(2, '0')).join('')}`
    };
  }

  // Decrypt proposal data
  public async decryptProposalData(proposalId: number, contractAddress: string): Promise<any> {
    if (!this.zamaInstance) {
      throw new Error('FHE not initialized. Call initialize() first.');
    }

    // This would call the contract to get encrypted data and decrypt it
    // For now, return mock data
    return {
      amount: 1000,
      votesFor: 5,
      votesAgainst: 2,
      totalVotes: 7
    };
  }

  // Convert FHE handle to bytes32 format
  private convertToBytes32(handle: any): string {
    if (typeof handle === 'string') {
      return handle.startsWith('0x') ? handle : `0x${handle}`;
    } else if (handle instanceof Uint8Array) {
      return `0x${Array.from(handle).map(b => b.toString(16).padStart(2, '0')).join('')}`;
    } else if (Array.isArray(handle)) {
      return `0x${handle.map(b => b.toString(16).padStart(2, '0')).join('')}`;
    }
    return `0x${handle.toString()}`;
  }
}

// Smart contract interaction utilities for DAO governance
export class ContractInteraction {
  private client: any;
  private walletClient: any;

  constructor() {
    this.client = createPublicClient({
      chain: sepolia,
      transport: http('https://1rpc.io/sepolia')
    });
  }

  // Set wallet client for transactions
  public setWalletClient(walletClient: any): void {
    this.walletClient = walletClient;
  }

  // Create an encrypted proposal
  public async createProposal(
    title: string,
    description: string,
    category: string,
    amount: number,
    beneficiary: string,
    duration: number,
    userAddress: string,
    fheInstance: any
  ): Promise<string> {
    if (!this.walletClient) {
      throw new Error('Wallet client not set');
    }

    const fhe = FHEEncryption.getInstance();
    await fhe.initialize(fheInstance);
    
    // Encrypt the proposal amount
    const encryptedData = await fhe.encryptProposalAmount(amount, CONTRACT_ADDRESS, userAddress);

    try {
      // Call the smart contract
      const hash = await this.walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'createProposal',
        args: [title, description, category, encryptedData.handles[0], beneficiary, duration, encryptedData.inputProof],
        account: userAddress as `0x${string}`
      });

      return hash;
    } catch (error) {
      console.error('Error creating proposal:', error);
      throw new Error('Failed to create proposal on blockchain');
    }
  }

  // Cast an encrypted vote
  public async castVote(
    proposalId: number,
    voteChoice: number,
    votingPower: number,
    userAddress: string,
    fheInstance: any
  ): Promise<string> {
    if (!this.walletClient) {
      throw new Error('Wallet client not set');
    }

    const fhe = FHEEncryption.getInstance();
    await fhe.initialize(fheInstance);
    
    // Encrypt the vote data
    const encryptedData = await fhe.encryptVoteData(voteChoice, votingPower, CONTRACT_ADDRESS, userAddress);

    try {
      // Call the smart contract
      const hash = await this.walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'castVote',
        args: [proposalId, encryptedData.handles[0], encryptedData.handles[1], encryptedData.inputProof],
        account: userAddress as `0x${string}`
      });

      return hash;
    } catch (error) {
      console.error('Error casting vote:', error);
      throw new Error('Failed to cast vote on blockchain');
    }
  }

  // Get proposal information
  public async getProposalInfo(proposalId: number): Promise<any> {
    try {
      const result = await this.client.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getProposalInfo',
        args: [proposalId]
      });

      return result;
    } catch (error) {
      console.error('Error getting proposal info:', error);
      throw new Error('Failed to get proposal information');
    }
  }

  // Get encrypted proposal data for decryption
  public async getProposalEncryptedData(proposalId: number): Promise<any> {
    try {
      const result = await this.client.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getProposalEncryptedData',
        args: [proposalId]
      });

      return result;
    } catch (error) {
      console.error('Error getting encrypted proposal data:', error);
      throw new Error('Failed to get encrypted proposal data');
    }
  }
}

// Export singleton instances
export const fheEncryption = FHEEncryption.getInstance();
export const contractInteraction = new ContractInteraction();
