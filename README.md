# 🛡️ Cipher DAO Spend

> **The Future of Private DAO Governance** 🏛️

Transform your DAO governance experience with cutting-edge FHE encryption technology. Vote on proposals and manage treasury spending while keeping your voting choices completely private until results are revealed.

## 🚀 What Makes Us Different

- **🔒 Zero-Knowledge Voting**: Your votes remain encrypted until results are revealed
- **⚡ Lightning-Fast**: Instant wallet connections with RainbowKit
- **🌐 Decentralized**: Built on Ethereum with full transparency
- **🎯 Smart Contracts**: Automated proposal execution with FHE-enabled privacy
- **🛡️ Bulletproof Security**: End-to-end encryption for maximum privacy
- **💰 Treasury Management**: Secure fund allocation with encrypted spending

## 🛠️ Tech Arsenal

| Category | Technology |
|----------|------------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Blockchain** | Ethereum Sepolia Testnet |
| **Wallets** | RainbowKit + Wagmi + Viem |
| **Encryption** | FHE via Zama Protocol |
| **Smart Contracts** | Solidity with FHE Support |

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/Eva-Rodriguez-Bug/cipher-dao-spend.git
cd cipher-dao-spend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup
Create `.env.local`:
```env
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/b18fb7e6ca7045ac83c41157ab93f990
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=2ec9743d0d0cd7fb94dee1a7e6d33475
NEXT_PUBLIC_INFURA_API_KEY=b18fb7e6ca7045ac83c41157ab93f990
NEXT_PUBLIC_RPC_URL=https://1rpc.io/sepolia
```

## 🎯 How It Works

```mermaid
graph TD
    A[Connect Wallet] --> B[View Proposals]
    B --> C[Cast Encrypted Vote]
    C --> D[FHE Encryption]
    D --> E[Wait for Results]
    E --> F[Automatic Execution]
```

1. **🔗 Connect**: Link your crypto wallet securely
2. **📋 Propose**: Create spending proposals for DAO funds
3. **🗳️ Vote**: Cast encrypted votes on proposals
4. **⏳ Wait**: Results revealed after voting period
5. **💰 Execute**: Automatic fund allocation to approved proposals

## 📁 Project Architecture

```
cipher-dao-spend/
├── 🎨 src/
│   ├── components/     # React components
│   ├── pages/         # Route pages
│   ├── lib/           # Utilities & configs
│   └── hooks/         # Custom hooks
├── 📜 contracts/
│   └── CipherDaoSpend.sol  # FHE smart contract
└── 📚 docs/           # Documentation
```

## 🚀 Deployment

### Vercel (Recommended)
1. Fork this repository
2. Connect to Vercel
3. Set environment variables
4. Deploy! 🎉

### Manual Build
```bash
npm run build
npm run preview
```

## 🎮 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint checks |

## 🏛️ DAO Features

### Proposal Management
- Create spending proposals with detailed descriptions
- Categorize proposals (Marketing, Development, Community, etc.)
- Set voting periods and execution delays
- Track proposal status and voting results

### Treasury Management
- View encrypted treasury balance
- Monitor fund allocation and spending
- Track transaction history
- Manage locked and available funds

### Member Management
- Add/remove DAO members
- Assign voting power and roles
- Track member reputation
- Monitor member activity

### Voting System
- FHE encrypted voting
- Private vote choices until results
- Weighted voting based on reputation
- Automatic proposal execution

## 🤝 Contributing

We welcome contributions! Here's how:

1. 🍴 Fork the repository
2. 🌿 Create a feature branch
3. ✨ Make your changes
4. 🧪 Test thoroughly
5. 📤 Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 🐛 **Bug Reports**: [Open an issue](https://github.com/Eva-Rodriguez-Bug/cipher-dao-spend/issues)
- 💡 **Feature Requests**: [Start a discussion](https://github.com/Eva-Rodriguez-Bug/cipher-dao-spend/discussions)
- 📧 **Contact**: [GitHub Issues](https://github.com/Eva-Rodriguez-Bug/cipher-dao-spend/issues)

---

<div align="center">

**🛡️ Built with ❤️ for the future of private DAO governance 🛡️**

[![GitHub stars](https://img.shields.io/github/stars/Eva-Rodriguez-Bug/cipher-dao-spend?style=social)](https://github.com/Eva-Rodriguez-Bug/cipher-dao-spend)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>