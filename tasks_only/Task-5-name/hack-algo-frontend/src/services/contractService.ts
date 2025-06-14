import algosdk from "algosdk";
import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import { FinalAsaControllerClient } from "../contracts/FinalASAController";
import { CONTRACT_CONFIG } from "../config/config";

export class ContractService {
  private algorand: AlgorandClient;
  private client: FinalAsaControllerClient | null = null;

  constructor() {
    this.algorand = AlgorandClient.testNet(); // or mainnet
  }

  // Initialize contract client
  initializeClient(signer: algosdk.TransactionSigner, sender: string) {
    this.client = new FinalAsaControllerClient({
      algorand: this.algorand,
      defaultSender: sender,
      defaultSigner: signer,
      appId: BigInt(CONTRACT_CONFIG.APP_ID),
    });
    return this.client;
  }

  // Get contract client
  getClient() {
    if (!this.client) {
      throw new Error("Contract client not initialized");
    }
    return this.client;
  }

  // Check if user is whitelisted
  async checkWhitelist(userAddress: string): Promise<boolean> {
    try {
      const result = await this.getClient().send.checkWhitelist({
        args: { account: userAddress },
      });
      return result.return === 1n;
    } catch (error) {
      console.error("Error checking whitelist:", error);
      return false;
    }
  }

  // Get contract info
  async getContractInfo() {
    try {
      const [totalMinted, maxSupply] = await Promise.all([
        this.getClient().send.getTotalMinted({ args: [] }),
        this.getClient().send.getMaxSupply({ args: [] }),
      ]);

      return {
        totalMinted: totalMinted.return,
        maxSupply: maxSupply.return,
      };
    } catch (error) {
      console.error("Error getting contract info:", error);
      throw error;
    }
  }

  async mint({ signer, sender, amount }: { signer: algosdk.TransactionSigner; sender: string; amount: bigint }) {
    this.initializeClient(signer, sender);
    const client = this.getClient();
    // Pass recipient and amount as named args
    return await client.send.mint({
      args: {
        recipient: sender,
        amount: amount,
      },
    });
  }
}

export const contractService = new ContractService();
