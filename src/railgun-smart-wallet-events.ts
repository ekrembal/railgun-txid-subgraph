import { Bytes, BigInt, log } from "@graphprotocol/graph-ts";
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
  Transact1Call,
} from "../generated/RailgunSmartWallet/RailgunSmartWallet";
import { bigIntToBytes, reversedBytesToBigInt } from "./utils";
import {
  saveCiphertextFromBytesArray,
  saveCommitmentCiphertext,
  saveTransactCommitment,
  saveTransactCall,
  saveTransaction,
} from "./entity";
import {
  idFrom2PaddedBigInts,
  idFrom3PaddedBigInts,
  idFromEventLogIndex,
} from "./id";
// import { poseidon } from 'circomlibjs';

/**
 * Enable to log IDs for new entities in this file.
 */
const SHOULD_DEBUG_LOG = false;

// export const poseidon = (inputs: Bytes[]): Bytes => {
//   return Bytes.fromHexString("0x00000000");
// };

/**
 * convert hex string to BigInt, prefixing with 0x if necessary
 * @param {string} str
 * @returns {bigint}
 */
// export function bytesToBigInt(str: string): bigint {
//   if (str.startsWith("0x")) {
//     return BigInt.fromI32(0);
//   }
//   return BigInt.fromI32(0);
// }


export function handleTransactionCall(call: TransactCall): void {
  for (let i = 0; i < call.inputs._transactions.length; i++) {
    // const x = poseidon(call.inputs._transactions[i].nullifiers.map((x) => bigint(x)));

    const id = idFrom3PaddedBigInts(
      call.block.number,
      call.transaction.index,
      BigInt.fromI32(i)
    )
    saveTransaction(
      id,
      call.transaction.hash,
      call.inputs._transactions[i].merkleRoot,
      call.inputs._transactions[i].nullifiers,
      call.inputs._transactions[i].commitments
    );
  }
  saveTransactCall(
    call.block.number,
    call.block.timestamp,
    call.transaction.hash
  );
}

export function handleLegacyTransactionCall(call: Transact1Call): void {
  for (let i = 0; i < call.inputs._transactions.length; i++) {
    const id = idFrom3PaddedBigInts(
      call.block.number,
      call.transaction.index,
      BigInt.fromI32(i)
    )

    const merkleRoot = Bytes.fromUint8Array(call.inputs._transactions[i].merkleRoot);
    const nullifiers: Bytes[] = call.inputs._transactions[i].nullifiers.map<Bytes>((x: BigInt):Bytes => Bytes.fromUint8Array(Bytes.fromBigInt(x).reverse()));
    const commitments: Bytes[] = call.inputs._transactions[i].commitments.map<Bytes>((x: BigInt):Bytes => Bytes.fromUint8Array(Bytes.fromBigInt(x).reverse()));

    saveTransaction(
      id,
      call.transaction.hash,
      merkleRoot,
      nullifiers,
      commitments
    );

  }
  saveTransactCall(
    call.block.number,
    call.block.timestamp,
    call.transaction.hash
  );

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
}


