# 🚀 Enhanced Algorand Token with ARC-53 Metadata & Asset Controls

## 📋 Overview

This project demonstrates advanced Algorand Standard Asset (ASA) features including ARC-53 metadata integration and comprehensive asset control mechanisms. Built upon the foundation of basic token creation, this enhanced version showcases professional-grade token management capabilities.

## ✨ Features Implemented

### 🖼️ ARC-53 Metadata Integration
- **IPFS-hosted metadata** with JSON structure
- **Token image** displayed on AlgoExplorer
- **Rich descriptions** and properties
- **External links** to social media/websites
- **Proper mimetype** specification for images

### 🔧 Asset Role Management
- **Manager Role**: Can modify asset configuration
- **Reserve Role**: Receives uncirculated tokens
- **Freeze Role**: Can freeze/unfreeze specific accounts
- **Clawback Role**: Can reclaim tokens from any account

### 🛡️ Asset Control Demonstrations
- **Account Freezing**: Prevent specific accounts from transferring tokens
- **Token Clawback**: Retrieve tokens from accounts for compliance
- **Status Monitoring**: Real-time freeze status and balance tracking

## 🎯 What This Demo Does

### Phase 1: Token Creation with Metadata
1. **Connects** to Algorand Testnet
2. **Creates** enhanced token with ARC-53 metadata
3. **Displays** complete asset information
4. **Shows** metadata on AlgoExplorer

### Phase 2: Asset Controls Setup
1. **Receiver opt-in** to the new token
2. **Initial transfer** of tokens to receiver
3. **Balance verification** before controls

### Phase 3: Freeze Functionality Demo
1. **Freezes** receiver account
2. **Attempts transfer** from frozen account (fails as expected)
3. **Unfreezes** account
4. **Verifies** account can transfer again

### Phase 4: Clawback Functionality Demo
1. **Claws back** tokens from receiver to sender
2. **Shows** updated balances
3. **Demonstrates** compliance capabilities

## 📊 Token Configuration

```typescript
const CONFIG = {
  TOKEN_NAME: "HivangToken",
  TOKEN_SYMBOL: "HVT",
  TOTAL_SUPPLY: 100000n, // 100,000 tokens
  DECIMALS: 2, // 2.00 format
  TRANSFER_AMOUNT: 200n, // 2.00 tokens
  TOKEN_URL: "https://bafkreihvxodurup4xxpkb2z5qz7hfpqvjbaq2qkxtgddyoklxzs2pf3jli.ipfs.nftstorage.link/"
}
```

## 🔗 ARC-53 Metadata Structure

```json
{
  "name": "HivangToken",
  "description": "A premium utility token created by @hivang26_ for demonstration of Algorand ASA features including metadata, freeze, and clawback capabilities.",
  "image": "https://bafkreiabltrd5zm73zby7ujwmglo4rk6xpqxetuwb6gtg4t6zegdua6bue.ipfs.nftstorage.link/",
  "image_mimetype": "image/png",
  "external_url": "https://x.com/hivang26_",
  "properties": {
    "creator": "@hivang26_",
    "category": "Utility Token",
    "blockchain": "Algorand",
    "standard": "ARC-53"
  }
}
```

## 🚀 How to Run
 

### Setup
1. **Install dependencies**:
   ```bash
   npm install @algorandfoundation/algokit-utils algosdk
   ```

2. **Update configuration**:
   ```typescript
   // Replace with your actual wallet addresses and mnemonics
   SENDER: "YOUR_SENDER_ADDRESS",
   RECEIVER: "YOUR_RECEIVER_ADDRESS",
   SENDER_MNEMONIC: "your twelve word mnemonic...",
   RECEIVER_MNEMONIC: "receiver twelve word mnemonic..."
   ```

3. **Run the demo**:
   ```bash
   npx ts-node task2.ts
   ```

## 📱 Expected Output

### ✅ Successful Creation
```
🎉 TOKEN CREATION WITH METADATA COMPLETED!
✅ Asset ID: 123456789
✅ Transaction ID: ABC123...
🔗 Asset on Explorer: https://testnet.algoexplorer.io/asset/123456789
🖼️ Check AlgoExplorer to see the metadata and image!
```

### ✅ Asset Controls Demo
```
🧊 DEMONSTRATING FREEZE FUNCTIONALITY...
✅ Account frozen successfully!
✅ Transfer correctly failed - account is frozen!
✅ Account unfrozen successfully!

🔄 DEMONSTRATING CLAWBACK FUNCTIONALITY...
✅ Clawback completed successfully!
💰 Final balances updated
```

## 🔍 Key Functions

### Core Token Functions
- `createTokenWithMetadata()` - Creates ASA with ARC-53 metadata
- `transferToken()` - Standard token transfer
- `optInToAsset()` - Account opt-in to receive tokens

### Asset Control Functions
- `freezeAccount()` - Freeze/unfreeze specific accounts
- `clawbackTokens()` - Clawback tokens from accounts
- `checkAccountFreezeStatus()` - Monitor freeze status

### Utility Functions
- `displayAssetInfo()` - Show complete asset details
- `checkTokenBalance()` - Balance and status checking
- `createSigner()` - Create transaction signer from mnemonic

## 🛡️ Security Features

### Asset Roles Configuration
- **Manager**: Controls asset configuration changes
- **Reserve**: Holds uncirculated token supply
- **Freeze**: Can freeze accounts for compliance
- **Clawback**: Can retrieve tokens when necessary

### Use Cases
- **Compliance**: Freeze accounts violating terms
- **Recovery**: Clawback tokens from compromised accounts
- **Regulation**: Meet regulatory requirements
- **Governance**: Manage token distribution

## 🌐 IPFS Integration

### Metadata Hosting
- **NFT.Storage**: Free IPFS pinning service
- **Persistent URLs**: Metadata remains accessible
- **Decentralized**: No single point of failure

### Image Hosting
- **High-quality PNG**: Professional token image
- **Proper sizing**: Optimized for explorers
- **Immutable**: Content-addressed storage

## 📈 Verification

### AlgoExplorer Verification
1. **Visit**: `https://testnet.algoexplorer.io/asset/[ASSET_ID]`
2. **Check**: Metadata and image display
3. **Verify**: Asset roles and configuration
4. **Monitor**: Transaction history

### Transaction Verification
- **Creation**: Asset creation transaction
- **Opt-in**: Receiver opt-in transaction
- **Transfer**: Token transfer transactions
- **Freeze**: Account freeze transactions
- **Clawback**: Token clawback transactions

 
 Demo video : https://drive.google.com/file/d/1d4idfsDJALeswE82VJ6lnLB3LcIpFJON/view?usp=sharing


 Hivangtoken :

 ![image](https://github.com/user-attachments/assets/1c9463e2-e7a5-4413-bf05-b88cea319ec0)
