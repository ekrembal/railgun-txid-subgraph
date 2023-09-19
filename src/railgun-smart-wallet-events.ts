import { crypto, Bytes, BigInt, ethereum, log } from "@graphprotocol/graph-ts";
import {
  TransactCall,
  Transact1Call,
  TransactCall_transactionsBoundParamsStruct,
  Transact1Call_transactionsBoundParamsStruct,
} from "../generated/RailgunSmartWallet/RailgunSmartWallet";
import { SNARK_PRIME_BIG_INT, bigIntToBytes, reverseBytes } from "./utils";
import { saveTransaction } from "./entity";
import { idFrom3PaddedBigInts } from "./id";

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

export const getBoundParammsHashLegacy = (
  boundParams: Transact1Call_transactionsBoundParamsStruct
): Bytes => {
  const combinedData = ethereum.encode(
    ethereum.Value.fromTuple(boundParams)
  ) as Bytes;

  const hashed = crypto.keccak256(combinedData);

  const bytesReversed = reverseBytes(Bytes.fromByteArray(hashed));
  const modulo = BigInt.fromUnsignedBytes(bytesReversed).mod(
    SNARK_PRIME_BIG_INT
  );
  return bigIntToBytes(modulo);
};

export function handleTransactionCall(call: TransactCall): void {
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
      getBoundParammsHash(call.inputs._transactions[i].boundParams)
    );
  }
}

export function handleLegacyTransactionCall(call: Transact1Call): void {
  for (let i = 0; i < call.inputs._transactions.length; i++) {
    const id = idFrom3PaddedBigInts(
      call.block.number,
      call.transaction.index,
      BigInt.fromI32(i)
    );

    const merkleRoot = Bytes.fromUint8Array(
      call.inputs._transactions[i].merkleRoot
    );
    const nullifiers: Bytes[] = call.inputs._transactions[i].nullifiers.map<
      Bytes
    >(
      (x: BigInt): Bytes => Bytes.fromUint8Array(Bytes.fromBigInt(x).reverse())
    );
    const commitments: Bytes[] = call.inputs._transactions[i].commitments.map<
      Bytes
    >(
      (x: BigInt): Bytes => Bytes.fromUint8Array(Bytes.fromBigInt(x).reverse())
    );

    saveTransaction(
      id,
      call.block.number,
      call.transaction.hash,
      merkleRoot,
      nullifiers,
      commitments,
      getBoundParammsHashLegacy(call.inputs._transactions[i].boundParams)
    );
  }
}
