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

  // Encrypt vote choice (matching CipherVoteHaven pattern)
  public async encryptVoteData(instance: any, contractAddress: string, userAddress: string, data: { voteChoice: number }): Promise<{ handles: string[], inputProof: string }> {
    if (!instance) {
      throw new Error('FHE instance not provided');
    }

    console.log('🚀 Starting FHE vote data encryption process...');
    console.log('📊 Input data:', {
      contractAddress,
      userAddress,
      data
    });
    
    console.log('🔄 Step 1: Creating encrypted input...');
    const input = instance.createEncryptedInput(contractAddress, userAddress);
    console.log('✅ Step 1 completed: Encrypted input created');
    
    console.log('🔄 Step 2: Adding encrypted data...');
    
    // Validate vote choice is within 32-bit range
    const max32Bit = 4294967295; // 2^32 - 1
    
    if (data.voteChoice !== undefined) {
      console.log('📊 Adding vote choice:', data.voteChoice);
      if (data.voteChoice > max32Bit) {
        throw new Error(`Vote choice ${data.voteChoice} exceeds 32-bit limit`);
      }
      input.add32(BigInt(data.voteChoice));
    }
    
    console.log('✅ Step 2 completed: All data added to encrypted input');
    
    console.log('🔄 Step 3: Encrypting data...');
    const encryptedInput = await input.encrypt();
    console.log('✅ Step 3 completed: Data encrypted successfully');
    console.log('📊 Encrypted handles count:', encryptedInput.handles.length);
    
    console.log('🔄 Step 4: Converting handles to hex format...');
    const handles = encryptedInput.handles.map((handle, index) => {
      const hex = this.convertToBytes32(handle);
      console.log(`📊 Handle ${index}: ${hex.substring(0, 10)}... (${hex.length} chars)`);
      return hex;
    });
    
    const proof = `0x${Array.from(encryptedInput.inputProof)
      .map((b: number) => b.toString(16).padStart(2, '0')).join('')}`;
    console.log('📊 Proof length:', proof.length);
    
    console.log('🎉 Vote data encryption completed successfully!');
    console.log('📊 Final result:', {
      handlesCount: handles.length,
      proofLength: proof.length,
      handles: handles.map(h => h.substring(0, 10) + '...')
    });
    
    return {
      handles,
      inputProof: proof
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

  // Convert FHE handle to proper hex format (32 bytes) - matching CipherVoteHaven
  private convertToBytes32(handle: any): string {
    let hex = '';
    
    try {
      if (handle instanceof Uint8Array) {
        hex = `0x${Array.from(handle).map(b => b.toString(16).padStart(2, '0')).join('')}`;
      } else if (typeof handle === 'string') {
        hex = handle.startsWith('0x') ? handle : `0x${handle}`;
      } else if (Array.isArray(handle)) {
        hex = `0x${handle.map(b => b.toString(16).padStart(2, '0')).join('')}`;
      } else if (handle && typeof handle === 'object' && handle.data) {
        // Handle FHE SDK object format
        hex = `0x${Array.from(handle.data).map(b => b.toString(16).padStart(2, '0')).join('')}`;
      } else {
        hex = `0x${handle.toString()}`;
      }
      
      // Ensure exactly 32 bytes (66 characters including 0x)
      if (hex.length < 66) {
        hex = hex.padEnd(66, '0');
      } else if (hex.length > 66) {
        hex = hex.substring(0, 66);
      }
      
      console.log('🔧 Converted hex:', hex.substring(0, 10) + '...', 'Length:', hex.length);
      return hex;
    } catch (error) {
      console.error('❌ Error converting hex:', error);
      console.log('📊 Handle type:', typeof handle);
      console.log('📊 Handle value:', handle);
      throw new Error(`Failed to convert handle to hex: ${error.message}`);
    }
  }
}

// Smart contract interaction utilities for DAO governance
export class ContractInteraction {
  private client: any;
  private walletClient: any;

  constructor() {
    console.log('Using Sepolia network for FHE operations');
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
    userAddress: string,
    fheInstance: any
  ): Promise<string> {
    if (!this.walletClient) {
      throw new Error('Wallet client not set');
    }

    const fhe = FHEEncryption.getInstance();
    await fhe.initialize(fheInstance);
    
    // Encrypt the vote data (matching CipherVoteHaven pattern)
    const encryptedData = await fhe.encryptVoteData(fheInstance, CONTRACT_ADDRESS, userAddress, { voteChoice });

    try {
      // Call the smart contract (matching CipherVoteHaven pattern)
      const hash = await this.walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'castVote',
        args: [
          BigInt(proposalId),
          encryptedData.handles[0] as `0x${string}`,
          encryptedData.inputProof as `0x${string}`
        ],
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
