import { Bytes, BigInt, log, ethereum, crypto } from "@graphprotocol/graph-ts";
import {
  Nullifiers as NullifiersEvent,
  CommitmentBatch as CommitmentBatchEvent,
  GeneratedCommitmentBatch as GeneratedCommitmentBatchEvent,
  Nullified as NullifiedEvent,
  Transact as TransactEvent,
  Unshield as UnshieldEvent,
  Shield as ShieldEvent,
  Shield1 as ShieldLegacyEvent,
  TransactCall,
  TransactCall_transactionsBoundParamsStruct,
} from "../generated/RailgunSmartWallet/RailgunSmartWallet";
import {
  SNARK_PRIME_BIG_INT,
  bigIntToBytes,
  reversedBytesToBigInt,
  reverseBytes,
} from "./utils";
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
  saveTransaction,
  saveCommitmentBatchEvent,
} from "./entity";
import {
  idFrom2PaddedBigInts,
  idFromEventLogIndex,
  idFrom3PaddedBigInts,
} from "./id";
import { getNoteHash } from "./hash";
import { CommitmentBatchEventNew } from "../generated/schema";

/**
 * Enable to log IDs for new entities in this file.
 */
const SHOULD_DEBUG_LOG = false;

// Original deployment (May 2022)

export function handleNullifiers(event: NullifiersEvent): void {
  const nullifiers = event.params.nullifier;

  for (let i = 0; i < nullifiers.length; i++) {
    const nullifier = nullifiers[i];
    const id = idFrom2PaddedBigInts(event.params.treeNumber, nullifier);

    const treeNumber = event.params.treeNumber;
    const nullifierBytes = bigIntToBytes(nullifier);

    if (SHOULD_DEBUG_LOG) {
      log.debug("Nullifier: id {}, block {}, hash {}, treeNumber {}", [
        id.toHexString(),
        event.block.number.toString(),
        event.transaction.hash.toHexString(),
        event.params.treeNumber.toString(),
      ]);
    }

    saveNullifier(
      id,
      event.block.number,
      event.block.timestamp,
      event.transaction.hash,
      treeNumber,
      nullifierBytes
    );
  }
}

export function handleGeneratedCommitmentBatch(
  event: GeneratedCommitmentBatchEvent
): void {
  const commitments = event.params.commitments;

  for (let i = 0; i < commitments.length; i++) {
    const commitment = commitments[i];
    const index = i;

    const treePosition = event.params.startPosition.plus(
      BigInt.fromString(index.toString())
    );
    const id = idFrom2PaddedBigInts(event.params.treeNumber, treePosition);

    const tokenInfo = commitment.token;
    const token = saveToken(
      tokenInfo.tokenType,
      tokenInfo.tokenAddress,
      tokenInfo.tokenSubID
    );

    const preimage = saveCommitmentPreimage(
      id,
      bigIntToBytes(commitment.npk),
      token,
      commitment.value
    );

    if (SHOULD_DEBUG_LOG) {
      log.debug(
        "LegacyGeneratedCommitment: id {}, block {}, hash {}, treeNumber {}, treePosition {}",
        [
          id.toHexString(),
          event.block.number.toString(),
          event.transaction.hash.toHexString(),
          event.params.treeNumber.toString(),
          treePosition.toString(),
        ]
      );
    }

    const commitmentHash = getNoteHash(
      commitment.npk,
      reversedBytesToBigInt(token.id),
      commitment.value
    );

    saveLegacyGeneratedCommitment(
      id,
      event.block.number,
      event.block.timestamp,
      event.transaction.hash,
      event.params.treeNumber,
      event.params.startPosition,
      treePosition,
      commitmentHash,
      preimage,
      event.params.encryptedRandom[index]
    );
  }
}

export function handleCommitmentBatch(event: CommitmentBatchEvent): void {
  const ciphertextStructs = event.params.ciphertext;

  for (let i = 0; i < ciphertextStructs.length; i++) {
    const ciphertextStruct = ciphertextStructs[i];
    const index = i;

    const treePosition = event.params.startPosition.plus(
      BigInt.fromString(index.toString())
    );
    const id = idFrom2PaddedBigInts(event.params.treeNumber, treePosition);

    const ciphertextBytes = ciphertextStruct.ciphertext.map<Bytes>((c) =>
      bigIntToBytes(c)
    );
    const ciphertext = saveCiphertextFromBytesArray(id, ciphertextBytes);

    const legacyCommitmentCiphertext = saveLegacyCommitmentCiphertext(
      id,
      ciphertext,
      ciphertextStruct.ephemeralKeys,
      ciphertextStruct.memo
    );

    if (SHOULD_DEBUG_LOG) {
      log.debug(
        "LegacyEncryptedCommitment: id {}, block {}, hash {}, treeNumber {}, treePosition {}",
        [
          id.toHexString(),
          event.block.number.toString(),
          event.transaction.hash.toHexString(),
          event.params.treeNumber.toString(),
          treePosition.toString(),
        ]
      );
    }

    saveLegacyEncryptedCommitment(
      id,
      event.block.number,
      event.block.timestamp,
      event.transaction.hash,
      event.params.treeNumber,
      event.params.startPosition,
      treePosition,
      event.params.hash[i],
      legacyCommitmentCiphertext
    );
  }
}

