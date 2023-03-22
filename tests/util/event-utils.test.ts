import { log, newMockEvent } from 'matchstick-as';
import { ethereum, Bytes, BigInt } from '@graphprotocol/graph-ts';
import {
  Nullifiers as NullifiersEvent,
  CommitmentBatch as CommitmentBatchEvent,
  GeneratedCommitmentBatch as GeneratedCommitmentBatchEvent,
  Nullified as NullifiedEvent,
  Transact as TransactEvent,
  Unshield as UnshieldEvent,
  Shield as ShieldEvent,
  Shield1 as ShieldLegacyEvent,
  GeneratedCommitmentBatchCommitmentsStruct,
} from '../../generated/RailgunSmartWallet/RailgunSmartWallet';

export function createNullifiersEvent(
  treeNumber: BigInt,
  nullifiers: BigInt[],
): NullifiersEvent {
  const event: NullifiersEvent = changetype<NullifiersEvent>(newMockEvent());

  event.parameters = [];

  event.parameters.push(
    new ethereum.EventParam(
      'treeNumber',
      ethereum.Value.fromUnsignedBigInt(treeNumber),
    ),
  );
  event.parameters.push(
    new ethereum.EventParam(
      'nullifier',
      ethereum.Value.fromUnsignedBigIntArray(nullifiers),
    ),
  );

  return event;
}

export function createGeneratedCommitmentBatchEvent(
  treeNumber: BigInt,
  startPosition: BigInt,
  commitments: ethereum.Value[][],
  encryptedRandom: BigInt[][],
): GeneratedCommitmentBatchEvent {
  const event: GeneratedCommitmentBatchEvent = changetype<
    GeneratedCommitmentBatchEvent
  >(newMockEvent());

  event.parameters = [];

  event.parameters.push(
    new ethereum.EventParam(
      'treeNumber',
      ethereum.Value.fromUnsignedBigInt(treeNumber),
    ),
  );
  event.parameters.push(
    new ethereum.EventParam(
      'startPosition',
      ethereum.Value.fromUnsignedBigInt(startPosition),
    ),
  );
  const tupleCommitmentsArray: ethereum.Tuple[] = changetype<ethereum.Tuple[]>(
    commitments,
  );
  event.parameters.push(
    new ethereum.EventParam(
      'commitments',
      ethereum.Value.fromTupleArray(tupleCommitmentsArray),
    ),
  );
  event.parameters.push(
    new ethereum.EventParam(
      'encryptedRandom',
      ethereum.Value.fromUnsignedBigIntMatrix(encryptedRandom),
    ),
  );

  return event;
}

export function createCommitmentBatchEvent(
  treeNumber: BigInt,
  startPosition: BigInt,
  hash: BigInt[],
  ciphertext: ethereum.Value[][],
): CommitmentBatchEvent {
  const event: CommitmentBatchEvent = changetype<CommitmentBatchEvent>(
    newMockEvent(),
  );

  event.parameters = [];

  event.parameters.push(
    new ethereum.EventParam(
      'treeNumber',
      ethereum.Value.fromUnsignedBigInt(treeNumber),
    ),
  );
  event.parameters.push(
    new ethereum.EventParam(
      'startPosition',
      ethereum.Value.fromUnsignedBigInt(startPosition),
    ),
  );
  event.parameters.push(
    new ethereum.EventParam(
      'hash',
      ethereum.Value.fromUnsignedBigIntArray(hash),
    ),
  );
  const tupleCiphertextArray: ethereum.Tuple[] = changetype<ethereum.Tuple[]>(
    ciphertext,
  );
  event.parameters.push(
    new ethereum.EventParam(
      'ciphertext',
      ethereum.Value.fromTupleArray(tupleCiphertextArray),
    ),
  );

  return event;
}
