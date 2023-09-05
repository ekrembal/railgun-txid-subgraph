import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { bigIntToBytes, padTo32BytesStart } from './utils';

export const idFrom3PaddedBigInts = (
  bigint0: BigInt,
  bigint1: BigInt,
  bigint2: BigInt,
): Bytes => {
  // Convert to hexString, pad to end.
  const bytes0 = padTo32BytesStart(bigIntToBytes(bigint0));
  const bytes1 = padTo32BytesStart(bigIntToBytes(bigint1));
  const bytes2 = padTo32BytesStart(bigIntToBytes(bigint2));
  // 96 bytes total. 192 chars.
  return bytes0.concat(bytes1).concat(bytes2);
};
