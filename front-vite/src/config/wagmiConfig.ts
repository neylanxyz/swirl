import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mantle } from 'wagmi/chains';

const projectId = import.meta.env.VITE_PROJECT_ID || '';

export const config = getDefaultConfig({
    appName: 'RainbowKit demo',
    projectId: projectId || '00000000000000000000000000000000', // Fallback for development
    chains: [mantle],
});
