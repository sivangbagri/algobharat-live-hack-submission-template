import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/App.css";
import { PeraWalletConnect } from "@perawallet/connect";

import ErrorBoundary from "./components/ErrorBoundary";
import { NetworkId, WalletId, WalletManager, WalletProvider } from "@txnlab/use-wallet-react";
import algosdk from "algosdk";

const walletManager = new WalletManager({
  wallets: [WalletId.PERA, WalletId.EXODUS],
  defaultNetwork: NetworkId.TESTNET,
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <WalletProvider manager={walletManager}>
        <App />
      </WalletProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
