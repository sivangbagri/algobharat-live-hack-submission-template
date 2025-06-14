import React from "react";
import { useWallet, WalletId, type Wallet } from "@txnlab/use-wallet-react";
import algosdk from "algosdk";

export function WalletConnection() {
  const { algodClient, activeAddress, signData, transactionSigner, wallets } = useWallet();
  const [isSending, setIsSending] = React.useState(false);

  const isConnectDisabled = (wallet: Wallet) => wallet.isConnected;

  const setActiveAccount = (event: React.ChangeEvent<HTMLSelectElement>, wallet: Wallet) => {
    wallet.setActiveAccount(event.target.value);
  };

  const sendTransaction = async () => {
    try {
      if (!activeAddress) throw new Error("[App] No active account");
      const atc = new algosdk.AtomicTransactionComposer();
      const suggestedParams = await algodClient.getTransactionParams().do();
      const transaction = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: activeAddress,
        receiver: activeAddress,
        amount: 0,
        suggestedParams,
      });
      atc.addTransaction({ txn: transaction, signer: transactionSigner });
      setIsSending(true);
      const result = await atc.execute(algodClient, 4);
      console.info(`[App] ✅ Successfully sent transaction!`, {
        confirmedRound: result.confirmedRound,
        txIDs: result.txIDs,
      });
    } catch (error) {
      console.error("[App] Error signing transaction:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {wallets.map((wallet) => (
        <div
          key={wallet.id}
          className="border border-gray-300 rounded-2xl p-6 shadow-md space-y-4 bg-white"
        >
          <h4 className="text-xl font-semibold flex items-center gap-2">
            {wallet.metadata.name}
            {wallet.isActive && <span className="text-green-600 text-sm font-medium">[Active]</span>}
          </h4>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => wallet.connect()}
              disabled={isConnectDisabled(wallet)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-blue-700 transition"
            >
              Connect
            </button>
            <button
              type="button"
              onClick={() => wallet.disconnect()}
              disabled={!wallet.isConnected}
              className="bg-red-500 text-white px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-red-600 transition"
            >
              Disconnect
            </button>

            {wallet.isActive ? (
              <>
                <button
                  type="button"
                  onClick={sendTransaction}
                  disabled={isSending}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-purple-700 transition"
                >
                  {isSending ? "Sending Transaction..." : "Send Transaction"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => wallet.setActive()}
                disabled={!wallet.isConnected}
                className="bg-green-500 text-white px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-green-600 transition"
              >
                Set Active
              </button>
            )}
          </div>

          {wallet.isActive && wallet.accounts.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Account:</label>
              <select
                onChange={(e) => setActiveAccount(e, wallet)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {wallet.accounts.map((account) => (
                  <option key={account.address} value={account.address}>
                    {account.address}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
