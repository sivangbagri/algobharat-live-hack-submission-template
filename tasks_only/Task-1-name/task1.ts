import * as algokit from "@algorandfoundation/algokit-utils";
import algosdk from "algosdk";

type TransactionSigner = algosdk.TransactionSigner;

const CONFIG = {
  // Pera wallet addresses
  SENDER: "XHKY3SZZ5UJULGJVSAXXBXU7H6QMDJNF4UHW226I7EY6DORQFGUKVRPRZA",
  RECEIVER: "YTR6GJAEBG2SFA5PAWU3JY7PRFGCZ7D7FISIBOT3LJA7NWJI7DP54NLVOE",

  SENDER_MNEMONIC:
    "price leisure tongue hundred segment release diamond sugar attitude weapon together month raccoon result cousin way electric rhythm walnut own spoil vast fan above crucial",
  RECEIVER_MNEMONIC:
    "winter buzz kingdom awesome link autumn theory skirt trick half acid ahead quick weather pony embody nasty alpha spike reject unable million office able bird",

  // Token details
  TOKEN_NAME: "hivang26-token",
  TOKEN_SYMBOL: "MFT",
  TOTAL_SUPPLY: 100000n, // 100,000 tokens
  DECIMALS: 2, 
  TOKEN_URL: "https://x.com/hivang26_",
  TRANSFER_AMOUNT: 200n, // 20.00 tokens to transfer
};

// signer from mnemonic
function createSigner(mnemonic: string): TransactionSigner {
  try {
    const account = algosdk.mnemonicToSecretKey(mnemonic);
    const signer = algosdk.makeBasicAccountTransactionSigner(account);
    console.log("✅ Signer created successfully");
    return signer;
  } catch (error) {
    console.error("❌ Error creating signer. Check your mnemonic!");
    throw error;
  }
}

// Create Token
async function createToken(algorand: algokit.AlgorandClient, sender: string, signer: TransactionSigner) {
  try {
    console.log("🚀 Creating new token...");
    console.log(`📋 Name: ${CONFIG.TOKEN_NAME}`);
    console.log(`📋 Symbol: ${CONFIG.TOKEN_SYMBOL}`);
    console.log(`📋 Total Supply: ${CONFIG.TOTAL_SUPPLY}`);
    console.log(`📋 Decimals: ${CONFIG.DECIMALS}`);

    const assetCreateResult = await algorand.send.assetCreate({
      sender: sender,
      signer: signer,
      total: CONFIG.TOTAL_SUPPLY,
      decimals: CONFIG.DECIMALS,
      assetName: CONFIG.TOKEN_NAME,
      unitName: CONFIG.TOKEN_SYMBOL,
      url: CONFIG.TOKEN_URL,
      manager: sender,
      reserve: sender,
      freeze: sender,
      clawback: sender,
    });

    const assetId = BigInt(assetCreateResult.confirmation.assetIndex!);

    console.log("✅ Token created successfully!");
    console.log(`📋 Asset ID: ${assetId}`);
    console.log(`📋 Transaction ID: ${assetCreateResult.txIds[0]}`);
    console.log(`🔗 View on AlgoExplorer: https://testnet.algoexplorer.io/asset/${assetId}`);

    return {
      assetId: assetId,
      txId: assetCreateResult.txIds[0],
      confirmation: assetCreateResult.confirmation,
    };
  } catch (error) {
    console.error("❌ Error creating token:", error);
    throw error;
  }
}

//  Transfer Token
async function transferToken(
  algorand: algokit.AlgorandClient,
  sender: string,
  signer: TransactionSigner,
  receiver: string,
  assetId: bigint,
  amount: bigint
) {
  try {
    console.log("\n🔄 Starting token transfer...");
    console.log(`📋 From: ${sender}`);
    console.log(`📋 To: ${receiver}`);
    console.log(`📋 Amount: ${amount} (${Number(amount) / Math.pow(10, CONFIG.DECIMALS)} tokens)`);

    // Check if receiver has opted into the asset
    let receiverOptedIn = false;
    try {
      const assetInfo = await algorand.asset.getAccountInformation(receiver, assetId);
      receiverOptedIn = true;
      console.log("✅ Receiver already opted in to asset");
    } catch (error) {
      console.log("⚠️ Receiver needs to opt-in to asset first");
    }

    if (!receiverOptedIn) {
      console.log("❌ Cannot transfer: Receiver must opt-in to the asset first");
      console.log("💡 The receiver needs to run an opt-in transaction");
      return null;
    }

    // Transfer the tokens
    const transferResult = await algorand.send.assetTransfer({
      sender: sender,
      signer: signer,
      receiver: receiver,
      assetId: assetId,
      amount: amount,
    });

    console.log(" Transfer completed!");
    console.log(` Transaction ID: ${transferResult.txIds[0]}`);
    console.log(` View on AlgoExplorer: https://testnet.algoexplorer.io/tx/${transferResult.txIds[0]}`);

    return {
      txId: transferResult.txIds[0],
      confirmation: transferResult.confirmation,
    };
  } catch (error) {
    console.error(" Error transferring tokens:", error);
    throw error;
  }
}

