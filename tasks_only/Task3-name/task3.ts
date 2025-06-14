import * as algokit from "@algorandfoundation/algokit-utils";
import algosdk, { AlgoCount } from "algosdk";
import {
  FinalAsaControllerClient,
  FinalAsaControllerFactory,
} from "../smart_contracts/artifacts/asa_controller/FinalAsaControllerClient";
import { encodeAddress } from "algosdk";
import { makeApplicationOptInTxnFromObject } from "algosdk";

// Your existing CONFIG with the ASA you created
const CONFIG = {
  SENDER: "XHKY3SZZ5UJULGJVSAXXBXU7H6QMDJNF4UHW226I7EY6DORQFGUKVRPRZA",
  RECEIVER: "YTR6GJAEBG2SFA5PAWU3JY7PRFGCZ7D7FISIBOT3LJA7NWJI7DP54NLVOE",
  SENDER_MNEMONIC:
    "price leisure tongue hundred segment release diamond sugar attitude weapon together month raccoon result cousin way electric rhythm walnut own spoil vast fan above crucial",
  RECEIVER_MNEMONIC:
    "winter buzz kingdom awesome link autumn theory skirt trick half acid ahead quick weather pony embody nasty alpha spike reject unable million office able bird",

   ASA_ID: 741156527, // Replace with your actual ASA ID

  // Smart contract settings
  MAX_SUPPLY: 2000n,
  MINT_AMOUNT: 1000n,
};

// Create signer function
function createSigner(mnemonic: string): algosdk.TransactionSigner {
  try {
    const account = algosdk.mnemonicToSecretKey(mnemonic);
    return algosdk.makeBasicAccountTransactionSigner(account);
  } catch (error) {
    console.error("❌ Error creating signer:", error);
    throw error;
  }
}

// Deploy the smart contract
async function deploySmartContract(algorand: algokit.AlgorandClient, deployer: string, signer: algosdk.TransactionSigner, asaId: bigint) {
  try {
    console.log("🚀 Deploying Smart ASA Controller...");

    // Create the smart contract factory
    const smartContractFactory = new FinalAsaControllerFactory({
      algorand: algorand,
      defaultSender: deployer, // address string
      defaultSigner: signer, // TransactionSigner
    });

    // Deploy the contract with correct method name and parameters
    const deployResult = await smartContractFactory.deploy({
      createParams: {
        sender: deployer,
        signer: signer,
        args: {
          assetId: asaId,
          maxSupply: CONFIG.MAX_SUPPLY,
        },
        method: "create",
      },
      onUpdate: 'update',
    });

    const appClient = deployResult.appClient;

    console.log("✅ Smart contract deployed successfully!");
    console.log(`📋 App ID: ${appClient.appId}`);
    console.log(`📋 App Address: ${appClient.appAddress}`);
    console.log(`🔗 View on AlgoExplorer: https://testnet.algoexplorer.io/application/${appClient.appId}`);

    return {
      appId: appClient.appId,
      appAddress: appClient.appAddress,
      client: appClient,
    };
  } catch (error) {
    console.error("❌ Error deploying smart contract:", error);
    throw error;
  }
}

// Opt contract into ASA (required before minting)
async function optContractIntoASA(client: FinalAsaControllerClient, ownerSigner: algosdk.TransactionSigner) {
  try {
    console.log("🔗 Opting contract into ASA...");



    const result = await client.send.optInToAsset({ args: [],extraFee: algokit.microAlgos(1000) });
    const txId = result.txIds ? result.txIds[0] : undefined;

    console.log("✅ Contract opted into ASA successfully!");
    console.log(`📋 Transaction ID: ${txId}`);
    return result;
  } catch (error) {
    console.error("❌ Error opting into ASA:", error);
    throw error;
  }
}
async function optAccountIntoASA(
    algorand: algokit.AlgorandClient,
    accountAddress: string,
    accountSigner: algosdk.TransactionSigner,
    asaId: number
  ) {
    try {
      console.log(`🔗 Opting ${accountAddress.substring(0, 8)}... into ASA...`);
  
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
      console.log("✅ Account opted into ASA successfully!");
      console.log(`📋 Transaction ID: ${txId}`);
      
      // Wait for confirmation
      await algosdk.waitForConfirmation(algorand.client.algod, txId, 4);
      return result;
    } catch (error) {
      console.error("❌ Error opting account into ASA:", error);
      throw error;
    }
  }

