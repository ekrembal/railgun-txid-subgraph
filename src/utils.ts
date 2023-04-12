import { Bytes, BigInt } from '@graphprotocol/graph-ts';

export const hexlify = (bytes: Bytes): string => {
  return bytes.toHexString().substring(2);
};

export const padTo32BytesEnd = (bytes: Bytes): Bytes => {
  const padded = bytes
    .toHexString()
    .substring(2)
    .padEnd(64, '0');
  return Bytes.fromHexString(padded);
};

export const padTo32BytesStart = (bytes: Bytes): Bytes => {
  const padded = bytes
    .toHexString()
    .substring(2)
    .padStart(64, '0');
  return Bytes.fromHexString(padded);
};

/**
 * Reverse in an endian-friendly way.
 */
export const reverseBytes = (bytes: Bytes): Bytes => {
  return Bytes.fromUint8Array(bytes.reverse());
};

export const bigIntToBytes = (bigint: BigInt): Bytes => {
  return Bytes.fromByteArray(Bytes.fromBigInt(bigint));
};

export const reversedBytesToBigInt = (bytes: Bytes): BigInt => {
  return BigInt.fromUnsignedBytes(reverseBytes(bytes));
};

export const padHexStringToEven = (hexString: string): string => {
  const stripped = hexString.substring(2);
  const padded = stripped.length % 2 === 0 ? stripped : '0' + stripped;
  return `0x${padded}`;
};
