// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { euint32, externalEuint32, euint8, ebool, FHE } from "@fhevm/solidity/lib/FHE.sol";

contract NeonCipherBet is SepoliaConfig {
    using FHE for *;
    
    struct Match {
        euint32 matchId;
        euint32 teamAOdds;
        euint32 teamBOdds;
        euint32 totalBets;
        euint32 teamABets;
        euint32 teamBBets;
        bool isActive;
        bool isResolved;
        string game;
        string tournament;
        string teamA;
        string teamB;
        address organizer;
        uint256 startTime;
        uint256 endTime;
        uint8 winner; // 0 = not resolved, 1 = teamA, 2 = teamB
    }
    
    struct Bet {
        euint32 betId;
        euint32 amount;
        euint32 matchId;
        euint8 teamChoice; // 1 = teamA, 2 = teamB
        address bettor;
        uint256 timestamp;
        bool isClaimed;
    }
    
    struct UserStats {
        euint32 totalBets;
        euint32 totalWon;
        euint32 totalLost;
        euint32 winStreak;
        euint32 reputation;
    }
    
    mapping(uint256 => Match) public matches;
    mapping(uint256 => Bet) public bets;
    mapping(address => UserStats) public userStats;
    mapping(address => euint32) public userBalances;
    
    uint256 public matchCounter;
    uint256 public betCounter;
    
    address public owner;
    address public verifier;
    uint256 public platformFee; // in basis points (100 = 1%)
    
    event MatchCreated(uint256 indexed matchId, address indexed organizer, string game, string teamA, string teamB);
    event BetPlaced(uint256 indexed betId, uint256 indexed matchId, address indexed bettor, uint8 teamChoice);
    event MatchResolved(uint256 indexed matchId, uint8 winner);
    event BetClaimed(uint256 indexed betId, address indexed bettor, uint32 amount);
    event ReputationUpdated(address indexed user, uint32 reputation);
    
    constructor(address _verifier) {
        owner = msg.sender;
        verifier = _verifier;
        platformFee = 250; // 2.5% platform fee
    }
    
    function createMatch(
        string memory _game,
        string memory _tournament,
        string memory _teamA,
        string memory _teamB,
        uint256 _startTime,
        uint256 _duration
    ) public returns (uint256) {
        require(bytes(_game).length > 0, "Game name cannot be empty");
        require(bytes(_teamA).length > 0, "Team A name cannot be empty");
        require(bytes(_teamB).length > 0, "Team B name cannot be empty");
        require(_startTime > block.timestamp, "Start time must be in the future");
        require(_duration > 0, "Duration must be positive");
        
        uint256 matchId = matchCounter++;
        
        matches[matchId] = Match({
            matchId: FHE.asEuint32(0), // Will be set properly later
            teamAOdds: FHE.asEuint32(200), // 2.00 odds (encrypted)
            teamBOdds: FHE.asEuint32(200), // 2.00 odds (encrypted)
            totalBets: FHE.asEuint32(0),
            teamABets: FHE.asEuint32(0),
            teamBBets: FHE.asEuint32(0),
            isActive: true,
            isResolved: false,
            game: _game,
            tournament: _tournament,
            teamA: _teamA,
            teamB: _teamB,
            organizer: msg.sender,
            startTime: _startTime,
            endTime: _startTime + _duration,
            winner: 0
        });
        
        emit MatchCreated(matchId, msg.sender, _game, _teamA, _teamB);
        return matchId;
    }
    
    function placeBet(
        uint256 matchId,
        externalEuint32 amount,
        externalEuint8 teamChoice,
        bytes calldata inputProof
    ) public payable returns (uint256) {
        require(matches[matchId].organizer != address(0), "Match does not exist");
        require(matches[matchId].isActive, "Match is not active");
        require(block.timestamp < matches[matchId].startTime, "Match has already started");
        require(msg.value > 0, "Bet amount must be greater than 0");
        
        uint256 betId = betCounter++;
        
        // Convert external encrypted values to internal
        euint32 internalAmount = FHE.fromExternal(amount, inputProof);
        euint8 internalTeamChoice = FHE.fromExternal(teamChoice, inputProof);
        
        bets[betId] = Bet({
            betId: FHE.asEuint32(0), // Will be set properly later
            amount: internalAmount,
            matchId: FHE.asEuint32(0), // Will be set to matchId
            teamChoice: internalTeamChoice,
            bettor: msg.sender,
            timestamp: block.timestamp,
            isClaimed: false
        });
        
        // Update match totals
        matches[matchId].totalBets = FHE.add(matches[matchId].totalBets, internalAmount);
        
        // Update team-specific bets based on choice
        // Note: This is a simplified version. In practice, you'd need conditional logic
        // to add to either teamABets or teamBBets based on teamChoice
        
        // Update user stats
        userStats[msg.sender].totalBets = FHE.add(userStats[msg.sender].totalBets, internalAmount);
        
        emit BetPlaced(betId, matchId, msg.sender, 0); // teamChoice will be decrypted off-chain
        return betId;
    }
    
    function resolveMatch(
        uint256 matchId,
        uint8 winner
    ) public {
        require(msg.sender == verifier, "Only verifier can resolve matches");
        require(matches[matchId].organizer != address(0), "Match does not exist");
        require(matches[matchId].isActive, "Match is not active");
        require(block.timestamp > matches[matchId].endTime, "Match has not ended yet");
        require(winner == 1 || winner == 2, "Winner must be 1 (teamA) or 2 (teamB)");
        
        matches[matchId].isResolved = true;
        matches[matchId].isActive = false;
        matches[matchId].winner = winner;
        
        emit MatchResolved(matchId, winner);
    }
    
    function claimWinnings(
        uint256 betId,
        bytes calldata inputProof
    ) public {
        Bet storage bet = bets[betId];
        require(bet.bettor == msg.sender, "Only bettor can claim winnings");
        require(!bet.isClaimed, "Bet already claimed");
        
        uint256 matchId = 0; // This would need to be decrypted from bet.matchId
        Match storage match_ = matches[matchId];
        require(match_.isResolved, "Match not resolved yet");
        
        // Check if bet won (simplified - in practice you'd decrypt teamChoice and compare with winner)
        bool isWinner = true; // This would be determined by decrypting and comparing
        
        if (isWinner) {
            // Calculate winnings (simplified)
            uint256 winnings = msg.value * 2; // This would be calculated based on odds
            
            // Update user stats
            userStats[msg.sender].totalWon = FHE.add(userStats[msg.sender].totalWon, FHE.asEuint32(0)); // Would be actual amount
            userStats[msg.sender].winStreak = FHE.add(userStats[msg.sender].winStreak, FHE.asEuint32(1));
            
            // Transfer winnings
            payable(msg.sender).transfer(winnings);
            
            emit BetClaimed(betId, msg.sender, 0); // Amount would be decrypted
        } else {
            // Update user stats for loss
            userStats[msg.sender].totalLost = FHE.add(userStats[msg.sender].totalLost, FHE.asEuint32(0)); // Would be actual amount
            userStats[msg.sender].winStreak = FHE.asEuint32(0);
        }
        
        bet.isClaimed = true;
    }
    
    function updateReputation(address user, euint32 reputation) public {
        require(msg.sender == verifier, "Only verifier can update reputation");
        require(user != address(0), "Invalid user address");
        
        userStats[user].reputation = reputation;
        emit ReputationUpdated(user, 0); // FHE.decrypt(reputation) - will be decrypted off-chain
    }
    
    function getMatchInfo(uint256 matchId) public view returns (
        string memory game,
        string memory tournament,
        string memory teamA,
        string memory teamB,
        bool isActive,
        bool isResolved,
        address organizer,
        uint256 startTime,
        uint256 endTime,
        uint8 winner
    ) {
        Match storage match_ = matches[matchId];
        return (
            match_.game,
            match_.tournament,
            match_.teamA,
            match_.teamB,
            match_.isActive,
            match_.isResolved,
            match_.organizer,
            match_.startTime,
            match_.endTime,
            match_.winner
        );
    }
    
    function getBetInfo(uint256 betId) public view returns (
        address bettor,
        uint256 timestamp,
        bool isClaimed
    ) {
        Bet storage bet = bets[betId];
        return (
            bet.bettor,
            bet.timestamp,
            bet.isClaimed
        );
    }
    
    function getUserStats(address user) public view returns (
        uint8 totalBets,
        uint8 totalWon,
        uint8 totalLost,
        uint8 winStreak,
        uint8 reputation
    ) {
        UserStats storage stats = userStats[user];
        return (
            0, // FHE.decrypt(stats.totalBets) - will be decrypted off-chain
            0, // FHE.decrypt(stats.totalWon) - will be decrypted off-chain
            0, // FHE.decrypt(stats.totalLost) - will be decrypted off-chain
            0, // FHE.decrypt(stats.winStreak) - will be decrypted off-chain
            0  // FHE.decrypt(stats.reputation) - will be decrypted off-chain
        );
    }
    
    function withdrawPlatformFees() public {
        require(msg.sender == owner, "Only owner can withdraw fees");
        
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        payable(owner).transfer(balance);
    }
    
    function updatePlatformFee(uint256 newFee) public {
        require(msg.sender == owner, "Only owner can update fee");
        require(newFee <= 1000, "Fee cannot exceed 10%");
        
        platformFee = newFee;
    }
    
    function setVerifier(address newVerifier) public {
        require(msg.sender == owner, "Only owner can set verifier");
        require(newVerifier != address(0), "Invalid verifier address");
        
        verifier = newVerifier;
    }
}
