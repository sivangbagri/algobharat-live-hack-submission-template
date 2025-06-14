import React, { useState } from "react";
import { useWallet } from "@txnlab/use-wallet-react";
import { contractService } from "../services/contractService";

const MintToken: React.FC = () => {
  const { activeAccount, transactionSigner } = useWallet();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMint = async () => {
    setSuccess(null);
    setError(null);

    if (!activeAccount || !transactionSigner) {
      setError("Please connect your wallet.");
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setLoading(true);
    try {
      await contractService.mint({
        signer: transactionSigner,
        sender: activeAccount.address,
        amount: BigInt(amount),
      });
      setSuccess("✅ Mint successful!");
      setAmount("");
    } catch (e: any) {
      setError(e?.message || "❌ Mint failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-md space-y-4 mt-10">
      <h2 className="text-2xl font-semibold text-gray-800">Mint ASA Token</h2>

      <input
        type="number"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        placeholder="Amount to mint"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        min="1"
        disabled={loading}
      />

      {success && <p className="text-green-600">{success}</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="flex justify-end">
        <button
          onClick={handleMint}
          disabled={loading}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Mint"
          )}
        </button>
      </div>
    </div>
  );
};

export default MintToken;
