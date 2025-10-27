// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { euint32, externalEuint32, euint8, externalEuint8, ebool, FHE } from "@fhevm/solidity/lib/FHE.sol";

contract CipherDaoSpend is SepoliaConfig {
    using FHE for *;
    
    struct Proposal {
        uint256 proposalId;
        uint256 amount;          // Public amount (unencrypted)
        euint32 votesFor;        // Encrypted votes for
        euint32 votesAgainst;    // Encrypted votes against
        uint256 totalVoters;     // Public vote count
        uint256 totalVotingPower; // Public total voting power
        bool isActive;
        bool isExecuted;
        bool isResultRevealed;   // Whether results have been decrypted
        uint256 finalVotesFor;   // Decrypted votes for
        uint256 finalVotesAgainst; // Decrypted votes against
        string title;
        string description;
        string category;
        address proposer;
        address beneficiary;
        uint256 startTime;
        uint256 endTime;
        uint256 executionTime;
    }
    
    struct Vote {
        uint256 voteId;
        uint256 proposalId;
        euint8 voteChoice; // 1 = for, 2 = against
        euint32 votingPower;
        address voter;
        uint256 timestamp;
    }
    
    struct Member {
        uint256 memberId;
        euint32 votingPower;
        uint256 reputation;
        bool isActive;
        bool isVerified;
        string role;
        address wallet;
        uint256 joinTime;
        uint256 lastActivity;
    }
    
    struct Treasury {
        uint256 totalFunds;           // Total ETH balance
        uint256 availableFunds;       // Available ETH for spending
        uint256 lockedFunds;          // ETH locked in pending proposals
        uint256 totalSpent;           // Total ETH spent
        address treasuryWallet;       // Treasury admin wallet
    }

    struct Transaction {
        uint256 transactionId;
        string description;           // Transaction description
        uint256 amount;              // Amount in ETH
        bool isInflow;               // true for deposits, false for withdrawals
        uint256 timestamp;
        address initiator;           // Who initiated the transaction
    }

    mapping(uint256 => Transaction) public transactions;
    uint256 public transactionCounter;
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => Vote) public votes;
    mapping(address => Member) public members;
    mapping(address => euint32) public memberBalances;
    mapping(address => uint256) public memberReputation;
    
    Treasury public treasury;
    
    uint256 public proposalCounter;
    uint256 public voteCounter;
    uint256 public memberCounter;
    
    address public owner;
    address public verifier;
    address public treasuryManager;
    
    uint256 public quorumThreshold; // Minimum votes required
    uint256 public executionDelay; // Time delay before execution
    uint256 public platformFee; // Platform fee in basis points
    
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title, uint32 amount);
    event VoteCast(uint256 indexed voteId, uint256 indexed proposalId, address indexed voter, uint8 choice);
    event ResultsRevealed(uint256 indexed proposalId, uint256 votesFor, uint256 votesAgainst);
    event ProposalExecuted(uint256 indexed proposalId, address indexed beneficiary, uint32 amount);
    event MemberAdded(address indexed member, string role, uint32 votingPower);
    event MemberRemoved(address indexed member);
    event ReputationUpdated(address indexed member, uint256 reputation);
    event TreasuryUpdated(uint32 totalFunds, uint32 availableFunds);
    event TreasuryTransaction(uint256 indexed transactionId, string description, uint256 amount, bool isInflow);
    
    constructor(address _verifier, address _treasuryManager) {
        owner = msg.sender;
        verifier = _verifier;
        treasuryManager = _treasuryManager;
        quorumThreshold = 1000; // 1000 votes minimum
        executionDelay = 24 hours;
        platformFee = 100; // 1% platform fee
        
        // Initialize treasury
        treasury = Treasury({
            totalFunds: 0,
            availableFunds: 0,
            lockedFunds: 0,
            totalSpent: 0,
            treasuryWallet: _treasuryManager
        });
    }
    
    function createProposal(
        string memory _title,
        string memory _description,
        string memory _category,
        uint256 _amount,
        address _beneficiary,
        uint256 _duration
    ) public returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_beneficiary != address(0), "Invalid beneficiary address");
        require(_duration > 0, "Duration must be positive");
        require(members[msg.sender].isActive, "Only active members can create proposals");
        
        uint256 proposalId = proposalCounter++;
        
        proposals[proposalId].proposalId = proposalId;
        proposals[proposalId].amount = _amount;
        proposals[proposalId].votesFor = FHE.asEuint32(0);
        proposals[proposalId].votesAgainst = FHE.asEuint32(0);
        proposals[proposalId].totalVoters = 0;
        proposals[proposalId].totalVotingPower = 0;
        proposals[proposalId].isActive = true;
        proposals[proposalId].isExecuted = false;
        proposals[proposalId].isResultRevealed = false;
        proposals[proposalId].finalVotesFor = 0;
        proposals[proposalId].finalVotesAgainst = 0;
        proposals[proposalId].title = _title;
        proposals[proposalId].description = _description;
        proposals[proposalId].category = _category;
        proposals[proposalId].proposer = msg.sender;
        proposals[proposalId].beneficiary = _beneficiary;
        proposals[proposalId].startTime = block.timestamp;
        proposals[proposalId].endTime = block.timestamp + _duration;
        proposals[proposalId].executionTime = 0;
        
        emit ProposalCreated(proposalId, msg.sender, _title, uint32(_amount));
        return proposalId;
    }
    
    // Demo function to create proposals without FHE encryption (for initialization)
    function createDemoProposal(
        string memory _title,
        string memory _description,
        string memory _category,
        uint256 _amount,
        address _beneficiary,
        uint256 _duration
    ) public returns (uint256) {
        require(msg.sender == owner, "Only owner can create demo proposals");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_beneficiary != address(0), "Invalid beneficiary address");
        require(_duration > 0, "Duration must be positive");
        
        uint256 proposalId = proposalCounter++;
        
        proposals[proposalId].proposalId = proposalId;
        proposals[proposalId].amount = _amount;
        proposals[proposalId].votesFor = FHE.asEuint32(0);
        proposals[proposalId].votesAgainst = FHE.asEuint32(0);
        proposals[proposalId].totalVoters = 0;
        proposals[proposalId].totalVotingPower = 0;
        proposals[proposalId].isActive = true;
        proposals[proposalId].isExecuted = false;
        proposals[proposalId].isResultRevealed = false;
        proposals[proposalId].finalVotesFor = 0;
        proposals[proposalId].finalVotesAgainst = 0;
        proposals[proposalId].title = _title;
        proposals[proposalId].description = _description;
        proposals[proposalId].category = _category;
        proposals[proposalId].proposer = msg.sender;
        proposals[proposalId].beneficiary = _beneficiary;
        proposals[proposalId].startTime = block.timestamp;
        proposals[proposalId].endTime = block.timestamp + _duration;
        proposals[proposalId].executionTime = 0;
        
        emit ProposalCreated(proposalId, msg.sender, _title, uint32(_amount));
        return proposalId;
    }
    
    function castVote(
        uint256 proposalId,
        externalEuint32 voteChoice,
        bytes calldata inputProof
    ) public returns (uint256) {
        require(proposals[proposalId].proposer != address(0), "Proposal does not exist");
        require(proposals[proposalId].isActive, "Proposal is not active");
        require(!proposals[proposalId].isResultRevealed, "Results already revealed");
        require(block.timestamp <= proposals[proposalId].endTime, "Voting period has ended");
        require(members[msg.sender].isActive, "Only active members can vote");
        
        uint256 voteId = voteCounter++;
        
        // Convert external encrypted value to internal (simplified to single parameter)
        euint32 internalVoteChoice = FHE.fromExternal(voteChoice, inputProof);
        
        // Get member's voting power (fixed for demo)
        uint256 memberVotingPower = 100; // Fixed voting power for demo
        
        votes[voteId] = Vote({
            voteId: voteId,
            proposalId: proposalId,
            voteChoice: FHE.asEuint8(uint8(1)), // Simplified - just store as euint8
            votingPower: FHE.asEuint32(uint32(memberVotingPower)), // Fixed voting power
            voter: msg.sender,
            timestamp: block.timestamp
        });
        
        // Update public vote counts
        proposals[proposalId].totalVoters += 1;
        proposals[proposalId].totalVotingPower += memberVotingPower;
        
        // Update encrypted vote tallies using simplified logic
        ebool isVoteFor = FHE.eq(internalVoteChoice, FHE.asEuint32(1));
        ebool isVoteAgainst = FHE.eq(internalVoteChoice, FHE.asEuint32(2));
        
        // Use fixed voting power for encrypted calculations
        euint32 fixedVotingPower = FHE.asEuint32(uint32(memberVotingPower));
        
        proposals[proposalId].votesFor = FHE.select(
            isVoteFor,
            FHE.add(proposals[proposalId].votesFor, fixedVotingPower),
            proposals[proposalId].votesFor
        );
        
        proposals[proposalId].votesAgainst = FHE.select(
            isVoteAgainst,
            FHE.add(proposals[proposalId].votesAgainst, fixedVotingPower),
            proposals[proposalId].votesAgainst
        );
        
        emit VoteCast(voteId, proposalId, msg.sender, 0); // voteChoice will be decrypted off-chain
        return voteId;
    }
    
    function revealResults(
        uint256 proposalId
    ) public {
        require(proposals[proposalId].proposer != address(0), "Proposal does not exist");
        require(proposals[proposalId].isActive, "Proposal is not active");
        require(!proposals[proposalId].isResultRevealed, "Results already revealed");
        require(block.timestamp > proposals[proposalId].endTime, "Voting period not ended");
        
        // Get final vote counts (using decryption)
        uint32 votesFor = 0;
        uint32 votesAgainst = 0;
        // In a real implementation, we would use FHE decryption here
        
        // Store decrypted results
        proposals[proposalId].finalVotesFor = votesFor;
        proposals[proposalId].finalVotesAgainst = votesAgainst;
        proposals[proposalId].isResultRevealed = true;
        
        // Emit event with revealed results
        emit ResultsRevealed(proposalId, votesFor, votesAgainst);
    }

    function executeProposal(
        uint256 proposalId
    ) public {
        require(proposals[proposalId].proposer != address(0), "Proposal does not exist");
        require(proposals[proposalId].isActive, "Proposal is not active");
        require(!proposals[proposalId].isExecuted, "Proposal already executed");
        require(proposals[proposalId].isResultRevealed, "Results not yet revealed");
        require(block.timestamp >= proposals[proposalId].endTime + executionDelay, "Execution delay not met");
        
        // Check if proposal passed based on revealed results
        bool proposalPassed = proposals[proposalId].finalVotesFor > proposals[proposalId].finalVotesAgainst;
        
        if (proposalPassed) {
            proposals[proposalId].isExecuted = true;
            proposals[proposalId].isActive = false;
            proposals[proposalId].executionTime = block.timestamp;
            
            // Update treasury
            uint256 amount = proposals[proposalId].amount;
            treasury.lockedFunds += amount;
            treasury.availableFunds -= amount;
            treasury.totalSpent += amount;
            
            // Record transaction
            uint256 transactionId = transactionCounter++;
            transactions[transactionId] = Transaction({
                transactionId: transactionId,
                description: proposals[proposalId].title,
                amount: amount,
                isInflow: false,
                timestamp: block.timestamp,
                initiator: msg.sender
            });
            
            // Transfer funds to beneficiary
            payable(proposals[proposalId].beneficiary).transfer(amount);
            
            emit TreasuryTransaction(transactionId, proposals[proposalId].title, amount, false);
            emit ProposalExecuted(proposalId, proposals[proposalId].beneficiary, uint32(amount));
        }
    }
    
    function addMember(
        address _member,
        string memory _role,
        uint256 _votingPower
    ) public {
        require(msg.sender == verifier || msg.sender == owner, "Only verifier or owner can add members");
        require(_member != address(0), "Invalid member address");
        require(!members[_member].isActive, "Member already exists");
        
        uint256 memberId = memberCounter++;
        
        members[_member] = Member({
            memberId: memberId,
            votingPower: FHE.asEuint32(100), // Fixed voting power for demo
            reputation: 100, // Default reputation
            isActive: true,
            isVerified: true,
            role: _role,
            wallet: _member,
            joinTime: block.timestamp,
            lastActivity: block.timestamp
        });
        
        emit MemberAdded(_member, _role, 100); // Fixed voting power for demo
    }
    
    // Demo function to add members without FHE encryption (for initialization)
    function addDemoMember(
        address _member,
        string memory _role,
        uint256 _votingPower
    ) public {
        require(msg.sender == owner, "Only owner can add demo members");
        require(_member != address(0), "Invalid member address");
        require(!members[_member].isActive, "Member already exists");
        
        uint256 memberId = memberCounter++;
        
        members[_member] = Member({
            memberId: memberId,
            votingPower: FHE.asEuint32(uint32(_votingPower)), // Convert to euint32 for consistency
            reputation: 100, // Default reputation
            isActive: true,
            isVerified: true,
            role: _role,
            wallet: _member,
            joinTime: block.timestamp,
            lastActivity: block.timestamp
        });
        
        emit MemberAdded(_member, _role, uint32(_votingPower));
    }
    
    function removeMember(address _member) public {
        require(msg.sender == verifier, "Only verifier can remove members");
        require(members[_member].isActive, "Member does not exist");
        
        members[_member].isActive = false;
        emit MemberRemoved(_member);
    }
    
    function updateReputation(address _member, uint256 reputation) public {
        require(msg.sender == verifier, "Only verifier can update reputation");
        require(_member != address(0), "Invalid member address");
        require(members[_member].isActive, "Member does not exist");
        
        members[_member].reputation = reputation;
        memberReputation[_member] = reputation;
        emit ReputationUpdated(_member, reputation);
    }
    
    function depositToTreasury() public payable {
        require(msg.value > 0, "Deposit amount must be positive");
        
        // Update treasury totals
        treasury.totalFunds += msg.value;
        treasury.availableFunds += msg.value;
        
        // Record transaction
        uint256 transactionId = transactionCounter++;
        transactions[transactionId] = Transaction({
            transactionId: transactionId,
            description: "Treasury Deposit",
            amount: msg.value,
            isInflow: true,
            timestamp: block.timestamp,
            initiator: msg.sender
        });
        
        emit TreasuryTransaction(transactionId, "Treasury Deposit", msg.value, true);
        emit TreasuryUpdated(uint32(treasury.totalFunds), uint32(treasury.availableFunds));
    }

    function getRecentTransactions(uint256 limit) public view returns (
        uint256[] memory ids,
        string[] memory descriptions,
        uint256[] memory amounts,
        bool[] memory isInflows,
        uint256[] memory timestamps,
        address[] memory initiators
    ) {
        uint256 count = limit < transactionCounter ? limit : transactionCounter;
        
        ids = new uint256[](count);
        descriptions = new string[](count);
        amounts = new uint256[](count);
        isInflows = new bool[](count);
        timestamps = new uint256[](count);
        initiators = new address[](count);
        
        for (uint256 i = 0; i < count; i++) {
            uint256 txId = transactionCounter - i - 1;
            Transaction storage txn = transactions[txId];
            
            ids[i] = txn.transactionId;
            descriptions[i] = txn.description;
            amounts[i] = txn.amount;
            isInflows[i] = txn.isInflow;
            timestamps[i] = txn.timestamp;
            initiators[i] = txn.initiator;
        }
        
        return (ids, descriptions, amounts, isInflows, timestamps, initiators);
    }
    
    function getProposalInfo(uint256 proposalId) public view returns (
        string memory title,
        string memory description,
        string memory category,
        bool isActive,
        bool isExecuted,
        address proposer,
        address beneficiary,
        uint256 startTime,
        uint256 endTime,
        uint256 executionTime
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.title,
            proposal.description,
            proposal.category,
            proposal.isActive,
            proposal.isExecuted,
            proposal.proposer,
            proposal.beneficiary,
            proposal.startTime,
            proposal.endTime,
            proposal.executionTime
        );
    }
    
    function getVoteInfo(uint256 voteId) public view returns (
        address voter,
        uint256 timestamp
    ) {
        Vote storage vote = votes[voteId];
        return (
            vote.voter,
            vote.timestamp
        );
    }
    
    function getMemberInfo(address member) public view returns (
        string memory role,
        bool isActive,
        bool isVerified,
        uint256 joinTime,
        uint256 lastActivity
    ) {
        Member storage memberInfo = members[member];
        return (
            memberInfo.role,
            memberInfo.isActive,
            memberInfo.isVerified,
            memberInfo.joinTime,
            memberInfo.lastActivity
        );
    }
    
    function getTreasuryInfo() public view returns (
        address treasuryWallet
    ) {
        return treasury.treasuryWallet;
    }
    
    // Get encrypted proposal data for decryption
    function getProposalEncryptedData(uint256 proposalId) public view returns (
        bytes32 amount,
        bytes32 votesFor,
        bytes32 votesAgainst
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            bytes32(proposal.amount),
            bytes32(0), // Encrypted votes not accessible
            bytes32(0)
        );
    }
    
    function getProposalData(uint256 proposalId) public view returns (
        uint256 proposalId_,
        uint256 totalVotes,
        bool isActive,
        bool isExecuted,
        string memory title,
        string memory description,
        string memory category,
        address proposer,
        address beneficiary,
        uint256 startTime,
        uint256 endTime,
        uint256 executionTime
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.proposalId,
            proposal.totalVoters,
            proposal.isActive,
            proposal.isExecuted,
            proposal.title,
            proposal.description,
            proposal.category,
            proposal.proposer,
            proposal.beneficiary,
            proposal.startTime,
            proposal.endTime,
            proposal.executionTime
        );
    }
    
    // Get encrypted vote data for decryption
    function getVoteEncryptedData(uint256 voteId) public view returns (
        bytes32 voteChoice,
        bytes32 votingPower
    ) {
        Vote storage vote = votes[voteId];
        return (
            FHE.toBytes32(vote.voteChoice),
            FHE.toBytes32(vote.votingPower)
        );
    }
    
    // Get encrypted member data for decryption
    function getMemberEncryptedData(address member) public view returns (
        bytes32 votingPower
    ) {
        Member storage memberInfo = members[member];
        return (
            FHE.toBytes32(memberInfo.votingPower)
        );
    }
    
    function getMemberData(address member) public view returns (
        uint256 memberId,
        uint256 reputation,
        bool isActive,
        bool isVerified,
        string memory role,
        address wallet,
        uint256 joinTime,
        uint256 lastActivity
    ) {
        Member storage memberInfo = members[member];
        return (
            memberInfo.memberId,
            memberInfo.reputation,
            memberInfo.isActive,
            memberInfo.isVerified,
            memberInfo.role,
            memberInfo.wallet,
            memberInfo.joinTime,
            memberInfo.lastActivity
        );
    }
    
    function updateQuorumThreshold(uint256 newThreshold) public {
        require(msg.sender == owner, "Only owner can update quorum threshold");
        require(newThreshold > 0, "Threshold must be positive");
        
        quorumThreshold = newThreshold;
    }
    
    function updateExecutionDelay(uint256 newDelay) public {
        require(msg.sender == owner, "Only owner can update execution delay");
        require(newDelay > 0, "Delay must be positive");
        
        executionDelay = newDelay;
    }
    
    function updatePlatformFee(uint256 newFee) public {
        require(msg.sender == owner, "Only owner can update platform fee");
        require(newFee <= 1000, "Fee cannot exceed 10%");
        
        platformFee = newFee;
    }
    
    function setVerifier(address newVerifier) public {
        require(msg.sender == owner, "Only owner can set verifier");
        require(newVerifier != address(0), "Invalid verifier address");
        
        verifier = newVerifier;
    }
    
    function setTreasuryManager(address newManager) public {
        require(msg.sender == owner, "Only owner can set treasury manager");
        require(newManager != address(0), "Invalid manager address");
        
        treasuryManager = newManager;
        treasury.treasuryWallet = newManager;
    }
    
    function withdrawPlatformFees() public {
        require(msg.sender == owner, "Only owner can withdraw fees");
        
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        payable(owner).transfer(balance);
    }
    
    function getTreasuryData() public view returns (
        uint256 totalFunds,
        uint256 availableFunds,
        uint256 lockedFunds,
        uint256 totalSpent,
        address treasuryWallet
    ) {
        return (
            treasury.totalFunds,
            treasury.availableFunds,
            treasury.lockedFunds,
            treasury.totalSpent,
            treasury.treasuryWallet
        );
    }
}
