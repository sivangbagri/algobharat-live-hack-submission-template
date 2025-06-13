
# 🪙 Algorand Token Creator & Transfer Script (Task 1)

This script demonstrates how to **create a custom Algorand Standard Asset (ASA)** on the Algorand Testnet and **transfer it to a receiver address** using the [`@algorandfoundation/algokit-utils`](https://www.npmjs.com/package/@algorandfoundation/algokit-utils) library.

---

## 📦 Features

* ✅ Create your own token (ASA) on the Algorand Testnet
* 🔐 Sign transactions using a Pera Wallet mnemonic
* 📝 Opt-in to ASA for the receiver
* 🔄 Transfer tokens to another account
* 📊 Display final token balances
* 🔗 Track all transactions on [AlgoExplorer](https://testnet.algoexplorer.io)

---

## 🚀 Quick Start

Configure Your Mnemonics and Addresses

In the script, update the `CONFIG` object:

```ts
const CONFIG = {
  SENDER: "<your sender address>",
  RECEIVER: "<receiver address>",

  SENDER_MNEMONIC: "<your Pera wallet 25-word mnemonic>",
  RECEIVER_MNEMONIC: "<receiver's 25-word mnemonic>",
  
  TOKEN_NAME: "hivang26-token",
  TOKEN_SYMBOL: "MFT",
  TOTAL_SUPPLY: 100000n,
  DECIMALS: 2,
  TOKEN_URL: "https://x.com/hivang26_",
  TRANSFER_AMOUNT: 200n,
};
```

> 💡 Get your mnemonic from Pera Wallet → Settings → Show Secret Key.

---

## 🧪 Run the Demo

```bash
npx ts-node index.ts
```

This script will:

1. Connect to Algorand Testnet
2. Create a new ASA (Algorand token)
3. Let the receiver opt-in
4. Transfer tokens
5. Show explorer links & balances

---

## 📁 File Overview

| File        | Description                                     |
| ----------- | ----------------------------------------------- |
| `index.ts`  | Main script to create, opt-in, and transfer ASA |
| `README.md` | You're reading it! Documentation for usage      |

---


Demo video : https://drive.google.com/file/d/1jee7MmxLVV110zC1gsELnBvNBAMYZDbA/view?usp=sharing

Output :

 Starting Algorand Token Creation Demo
==================================================

📡 Connecting to Algorand Testnet...

🔐 Setting up signer...
✅ Signer created successfully

🪙 Creating token...
🚀 Creating new token...
📋 Name: hivang26-token
📋 Symbol: MFT
📋 Total Supply: 100000
📋 Decimals: 2
Created asset hivang26-token (MFT) with 100000 units and 2 decimals created by XHKY3SZZ5UJULGJVSAXXBXU7H6QMDJNF4UHW226I7EY6DORQFGUKVRPRZA with ID 741156527 via transaction HYXXWFWHTBU2UAFVMPE43ZMJ2SRTAE6FX3UDB3M22IIWR6PWUQOQ
✅ Token created successfully!
📋 Asset ID: 741156527
📋 Transaction ID: HYXXWFWHTBU2UAFVMPE43ZMJ2SRTAE6FX3UDB3M22IIWR6PWUQOQ
🔗 View on AlgoExplorer: https://testnet.algoexplorer.io/asset/741156527

🎉 TOKEN CREATION COMPLETED!
==================================================
✅ Asset ID: 741156527
✅ Transaction ID: HYXXWFWHTBU2UAFVMPE43ZMJ2SRTAE6FX3UDB3M22IIWR6PWUQOQ
🔗 Asset on Explorer: https://testnet.algoexplorer.io/asset/741156527
🔗 Transaction on Explorer: https://testnet.algoexplorer.io/tx/HYXXWFWHTBU2UAFVMPE43ZMJ2SRTAE6FX3UDB3M22IIWR6PWUQOQ

🎯 TRANSFERRING TOKENS TO RECEIVER...
==================================================
🔐 Creating receiver signer...
✅ Signer created successfully
📝 Receiver opting in to asset...

📝 Opting in to asset...
📋 Account: YTR6GJAEBG2SFA5PAWU3JY7PRFGCZ7D7FISIBOT3LJA7NWJI7DP54NLVOE
📋 Asset ID: 741156527
Opting in YTR6GJAEBG2SFA5PAWU3JY7PRFGCZ7D7FISIBOT3LJA7NWJI7DP54NLVOE to asset with ID 741156527 via transaction BNGQIFSQIISHJTL4UNVO4J3J4QMZD6JNWJAZFNK2S3ZWYB4YKMJA
✅ Opted in successfully!
📋 Transaction ID: BNGQIFSQIISHJTL4UNVO4J3J4QMZD6JNWJAZFNK2S3ZWYB4YKMJA
🔗 View on AlgoExplorer: https://testnet.algoexplorer.io/tx/BNGQIFSQIISHJTL4UNVO4J3J4QMZD6JNWJAZFNK2S3ZWYB4YKMJA
🔄 Transferring tokens...

🔄 Starting token transfer...
📋 From: XHKY3SZZ5UJULGJVSAXXBXU7H6QMDJNF4UHW226I7EY6DORQFGUKVRPRZA
📋 To: YTR6GJAEBG2SFA5PAWU3JY7PRFGCZ7D7FISIBOT3LJA7NWJI7DP54NLVOE
📋 Amount: 200 (2 tokens)
✅ Receiver already opted in to asset
Transferring 200 units of asset with ID 741156527 from XHKY3SZZ5UJULGJVSAXXBXU7H6QMDJNF4UHW226I7EY6DORQFGUKVRPRZA to YTR6GJAEBG2SFA5PAWU3JY7PRFGCZ7D7FISIBOT3LJA7NWJI7DP54NLVOE via transaction 6HBYD7ZZWR65APSDI324X423U5BRYAQ3YKVP33PMTWMRM5SATI3A
✅ Transfer completed!
📋 Transaction ID: 6HBYD7ZZWR65APSDI324X423U5BRYAQ3YKVP33PMTWMRM5SATI3A
🔗 View on AlgoExplorer: https://testnet.algoexplorer.io/tx/6HBYD7ZZWR65APSDI324X423U5BRYAQ3YKVP33PMTWMRM5SATI3A

🎉 TRANSFER COMPLETED!
✅ Transfer Transaction ID: 6HBYD7ZZWR65APSDI324X423U5BRYAQ3YKVP33PMTWMRM5SATI3A
🔗 Transfer on Explorer: https://testnet.algoexplorer.io/tx/6HBYD7ZZWR65APSDI324X423U5BRYAQ3YKVP33PMTWMRM5SATI3A

📊 Final Token Balances:
💰 Sender (XHKY3SZZ...) has 998 MFT
💰 Receiver (YTR6GJAE...) has 2 MFT

✨ Demo completed successfully!

🎊 All done! Your token has been created successfully!