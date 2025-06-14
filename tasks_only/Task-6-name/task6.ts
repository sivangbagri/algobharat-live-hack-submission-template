import * as algokit from "@algorandfoundation/algokit-utils";
import algosdk from "algosdk";
import {
  OnDemandTokenizationClient,
  OnDemandTokenizationFactory,
} from "../smart_contracts/artifacts/on-demand/OnDemandTokenizationClient";

const CONFIG = {
  SENDER: "XHKY3SZZ5UJULGJVSAXXBXU7H6QMDJNF4UHW226I7EY6DORQFGUKVRPRZA",
  RECEIVER: "YTR6GJAEBG2SFA5PAWU3JY7PRFGCZ7D7FISIBOT3LJA7NWJI7DP54NLVOE",
  SENDER_MNEMONIC:
    "price leisure tongue hundred segment release diamond sugar attitude weapon together month raccoon result cousin way electric rhythm walnut own spoil vast fan above crucial",
  RECEIVER_MNEMONIC:
    "winter buzz kingdom awesome link autumn theory skirt trick half acid ahead quick weather pony embody nasty alpha spike reject unable million office able bird",
  ASA_ID: 741156527,
  MAX_REISSUES: 5n,
  COOLDOWN_SECONDS: 3600n, // 1 hour
};

/**
 * Create a transaction signer from a mnemonic
 */
function createSigner(mnemonic: string): algosdk.TransactionSigner {
  try {
    const account = algosdk.mnemonicToSecretKey(mnemonic);
    return algosdk.makeBasicAccountTransactionSigner(account);
  } catch (error) {
    console.error("❌ Error creating signer:", error);
    throw error;
  }
}

/**
 * Deploy the OnDemandTokenization contract
 */
async function deployTokenizationContract(
  algorand: algokit.AlgorandClient,
  deployer: string,
  signer: algosdk.TransactionSigner,
  maxReissues: bigint,
  cooldownSeconds: bigint
) {
  try {
    console.log("🚀 Deploying OnDemand Tokenization Contract...");

    // Create the contract factory
    const contractFactory = new OnDemandTokenizationFactory({
      algorand: algorand,
      defaultSender: deployer,
      defaultSigner: signer,
    });

    // Deploy the contract
    const deployResult = await contractFactory.deploy({
      createParams: {
        sender: deployer,
        signer: signer,
        args: {
          maxReissues,
          cooldown: cooldownSeconds,
        },
        method: "create",
      },
      onUpdate: 'update',
    });

    const appClient = deployResult.appClient;

    console.log("✅ OnDemand Tokenization contract deployed successfully!");
    console.log(`📋 App ID: ${appClient.appId}`);
    console.log(`📋 App Address: ${appClient.appAddress}`);
    console.log(`🔗 View on AlgoExplorer: https://testnet.algoexplorer.io/application/${appClient.appId}`);

    return {
      appId: appClient.appId,
      appAddress: appClient.appAddress,
      client: appClient,
    };
  } catch (error) {
    console.error("❌ Error deploying tokenization contract:", error);
    throw error;
  }
}

/**
 * Opt an account into the app
 */
async function optInAccountToApp(
  algorand: algokit.AlgorandClient,
  appClient: OnDemandTokenizationClient,
  accountAddress: string,
  accountSigner: algosdk.TransactionSigner
) {
  try {
    console.log(`🔗 Opting in ${accountAddress.substring(0, 8)}... to the tokenization app...`);
    
    const optInTxn = await algorand.createTransaction.appCall({
      sender: accountAddress,
      appId: appClient.appId,
      onComplete: algosdk.OnApplicationComplete.OptInOC,
    });

    const signedTxn = await accountSigner([optInTxn], [0]);
    const result = await algorand.client.algod.sendRawTransaction(signedTxn).do();
    const txId = result.txid;
    
    await algosdk.waitForConfirmation(algorand.client.algod, txId, 4);

    console.log("✅ Account opted in to tokenization app successfully!");
    console.log(`📋 Transaction ID: ${txId}`);
    return result;
  } catch (error) {
    console.error("❌ Error opting account into app:", error);
    throw error;
  }
}

/**
 * Opt an account into an ASA
 */