// Engine V3 (Nov 2022)

export function handleShieldLegacyPreMar23(event: ShieldLegacyEvent): void {
  if (!event.receipt) {
    throw new Error("No receipt found for ShieldLegacy event");
  }

  const commitments = event.params.commitments;

  for (let i = 0; i < commitments.length; i++) {
    const commitment = commitments[i];
    const index = i;

    const treePosition = event.params.startPosition.plus(
      BigInt.fromString(index.toString())
    );
    const id = idFrom2PaddedBigInts(event.params.treeNumber, treePosition);

    const tokenInfo = commitment.token;
    const token = saveToken(
      tokenInfo.tokenType,
      tokenInfo.tokenAddress,
      tokenInfo.tokenSubID
    );

    const preimage = saveCommitmentPreimage(
      id,
      commitment.npk,
      token,
      commitment.value
    );

    if (SHOULD_DEBUG_LOG) {
      log.debug("Shield: id {}, block {}, hash {}, treeNumber {}", [
        id.toHexString(),
        event.block.number.toString(),
        event.transaction.hash.toHexString(),
        event.params.treeNumber.toString(),
      ]);
    }

    const commitmentHash = getNoteHash(
      reversedBytesToBigInt(commitment.npk),
      reversedBytesToBigInt(token.id),
      commitment.value
    );

    saveShieldCommitment(
      id,
      event.block.number,
      event.block.timestamp,
      event.transaction.hash,
      event.params.treeNumber,
      event.params.startPosition,
      treePosition,
      commitmentHash,
      preimage,
      event.params.shieldCiphertext[index].encryptedBundle,
      event.params.shieldCiphertext[index].shieldKey,
      null // No fee in legacy shield
    );
  }
}

export function handleTransact(event: TransactEvent): void {
  const ciphertextStructs = event.params.ciphertext;

  for (let i = 0; i < ciphertextStructs.length; i++) {
    const ciphertextStruct = ciphertextStructs[i];
    const index = i;

    const treePosition = event.params.startPosition.plus(
      BigInt.fromString(index.toString())
    );
    const id = idFrom2PaddedBigInts(event.params.treeNumber, treePosition);

    const ciphertext = saveCiphertextFromBytesArray(
      id,
      ciphertextStruct.ciphertext
    );

    const commitmentCiphertext = saveCommitmentCiphertext(
      id,
      ciphertext,
      ciphertextStruct.blindedSenderViewingKey,
      ciphertextStruct.blindedReceiverViewingKey,
      ciphertextStruct.annotationData,
      ciphertextStruct.memo
    );

    if (SHOULD_DEBUG_LOG) {
      log.debug("Transact: id {}, block {}, hash {}, treeNumber {}", [
        id.toHexString(),
        event.block.number.toString(),
        event.transaction.hash.toHexString(),
        event.params.treeNumber.toString(),
      ]);
    }

    saveTransactCommitment(
      id,
      event.block.number,
      event.block.timestamp,
      event.transaction.hash,
      event.params.treeNumber,
      event.params.startPosition,
      treePosition,
      reversedBytesToBigInt(event.params.hash[i]),
      commitmentCiphertext
    );
  }
  const id = idFrom2PaddedBigInts(event.block.number, event.transaction.index);

  saveCommitmentBatchEvent(
    id,
    event.params.treeNumber,
    event.params.startPosition
  );
}

export function handleUnshield(event: UnshieldEvent): void {
  const id = idFromEventLogIndex(event);

  const tokenInfo = event.params.token;
  const token = saveToken(
    tokenInfo.tokenType,
    tokenInfo.tokenAddress,
    tokenInfo.tokenSubID
  );

  if (SHOULD_DEBUG_LOG) {
    log.debug("Unshield: id {}, block {}, hash {}", [
      id.toHexString(),
      event.block.number.toString(),
      event.transaction.hash.toHexString(),
    ]);
  }

  saveUnshield(
    id,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash,
    event.params.to,
    token,
    event.params.amount,
    event.params.fee,
    event.logIndex
  );
}