async function optInAccountToApp(
algorand: algokit.AlgorandClient,
  appClient: FinalAsaControllerClient,
  accountAddress: string,
  accountSigner: algosdk.TransactionSigner
) {
  console.log(`🔗 Opting in ${accountAddress.substring(0, 8)}... to the app...`);
  const appId = appClient.appId;  
  const suggestedParams = await appClient.algorand.client.algod.getTransactionParams().do();
//    const optInTxn = algosdk.makeApplicationOptInTxnFromObject({
//     sender: accountAddress,
//     appIndex: appId,
//     suggestedParams,
//   });
const optInTxn= await algorand.createTransaction.appCall({
    sender: accountAddress,
    appId:appClient.appId,
    onComplete: algosdk.OnApplicationComplete.OptInOC,
  })
  const signedTxn = await accountSigner([optInTxn], [0]);
  const result = await appClient.algorand.client.algod.sendRawTransaction(signedTxn).do();
  const txId = result.txid;
  const confirmedTxn = await algosdk.waitForConfirmation(appClient.algorand.client.algod, txId, 4);

  console.log("✅ Account opted in to app successfully!");
  console.log(`📋 Transaction ID: ${txId}`);
  console.log(confirmedTxn)
  return result;
}
// Add address to whitelist
async function addToWhitelist(client: FinalAsaControllerClient, ownerSigner: algosdk.TransactionSigner, addressToWhitelist: string) {
  try {
    console.log(`📝 Adding ${addressToWhitelist.substring(0, 8)}... to whitelist`);

    const result = await client.send.addToWhitelist({
      args: { account: addressToWhitelist },
      extraFee: algokit.microAlgos(1000),
    });
    const txId = result.txIds ? result.txIds[0] : undefined;

    console.log("✅ Address added to whitelist successfully!");
    console.log(`📋 Transaction ID: ${txId}`);
    return result;
  } catch (error) {
    console.error("❌ Error adding to whitelist:", error);
    throw error;
  }
}

// Check whitelist status
async function checkWhitelistStatus(client: FinalAsaControllerClient, address: string) {
  try {
    console.log(`🔍 Checking whitelist status for ${address.substring(0, 8)}...`);

    const result = await client.send.checkWhitelist({
      args: { account: address },
    });
    const isWhitelisted = result.return === 1n;
    console.log(`📋 Address ${address.substring(0, 8)}... is ${isWhitelisted ? "WHITELISTED ✅" : "NOT WHITELISTED ❌"}`);
    return isWhitelisted;
  } catch (error) {
    console.error("❌ Error checking whitelist:", error);
    return false;
  }
}

// Fund contract with ASA tokens (must be done before minting)
async function fundContractWithASA(
  algorand: algokit.AlgorandClient,
  contractAddress: string,
  ownerSigner: algosdk.TransactionSigner,
  asaId: number,
  amount: bigint
) {
  try {
    console.log(`💰 Funding contract with ${amount} ASA tokens...`);

    // Create asset transfer transaction to fund the contract
    const suggestedParams = await algorand.client.algod.getTransactionParams().do();
    const fundTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      sender: CONFIG.SENDER,
      receiver: contractAddress,
      amount: Number(amount),
      assetIndex: asaId,
      suggestedParams,
    });

    // Sign and send the transaction
    const signedTxn = await ownerSigner([fundTxn], [0]);
    const result = await algorand.client.algod.sendRawTransaction(signedTxn).do();

    const txId = result.txid;
    console.log("✅ Contract funded with ASA tokens!");
    console.log(`📋 Transaction ID: ${txId}`);
    // Wait for confirmation
    await algosdk.waitForConfirmation(algorand.client.algod, txId, 4);
    return result;
  } catch (error) {
    console.error("❌ Error funding contract:", error);
    throw error;
  }
}

