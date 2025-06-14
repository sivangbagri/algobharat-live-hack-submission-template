import {
  Contract,
  abimethod,
  contract,
  GlobalState,
  LocalState,
  uint64,
  Account,
  itxn,
  assert,
  Txn,
  Global,
  baremethod
} from "@algorandfoundation/algorand-typescript";

@contract({ name: "FinalASAController", avmVersion: 11, stateTotals: { globalUints: 4, localUints: 1 } })
export class SmartASAController extends Contract {
  // Global state fields
  TOTAL_MINTED = GlobalState<uint64>({ key: "total_minted" });
  MAX_SUPPLY = GlobalState<uint64>({ key: "max_supply" });
  OWNER = GlobalState<Account>({ key: "owner" });
  ASA_ID = GlobalState<uint64>({ key: "asa_id" });

  // Local state field for whitelisting
  WHITELISTED = LocalState<uint64>({ key: "whitelisted" });

  /**
   * Create the contract with ASA ID and max supply
   */
  @abimethod({ onCreate: "require" })
  public create(assetId: uint64, maxSupply: uint64): void {
    this.ASA_ID.value = assetId;
    this.MAX_SUPPLY.value = maxSupply;
    this.TOTAL_MINTED.value = 0;
    this.OWNER.value = Txn.sender;
  }

  @baremethod({ allowActions: ["OptIn"] })
  public optIn(): void {
    // Initialize local state if needed
    this.WHITELISTED(Txn.sender).value = 0;
  }
  /**
   * Add an account to the whitelist (only owner)
   */
  @abimethod()
  public addToWhitelist(account: Account): void {
    assert(Txn.sender === this.OWNER.value, "Only owner can add to whitelist");
    this.WHITELISTED(account).value = 1;
  }

  /**
   * Remove an account from the whitelist (only owner)
   */
  @abimethod()
  public removeFromWhitelist(account: Account): void {
    assert(Txn.sender === this.OWNER.value, "Only owner can remove from whitelist");
    this.WHITELISTED(account).value = 0;
  }

  /**
   * Mint tokens to a whitelisted recipient
   */
  @abimethod()
  public mint(recipient: Account, amount: uint64): void {
    // Only owner can mint
    assert(Txn.sender === this.OWNER.value, "Only owner can mint");

    // Check if recipient is whitelisted
    assert(this.WHITELISTED(recipient).value === 1, "Recipient not whitelisted");

    // Check supply limits
    const newTotal: uint64 = this.TOTAL_MINTED.value + amount;
    assert(newTotal <= this.MAX_SUPPLY.value, "Would exceed max supply");

    // Update total minted
    this.TOTAL_MINTED.value = newTotal;

    // Perform ASA transfer using inner transaction
    // The contract must be funded with the ASA tokens first
    itxn
      .assetTransfer({
        xferAsset: this.ASA_ID.value,
        assetReceiver: recipient,
        assetAmount: amount,
        fee: 0,
      })
      .submit();
  }

  /**
   * Validate if a transfer should be allowed
   */
  @abimethod()
  public validateTransfer(from: Account, to: Account, amount: uint64): boolean {
    // Check if recipient is whitelisted
    const isWhitelisted = this.WHITELISTED(to).value === 1;
    assert(isWhitelisted, "Recipient must be whitelisted");

    // Additional validation logic can go here
    // For example: time-based restrictions, amount limits, etc.

    return true;
  }

  /**
   * Check if an account is whitelisted
   */
  @abimethod()
  public checkWhitelist(account: Account): uint64 {
    return this.WHITELISTED(account).value;
  }

  /**
   * Get contract information
   */
  @abimethod()
  public get_total_minted(): uint64 {
    return this.TOTAL_MINTED.value;
  }

  @abimethod()
  public get_max_supply(): uint64 {
    return this.MAX_SUPPLY.value;
  }

  /**
   * Update contract owner (only current owner)
   */
  @abimethod()
  public updateOwner(newOwner: Account): void {
    assert(Txn.sender === this.OWNER.value, "Only current owner can update owner");
    this.OWNER.value = newOwner;
  }

  /**
   * Opt the contract into the ASA (needed for holding tokens)
   */
  @abimethod()
  public optInToAsset(): void {
    // assert(Txn.sender === this.OWNER.value, "Only owner can opt-in");

    itxn
      .assetTransfer({
        xferAsset: this.ASA_ID.value,
        assetReceiver: Global.currentApplicationAddress,
        assetAmount: 0,
        fee: 0,
      })
      .submit();
  }

  /**
   * Fund contract with ASA tokens for minting
   */
  @abimethod()
  public fundContract(amount: uint64): void {
    assert(Txn.sender === this.OWNER.value, "Only owner can fund contract");

    // This method expects the owner to send ASA tokens to the contract
    // The actual transfer happens in the transaction group, not here
    // This is just a placeholder for the logic
  }
}
