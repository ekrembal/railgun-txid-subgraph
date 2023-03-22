import { Bytes, BigInt } from '@graphprotocol/graph-ts';
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
} from '../generated/schema';
import { getTokenHash, getTokenTypeEnum } from './token';
import { bigIntToBytes, hexlify } from './utils';

export const saveToken = (
  tokenType: i32,
  tokenAddress: Bytes,
  tokenSubID: BigInt,
): Token => {
  const tokenSubIDBytes = bigIntToBytes(tokenSubID);
  const id = getTokenHash(tokenAddress, tokenType, tokenSubIDBytes);

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

  const ivTag = hexlify(ciphertext[0]);

  entity.iv = Bytes.fromHexString(ivTag.substring(0, 32));
  entity.tag = Bytes.fromHexString(ivTag.substring(32));
  entity.data = ciphertext.slice(1);

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
  treeNumber: i32,
  nullifier: Bytes,
): Nullifier => {
  const entity = new Nullifier(id);

  entity.blockNumber = blockNumber;
  entity.blockTimestamp = blockTimestamp;
  entity.transactionHash = transactionHash;

  // Custom required values
  entity.treeNumber = treeNumber;
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
  treePosition: BigInt,
  preimage: CommitmentPreimage,
  encryptedRandom: BigInt[],
): LegacyGeneratedCommitment => {
  const entity = new LegacyGeneratedCommitment(id);

  entity.commitmentType = 'LegacyGeneratedCommitment';

  entity.blockNumber = blockNumber;
  entity.blockTimestamp = blockTimestamp;
  entity.transactionHash = transactionHash;
  entity.treeNumber = treeNumber.toI32();
  entity.treePosition = treePosition.toI32();

  // Custom values: GeneratedCommitmentBatch event
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
  treePosition: BigInt,
  ciphertext: LegacyCommitmentCiphertext,
): LegacyEncryptedCommitment => {
  const entity = new LegacyEncryptedCommitment(id);

  entity.commitmentType = 'LegacyEncryptedCommitment';

  entity.blockNumber = blockNumber;
  entity.blockTimestamp = blockTimestamp;
  entity.transactionHash = transactionHash;
  entity.treeNumber = treeNumber.toI32();
  entity.treePosition = treePosition.toI32();

  // Custom values: CommitmentBatch event
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
  treePosition: BigInt,
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
  entity.treePosition = treePosition.toI32();

  // Custom values: Shield event
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
  treePosition: BigInt,
  ciphertext: CommitmentCiphertext,
): TransactCommitment => {
  const entity = new TransactCommitment(id);

  entity.commitmentType = 'TransactCommitment';

  entity.blockNumber = blockNumber;
  entity.blockTimestamp = blockTimestamp;
  entity.transactionHash = transactionHash;
  entity.treeNumber = treeNumber.toI32();
  entity.treePosition = treePosition.toI32();

  // Custom values: CommitmentBatch event
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

  entity.save();
  return entity;
};