// Mint tokens to a whitelisted recipient
async function mintTokens(client: FinalAsaControllerClient, ownerSigner: algosdk.TransactionSigner, recipient: string, amount: bigint) {
  try {
    console.log(`🪙 Minting ${amount} tokens to ${recipient.substring(0, 8)}...`);

    const result = await client.send.mint({
      args: { recipient, amount },
      extraFee: algokit.microAlgos(1000)

    });
    const txId = result.txIds ? result.txIds[0] : undefined;

    console.log("✅ Tokens minted successfully!");
    console.log(`📋 Transaction ID: ${txId}`);
    return result;
  } catch (error) {
    console.error("❌ Error minting tokens:", error);
    throw error;
  }
}

// Validate transfer
async function validateTransfer(client: FinalAsaControllerClient, from: string, to: string, amount: bigint) {
  try {
    console.log(`🔍 Validating transfer from ${from.substring(0, 8)}... to ${to.substring(0, 8)}...`);

    const result = await client.send.validateTransfer({
      args: { from, to, amount },
      extraFee: algokit.microAlgos(1000)
    });

    console.log("✅ Transfer validation passed!");
    return result.return;
  } catch (error) {
    console.error("❌ Transfer validation failed:", error);
    return false;
  }
}

// Get contract information
async function getContractInfo(client: FinalAsaControllerClient) {
  try {
    console.log("📊 Getting contract information...");

    // Use the correct method names from the contract
    const totalMintedResult = await client.send.getTotalMinted({ args: [] });
    const maxSupplyResult = await client.send.getMaxSupply({ args: [] });

    return {
      totalMinted: totalMintedResult.return,
      maxSupply: maxSupplyResult.return,
    };
  } catch (error) {
    console.error("❌ Error getting contract info:", error);
    throw error;
  }
}

