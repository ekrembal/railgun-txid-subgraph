import { BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';

export const padTo64Bytes = (bigint: Bytes | BigInt): Bytes => {
  const padded = bigint
    .toHexString()
    .substring(2)
    .padStart(64, '0');
  return Bytes.fromHexString(padded);
};

export const idFrom2PaddedBigInts = (
  bigint0: BigInt,
  bigint1: BigInt,
): Bytes => {
  // Convert to hexString, pad to right length.
  const bytes0 = padTo64Bytes(bigint0);
  const bytes1 = padTo64Bytes(bigint1);

  // 64 bytes total. 128 chars.
  return bytes0.concat(bytes1);
};

export const hexlify = (bytes: Bytes): string => {
  return bytes.toHexString().substring(2);
};

export const idFrom2BigInts = (bigints: [BigInt, BigInt]): Bytes => {
  const bytes0 = Bytes.fromBigInt(bigints[0]);
  const bytes1 = Bytes.fromBigInt(bigints[1]);
  return bytes0.concat(bytes1);
};

export const idFromEventLogIndex = (event: ethereum.Event): Bytes => {
  return event.transaction.hash.concatI32(event.logIndex.toI32());
};
