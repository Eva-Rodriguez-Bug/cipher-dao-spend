# 本地开发指南

## 🚀 快速开始

### 1. 启动本地Hardhat节点

```bash
# 终端1: 启动本地Hardhat节点
npm run chain
# 或者
npx hardhat node
```

### 2. 部署合约到本地网络

```bash
# 终端2: 部署合约
npm run deploy:localhost
```

### 3. 初始化合约数据

```bash
# 终端3: 初始化demo数据
npm run initialize:localhost
```

### 4. 启动前端开发服务器

```bash
# 终端4: 启动前端
npm run dev
```

## 🔧 环境配置

### 本地开发模式

在项目根目录创建 `.env.local` 文件：

```bash
# 启用本地开发模式
VITE_USE_LOCAL=true

# 本地网络配置
LOCAL_RPC_URL=http://127.0.0.1:8545
LOCAL_CHAIN_ID=31337

# 合约地址（部署后更新）
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

### MetaMask配置

1. 打开MetaMask
2. 添加网络：
   - **网络名称**: Hardhat Local
   - **RPC URL**: `http://127.0.0.1:8545`
   - **链ID**: `31337`
   - **货币符号**: `ETH`

## 📋 开发流程

### 完整开发流程

```bash
# 1. 启动本地节点
npm run chain

# 2. 部署合约
npm run deploy:localhost

# 3. 初始化数据
npm run initialize:localhost

# 4. 测试合约
npm run test:contract:localhost

# 5. 启动前端
npm run dev
```

### 网络切换

- **本地开发**: 设置 `VITE_USE_LOCAL=true`
- **Sepolia测试网**: 设置 `VITE_USE_LOCAL=false` 或不设置

## 🎯 功能特性

### 本地开发模式
- ✅ 跳过FHE SDK初始化
- ✅ 使用demo函数创建提案
- ✅ 无需relayer服务
- ✅ 快速测试和开发

### 生产模式
- ✅ 完整的FHE加密
- ✅ Sepolia测试网部署
- ✅ Relayer服务集成

## 🔍 故障排除

### 常见问题

1. **MetaMask连接问题**
   - 确保添加了Hardhat Local网络
   - 检查RPC URL和链ID

2. **合约部署失败**
   - 确保Hardhat节点正在运行
   - 检查私钥配置

3. **前端无法连接**
   - 检查环境变量设置
   - 确保合约地址正确

### 重置开发环境

```bash
# 停止所有进程
pkill -f "hardhat\|vite"

# 清理缓存
rm -rf node_modules/.cache
rm -rf artifacts
rm -rf cache

# 重新安装和启动
npm install
npm run chain
npm run deploy:localhost
npm run dev
```

## 📚 参考资源

- [FHEVM React Template](https://github.com/zama-ai/fhevm-react-template)
- [Hardhat文档](https://hardhat.org/docs)
- [FHEVM文档](https://docs.zama.ai/fhevm)
