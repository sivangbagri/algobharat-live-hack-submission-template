import React, { useState, useEffect } from "react";
import { useWallet } from "@txnlab/use-wallet-react";
import { contractService } from "../services/contractService";
import { CONTRACT_CONFIG } from "../config/config";

export const ContractInfo: React.FC = () => {
  const { activeAccount, transactionSigner } = useWallet();
  const [contractInfo, setContractInfo] = useState<{
    totalMinted: bigint;
    maxSupply: bigint;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchContractInfo = async () => {
    if (!activeAccount) return;

    setLoading(true);
    try {
      contractService.initializeClient(transactionSigner, activeAccount.address);

      const info = await contractService.getContractInfo();
      setContractInfo({
        totalMinted: info.totalMinted !== undefined ? info.totalMinted : 0n,
        maxSupply: info.maxSupply !== undefined ? info.maxSupply : 0n,
      });
    } catch (error) {
      console.error("Error fetching contract info:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeAccount) {
      fetchContractInfo();
    }
  }, [activeAccount]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-md space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Contract Information</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-100 rounded-lg">
          <div className="text-sm text-gray-500">ASA ID</div>
          <div className="text-base font-medium text-gray-800">{CONTRACT_CONFIG.ASA_ID}</div>
        </div>

        <div className="p-4 bg-gray-100 rounded-lg">
          <div className="text-sm text-gray-500">App ID</div>
          <div className="text-base font-medium text-gray-800">{CONTRACT_CONFIG.APP_ID}</div>
        </div>

        {contractInfo && (
          <>
            <div className="p-4 bg-gray-100 rounded-lg">
              <div className="text-sm text-gray-500">Total Minted</div>
              <div className="text-base font-medium text-gray-800">
                {contractInfo.totalMinted.toString()}
              </div>
            </div>

            <div className="p-4 bg-gray-100 rounded-lg">
              <div className="text-sm text-gray-500">Max Supply</div>
              <div className="text-base font-medium text-gray-800">
                {contractInfo.maxSupply.toString()}
              </div>
            </div>
          </>
        )}
      </div>

      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={fetchContractInfo}
          disabled={loading}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          Refresh Info
        </button>
      </div>
    </div>
  );
};
