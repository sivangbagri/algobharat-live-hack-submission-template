import { PeraWalletConnect } from "@perawallet/connect";
import { WalletProvider } from "@txnlab/use-wallet-react";
import algosdk from "algosdk";

import React from "react";
import { WalletConnection } from "./components/WalletConnection";
import { ContractInfo } from "./components/ContractInfo";
import { WhitelistStatus } from "./components/WhitelistStatus";
import MintToken from "./components/MintToken";
function App() {
  return (
    <>
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-4xl mx-auto space-y-10">
          <header className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">Algorand DApp Dashboard</h1>
            <p className="text-gray-500 mt-2">Interact with your wallet and smart contract</p>
          </header>

          <WalletConnection />
          <WhitelistStatus />
          <ContractInfo />
          <MintToken />
        </div>
      </div>
    </>
  );
}

export default App;
