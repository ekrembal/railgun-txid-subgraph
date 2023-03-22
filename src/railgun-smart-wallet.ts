import { Bytes, BigInt } from '@graphprotocol/graph-ts';
import {
  Nullifiers as NullifiersEvent,
  CommitmentBatch as CommitmentBatchEvent,
  GeneratedCommitmentBatch as GeneratedCommitmentBatchEvent,
  Nullified as NullifiedEvent,
  Transact as TransactEvent,
  Unshield as UnshieldEvent,
  Shield as ShieldEvent,
  Shield1 as ShieldLegacyEvent,
} from '../generated/RailgunSmartWallet/RailgunSmartWallet';
import { bigIntToBytes, padTo64Bytes } from './utils';
import {
  saveCiphertextFromBytesArray,
  saveCommitmentCiphertext,
  saveCommitmentPreimage,
  saveLegacyCommitmentCiphertext,
  saveLegacyEncryptedCommitment,
  saveLegacyGeneratedCommitment,
  saveNullifier,
  saveShieldCommitment,
  saveToken,
  saveTransactCommitment,
  saveUnshield,
} from './entity';
import { idFrom2PaddedBigInts, idFromEventLogIndex } from './id';

// Original deployment (May 2022)

export const handleNullifier = (event: NullifiersEvent): void => {
  const nullifiers = event.params.nullifier;

  for (let i = 0; i < nullifiers.length; i++) {
    const nullifier = nullifiers[i];
    const id = idFrom2PaddedBigInts(event.params.treeNumber, nullifier);

    const treeNumber = event.params.treeNumber.toI32();
    const nullifierBytes = bigIntToBytes(nullifier);

    saveNullifier(
      id,
      event.block.number,
      event.block.timestamp,
      event.transaction.hash,
      treeNumber,
      nullifierBytes,
    );
  }
};

export const handleGeneratedCommitmentBatch = (
  event: GeneratedCommitmentBatchEvent,
): void => {
  const commitments = event.params.commitments;

  for (let i = 0; i < commitments.length; i++) {
    const commitment = commitments[i];
    const index = i;

    const treePosition = event.params.startPosition.plus(new BigInt(index));
    const id = idFrom2PaddedBigInts(event.params.treeNumber, treePosition);

    const tokenInfo = commitment.token;
    const token = saveToken(
      tokenInfo.tokenType,
      tokenInfo.tokenAddress,
      tokenInfo.tokenSubID,
    );

    const preimage = saveCommitmentPreimage(
      id,
      bigIntToBytes(commitment.npk),
      token,
      commitment.value,
    );

    saveLegacyGeneratedCommitment(
      id,
      event.block.number,
      event.block.timestamp,
      event.transaction.hash,
      event.params.treeNumber,
      treePosition,
      preimage,
      event.params.encryptedRandom[index],
    );
  }
};

export const handleCommitmentBatch = (event: CommitmentBatchEvent): void => {
  const ciphertextStructs = event.params.ciphertext;

  for (let i = 0; i < ciphertextStructs.length; i++) {
    const ciphertextStruct = ciphertextStructs[i];
    const index = i;

    const treePosition = event.params.startPosition.plus(new BigInt(index));
    const id = idFrom2PaddedBigInts(event.params.treeNumber, treePosition);

    const ciphertextBytes = ciphertextStruct.ciphertext.map<Bytes>((c) =>
      padTo64Bytes(bigIntToBytes(c)),
    );
    const ciphertext = saveCiphertextFromBytesArray(id, ciphertextBytes);

    const legacyCommitmentCiphertext = saveLegacyCommitmentCiphertext(
      id,
      ciphertext,
      ciphertextStruct.ephemeralKeys,
      ciphertextStruct.memo,
    );

    saveLegacyEncryptedCommitment(
      id,
      event.block.number,
      event.block.timestamp,
      event.transaction.hash,
      event.params.treeNumber,
      treePosition,
      legacyCommitmentCiphertext,
    );
  }
};

// Engine V3 (Nov 2022)

