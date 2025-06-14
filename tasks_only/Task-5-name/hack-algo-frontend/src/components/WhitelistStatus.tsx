import React, { useState, useEffect } from "react";
import { useWallet } from "@txnlab/use-wallet-react";
import { contractService } from "../services/contractService";

export const WhitelistStatus: React.FC = () => {
  const { activeAccount, transactionSigner } = useWallet();
  const [isWhitelisted, setIsWhitelisted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    if (!activeAccount) return;

    setLoading(true);
    try {
      if (transactionSigner) {
        contractService.initializeClient(transactionSigner, activeAccount.address);
      }

      const status = await contractService.checkWhitelist(activeAccount.address);
      setIsWhitelisted(status);
    } catch (error) {
      console.error("Error checking whitelist status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeAccount) {
      checkStatus();
    }
  }, [activeAccount]);

  if (!activeAccount) {
    return null;
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-md space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Whitelist Status</h2>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
        </div>
      ) : (
        <div
          className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
            isWhitelisted === null
              ? "bg-gray-200 text-gray-700"
              : isWhitelisted
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-red-100 text-red-700 border border-red-300"
          }`}
        >
          {isWhitelisted === null
            ? "Status Unknown"
            : isWhitelisted
            ? "Whitelisted ✅"
            : "Not Whitelisted ❌"}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={checkStatus}
          disabled={loading}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          Refresh Status
        </button>
      </div>
    </div>
  );
};
