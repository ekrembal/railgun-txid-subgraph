import { Bytes, BigInt, log } from '@graphprotocol/graph-ts';
import {
  CommitmentPreimage,
  Token,
  CommitmentCiphertext,
  LegacyCommitmentCiphertext,
  LegacyGeneratedCommitment,
  LegacyEncryptedCommitment,
  ShieldCommitment,
  TransactCommitment,
  Ciphertext,
  Unshield,
  Nullifier,
  Transaction,
  CommitmentBatchEventNew
} from '../generated/schema';
import {
  getCiphertextData,
  getCiphertextIV,
  getCiphertextTag,
} from './ciphertext';
import { getTokenHash, getTokenTypeEnum } from './token';
import { bigIntToBytes } from './utils';

export const saveToken = (
  tokenType: i32,
  tokenAddress: Bytes,
  tokenSubID: BigInt,
): Token => {
  const tokenSubIDBytes = bigIntToBytes(tokenSubID);
  const id = getTokenHash(tokenType, tokenAddress, tokenSubID);

  // Token can be a duplicate for hash, but is immutable in DB.
  // Check if it already exists.
  const loaded = Token.load(id);
  if (loaded) {
    return loaded;
  }

  const entity = new Token(id);

  entity.tokenType = getTokenTypeEnum(tokenType);
  entity.tokenAddress = tokenAddress;
  entity.tokenSubID = tokenSubIDBytes;

  entity.save();
  return entity;
};

export const saveCommitmentPreimage = (
  id: Bytes,
  npk: Bytes,
  token: Token,
  value: BigInt,
): CommitmentPreimage => {
  const entity = new CommitmentPreimage(id);

  entity.npk = npk;
  entity.token = token.id;
  entity.value = value;

  entity.save();
  return entity;
};

export const saveCiphertextFromBytesArray = (
  id: Bytes,
  ciphertext: Bytes[],
): Ciphertext => {
  const entity = new Ciphertext(id);

  entity.iv = getCiphertextIV(ciphertext);
  entity.tag = getCiphertextTag(ciphertext);
  entity.data = getCiphertextData(ciphertext);

  entity.save();
  return entity;
};

export const saveLegacyCommitmentCiphertext = (
  id: Bytes,
  ciphertext: Ciphertext,
  ephemeralKeys: BigInt[],
  memo: BigInt[],
): LegacyCommitmentCiphertext => {
  const entity = new LegacyCommitmentCiphertext(id);

  entity.ciphertext = ciphertext.id;
  entity.ephemeralKeys = ephemeralKeys.map<Bytes>((e) => bigIntToBytes(e));
  entity.memo = memo.map<Bytes>((e) => bigIntToBytes(e));

  entity.save();
  return entity;
};

export const saveCommitmentCiphertext = (
  id: Bytes,
  ciphertext: Ciphertext,
  blindedSenderViewingKey: Bytes,
  blindedReceiverViewingKey: Bytes,
  annotationData: Bytes,
  memo: Bytes,
): CommitmentCiphertext => {
  const entity = new CommitmentCiphertext(id);

  entity.ciphertext = ciphertext.id;
  entity.blindedSenderViewingKey = blindedSenderViewingKey;
  entity.blindedReceiverViewingKey = blindedReceiverViewingKey;
  entity.annotationData = annotationData;
  entity.memo = memo;

  entity.save();
  return entity;
};

export const saveNullifier = (
  id: Bytes,
  blockNumber: BigInt,
  blockTimestamp: BigInt,
  transactionHash: Bytes,
  treeNumber: BigInt,
  nullifier: Bytes,
): Nullifier => {
  const entity = new Nullifier(id);

  entity.blockNumber = blockNumber;
  entity.blockTimestamp = blockTimestamp;
  entity.transactionHash = transactionHash;

  // Custom required values
  entity.treeNumber = treeNumber.toI32();
  entity.nullifier = nullifier;

  entity.save();
  return entity;
};

export const saveLegacyGeneratedCommitment = (
  id: Bytes,
  blockNumber: BigInt,
  blockTimestamp: BigInt,
  transactionHash: Bytes,
  treeNumber: BigInt,
  batchStartTreePosition: BigInt,
  treePosition: BigInt,
  commitmentHash: BigInt,
  preimage: CommitmentPreimage,
  encryptedRandom: BigInt[],
): LegacyGeneratedCommitment => {
  const entity = new LegacyGeneratedCommitment(id);

  entity.commitmentType = 'LegacyGeneratedCommitment';

  entity.blockNumber = blockNumber;
  entity.blockTimestamp = blockTimestamp;
  entity.transactionHash = transactionHash;
  entity.treeNumber = treeNumber.toI32();
  entity.batchStartTreePosition = batchStartTreePosition.toI32();
  entity.treePosition = treePosition.toI32();

  // Custom values: GeneratedCommitmentBatch event
  entity.hash = commitmentHash;
  entity.preimage = preimage.id;
  entity.encryptedRandom = encryptedRandom.map<Bytes>((e) => bigIntToBytes(e));

  entity.save();
  return entity;
};

