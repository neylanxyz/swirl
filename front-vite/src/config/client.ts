import { createPublicClient, http } from 'viem'
import { mantleSepoliaTestnet } from 'viem/chains'

export const publicClient = createPublicClient({
    chain: mantleSepoliaTestnet,
    transport: http(),
})