async function optAccountIntoASA(
  algorand: algokit.AlgorandClient,
  accountAddress: string,
  accountSigner: algosdk.TransactionSigner,
  asaId: number
) {
  try {
    console.log(`🔗 Opting ${accountAddress.substring(0, 8)}... into ASA ${asaId}...`);

    const suggestedParams = await algorand.client.algod.getTransactionParams().do();
    const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      sender: accountAddress,
      receiver: accountAddress,
      amount: 0, // 0 for opt-in
      assetIndex: asaId,
      suggestedParams,
    });

    const signedTxn = await accountSigner([optInTxn], [0]);
    const result = await algorand.client.algod.sendRawTransaction(signedTxn).do();
    
    const txId = result.txid;
    await algosdk.waitForConfirmation(algorand.client.algod, txId, 4);
    
    console.log("✅ Account opted into ASA successfully!");
    console.log(`📋 Transaction ID: ${txId}`);
    return result;
  } catch (error) {
    console.error("❌ Error opting account into ASA:", error);
    throw error;
  }
}

/**
 * Fund the contract with ASA tokens for reissuance
 */
async function fundContractWithASA(
  algorand: algokit.AlgorandClient,
  contractAddress: string,
  ownerAddress: string,
  ownerSigner: algosdk.TransactionSigner,
  asaId: number,
  amount: bigint
) {
  try {
    console.log(`💰 Funding contract with ${amount} ASA tokens...`);

    const suggestedParams = await algorand.client.algod.getTransactionParams().do();
    const fundTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      sender: ownerAddress,
      receiver: contractAddress,
      amount: Number(amount),
      assetIndex: asaId,
      suggestedParams,
    });

    const signedTxn = await ownerSigner([fundTxn], [0]);
    const result = await algorand.client.algod.sendRawTransaction(signedTxn).do();

    const txId = result.txid;
    await algosdk.waitForConfirmation(algorand.client.algod, txId, 4);
    
    console.log("✅ Contract funded with ASA tokens!");
    console.log(`📋 Transaction ID: ${txId}`);
    return result;
  } catch (error) {
    console.error("❌ Error funding contract:", error);
    throw error;
  }
}

/**
 * Register a user for token reissuance
 */
async function registerUser(
  client: OnDemandTokenizationClient,
  accountAddress: string,
  accountSigner: algosdk.TransactionSigner
) {
  try {
    console.log(`📝 Registering user ${accountAddress.substring(0, 8)}... for token reissuance`);

    // Create a client with the user's signer
    const userClient = new OnDemandTokenizationClient({
      algorand: client.algorand,
      appId: client.appId,
      defaultSender: accountAddress,
      defaultSigner: accountSigner,
    });

    const result = await userClient.send.registerUser({
      args: {},
      extraFee: algokit.microAlgos(1000),
    });

    const txId = result.txIds ? result.txIds[0] : undefined;
    console.log("✅ User registered successfully!");
    console.log(`📋 Transaction ID: ${txId}`);
    return result;
  } catch (error) {
    console.error("❌ Error registering user:", error);
    throw error;
  }
}

/**
 * Reissue a token for a user
 */
async function reissueToken(
  client: OnDemandTokenizationClient,
  accountAddress: string,
  accountSigner: algosdk.TransactionSigner,
  assetId: bigint
) {
  try {
    console.log(`🪙 Reissuing token ${assetId} for ${accountAddress.substring(0, 8)}...`);

    // Create a client with the user's signer
    const userClient = new OnDemandTokenizationClient({
      algorand: client.algorand,
      appId: client.appId,
      defaultSender: accountAddress,
      defaultSigner: accountSigner,
    });

    const result = await userClient.send.reissueToken({
      args: { assetId },
      extraFee: algokit.microAlgos(2000), // Extra fee for inner transaction
    });

    const txId = result.txIds ? result.txIds[0] : undefined;
    console.log("✅ Token reissued successfully!");
    console.log(`📋 Transaction ID: ${txId}`);
    return result;
  } catch (error) {
    console.error("❌ Error reissuing token:", error);
    throw error;
  }
}

/**
 * Check if a user can reissue a token
 */
async function canReissueToken(
  client: OnDemandTokenizationClient,
  accountAddress: string
) {
  try {
    console.log(`🔍 Checking reissue eligibility for ${accountAddress.substring(0, 8)}...`);

    const result = await client.send.canReissueToken({
      args: { account: accountAddress },
    });

    const canReissue = result.return === 1n;
    console.log(`📋 User ${accountAddress.substring(0, 8)}... ${canReissue ? "CAN ✅" : "CANNOT ❌"} reissue tokens`);
    return canReissue;
  } catch (error) {
    console.error("❌ Error checking reissue eligibility:", error);
    return false;
  }
}

