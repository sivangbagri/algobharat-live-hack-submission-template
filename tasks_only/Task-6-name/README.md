# On-Demand Tokenization Smart Contract

A TypeScript smart contract for Algorand that enables secure re-issuance of lost or recurring tokens with identical metadata and built-in abuse prevention mechanisms.

## 🌟 Overview

This project implements an advanced smart contract solution for the **On-Demand Tokenization** challenge. The contract allows users to securely re-mint lost tokens while preventing abuse through:

- **User Registration System**: Secure identification using hashed user identifiers
- **Metadata Preservation**: Re-issued tokens maintain identical metadata to originals
- **Abuse Prevention**: Cooldown periods and reissuance limits
- **Owner Controls**: Administrative functions for contract management

## 🎯 Features

### Core Functionality
- ✅ **Token Registration**: Register users and their original token metadata
- ✅ **On-Demand Reissuance**: Create new ASAs with identical metadata
- ✅ **Eligibility Checking**: Verify if a user can reissue tokens
- ✅ **User Information**: Query user token records and statistics

### Security & Abuse Prevention
- 🛡️ **Cooldown Periods**: Configurable time delays between reissuances
- 🛡️ **Reissuance Limits**: Maximum number of reissuances per user
- 🛡️ **Owner-Only Functions**: Administrative controls restricted to contract owner
- 🛡️ **Input Validation**: Comprehensive checks for all operations

### Technical Features
- 🔧 **TypeScript Implementation**: Full type safety and modern development
- 🔧 **AlgoKit Integration**: Professional development workflow
- 🔧 **Comprehensive Testing**: Unit tests for all functionality
- 🔧 **Demo Scripts**: Interactive demonstrations of features

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **AlgoKit** CLI tool
- **Docker** (for LocalNet)

### Installation

1. **Clone and setup the project:**
```bash
# If using AlgoKit template
algokit init -t typescript

# Or setup manually
git clone <your-repo>
cd on-demand-tokenization
npm install
```

2. **Start Algorand LocalNet:**
```bash
algokit localnet start
```

3. **Build the project:**
```bash
npm run build
```

## 📖 Usage Guide

### 1. Deploy the Contract

```bash
npm run deploy
```

This will:
- Deploy the contract to LocalNet
- Display the Application ID and Address
- Setup the contract with default configuration

### 2. Run the Interactive Demo

```bash
npm run demo
```

The demo showcases:
- Multiple user registrations
- Token reissuance process
- Abuse prevention mechanisms
- Real-world scenarios

### 3. Run Tests

```bash
npm test
```

Tests cover:
- Contract deployment
- User registration
- Token reissuance
- Security mechanisms
- Error conditions

## 🔧 Contract API

### Registration Functions

#### `registerUserToken(userId, originalAssetId, tokenName, unitName, tokenUrl, metadataHash)`
Register a user's original token for future reissuance.

**Parameters:**
- `userId`: Unique identifier for the user (recommend hashing)
- `originalAssetId`: ID of the original ASA
- `tokenName`: Name of the token
- `unitName`: Unit name of the token
- `tokenUrl`: URL for token metadata
- `metadataHash`: Hash of the token metadata

**Access:** Owner only

### Reissuance Functions

#### `reissueToken(userId)`
Create a new token with identical metadata for a registered user.

**Parameters:**
- `userId`: The user's identifier

**Returns:** New ASA ID

**Requirements:**
- User must be registered
- Cooldown period must have passed
- Reissuance limit not exceeded

#### `canReissueToken(userId)`
Check if a user is eligible for token reissuance.

**Parameters:**
- `userId`: The user's identifier

**Returns:** Boolean indicating eligibility

### Query Functions

#### `getUserTokenInfo(userId)`
Get detailed information about a user's token record.

**Parameters:**
- `userId`: The user's identifier

**Returns:** UserTokenRecord object containing:
- `originalAssetId`: Original token ID
- `lastReissueTime`: Timestamp of last reissuance
- `reissueCount`: Number of reissuances performed
- `tokenMetadata`: Encoded token metadata

### Administrative Functions

#### `updateConfig(maxReissues, cooldownPeriod)`
Update contract configuration parameters.

**Parameters:**
- `maxReissues`: Maximum reissuances per user
- `cooldownPeriod`: Cooldown period in seconds

**Access:** Owner only

## 🏗️ Project Structure

```
on-demand-tokenization/
├── src/
│   ├── contracts/
│   │   ├── OnDemandTokenizationContract.ts   # Main contract
│   │   └── clients/                          # Generated clients
│   └── utils/
│       └── network.ts                        # Network utilities
├── scripts/
│   ├── deploy.ts                            # Deployment script
│   └── demo.ts                              # Interactive demo
├── __tests__/
│   └── contract.test.ts                     # Test suite
├── artifacts/                               # Compiled contracts
├── package.json                             # Dependencies
├── tsconfig.json                           # TypeScript config
├── .algokit.yaml                           # AlgoKit config
└── README.md                               # This file
```

