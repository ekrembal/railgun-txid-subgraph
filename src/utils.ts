import { Bytes, BigInt, log } from "@graphprotocol/graph-ts";
import { crypto } from "@graphprotocol/graph-ts";

export const stripPrefix0x = (bytes: Bytes): string => {
  return bytes.toHexString().substring(2);
};

export const padTo32BytesEnd = (bytes: Bytes): Bytes => {
  const padded = bytes
    .toHexString()
    .substring(2)
    .padEnd(64, "0");
  return Bytes.fromHexString(padded);
};

export const padTo32BytesStart = (bytes: Bytes): Bytes => {
  const padded = bytes
    .toHexString()
    .substring(2)
    .padStart(64, "0");
  return Bytes.fromHexString(padded);
};

export const padHexStringToEven = (hexString: string): string => {
  const stripped = hexString.substring(2);
  const padded = stripped.length % 2 === 0 ? stripped : "0" + stripped;
  return `0x${padded}`;
};

export const padHexString = (hexString: string, byteLength: number): string => {
  const stripped = hexString.substring(2);
  const padded = stripped.padStart(<i32>(byteLength * 2), "0");
  return `0x${padded}`;
};

/**
 * Reverse in an endian-friendly way.
 */
export const reverseBytes = (bytes: Bytes): Bytes => {
  return Bytes.fromUint8Array(
    Bytes.fromHexString(bytes.toHexString()).reverse()
  );
};

export const bigIntToBytes = (bigint: BigInt): Bytes => {
  return Bytes.fromUint8Array(
    Bytes.fromHexString(padHexStringToEven(bigint.toHexString()))
  );
};

export const reversedBytesToBigInt = (bytes: Bytes): BigInt => {
  return BigInt.fromUnsignedBytes(reverseBytes(bytes));
};

export const SNARK_PRIME_BIG_INT = BigInt.fromString(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617"
);

export const calculateRailgunTransactionVerificationHash = (
  previousVerificationHash: Bytes,
  firstNullifier: Bytes
): Bytes => {
  const combinedData: Bytes =
    previousVerificationHash != Bytes.fromHexString("0x")
      ? padTo32BytesStart(previousVerificationHash).concat(
          padTo32BytesStart(firstNullifier)
        )
      : Bytes.fromHexString("0x").concat(padTo32BytesStart(firstNullifier));
  return Bytes.fromHexString(
    padHexString(crypto.keccak256(combinedData).toHexString(), 32)
  );
};

export const calculateRailgunTransactionVerificationHashStr = (
  previousVerificationHash: string | null,
  firstNullifier: string
): string => {
  return calculateRailgunTransactionVerificationHash(
    previousVerificationHash
      ? Bytes.fromHexString(previousVerificationHash)
      : Bytes.fromHexString("0x"),
    Bytes.fromHexString(firstNullifier)
  ).toHexString();
};
