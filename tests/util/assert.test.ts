import { ethereum } from '@graphprotocol/graph-ts';
import { assert } from 'matchstick-as';

export const assertCommonFields = (
  entityType: string,
  id: string,
  event: ethereum.Event,
): void => {
  assert.fieldEquals(
    entityType,
    id,
    'blockNumber',
    event.block.number.toString(),
  );

  assert.fieldEquals(
    entityType,
    id,
    'blockTimestamp',
    event.block.timestamp.toString(),
  );

  assert.fieldEquals(
    entityType,
    id,
    'transactionHash',
    event.transaction.hash.toHexString(),
  );
};
