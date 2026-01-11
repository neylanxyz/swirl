import { createConfig } from "ponder";

import { SWIRL_PRIVATE_POOL_ABI } from "./abis/PrimitiveManagerAbi";

export default createConfig({
  chains: {
    mantlesepolia: {
      id: 5003,
      rpc: process.env.PONDER_RPC_URL_5003 || "https://rpc.sepolia.mantle.xyz",
    }
  },
  contracts: {
    SwirlPrivatePool: {
      chain: "mantlesepolia",
      abi: SWIRL_PRIVATE_POOL_ABI,
      address: "0xE91EAeD965BEB42854E509af76281F0BF03a648d",
      startBlock: 33218468,
      filter: [
        {
          event: "Deposit",
          args: {}
        },
        {
          event: "Withdrawal",
          args: {}
        }
      ],
    },
  },
});
