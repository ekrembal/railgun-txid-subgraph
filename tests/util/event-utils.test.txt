import { newMockEvent } from 'matchstick-as';
import { ethereum, Bytes, BigInt, Address } from '@graphprotocol/graph-ts';
import {
  Nullifiers as NullifiersEvent,
  CommitmentBatch as CommitmentBatchEvent,
  GeneratedCommitmentBatch as GeneratedCommitmentBatchEvent,
  Nullified as NullifiedEvent,
  Transact as TransactEvent,
  Unshield as UnshieldEvent,
} from '../../generated/RailgunSmartWallet/RailgunSmartWallet';

const ETHEREUM_CONTRACT = Address.fromString(
  '0xfa7093cdd9ee6932b4eb2c9e1cde7ce00b1fa4b9',
);

const addReceiptContractAddress = (event: ethereum.Event): void => {
  changetype<ethereum.TransactionReceipt>(
    event.receipt,
  ).contractAddress = ETHEREUM_CONTRACT;
};

export const createNullifiersEvent = (
  treeNumber: BigInt,
  nullifiers: BigInt[],
): NullifiersEvent => {
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

  addReceiptContractAddress(event);

  return event;
};

export const createGeneratedCommitmentBatchEvent = (
  treeNumber: BigInt,
  startPosition: BigInt,
  commitments: ethereum.Value[][],
  encryptedRandom: BigInt[][],
): GeneratedCommitmentBatchEvent => {
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

  addReceiptContractAddress(event);

  return event;
};

export const createCommitmentBatchEvent = (
  treeNumber: BigInt,
  startPosition: BigInt,
  hash: BigInt[],
  ciphertext: ethereum.Value[][],
): CommitmentBatchEvent => {
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

  addReceiptContractAddress(event);

  return event;
};

export function createShield<T extends ethereum.Event>(
  treeNumber: BigInt,
  startPosition: BigInt,
  commitments: ethereum.Value[][],
  shieldCiphertext: ethereum.Value[][],
  fees: BigInt[] | null,
): T {
  const event: T = changetype<T>(newMockEvent());

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
  const tupleShieldCiphertextArray: ethereum.Tuple[] = changetype<
    ethereum.Tuple[]
  >(shieldCiphertext);
  event.parameters.push(
    new ethereum.EventParam(
      'shieldCiphertext',
      ethereum.Value.fromTupleArray(tupleShieldCiphertextArray),
    ),
  );

  if (fees) {
    event.parameters.push(
      new ethereum.EventParam(
        'fees',
        ethereum.Value.fromUnsignedBigIntArray(fees),
      ),
    );
  }

  addReceiptContractAddress(event);

  return event;
}

export const createNullifiedEvent = (
  treeNumber: i32,
  nullifiers: Bytes[],
): NullifiedEvent => {
  const event: NullifiedEvent = changetype<NullifiedEvent>(newMockEvent());

  event.parameters = [];

  event.parameters.push(
    new ethereum.EventParam('treeNumber', ethereum.Value.fromI32(treeNumber)),
  );
  event.parameters.push(
    new ethereum.EventParam(
      'nullifier',
      ethereum.Value.fromBytesArray(nullifiers),
    ),
  );

  addReceiptContractAddress(event);

  return event;
};

export const createUnshieldEvent = (
  to: Address,
  token: ethereum.Value[],
  amount: BigInt,
  fee: BigInt,
): UnshieldEvent => {
  const event: UnshieldEvent = changetype<UnshieldEvent>(newMockEvent());

  event.parameters = [];

  event.parameters.push(
    new ethereum.EventParam('to', ethereum.Value.fromAddress(to)),
  );
  const tupleToken: ethereum.Tuple = changetype<ethereum.Tuple>(token);
  event.parameters.push(
    new ethereum.EventParam('token', ethereum.Value.fromTuple(tupleToken)),
  );
  event.parameters.push(
    new ethereum.EventParam(
      'amount',
      ethereum.Value.fromUnsignedBigInt(amount),
    ),
  );
  event.parameters.push(
    new ethereum.EventParam('fee', ethereum.Value.fromUnsignedBigInt(fee)),
  );

  addReceiptContractAddress(event);

  return event;
};

export const createTransactEvent = (
  treeNumber: BigInt,
  startPosition: BigInt,
  hash: Bytes[],
  ciphertext: ethereum.Value[][],
): TransactEvent => {
  const event: TransactEvent = changetype<TransactEvent>(newMockEvent());

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
    new ethereum.EventParam('hash', ethereum.Value.fromBytesArray(hash)),
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

  addReceiptContractAddress(event);

  return event;
};