export const handleShieldLegacyPreMar23 = (event: ShieldLegacyEvent): void => {
  const commitments = event.params.commitments;

  for (let i = 0; i < commitments.length; i++) {
    const commitment = commitments[i];
    const index = i;

    const treePosition = event.params.startPosition.plus(new BigInt(index));
    const id = idFrom2PaddedBigInts(event.params.treeNumber, treePosition);

    const tokenInfo = commitment.token;
    const token = saveToken(
      tokenInfo.tokenType,
      tokenInfo.tokenAddress,
      tokenInfo.tokenSubID,
    );

    const preimage = saveCommitmentPreimage(
      id,
      commitment.npk,
      token,
      commitment.value,
    );

    saveShieldCommitment(
      id,
      event.block.number,
      event.block.timestamp,
      event.transaction.hash,
      event.params.treeNumber,
      treePosition,
      preimage,
      event.params.shieldCiphertext[index].encryptedBundle,
      event.params.shieldCiphertext[index].shieldKey,
      null, // No fee in legacy shield
    );
  }
};

export const handleTransact = (event: TransactEvent): void => {
  const ciphertextStructs = event.params.ciphertext;

  for (let i = 0; i < ciphertextStructs.length; i++) {
    const ciphertextStruct = ciphertextStructs[i];
    const index = i;

    const treePosition = event.params.startPosition.plus(
      BigInt.fromString(index.toString()),
    );
    const id = idFrom2PaddedBigInts(event.params.treeNumber, treePosition);

    const ciphertext = saveCiphertextFromBytesArray(
      id,
      ciphertextStruct.ciphertext,
    );

    const commitmentCiphertext = saveCommitmentCiphertext(
      id,
      ciphertext,
      ciphertextStruct.blindedSenderViewingKey,
      ciphertextStruct.blindedReceiverViewingKey,
      ciphertextStruct.annotationData,
      ciphertextStruct.memo,
    );

    saveTransactCommitment(
      id,
      event.block.number,
      event.block.timestamp,
      event.transaction.hash,
      event.params.treeNumber,
      treePosition,
      commitmentCiphertext,
    );
  }
};

export const handleUnshield = (event: UnshieldEvent): void => {
  const id = idFromEventLogIndex(event);

  const tokenInfo = event.params.token;
  const token = saveToken(
    tokenInfo.tokenType,
    tokenInfo.tokenAddress,
    tokenInfo.tokenSubID,
  );

  saveUnshield(
    id,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
    event.params.to,
    token,
    event.params.amount,
    event.params.fee,
  );
};

export const handleNullified = (event: NullifiedEvent): void => {
  const nullifiers = event.params.nullifier;

  for (let i = 0; i < nullifiers.length; i++) {
    const nullifier = nullifiers[i];

    const id = idFrom2PaddedBigInts(
      BigInt.fromString(event.params.treeNumber.toString()),
      BigInt.fromUnsignedBytes(nullifier),
    );

    saveNullifier(
      id,
      event.block.number,
      event.block.timestamp,
      event.transaction.hash,
      event.params.treeNumber,
      nullifier,
    );
  }
};

// New Shield event (Mar 2023)

export const handleShield = (event: ShieldEvent): void => {
  const commitments = event.params.commitments;

  for (let i = 0; i < commitments.length; i++) {
    const commitment = commitments[i];
    const index = i;

    const treePosition = event.params.startPosition.plus(new BigInt(index));
    const id = idFrom2PaddedBigInts(event.params.treeNumber, treePosition);

    const tokenInfo = commitment.token;
    const token = saveToken(
      tokenInfo.tokenType,
      tokenInfo.tokenAddress,
      tokenInfo.tokenSubID,
    );

    const preimage = saveCommitmentPreimage(
      id,
      commitment.npk,
      token,
      commitment.value,
    );

    saveShieldCommitment(
      id,
      event.block.number,
      event.block.timestamp,
      event.transaction.hash,
      event.params.treeNumber,
      treePosition,
      preimage,
      event.params.shieldCiphertext[index].encryptedBundle,
      event.params.shieldCiphertext[index].shieldKey,
      event.params.fees[index],
    );
  }
};