export const saveLegacyEncryptedCommitment = (
  id: Bytes,
  blockNumber: BigInt,
  blockTimestamp: BigInt,
  transactionHash: Bytes,
  treeNumber: BigInt,
  batchStartTreePosition: BigInt,
  treePosition: BigInt,
  commitmentHash: BigInt,
  ciphertext: LegacyCommitmentCiphertext,
): LegacyEncryptedCommitment => {
  const entity = new LegacyEncryptedCommitment(id);

  entity.commitmentType = 'LegacyEncryptedCommitment';

  entity.blockNumber = blockNumber;
  entity.blockTimestamp = blockTimestamp;
  entity.transactionHash = transactionHash;
  entity.treeNumber = treeNumber.toI32();
  entity.batchStartTreePosition = batchStartTreePosition.toI32();
  entity.treePosition = treePosition.toI32();

  // Custom values: CommitmentBatch event
  entity.hash = commitmentHash;
  entity.ciphertext = ciphertext.id;

  entity.save();
  return entity;
};

export const saveShieldCommitment = (
  id: Bytes,
  blockNumber: BigInt,
  blockTimestamp: BigInt,
  transactionHash: Bytes,
  treeNumber: BigInt,
  batchStartTreePosition: BigInt,
  treePosition: BigInt,
  commitmentHash: BigInt,
  preimage: CommitmentPreimage,
  encryptedBundle: Bytes[],
  shieldKey: Bytes,
  fee: BigInt | null,
): ShieldCommitment => {
  const entity = new ShieldCommitment(id);

  entity.commitmentType = 'ShieldCommitment';

  entity.blockNumber = blockNumber;
  entity.blockTimestamp = blockTimestamp;
  entity.transactionHash = transactionHash;
  entity.treeNumber = treeNumber.toI32();
  entity.batchStartTreePosition = batchStartTreePosition.toI32();
  entity.treePosition = treePosition.toI32();

  // Custom values: Shield event
  entity.hash = commitmentHash;
  entity.preimage = preimage.id;
  entity.encryptedBundle = encryptedBundle;
  entity.shieldKey = shieldKey;
  entity.fee = fee;

  entity.save();
  return entity;
};

export const saveTransactCommitment = (
  id: Bytes,
  blockNumber: BigInt,
  blockTimestamp: BigInt,
  transactionHash: Bytes,
  treeNumber: BigInt,
  batchStartTreePosition: BigInt,
  treePosition: BigInt,
  commitmentHash: BigInt,
  ciphertext: CommitmentCiphertext,
): TransactCommitment => {
  const entity = new TransactCommitment(id);

  entity.commitmentType = 'TransactCommitment';

  entity.blockNumber = blockNumber;
  entity.blockTimestamp = blockTimestamp;
  entity.transactionHash = transactionHash;
  entity.treeNumber = treeNumber.toI32();
  entity.batchStartTreePosition = batchStartTreePosition.toI32();
  entity.treePosition = treePosition.toI32();

  // Custom values: CommitmentBatch event
  entity.hash = commitmentHash;
  entity.ciphertext = ciphertext.id;

  entity.save();
  return entity;
};

export const saveUnshield = (
  id: Bytes,
  blockNumber: BigInt,
  blockTimestamp: BigInt,
  transactionHash: Bytes,
  to: Bytes,
  token: Token,
  amount: BigInt,
  fee: BigInt,
  eventLogIndex: BigInt,
): Unshield => {
  const entity = new Unshield(id);

  entity.blockNumber = blockNumber;
  entity.blockTimestamp = blockTimestamp;
  entity.transactionHash = transactionHash;

  // Custom required values
  entity.to = to;
  entity.token = token.id;
  entity.amount = amount;
  entity.fee = fee;
  entity.eventLogIndex = eventLogIndex;

  entity.save();
  return entity;
};



export const saveTransaction = (
  id: Bytes,
  blockNumber: BigInt,
  transactionHash: Bytes,
  merkleRoot: Bytes,
  nullifiers: Bytes[],
  commitments: Bytes[],
  boundParams: Bytes,
  isUnshield: boolean,
  inputTreeNumber: BigInt,
  outputTreeNumber: BigInt,
  batchStartTreePosition: BigInt,
  unshieldToken: Token,
  unshieldToAddress: Bytes,
  unshieldValue: BigInt,
  blockTimestamp: BigInt,
  verificationHash: Bytes,
): Transaction => {
  const entity = new Transaction(id);
  entity.transactionHash = transactionHash;
  entity.blockNumber = blockNumber;
  entity.merkleRoot = merkleRoot;
  entity.nullifiers = nullifiers.map<Bytes>((e) => e);
  entity.commitments = commitments.map<Bytes>((e) => e);
  entity.boundParamsHash = boundParams;
  entity.hasUnshield = isUnshield;
  entity.utxoTreeIn = inputTreeNumber;
  entity.utxoTreeOut = outputTreeNumber;
  entity.utxoBatchStartPositionOut = batchStartTreePosition;
  entity.unshieldToken = unshieldToken.id;
  entity.unshieldToAddress = unshieldToAddress;
  entity.unshieldValue = unshieldValue;
  entity.blockTimestamp = blockTimestamp;
  entity.verificationHash = verificationHash;
  entity.save();
  return entity;
};

export const saveCommitmentBatchEvent = (
  id: Bytes,
  treeNumber: BigInt,
  batchStartTreePosition: BigInt,
): CommitmentBatchEventNew => {
  const entity = new CommitmentBatchEventNew(id);
  entity.treeNumber = treeNumber;
  entity.batchStartTreePosition = batchStartTreePosition;
  entity.save();
  return entity;
}
