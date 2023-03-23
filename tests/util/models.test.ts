import { Address, ethereum, BigInt } from '@graphprotocol/graph-ts';

export const MOCK_TOKEN_ADDRESS = Address.fromString(
  '0x40FDe2952a0674a3E77707Af270af09800657293',
);

export const MOCK_WALLET_ADDRESS_1 = Address.fromString(
  '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
);
export const MOCK_WALLET_ADDRESS_2 = Address.fromString(
  '0xe8da6bf26964af9d7eed9e03e53415d37aa96046',
);

export const MOCK_TOKEN_ERC20_TUPLE: ethereum.Tuple = changetype<
  ethereum.Tuple
>([
  // tokenType
  ethereum.Value.fromI32(0),
  // tokenAddress
  ethereum.Value.fromAddress(MOCK_TOKEN_ADDRESS),
  // tokenSubID
  ethereum.Value.fromUnsignedBigInt(BigInt.fromString('0')),
]);
export const MOCK_TOKEN_ERC20_HASH =
  '0x00000000000000000000000040fde2952a0674a3e77707af270af09800657293';

export const MOCK_TOKEN_ERC721_TUPLE: ethereum.Tuple = changetype<
  ethereum.Tuple
>([
  // tokenType
  ethereum.Value.fromI32(1),
  // tokenAddress
  ethereum.Value.fromAddress(MOCK_TOKEN_ADDRESS),
  // tokenSubID
  ethereum.Value.fromUnsignedBigInt(BigInt.fromString('1')),
]);
export const MOCK_TOKEN_ERC721_HASH =
  '0x1f325aa1bee8caa33be0570b597f64a8f7e745ee2b9a26a8ed3c3bc769d90c4b';
