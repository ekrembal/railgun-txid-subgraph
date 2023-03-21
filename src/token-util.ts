import { Bytes, crypto, BigInt } from '@graphprotocol/graph-ts';
import { TokenType } from './models';
import { padTo64Bytes } from './utils';

const SNARK_PRIME_BIG_INT = BigInt.fromString(
  '21888242871839275222246405745257275088548364400416034343698204186575808495617',
);

const getTokenDataHashNFT = (
  tokenAddress: Bytes,
  tokenType: TokenType,
  tokenSubID: Bytes,
): Bytes => {
  const tokenTypeBytes = padTo64Bytes(getTokenTypeBigInt(tokenType));
  const tokenAddressBytes = padTo64Bytes(tokenAddress);
  const tokenSubIDBytes = padTo64Bytes(tokenSubID);

  // keccak256 hash of the token data.
  const combinedData: Bytes = tokenTypeBytes
    .concat(tokenAddressBytes)
    .concat(tokenSubIDBytes);

  const hashed: Bytes = crypto.keccak256(combinedData);
  const modulo = BigInt.fromUnsignedBytes(hashed).mod(SNARK_PRIME_BIG_INT);

  return Bytes.fromBigInt(modulo);
};

export const getTokenHash = (
  tokenAddress: Bytes,
  tokenType: TokenType,
  tokenSubID: Bytes,
): Bytes => {
  switch (tokenType) {
    case TokenType.ERC20:
      return tokenAddress;
    case TokenType.ERC721:
    case TokenType.ERC1155:
      return getTokenDataHashNFT(tokenAddress, tokenType, tokenSubID);
  }
};

export const getTokenType = (tokenType: number): TokenType => {
  switch (tokenType) {
    case 0:
      return TokenType.ERC20;
    case 1:
      return TokenType.ERC721;
    case 2:
      return TokenType.ERC1155;
  }
  throw new Error('Unhandled token type');
};

export const getTokenTypeBigInt = (tokenType: TokenType): BigInt => {
  switch (tokenType) {
    case TokenType.ERC20:
      return BigInt.fromI32(0);
    case TokenType.ERC721:
      return BigInt.fromI32(1);
    case TokenType.ERC1155:
      return BigInt.fromI32(2);
  }
};
