# CloneGuard 🛡️

**Blockchain-based APK authenticity verification on Solana**

CloneGuard lets developers register the hash of their genuine APK on the Solana blockchain. Anyone can then verify if an APK file is real or a fake clone — in under 2 seconds, without any central authority.

---

## The Problem

Millions of users in India install APK files from WhatsApp, Telegram, and third-party websites. These APKs could be fake versions of real apps like PhonePe or BHIM that steal credentials and drain bank accounts. There is currently no easy way to verify if a downloaded APK is genuine before installing it.

---

## How CloneGuard Solves It

1. **Developer registers** their APK → browser computes SHA-256 hash → stored on Solana blockchain via wallet-signed transaction
2. **User downloads** any APK → browser computes its hash → compared against on-chain record
3. **Result is instant** → ✅ VERIFIED (hashes match) or 🚨 CLONE DETECTED (hashes differ)

Everything happens in the browser. The APK file is never uploaded to any server.

---

## Live Deployment

| Detail | Value |
|---|---|
| Network | Solana Devnet |
| Program ID | `9YqBRvxkBv7N2RPzEnAdUi4VUVxZB1aukK4sTio5QWha` |
| Verify on | [Solana Explorer](https://explorer.solana.com/address/9YqBRvxkBv7N2RPzEnAdUi4VUVxZB1aukK4sTio5QWha?cluster=devnet) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Rust + Anchor 0.32.1 |
| Blockchain | Solana Devnet |
| Frontend | React 18 + Vite 8 + Tailwind CSS v3 |
| Wallet | Phantom (Standard Wallet Adapter) |
| Hashing | SHA-256 (browser) + Poseidon (ZK-ready) |

---

## Project Structure

```
CloneGuard/
├── programs/
│   └── clone_guard/
│       └── src/
│           ├── lib.rs               # Program entry point
│           └── instructions/
│               ├── register_app.rs  # Register APK hash on-chain
│               ├── verify_app.rs    # Read and return stored hash
│               ├── report_clone.rs  # Submit clone report on-chain
│               └── update_app.rs    # Update hash for new release
├── app/                             # React frontend
│   ├── src/
│   │   ├── components/              # UI pages
│   │   └── utils/
│   │       ├── hash.js              # SHA-256 computation
│   │       └── solana.js            # Anchor + RPC helpers
│   └── vite.config.js
├── tests/                           # Anchor integration tests
└── Anchor.toml
```

---

## Smart Contract Instructions

| Instruction | Who Can Call | What It Does |
|---|---|---|
| `register_app` | Developer only | Creates PDA, stores APK hash + metadata |
| `verify_app` | Anyone | Fetches on-chain hash for comparison |
| `report_clone` | Anyone | Writes permanent clone report on-chain |
| `update_app` | Developer only | Updates hash when new version is released |

Each app is stored in a **Program Derived Address (PDA)** — a unique on-chain account derived from the developer's wallet and app ID. No two apps can share the same address.

---

## Getting Started

### Prerequisites
- Rust 1.82.0
- Solana CLI ≥ 1.18
- Anchor CLI 0.32.1
- Node.js ≥ 18
- Phantom wallet browser extension

### Setup

```bash
# Clone the repo
git clone https://github.com/rishabhyadav03/CloneGuard.git
cd CloneGuard

# Install dependencies
yarn install

# Set Solana to Devnet
solana config set --url devnet
solana airdrop 2

# Build and deploy
anchor build
anchor deploy

# Run tests
anchor test --skip-local-validator
```

### Run the Frontend

```bash
cd app
npm install
npm run dev
# Open http://localhost:5173
# Connect Phantom wallet set to Devnet
```


## Future Work — Zero Knowledge Proofs

CloneGuard is already architected for ZK proof integration. The Poseidon hash function used internally is ZK-circuit-friendly and works natively with the BN254 elliptic curve.

**Planned ZK roadmap:**

- **Circom 2.0** — Write ZK circuits for APK ownership proof
- **Groth16 / snarkjs** — Generate proofs that a developer owns an APK without revealing the APK itself
- **On-chain Solana verifier** — Deploy a Solana program that verifies Groth16 proofs on-chain

This will allow developers to prove their APK is genuine without revealing proprietary code — important for enterprise and government apps.

---

## Security

- APK hashes are stored in Solana PDAs — immutable by anyone except the original publisher
- `has_one = publisher` constraint in Anchor ensures only the original developer can update records
- Clone reports are permanent — cannot be deleted or modified by any party
- SHA-256 collision resistance means even a 1-byte change in the APK produces a completely different hash

---
