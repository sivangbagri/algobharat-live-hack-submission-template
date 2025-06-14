// smart-contract/task1/task1.ts
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import algosdk from 'algosdk'

// Initialize Algorand client
const algodConfig = getAlgodConfigFromViteEnvironment()
const algorand = AlgorandClient.fromConfig({ algodConfig })

/**
 * Create an Algorand Standard Asset (ASA)
 */
export async function createASAToken() {
  try {
    console.log('🚀 Starting ASA token creation...')

   
    // Create the ASA token
    const result = await algorand.send.assetCreate({
      sender: "BIYJ5RDQTR72PWWH7L3MFEAOSMLDDWMEXIPROOFRY7Z5GEXOQ56N3BVJ3Ir",
      total: 1000000n,              // Total supply (1,000,000 tokens in base units)
      decimals: 2,                  // 2 decimal places (so 1000000n = 10,000.00 tokens)
      assetName: 'live hack Token',        // Asset name (max 32 bytes)
      unitName: 'MTK',              // Unit name/ticker (max 8 bytes)
      url: 'https://x.com/hivang26_',   // Optional: URL for more info
      defaultFrozen: false,         // Tokens are not frozen by default
      // Management addresses (optional)
      manager: "BIYJ5RDQTR72PWWH7L3MFEAOSMLDDWMEXIPROOFRY7Z5GEXOQ56N3BVJ3Ir", // Can reconfigure the asset
      reserve: "BIYJ5RDQTR72PWWH7L3MFEAOSMLDDWMEXIPROOFRY7Z5GEXOQ56N3BVJ3Ir", // Holds reserve tokens
      freeze: undefined,            // No freeze capability  
      clawback: undefined,          // No clawback capability
    })

    console.log('✅ ASA Token Created Successfully!')
    console.log(`Asset ID: ${result.assetId}`)
    console.log(`Transaction ID: ${result.txIds[0]}`)
    console.log(`Confirmed Round: ${result.confirmation.confirmedRound}`)
 
    return {
      assetId: result.assetId,
      txId: result.txIds[0],
      confirmedRound: result.confirmation.confirmedRound,
      creatorAddress:"BIYJ5RDQTR72PWWH7L3MFEAOSMLDDWMEXIPROOFRY7Z5GEXOQ56N3BVJ3Ir"
    }

  } catch (error) {
    console.error('❌ Error creating ASA token:', error)
    throw error
  }
}


export async function main() {
  const tokenResult = await createASAToken()
  console.log(tokenResult)
}

main()
