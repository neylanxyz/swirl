import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { zeroAddress } from "viem";
import { mantleSepoliaTestnet } from 'wagmi/chains';

const projectId = import.meta.env.VITE_PROJECT_ID || '';

export const config = getDefaultConfig({
    appName: 'Swirl Private Pool',
    projectId: projectId || zeroAddress, // Fallback for development
    chains: [mantleSepoliaTestnet],
});