// 📝 receiver calls this
async function optInToAsset(algorand: algokit.AlgorandClient, account: string, signer: TransactionSigner, assetId: bigint) {
  try {
    console.log("\n📝 Opting in to asset...");
    console.log(`📋 Account: ${account}`);
    console.log(`📋 Asset ID: ${assetId}`);

    const optInResult = await algorand.send.assetOptIn({
      sender: account,
      signer: signer,
      assetId: assetId,
    });

    console.log(" Opted in successfully!");
    console.log(` Transaction ID: ${optInResult.txIds[0]}`);
    console.log(` View on AlgoExplorer: https://testnet.algoexplorer.io/tx/${optInResult.txIds[0]}`);

    return optInResult;
  } catch (error) {
    console.error("❌ Error opting in to asset:", error);
    throw error;
  }
}

async function checkTokenBalance(algorand: algokit.AlgorandClient, address: string, assetId: bigint, label: string) {
  try {
    const assetInfo = await algorand.asset.getAccountInformation(address, assetId);
    const balance = Number(assetInfo.balance) / Math.pow(10, CONFIG.DECIMALS);
    console.log(`💰 ${label} (${address.substring(0, 8)}...) has ${balance} ${CONFIG.TOKEN_SYMBOL}`);
    return balance;
  } catch (error) {
    console.log(`💰 ${label} (${address.substring(0, 8)}...) has 0 ${CONFIG.TOKEN_SYMBOL} (not opted in)`);
    return 0;
  }
}

async function main() {
  console.log("🎯 Starting Algorand Token Creation Demo");
  console.log("=".repeat(50));

  try {
    console.log("\n📡 Connecting to Algorand Testnet...");
    const algorand = algokit.AlgorandClient.testNet();

    // Create signer
    console.log("\n🔐 Setting up signer...");
    if (CONFIG.SENDER_MNEMONIC === "your twelve word mnemonic phrase from pera wallet goes here exactly as shown") {
      console.error("❌ ERROR: You need to update CONFIG.SENDER_MNEMONIC with your actual mnemonic!");
      console.log("💡 Go to Pera Wallet → Settings → Show Secret Key and copy the mnemonic");
      return;
    }

    const signer = createSigner(CONFIG.SENDER_MNEMONIC);

     console.log("\n🪙 Creating token...");
    const tokenResult = await createToken(algorand, CONFIG.SENDER, signer);

    console.log("\n TOKEN CREATION COMPLETED!");
    console.log("=".repeat(50));
    console.log(`✅ Asset ID: ${tokenResult.assetId}`);
    console.log(`✅ Transaction ID: ${tokenResult.txId}`);
    console.log(`🔗 Asset on Explorer: https://testnet.algoexplorer.io/asset/${tokenResult.assetId}`);
    console.log(`🔗 Transaction on Explorer: https://testnet.algoexplorer.io/tx/${tokenResult.txId}`);

     console.log("\n🎯 TRANSFERRING TOKENS TO RECEIVER...");
    console.log("=".repeat(50));

    // Check if we have receiver's mnemonic for auto-transfer
    if (CONFIG.RECEIVER_MNEMONIC && CONFIG.RECEIVER_MNEMONIC.trim() !== "") {
      console.log("🔐 Creating receiver signer...");
      const receiverSigner = createSigner(CONFIG.RECEIVER_MNEMONIC);

      // Receiver opts in to asset
      console.log("📝 Receiver opting in to asset...");
      await optInToAsset(algorand, CONFIG.RECEIVER, receiverSigner, tokenResult.assetId);

      // Transfer tokens from sender to receiver
      console.log("🔄 Transferring tokens...");
      const transferResult = await transferToken(
        algorand,
        CONFIG.SENDER,
        signer,
        CONFIG.RECEIVER,
        tokenResult.assetId,
        CONFIG.TRANSFER_AMOUNT
      );

      if (transferResult) {
        console.log("\n🎉 TRANSFER COMPLETED!");
        console.log(`✅ Transfer Transaction ID: ${transferResult.txId}`);
        console.log(`🔗 Transfer on Explorer: https://testnet.algoexplorer.io/tx/${transferResult.txId}`);

        // Check final balances
        console.log("\n📊 Final Token Balances:");
        await checkTokenBalance(algorand, CONFIG.SENDER, tokenResult.assetId, "Sender");
        await checkTokenBalance(algorand, CONFIG.RECEIVER, tokenResult.assetId, "Receiver");
      }
    } else {
      console.log("ℹ️ No receiver mnemonic provided. Skipping auto-transfer.");
      console.log("📝 To complete the transfer manually:");
      console.log(`1. Receiver needs to opt-in to Asset ID: ${tokenResult.assetId}`);
      console.log(`2. Then sender can transfer ${CONFIG.TRANSFER_AMOUNT} tokens`);
      console.log(`🔗 Asset Link: https://testnet.algoexplorer.io/asset/${tokenResult.assetId}`);
    }

    console.log("\n✨ Demo completed successfully!");

    return {
      success: true,
      assetId: tokenResult.assetId,
      txId: tokenResult.txId,
      transferCompleted: CONFIG.RECEIVER_MNEMONIC && CONFIG.RECEIVER_MNEMONIC.trim() !== "",
    };
  } catch (error) {
    console.error("\n❌ DEMO FAILED:", error);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Make sure your mnemonic is correct");
    console.log("2. Ensure your account has testnet ALGO");
    console.log("3. Check your internet connection");
    return {
      success: false,
      error: error,
    };
  }
}

if (require.main === module) {
  main()
    .then((result) => {
      if (result?.success) {
        console.log("\n🎊 All done! Your token has been created successfully!");
        process.exit(0);
      } else {
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}

export { main, createToken, transferToken, optInToAsset, createSigner };