## 🔒 Security Considerations

### Anti-Abuse Mechanisms

1. **Cooldown Periods**: Default 24-hour cooldown between reissuances
2. **Reissuance Limits**: Maximum 5 reissuances per user by default
3. **Owner Controls**: Critical functions restricted to contract owner
4. **Input Validation**: All inputs validated before processing

### Best Practices

- **Hash User IDs**: Use hashed identifiers for privacy
- **Monitor Usage**: Track reissuance patterns for abuse detection
- **Regular Updates**: Keep configuration parameters updated
- **Audit Logs**: Monitor all contract interactions

## 🧪 Testing

The project includes comprehensive tests covering:

- ✅ Contract deployment and initialization
- ✅ User registration workflows
- ✅ Token reissuance functionality
- ✅ Security and abuse prevention
- ✅ Error handling and edge cases
- ✅ Owner-only function restrictions

Run tests with different configurations:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## 📊 Configuration

### Default Settings

- **Maximum Reissuances**: 5 per user
- **Cooldown Period**: 86,400 seconds (24 hours)
- **Token Supply**: 1 (NFT standard)
- **Decimals**: 0 (whole tokens only)

### Customization

Update settings via the `updateConfig` function:

```typescript
await appClient.updateConfig({
  maxReissues: 10n,        // Allow 10 reissuances
  cooldownPeriod: 3600n,   // 1-hour cooldown
});
```

## 🌐 Network Support

### LocalNet (Default)
- **Algod**: `http://localhost:4001`
- **Indexer**: `http://localhost:8980`
- **Token**: Standard LocalNet token

### TestNet
- **Algod**: `https://testnet-api.algonode.cloud`
- **Indexer**: `https://testnet-indexer.algonode.cloud`

### MainNet
- **Algod**: `https://mainnet-api.algonode.cloud`
- **Indexer**: `https://mainnet-indexer.algonode.cloud`

Set network via environment variable:
```bash
export ALGORAND_NETWORK=testnet
npm run deploy
```

## 🚀 Deployment Guide

### LocalNet Deployment

1. **Start LocalNet:**
```bash
algokit localnet start
```

2. **Deploy:**
```bash
npm run deploy
```

### TestNet Deployment

1. **Set network:**
```bash
export ALGORAND_NETWORK=testnet
```

2. **Configure funding account** (update scripts/deploy.ts)

3. **Deploy:**
```bash
npm run deploy
```

## 🔍 Demo Scenarios

The interactive demo demonstrates:

### Scenario 1: Multi-User Registration
- Register multiple users with unique certificates
- Show metadata preservation
- Demonstrate individual user tracking

### Scenario 2: Token Loss and Recovery
- Simulate NFT loss scenario
- Request and process reissuance
- Verify identical metadata

### Scenario 3: Abuse Prevention
- Attempt rapid reissuance (blocked by cooldown)
- Show reissuance counting
- Demonstrate limit enforcement

## 📚 Additional Resources

- [Algorand Developer Documentation](https://developer.algorand.org/)
- [AlgoKit Documentation](https://developer.algorand.org/docs/get-started/algokit/)
- [TypeScript Smart Contracts](https://developer.algorand.org/docs/get-started/dapps/smart-contracts/typescript/)
- [ASA Documentation](https://developer.algorand.org/docs/get-details/asa/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🆘 Support

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review the test output for error details
3. Ensure LocalNet is running properly
4. Verify all dependencies are installed

### Troubleshooting

**Contract deployment fails:**
- Ensure LocalNet is running: `algokit localnet status`
- Check account funding: `algokit localnet accounts`
- Verify network configuration in scripts

**Tests fail:**
- Clear artifacts: `npm run clean`
- Rebuild: `npm run build`
- Reset LocalNet: `algokit localnet reset`

**Demo script errors:**
- Check contract deployment status
- Verify account balances
- Review network connectivity

---

## ⭐ Key Innovation Points

This implementation showcases several advanced concepts:

1. **Dynamic Asset Creation**: Smart contracts creating new ASAs on-demand
2. **Metadata Preservation**: Exact replication of original token properties
3. **State-Based Access Control**: User-specific permissions and tracking
4. **Time-Based Security**: Cooldown mechanisms for abuse prevention
5. **Scalable Architecture**: Efficient state management for multiple users

The contract demonstrates how Algorand's smart contract capabilities can solve real-world problems like token recovery while maintaining security and preventing abuse.