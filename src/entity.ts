import { Bytes, BigInt } from "@graphprotocol/graph-ts";
import {
  TransactCall,
  Transaction,
} from "../generated/schema";

export const saveTransaction = (
  id: Bytes,
  transactionHash: Bytes,
  merkleRoot: Bytes,
  nullifiers: Bytes[],
  commitments: Bytes[],
  boundParams: Bytes
): Transaction => {
  const entity = new Transaction(id);
  entity.transactionHash = transactionHash;
  entity.merkleRoot = merkleRoot;
  entity.nullifiers = nullifiers.map<Bytes>((e) => e);
  entity.commitments = commitments.map<Bytes>((e) => e);
  entity.boundParams = boundParams;
  entity.save();
  return entity;
};

export const saveTransactCall = (
  blockNumber: BigInt,
  blockTimestamp: BigInt,
  transactionHash: Bytes
): TransactCall => {
  const id = transactionHash;
  const entity = new TransactCall(id);
  entity.blockNumber = blockNumber;
  entity.blockTimestamp = blockTimestamp;
  entity.transactionHash = transactionHash;
  entity.save();
  return entity;
};