// Main demonstration function
async function main() {
    console.log("🎯 Starting Smart ASA Controller Demo");
    console.log("=".repeat(50));
  
    try {
      // Connect to Algorand
      console.log("\n📡 Connecting to Algorand Testnet...");
      const algorand = algokit.AlgorandClient.testNet();
  
      // Create signers
      console.log("\n🔐 Setting up signers...");
      const ownerSigner = createSigner(CONFIG.SENDER_MNEMONIC);
      const receiverSigner = createSigner(CONFIG.RECEIVER_MNEMONIC);
  
      // Deploy smart contract
      console.log("\n🚀 Deploying Smart Contract...");
      const contractResult = await deploySmartContract(algorand, CONFIG.SENDER, ownerSigner, BigInt(CONFIG.ASA_ID));
  
      // Opt contract into ASA (required for holding tokens)
      console.log("\n🔗 Opting contract into ASA...");
      await optContractIntoASA(contractResult.client, ownerSigner);
  
      // Fund contract with ASA tokens (required for minting)
      console.log("\n💰 Funding contract with ASA tokens...");
      const appAddress =
        typeof contractResult.appAddress === "string" ? contractResult.appAddress : encodeAddress(contractResult.appAddress.publicKey);
      await fundContractWithASA(
        algorand,
        appAddress,
        ownerSigner,
        CONFIG.ASA_ID,
        CONFIG.MAX_SUPPLY // Fund with max supply
      );
  
      // Get initial contract info
      console.log("\n📊 Initial Contract State:");
      await getContractInfo(contractResult.client);
  
  
      // Opt receiver into ASA (CRITICAL: Required before minting)
      console.log("\n🔗 Opting receiver into ASA...");
      await optAccountIntoASA(algorand, CONFIG.RECEIVER, receiverSigner, CONFIG.ASA_ID);

      
      // Opt receiver into the app first
      console.log("\n🔗 Opting receiver into app...");
      
      try{
        await optInAccountToApp(algorand,contractResult.client, CONFIG.RECEIVER, receiverSigner);
        await optInAccountToApp(algorand,contractResult.client, CONFIG.SENDER, ownerSigner);
      }catch(e){
        console.log("error",e)
      }
      // Add receiver to whitelist
      console.log("\n📝 Adding receiver to whitelist...");
      await addToWhitelist(contractResult.client, ownerSigner, CONFIG.RECEIVER);
  
      // Check whitelist status
      console.log("\n🔍 Checking whitelist status...");
      await checkWhitelistStatus(contractResult.client, CONFIG.RECEIVER);
    //   await checkWhitelistStatus(contractResult.client, CONFIG.SENDER);
  
      // Try to mint tokens to whitelisted address
      console.log("\n🪙 Minting tokens to whitelisted address...");
      await mintTokens(contractResult.client, ownerSigner, CONFIG.RECEIVER, CONFIG.MINT_AMOUNT);
  
      // Validate transfer between addresses
      console.log("\n🔍 Validating transfer to whitelisted address...");
      const transferValid = await validateTransfer(contractResult.client, CONFIG.SENDER, CONFIG.RECEIVER, 500n);
  
      // Try to validate transfer to non-whitelisted address
      console.log("\n🔍 Validating transfer to non-whitelisted address (should fail)...");
      const randomAddress = "BIYJ5RDQTR72PWWH7L3MFEAOSMLDDWMEXIPROOFRY7Z5GEXOQ56N3BVJ3I";
      try {
        const transferInvalid = await validateTransfer(contractResult.client, CONFIG.SENDER, randomAddress, 500n);
      } catch (error) {
        console.log("✅ Expected failure: Transfer to non-whitelisted address was rejected");
      }
  
      // Get final contract info
      console.log("\n📊 Final Contract State:");
      await getContractInfo(contractResult.client);
  
      console.log("\n🎉 Smart ASA Controller Demo Completed!");
      console.log("✅ Successfully demonstrated:");
      console.log("   • Smart contract deployment");
      console.log("   • Contract ASA opt-in");
      console.log("   • Contract funding with ASA tokens");
      console.log("   • Account ASA opt-in (CRITICAL FIX)");
      console.log("   • Account app opt-in");
      console.log("   • Whitelist management");
      console.log("   • Minting with restrictions");
      console.log("   • Transfer validation");
      console.log(`🔗 Contract on Explorer: https://testnet.algoexplorer.io/application/${contractResult.appId}`);
  
      return {
        success: true,
        appId: contractResult.appId,
        appAddress: contractResult.appAddress,
      };
    } catch (error) {
      console.error("\n❌ Demo failed:", error);
      console.log("\n🔧 Troubleshooting:");
      console.log("1. Make sure your ASA_ID is correct");
      console.log("2. Ensure your account has testnet ALGO");
      console.log("3. Check that your mnemonic is correct");
      console.log("4. Verify you've built the contract first");
      console.log("5. Make sure you have enough ASA tokens to fund the contract");
      console.log("6. Ensure receiver has opted into the ASA");
  
      return {
        success: false,
        error: error,
      };
    }
  }
  

// Export functions for use in other modules
export {
  main,
  deploySmartContract,
  optContractIntoASA,
  fundContractWithASA,
  addToWhitelist,
  checkWhitelistStatus,
  mintTokens,
  validateTransfer,
  getContractInfo,
  createSigner,
};

// Run the demo if this file is executed directly
if (require.main === module) {
  main()
    .then((result) => {
      if (result?.success) {
        console.log("\n🎊 Smart ASA Controller demo completed successfully!");
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
