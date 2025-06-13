import * as algokit from "@algorandfoundation/algokit-utils";
import algosdk from "algosdk";

// Type definition for TransactionSigner
type TransactionSigner = algosdk.TransactionSigner;

const CONFIG = {
  // Pera wallet addresses
  SENDER: "XHKY3SZZ5UJULGJVSAXXBXU7H6QMDJNF4UHW226I7EY6DORQFGUKVRPRZA",
  RECEIVER: "YTR6GJAEBG2SFA5PAWU3JY7PRFGCZ7D7FISIBOT3LJA7NWJI7DP54NLVOE",

  SENDER_MNEMONIC:
    "price leisure tongue hundred segment release diamond sugar attitude weapon together month raccoon result cousin way electric rhythm walnut own spoil vast fan above crucial",
  RECEIVER_MNEMONIC:
    "winter buzz kingdom awesome link autumn theory skirt trick half acid ahead quick weather pony embody nasty alpha spike reject unable million office able bird",

  // Token details with ARC-53 metadata
  TOKEN_NAME: "HivangToken",
  TOKEN_SYMBOL: "HVT",
  TOTAL_SUPPLY: 100000n, // 100,000 tokens
  DECIMALS: 2, // 2 decimal places
  TOKEN_URL: "https://bafkreihvxodurup4xxpkb2z5qz7hfpqvjbaq2qkxtgddyoklxzs2pf3jli.ipfs.nftstorage.link/", // IPFS metadata URL
  TRANSFER_AMOUNT: 200n, // 2.00 tokens to transfer

  // ARC-53 Metadata JSON (this would be stored on IPFS)
  METADATA: {
    name: "HivangToken",
    description:
      "A premium utility token created by @hivang26_ for demonstration of Algorand ASA features including metadata, freeze, and clawback capabilities.",
    image: "https://bafkreiabltrd5zm73zby7ujwmglo4rk6xpqxetuwb6gtg4t6zegdua6bue.ipfs.nftstorage.link/",
    image_mimetype: "image/png",
    external_url: "https://x.com/hivang26_",
    properties: {
      creator: "@hivang26_",
      category: "Utility Token",
      blockchain: "Algorand",
      standard: "ARC-53",
    },
  },
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

// Create Token with ARC-53 Metadata
async function createTokenWithMetadata(algorand: algokit.AlgorandClient, sender: string, signer: TransactionSigner) {
  try {
    console.log("🚀 Creating new token with ARC-53 metadata...");
    console.log(`📋 Name: ${CONFIG.TOKEN_NAME}`);
    console.log(`📋 Symbol: ${CONFIG.TOKEN_SYMBOL}`);
    console.log(`📋 Total Supply: ${CONFIG.TOTAL_SUPPLY}`);
    console.log(`📋 Decimals: ${CONFIG.DECIMALS}`);
    console.log(`🖼️ IPFS Metadata URL: ${CONFIG.TOKEN_URL}`);

    const assetCreateResult = await algorand.send.assetCreate({
      sender: sender,
      signer: signer,
      total: CONFIG.TOTAL_SUPPLY,
      decimals: CONFIG.DECIMALS,
      assetName: CONFIG.TOKEN_NAME,
      unitName: CONFIG.TOKEN_SYMBOL,
      url: CONFIG.TOKEN_URL, // ARC-53 metadata IPFS URL
      // Asset roles configuration
      manager: sender,
      reserve: sender,
      freeze: sender,
      clawback: sender,
    });

    const assetId = BigInt(assetCreateResult.confirmation.assetIndex!);

    console.log("✅ Token with metadata created successfully!");
    console.log(`📋 Asset ID: ${assetId}`);
    console.log(`📋 Transaction ID: ${assetCreateResult.txIds[0]}`);
    console.log(`🔗 View on AlgoExplorer: https://testnet.algoexplorer.io/asset/${assetId}`);
    console.log(`🖼️ Metadata should be visible on AlgoExplorer`);

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

// 🧊 Freeze Account
async function freezeAccount(
  algorand: algokit.AlgorandClient,
  freezeAddress: string, // The freeze authority (manager)
  signer: TransactionSigner,
  targetAccount: string, // Account to freeze
  assetId: bigint,
  freeze: boolean = true
) {
  try {
    const action = freeze ? "Freezing" : "Unfreezing";
    console.log(`\n🧊 ${action} account for asset...`);
    console.log(`📋 Freeze Authority: ${freezeAddress}`);
    console.log(`📋 Target Account: ${targetAccount}`);
    console.log(`📋 Asset ID: ${assetId}`);
    console.log(`📋 Action: ${freeze ? "FREEZE" : "UNFREEZE"}`);

    const freezeResult = await algorand.send.assetFreeze({
      sender: freezeAddress,
      signer: signer,
      assetId: assetId,
      account: targetAccount,
      frozen: freeze,
    });

    console.log(`✅ Account ${freeze ? "frozen" : "unfrozen"} successfully!`);
    console.log(`📋 Transaction ID: ${freezeResult.txIds[0]}`);
    console.log(`🔗 View on AlgoExplorer: https://testnet.algoexplorer.io/tx/${freezeResult.txIds[0]}`);

    return {
      txId: freezeResult.txIds[0],
      confirmation: freezeResult.confirmation,
    };
  } catch (error) {
    console.error(`❌ Error ${freeze ? "freezing" : "unfreezing"} account:`, error);
    throw error;
  }
}

// Clawback Tokens
async function clawbackTokens(
  algorand: algokit.AlgorandClient,
  clawbackAddress: string, // The clawback authority
  signer: TransactionSigner,
  fromAccount: string, // Account to clawback from
  toAccount: string, // Account to send clawed back tokens to
  assetId: bigint,
  amount: bigint
) {
  try {
    console.log("\n🔄 Clawing back tokens...");
    console.log(`📋 Clawback Authority: ${clawbackAddress}`);
    console.log(`📋 From Account: ${fromAccount}`);
    console.log(`📋 To Account: ${toAccount}`);
    console.log(`📋 Asset ID: ${assetId}`);
    console.log(`📋 Amount: ${amount} (${Number(amount) / Math.pow(10, CONFIG.DECIMALS)} tokens)`);

    const clawbackResult = await algorand.send.assetTransfer({
      sender: clawbackAddress,
      signer: signer,
      assetId: assetId,
      amount: amount,
      receiver: toAccount,
      clawbackTarget: fromAccount, // This makes it a clawback transaction
    });

    console.log("✅ Clawback completed successfully!");
    console.log(`📋 Transaction ID: ${clawbackResult.txIds[0]}`);
    console.log(`🔗 View on AlgoExplorer: https://testnet.algoexplorer.io/tx/${clawbackResult.txIds[0]}`);

    return {
      txId: clawbackResult.txIds[0],
      confirmation: clawbackResult.confirmation,
    };
  } catch (error) {
    console.error("❌ Error clawing back tokens:", error);
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

    console.log("✅ Transfer completed!");
    console.log(`📋 Transaction ID: ${transferResult.txIds[0]}`);
    console.log(`🔗 View on AlgoExplorer: https://testnet.algoexplorer.io/tx/${transferResult.txIds[0]}`);

    return {
      txId: transferResult.txIds[0],
      confirmation: transferResult.confirmation,
    };
  } catch (error) {
    console.error("❌ Error transferring tokens:", error);
    throw error;
  }
}

//  receiver calls this
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

    console.log("✅ Opted in successfully!");
    console.log(`📋 Transaction ID: ${optInResult.txIds[0]}`);
    console.log(`🔗 View on AlgoExplorer: https://testnet.algoexplorer.io/tx/${optInResult.txIds[0]}`);

    return optInResult;
  } catch (error) {
    console.error("❌ Error opting in to asset:", error);
    throw error;
  }
}

//  Check account freeze status
async function checkAccountFreezeStatus(algorand: algokit.AlgorandClient, address: string, assetId: bigint) {
  try {
    const assetInfo = await algorand.asset.getAccountInformation(address, assetId);
    const isFrozen = assetInfo["is-frozen"] || false;
    console.log(`🧊 Account ${address.substring(0, 8)}... freeze status: ${isFrozen ? "FROZEN ❄️" : "UNFROZEN ✅"}`);
    return isFrozen;
  } catch (error) {
    console.log(`❌ Could not check freeze status for ${address.substring(0, 8)}...`);
    return false;
  }
}

async function checkTokenBalance(algorand: algokit.AlgorandClient, address: string, assetId: bigint, label: string) {
  try {
    const assetInfo = await algorand.asset.getAccountInformation(address, assetId);
    const balance = Number(assetInfo.balance) / Math.pow(10, CONFIG.DECIMALS);
    const frozen = assetInfo["is-frozen"] ? " (FROZEN ❄️)" : "";
    console.log(`💰 ${label} (${address.substring(0, 8)}...) has ${balance} ${CONFIG.TOKEN_SYMBOL}${frozen}`);
    return balance;
  } catch (error) {
    console.log(`💰 ${label} (${address.substring(0, 8)}...) has 0 ${CONFIG.TOKEN_SYMBOL} (not opted in)`);
    return 0;
  }
}

//  Display Asset Information
async function displayAssetInfo(algorand: algokit.AlgorandClient, assetId: bigint) {
  try {
    console.log("\n🔍 Asset Information:");
    console.log("=".repeat(40));

    const assetInfo = await algorand.asset.getById(assetId);

    console.log(`📋 Asset ID: ${assetId}`);
    // console.log(`📋 Name: ${assetInfo.name || 'N/A'}`);
    console.log(`📋 Unit Name: ${assetInfo["unit-name"] || "N/A"}`);
    console.log(`📋 Total Supply: ${assetInfo.total || "N/A"}`);
    console.log(`📋 Decimals: ${assetInfo.decimals || "N/A"}`);
    console.log(`📋 URL: ${assetInfo.url || "N/A"}`);
    console.log(`📋 Manager: ${assetInfo.manager || "None"}`);
    console.log(`📋 Reserve: ${assetInfo.reserve || "None"}`);
    console.log(`📋 Freeze: ${assetInfo.freeze || "None"}`);
    console.log(`📋 Clawback: ${assetInfo.clawback || "None"}`);

    return assetInfo;
  } catch (error) {
    console.error("❌ Error fetching asset info:", error);
    return null;
  }
}

async function main() {
  console.log("🎯 Starting Enhanced Algorand Token Demo with ARC-53 Metadata & Asset Controls");
  console.log("=".repeat(80));

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

    //  Create Token with ARC-53 Metadata
    console.log("\n🪙 Creating token with ARC-53 metadata...");
    const tokenResult = await createTokenWithMetadata(algorand, CONFIG.SENDER, signer);

    //  Display Asset Information
    await displayAssetInfo(algorand, tokenResult.assetId);

    console.log("\n🎉 TOKEN CREATION WITH METADATA COMPLETED!");
    console.log("=".repeat(50));
    console.log(`✅ Asset ID: ${tokenResult.assetId}`);
    console.log(`✅ Transaction ID: ${tokenResult.txId}`);
    console.log(`🔗 Asset on Explorer: https://testnet.algoexplorer.io/asset/${tokenResult.assetId}`);
    console.log(`🖼️ Check AlgoExplorer to see the metadata and image!`);

    // Setup for Asset Control Demonstration
    if (CONFIG.RECEIVER_MNEMONIC && CONFIG.RECEIVER_MNEMONIC.trim() !== "") {
      console.log("\n🎯 DEMONSTRATING ASSET CONTROLS...");
      console.log("=".repeat(50));

      const receiverSigner = createSigner(CONFIG.RECEIVER_MNEMONIC);

      // Receiver opts in to asset
      console.log("📝 Receiver opting in to asset...");
      await optInToAsset(algorand, CONFIG.RECEIVER, receiverSigner, tokenResult.assetId);

      // Transfer initial tokens to receiver
      console.log("🔄 Transferring tokens to receiver...");
      await transferToken(algorand, CONFIG.SENDER, signer, CONFIG.RECEIVER, tokenResult.assetId, CONFIG.TRANSFER_AMOUNT);

      console.log("\n📊 Balances before asset controls:");
      await checkTokenBalance(algorand, CONFIG.SENDER, tokenResult.assetId, "Sender");
      await checkTokenBalance(algorand, CONFIG.RECEIVER, tokenResult.assetId, "Receiver");

      //  Demonstrate Freeze Functionality
      console.log("\n🧊 DEMONSTRATING FREEZE FUNCTIONALITY...");
      console.log("=".repeat(50));

      // Freeze the receiver account
      await freezeAccount(algorand, CONFIG.SENDER, signer, CONFIG.RECEIVER, tokenResult.assetId, true);

      // Check freeze status
      await checkAccountFreezeStatus(algorand, CONFIG.RECEIVER, tokenResult.assetId);

      // Try to transfer from frozen account (this should fail)
      console.log("\n⚠️ Attempting transfer from frozen account (should fail)...");
      try {
        await transferToken(algorand, CONFIG.RECEIVER, receiverSigner, CONFIG.SENDER, tokenResult.assetId, 100n);
      } catch (error) {
        console.log("✅ Transfer correctly failed - account is frozen!");
      }

      // Unfreeze the account
      await freezeAccount(algorand, CONFIG.SENDER, signer, CONFIG.RECEIVER, tokenResult.assetId, false);
      await checkAccountFreezeStatus(algorand, CONFIG.RECEIVER, tokenResult.assetId);

      // Step 5: Demonstrate Clawback Functionality
      console.log("\n🔄 DEMONSTRATING CLAWBACK FUNCTIONALITY...");
      console.log("=".repeat(50));

      // Clawback some tokens from receiver back to sender
      const clawbackAmount = 100n;
      await clawbackTokens(algorand, CONFIG.SENDER, signer, CONFIG.RECEIVER, CONFIG.SENDER, tokenResult.assetId, clawbackAmount);

      // Check final balances
      console.log("\n📊 Final Token Balances after asset controls:");
      await checkTokenBalance(algorand, CONFIG.SENDER, tokenResult.assetId, "Sender");
      await checkTokenBalance(algorand, CONFIG.RECEIVER, tokenResult.assetId, "Receiver");

      console.log("\n🎉 ASSET CONTROLS DEMONSTRATION COMPLETED!");
      console.log("✅ Successfully demonstrated:");
      console.log("   • ARC-53 metadata attachment");
      console.log("   • Account freeze/unfreeze");
      console.log("   • Token clawback");
    } else {
      console.log("ℹ️ No receiver mnemonic provided. Skipping asset controls demonstration.");
      console.log("📝 To see asset controls in action:");
      console.log(`1. Add receiver mnemonic to CONFIG`);
      console.log(`2. Receiver opts-in to Asset ID: ${tokenResult.assetId}`);
      console.log(`3. Run freeze/clawback operations`);
    }

    console.log("\n✨ Enhanced demo completed successfully!");
    console.log(
      `🖼️ Check your token on AlgoExplorer to see the ARC-53 metadata: https://testnet.algoexplorer.io/asset/${tokenResult.assetId}`
    );

    return {
      success: true,
      assetId: tokenResult.assetId,
      txId: tokenResult.txId,
      hasMetadata: true,
      controlsDemonstrated: CONFIG.RECEIVER_MNEMONIC && CONFIG.RECEIVER_MNEMONIC.trim() !== "",
    };
  } catch (error) {
    console.error("\n❌ ENHANCED DEMO FAILED:", error);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Make sure your mnemonic is correct");
    console.log("2. Ensure your account has testnet ALGO");
    console.log("3. Check your internet connection");
    console.log("4. Verify IPFS URLs are accessible");
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
        console.log("\n🎊 All done! Your enhanced token with metadata and asset controls has been created!");
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

export {
  main,
  createTokenWithMetadata,
  transferToken,
  optInToAsset,
  createSigner,
  freezeAccount,
  clawbackTokens,
  checkAccountFreezeStatus,
  displayAssetInfo,
};
