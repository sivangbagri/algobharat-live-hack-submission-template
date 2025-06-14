# Hack Algo Frontend

A modern React-based frontend for interacting with Algorand smart contracts, including ASA (Algorand Standard Asset) minting, contract information display, and wallet integration (Pera Wallet, etc).

## Features

- **Wallet Connection:** Connect and interact with Algorand wallets (Pera Wallet, etc).
- **Contract Info:** View ASA ID, App ID, total minted, and max supply from the smart contract.
- **Mint ASA Tokens:** Mint new ASA tokens directly from the UI (if whitelisted/authorized).
- **Responsive UI:** Clean, modern, and mobile-friendly interface.

## Tech Stack

- React + TypeScript
- Tailwind CSS (or similar utility classes)
- Algorand SDK & algokit-utils
- @txnlab/use-wallet-react

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
 git clone <your-repo-url>
 cd hack-algo-frontend

# Install dependencies
 npm install
# or
yarn install
```

### Environment Variables

Copy `.env.template` to `.env` and fill in the required values:

```bash
cp .env.template .env
```

Key variables include:

- `VITE_ALGOD_SERVER` - Algorand node URL (Testnet/Mainnet)
- `VITE_ALGOD_TOKEN` - Algorand API token
- `VITE_ALGOD_PORT` - Algorand node port
- `VITE_NETWORK` - `testnet` or `mainnet`
- `VITE_CONTRACT_APP_ID` - Deployed contract App ID
- `VITE_CONTRACT_ASA_ID` - ASA ID

### Running the App

```bash
npm run dev
# or
yarn dev
```

The app will be available at [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal).

## Usage

### 1. Connect Your Wallet

- Click the wallet connect button and choose your preferred wallet (e.g., Pera Wallet).
- Make sure your wallet is on the same network (Testnet/Mainnet) as the dApp.

### 2. View Contract Info

- The dashboard displays ASA ID, App ID, total minted, and max supply.
- Click "Refresh Info" to update contract data.

### 3. Mint ASA Tokens

- Enter the amount you wish to mint in the Mint section.
- Click "Mint". If your account is authorized, the transaction will be sent and you'll see a success message.

### 4. Troubleshooting

- **Network Mismatch:** Ensure both your wallet and the dApp are on the same network.
- **Not Whitelisted:** Only whitelisted/authorized accounts can mint tokens.
- **Transaction Fails:** Check wallet connection, network, and contract state.

## Project Structure

```
├── src/
│   ├── components/         # React components (ContractInfo, MintToken, etc)
│   ├── services/           # contractService for Algorand interactions
│   ├── config/             # App/contract configuration
│   └── ...
├── public/                 # Static assets
├── .env.template           # Example environment variables
├── package.json            # Project dependencies and scripts
└── README.md               # This file
```

## Customization

- Update contract addresses and IDs in `.env` or `src/config/config.ts` as needed.
- Style the UI using Tailwind or your preferred CSS framework.

## License

MIT

---

**Made with ❤️ for Algorand hackathons and builders!**
