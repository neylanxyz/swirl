import { ponder } from "ponder:registry";
import schema from "ponder:schema";

ponder.on("SwirlPrivatePool:Deposit", async ({ event, context }) => {
  await context.db.insert(schema.depositEvent).values({
    id: `${event.log.address}-${event.log.logIndex}-${event.block.number}`,
    commitment: event.args.commitment,
    leafIndex: event.args.leafIndex,
    transactionHash: event.transaction.hash,
    timestamp: event.block.timestamp,
    blockNumber: event.block.number,
  });
});

ponder.on("SwirlPrivatePool:Withdrawal", async ({ event, context }) => {
  await context.db.insert(schema.withdrawalEvent).values({
    id: `${event.log.address}-${event.log.logIndex}-${event.block.number}`,
    recipient: event.args.recipient,
    nullifierHash: event.args.nullifierHash,
    transactionHash: event.transaction.hash,
    timestamp: event.block.timestamp,
    blockNumber: event.block.number,
  });
});