export function handleNullified(event: NullifiedEvent): void {
  const nullifiers = event.params.nullifier;

  for (let i = 0; i < nullifiers.length; i++) {
    const nullifier = nullifiers[i];

    const id = idFrom2PaddedBigInts(
      BigInt.fromString(event.params.treeNumber.toString()),
      reversedBytesToBigInt(nullifier)
    );

    if (SHOULD_DEBUG_LOG) {
      log.debug("Nullifier: id {}, block {}, hash {}", [
        id.toHexString(),
        event.block.number.toString(),
        event.transaction.hash.toHexString(),
      ]);
    }

    saveNullifier(
      id,
      event.block.number,
      event.block.timestamp,
      event.transaction.hash,
      BigInt.fromString(event.params.treeNumber.toString()),
      nullifier
    );
  }
}

// New Shield event (Mar 2023)

export function handleShield(event: ShieldEvent): void {
  const commitments = event.params.commitments;

  for (let i = 0; i < commitments.length; i++) {
    const commitment = commitments[i];
    const index = i;

    const treePosition = event.params.startPosition.plus(
      BigInt.fromString(index.toString())
    );
    const id = idFrom2PaddedBigInts(event.params.treeNumber, treePosition);

    const tokenInfo = commitment.token;
    const token = saveToken(
      tokenInfo.tokenType,
      tokenInfo.tokenAddress,
      tokenInfo.tokenSubID
    );

    const preimage = saveCommitmentPreimage(
      id,
      commitment.npk,
      token,
      commitment.value
    );

    if (SHOULD_DEBUG_LOG) {
      log.debug("Shield: id {}, block {}, hash {}", [
        id.toHexString(),
        event.block.number.toString(),
        event.transaction.hash.toHexString(),
      ]);
    }

    const commitmentHash = getNoteHash(
      reversedBytesToBigInt(commitment.npk),
      reversedBytesToBigInt(token.id),
      commitment.value
    );

    saveShieldCommitment(
      id,
      event.block.number,
      event.block.timestamp,
      event.transaction.hash,
      event.params.treeNumber,
      event.params.startPosition,
      treePosition,
      commitmentHash,
      preimage,
      event.params.shieldCiphertext[index].encryptedBundle,
      event.params.shieldCiphertext[index].shieldKey,
      event.params.fees[index]
    );
  }
}

export const getBoundParammsHash = (
  boundParams: TransactCall_transactionsBoundParamsStruct
): Bytes => {
  // log.debug(ethereum.Value.fromTuple(boundParams).toString(), []);
  const combinedData = ethereum.encode(
    ethereum.Value.fromTuple(boundParams)
  ) as Bytes;

  // log.debug(combinedData.toHexString(), []);

  const hashed = crypto.keccak256(combinedData);

  const bytesReversed = reverseBytes(Bytes.fromByteArray(hashed));
  const modulo = BigInt.fromUnsignedBytes(bytesReversed).mod(
    SNARK_PRIME_BIG_INT
  );
  return bigIntToBytes(modulo);
};

export function handleTransactionCall(call: TransactCall): void {
  let commitmentBatchEventNew = CommitmentBatchEventNew.load(
    idFrom2PaddedBigInts(call.block.number, call.transaction.index)
  );
  if(commitmentBatchEventNew == null) {
    return;
  }
  let batchStartTreePosition = commitmentBatchEventNew.batchStartTreePosition;


  for (let i = 0; i < call.inputs._transactions.length; i++) {
    // const x = poseidon(call.inputs._transactions[i].nullifiers.map((x) => bigint(x)));

    const id = idFrom3PaddedBigInts(
      call.block.number,
      call.transaction.index,
      BigInt.fromI32(i)
    );
    saveTransaction(
      id,
      call.block.number,
      call.transaction.hash,
      call.inputs._transactions[i].merkleRoot,
      call.inputs._transactions[i].nullifiers,
      call.inputs._transactions[i].commitments,
      getBoundParammsHash(call.inputs._transactions[i].boundParams),
      call.inputs._transactions[i].boundParams.unshield != 0,
      commitmentBatchEventNew.treeNumber,
      batchStartTreePosition
    );
    batchStartTreePosition = BigInt.fromI64(call.inputs._transactions[i].commitments.length).plus(batchStartTreePosition); 
    call.transaction.index;
  }
}
