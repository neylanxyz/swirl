import { onchainTable } from "ponder";

export const depositEvent = onchainTable("depositEvent", (t) => ({
  id: t.text().primaryKey(),
  commitment: t.hex().notNull(),
  leafIndex: t.integer().notNull(),
  transactionHash: t.hex().notNull(),
  timestamp: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
}));

export const withdrawalEvent = onchainTable("withdrawalEvent", (t) => ({
  id: t.text().primaryKey(),
  recipient: t.hex().notNull(),
  nullifierHash: t.hex().notNull(),
  transactionHash: t.hex().notNull(),
  timestamp: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
}));