/**
 * Get user token information
 */
async function getUserTokenInfo(
  client: OnDemandTokenizationClient,
  accountAddress: string
) {
  try {
    console.log(`📊 Getting token info for ${accountAddress.substring(0, 8)}...`);

    const result = await client.send.getUserTokenInfo({
      args: { account: accountAddress },
    });

    const [reissueCount, lastReissue] = result.return ?? [undefined, undefined];
    console.log(`📋 User ${accountAddress.substring(0, 8)}...:`);
    console.log(`   • Reissue count: ${reissueCount}`);
    console.log(`   • Last reissue: ${lastReissue} (timestamp)`);

    return {
      reissueCount,
      lastReissue,
    };
  } catch (error) {
    console.error("❌ Error getting user token info:", error);
    throw error;
  }
}

/**
 * Update contract configuration (owner only)
 */
async function updateConfig(
  client: OnDemandTokenizationClient,
  ownerSigner: algosdk.TransactionSigner,
  maxReissues: bigint,
  cooldownSeconds: bigint
) {
  try {
    console.log("⚙️ Updating contract configuration...");

    const result = await client.send.updateConfig({
      args: { maxReissues, cooldown: cooldownSeconds },
      extraFee: algokit.microAlgos(1000),
    });

    const txId = result.txIds ? result.txIds[0] : undefined;
    console.log("✅ Contract configuration updated successfully!");
    console.log(`📋 Transaction ID: ${txId}`);
    return result;
  } catch (error) {
    console.error("❌ Error updating contract config:", error);
    throw error;
  }
}

/**
 * Get contract global state information
 */
async function getContractInfo(client: OnDemandTokenizationClient) {
  try {
    console.log("📊 Getting contract information...");

    const appInfo = await client.algorand.client.algod.getApplicationByID(client.appId).do();
    const globalState: any = {};
    
    if (appInfo.params['global-state']) {
      appInfo.params['global-state'].forEach((item: any) => {
        const key = Buffer.from(item.key, 'base64').toString();
        const value = item.value.type === 1 ? 
          Buffer.from(item.value.bytes, 'base64').toString() : 
          item.value.uint;
        globalState[key] = value;
      });
    }

    console.log("📋 Contract Global State:");
    console.log(`   • Max Reissues: ${globalState.max_reissues || 'N/A'}`);
    console.log(`   • Cooldown: ${globalState.cooldown || 'N/A'} seconds`);
    console.log(`   • Owner: ${globalState.owner || 'N/A'}`);

    return globalState;
  } catch (error) {
    console.error("❌ Error getting contract info:", error);
    throw error;
  }
}

/**
 * Main demonstration function
 */
