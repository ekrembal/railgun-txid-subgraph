import { Bytes, BigInt } from "@graphprotocol/graph-ts";
import { Transaction } from "../generated/schema";

export const saveTransaction = (
  id: Bytes,
  blockNumber: BigInt,
  transactionHash: Bytes,
  merkleRoot: Bytes,
  nullifiers: Bytes[],
  commitments: Bytes[],
  boundParams: Bytes
): Transaction => {
  const entity = new Transaction(id);
  entity.transactionHash = transactionHash;
  entity.blockNumber = blockNumber;
  entity.merkleRoot = merkleRoot;
  entity.nullifiers = nullifiers.map<Bytes>((e) => e);
  entity.commitments = commitments.map<Bytes>((e) => e);
  entity.boundParamsHash = boundParams;
  entity.save();
  return entity;
};
