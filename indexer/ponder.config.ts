import { createConfig } from "ponder";

import { SWIRL_PRIVATE_POOL_ABI } from "./abis/PrimitiveManagerAbi";

export default createConfig({
  chains: {
    mantlesepolia: {
      id: 5003,
      rpc: process.env.PONDER_RPC_URL_5003 || "https://rpc.sepolia.mantle.xyz",
      pollingInterval: 5_000,
    },
  },
  contracts: {
    SwirlPrivatePool: {
      chain: "mantlesepolia",
      abi: SWIRL_PRIVATE_POOL_ABI,
      address: "0xDAfA37E8DA60c00F689e70fefcD06EdC1C4dACbe",
      startBlock: 33349712,
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
