import { ByteArray, Bytes, BigInt } from '@graphprotocol/graph-ts';

export const hexlify = (bytes: Bytes): string => {
  return bytes.toHexString().substring(2);
};

export const padTo64Bytes = (bytes: Bytes): Bytes => {
  const padded = bytes
    .toHexString()
    .substring(2)
    .padStart(64, '0');
  return Bytes.fromHexString(padded);
};

export const bigIntToBytes = (bigint: BigInt): Bytes => {
  return Bytes.fromByteArray(Bytes.fromBigInt(bigint));
};