async function main() {
  console.log("🎯 Starting OnDemand Tokenization Demo");
  console.log("=".repeat(50));

  try {
    // Connect to Algorand
    console.log("\n📡 Connecting to Algorand Testnet...");
    const algorand = algokit.AlgorandClient.testNet();

    // Create signers
    console.log("\n🔐 Setting up signers...");
    const ownerSigner = createSigner(CONFIG.SENDER_MNEMONIC);
    const userSigner = createSigner(CONFIG.RECEIVER_MNEMONIC);

    // Deploy tokenization contract
    console.log("\n🚀 Deploying Tokenization Contract...");
    const contractResult = await deployTokenizationContract(
      algorand, 
      CONFIG.SENDER, 
      ownerSigner, 
      CONFIG.MAX_REISSUES, 
      CONFIG.COOLDOWN_SECONDS
    );

    // Get contract address
    const appAddress = typeof contractResult.appAddress === "string" 
      ? contractResult.appAddress 
      : algosdk.encodeAddress(contractResult.appAddress.publicKey);

    // Opt contract into ASA (required for holding tokens)
    console.log("\n🔗 Opting contract into ASA...");
    await optAccountIntoASA(algorand, appAddress, ownerSigner, CONFIG.ASA_ID);

    // Fund contract with ASA tokens
    console.log("\n💰 Funding contract with ASA tokens...");
    await fundContractWithASA(
      algorand,
      appAddress,
      CONFIG.SENDER,
      ownerSigner,
      CONFIG.ASA_ID,
      100n // Fund with 100 tokens for reissuance
    );

    // Get initial contract info
    console.log("\n📊 Initial Contract State:");
    await getContractInfo(contractResult.client);

    // Opt users into the app
    console.log("\n🔗 Opting users into app...");
    await optInAccountToApp(algorand, contractResult.client, CONFIG.SENDER, ownerSigner);
    await optInAccountToApp(algorand, contractResult.client, CONFIG.RECEIVER, userSigner);

    // Opt users into ASA (required before receiving tokens)
    console.log("\n🔗 Opting users into ASA...");
    await optAccountIntoASA(algorand, CONFIG.SENDER, ownerSigner, CONFIG.ASA_ID);
    await optAccountIntoASA(algorand, CONFIG.RECEIVER, userSigner, CONFIG.ASA_ID);

    // Register users
    console.log("\n📝 Registering users...");
    await registerUser(contractResult.client, CONFIG.SENDER, ownerSigner);
    await registerUser(contractResult.client, CONFIG.RECEIVER, userSigner);

    // Check reissue eligibility
    console.log("\n🔍 Checking reissue eligibility...");
    await canReissueToken(contractResult.client, CONFIG.SENDER);
    await canReissueToken(contractResult.client, CONFIG.RECEIVER);

    // Get initial user token info
    console.log("\n📊 Initial User Token Info:");
    await getUserTokenInfo(contractResult.client, CONFIG.SENDER);
    await getUserTokenInfo(contractResult.client, CONFIG.RECEIVER);

    // Reissue tokens
    console.log("\n🪙 Reissuing tokens...");
    await reissueToken(contractResult.client, CONFIG.SENDER, ownerSigner, BigInt(CONFIG.ASA_ID));
    await reissueToken(contractResult.client, CONFIG.RECEIVER, userSigner, BigInt(CONFIG.ASA_ID));

    // Check updated eligibility (should be affected by cooldown)
    console.log("\n🔍 Checking reissue eligibility after reissuance...");
    await canReissueToken(contractResult.client, CONFIG.SENDER);
    await canReissueToken(contractResult.client, CONFIG.RECEIVER);

    // Get updated user token info
    console.log("\n📊 Updated User Token Info:");
    await getUserTokenInfo(contractResult.client, CONFIG.SENDER);
    await getUserTokenInfo(contractResult.client, CONFIG.RECEIVER);

    // Try to reissue again (should fail due to cooldown)
    console.log("\n🪙 Attempting immediate reissuance (should fail due to cooldown)...");
    try {
      await reissueToken(contractResult.client, CONFIG.SENDER, ownerSigner, BigInt(CONFIG.ASA_ID));
    } catch (error) {
      console.log("✅ Expected failure: Cooldown period not met");
    }

    // Update contract configuration
    console.log("\n⚙️ Updating contract configuration...");
    await updateConfig(contractResult.client, ownerSigner, 10n, 1800n); // 10 max reissues, 30 min cooldown

    // Get final contract info
    console.log("\n📊 Final Contract State:");
    await getContractInfo(contractResult.client);

    console.log("\n🎉 OnDemand Tokenization Demo Completed!");
    console.log("✅ Successfully demonstrated:");
    console.log("   • Contract deployment and configuration");
    console.log("   • Contract ASA opt-in and funding");
    console.log("   • User app and ASA opt-ins");
    console.log("   • User registration");
    console.log("   • Token reissuance with limits and cooldowns");
    console.log("   • Eligibility checking");
    console.log("   • Configuration updates");
    console.log(`🔗 Contract on Explorer: https://testnet.algoexplorer.io/application/${contractResult.appId}`);

    return {
      success: true,
      appId: contractResult.appId,
      appAddress: contractResult.appAddress,
    };
  } catch (error) {
    console.error("\n❌ Demo failed:", error);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Make sure your ASA_ID is correct and you own tokens");
    console.log("2. Ensure your account has testnet ALGO");
    console.log("3. Check that your mnemonics are correct");
    console.log("4. Verify you've built the contract first");
    console.log("5. Make sure the contract is funded with ASA tokens");

    return {
      success: false,
      error: error,
    };
  }
}

// Export all functions for use in other modules
export {
  main,
  deployTokenizationContract,
  optInAccountToApp,
  optAccountIntoASA,
  fundContractWithASA,
  registerUser,
  reissueToken,
  canReissueToken,
  getUserTokenInfo,
  updateConfig,
  getContractInfo,
  createSigner,
  CONFIG,
};

// Run the demo if this file is executed directly
if (require.main === module) {
  main()
    .then((result) => {
      if (result?.success) {
        console.log("\n🎊 OnDemand Tokenization demo completed successfully!");
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