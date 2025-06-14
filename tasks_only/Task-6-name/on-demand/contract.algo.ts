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
} from "@algorandfoundation/algorand-typescript";

@contract({ name: "OnDemandTokenization", avmVersion: 11, stateTotals: { globalUints: 3, localUints: 2 } })
export class OnDemandTokenizationContract extends Contract {
  // Global state
  MAX_REISSUES = GlobalState<uint64>({ key: "max_reissues" });
  REISSUE_COOLDOWN = GlobalState<uint64>({ key: "cooldown" });
  OWNER = GlobalState<Account>({ key: "owner" });

  // Local state for each user
  LAST_REISSUE = LocalState<uint64>({ key: "last_reissue" });
  REISSUE_COUNT = LocalState<uint64>({ key: "reissue_count" });

  /**
   * Initialize contract with max reissues and cooldown period
   */
  @abimethod({ onCreate: "require" })
  public create(maxReissues: uint64, cooldown: uint64): void {
    this.MAX_REISSUES.value = maxReissues;
    this.REISSUE_COOLDOWN.value = cooldown;
    this.OWNER.value = Txn.sender;
  }

  /**
   * Register a user for token reissuance (initialize local state)
   */
  @abimethod()
  public registerUser(): void {
    this.LAST_REISSUE(Txn.sender).value = 0;
    this.REISSUE_COUNT(Txn.sender).value = 0;
  }

  /**
   * Re-issue a token for a registered user (requires assetId as parameter)
   */
  @abimethod()
  public reissueToken(assetId: uint64): void {
    assert(this.REISSUE_COUNT(Txn.sender).value < this.MAX_REISSUES.value, "Max reissues reached");
    const now = Global.latestTimestamp;
    const last = this.LAST_REISSUE(Txn.sender).value;
    assert(last === 0 || now - last >= this.REISSUE_COOLDOWN.value, "Cooldown not met");

    // Transfer 1 unit of the asset to the user (minting must be handled off-chain)
    itxn.assetTransfer({
      xferAsset: assetId,
      assetReceiver: Txn.sender,
      assetAmount: 1,
      fee: 0,
    }).submit();

    this.REISSUE_COUNT(Txn.sender).value += 1;
    this.LAST_REISSUE(Txn.sender).value = now;
  }

  /**
   * Check if a user can reissue a token
   */
  @abimethod()
  public canReissueToken(account: Account): uint64 {
    const count = this.REISSUE_COUNT(account).value;
    const last = this.LAST_REISSUE(account).value;
    const now = Global.latestTimestamp;
    if (count >= this.MAX_REISSUES.value) return 0;
    if (last > 0 && now - last < this.REISSUE_COOLDOWN.value) return 0;
    return 1;
  }

  /**
   * Get user token info (reissue count and last reissue time)
   */
  @abimethod()
  public getUserTokenInfo(account: Account): [uint64, uint64] {
    return [this.REISSUE_COUNT(account).value, this.LAST_REISSUE(account).value];
  }

  /**
   * Update contract configuration (only owner)
   */
  @abimethod()
  public updateConfig(maxReissues: uint64, cooldown: uint64): void {
    assert(Txn.sender === this.OWNER.value, "Only owner can update config");
    this.MAX_REISSUES.value = maxReissues;
    this.REISSUE_COOLDOWN.value = cooldown;
  }
}