import { Bytes, crypto, BigInt } from '@graphprotocol/graph-ts';
import { bigIntToBytes, padTo32Bytes, reverseBytes } from './utils';

const SNARK_PRIME_BIG_INT = BigInt.fromString(
  '21888242871839275222246405745257275088548364400416034343698204186575808495617',
);

const getTokenDataHashNFT = (
  tokenAddress: Bytes,
  tokenType: i32,
  tokenSubID: Bytes,
): Bytes => {
  const tokenTypeBytes = padTo32Bytes(
    bigIntToBytes(BigInt.fromString(tokenType.toString())),
  );
  const tokenAddressBytes = padTo32Bytes(tokenAddress);
  const tokenSubIDBytes = padTo32Bytes(tokenSubID);

  // keccak256 hash of the token data.
  const combinedData: Bytes = tokenTypeBytes
    .concat(tokenAddressBytes)
    .concat(tokenSubIDBytes);

  const hashed = crypto.keccak256(combinedData);

  const bytesReversed = reverseBytes(Bytes.fromByteArray(hashed));
  const modulo = BigInt.fromUnsignedBytes(bytesReversed).mod(
    SNARK_PRIME_BIG_INT,
  );
  return reverseBytes(bigIntToBytes(modulo));
};

export const getTokenHash = (
  tokenAddress: Bytes,
  tokenType: i32,
  tokenSubID: Bytes,
): Bytes => {
  switch (tokenType) {
    case 0: // TokenType.ERC20:
      return tokenAddress;
    case 1: // TokenType.ERC721:
    case 2: // TokenType.ERC1155:
      return getTokenDataHashNFT(tokenAddress, tokenType, tokenSubID);
  }
  throw new Error('Unhandled token type');
};

export const getTokenTypeEnum = (tokenType: i32): string => {
  switch (tokenType) {
    case 0:
      return 'ERC20';
    case 1:
      return 'ERC721';
    case 2:
      return 'ERC1155';
  }
  throw new Error('Unhandled token type');
};
