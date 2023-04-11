import { Address } from '@graphprotocol/graph-ts';

export const getPoseidonT4ContractAddress = (chainId: u32): string => {
  switch (chainId) {
    case 1:
      return '0xcb2ebd9fcb570db7b4f723461efce7e1f3b5b5a3'; // Ethereum
    case 5:
      return '0xD72bEfcbdDd9615E90887b822Daa0115e751407a'; // Goerli
    case 56:
      return '0xa214d47e24de000dcdc83ef6cda192e5fc74a067'; // BSC
    case 137:
      return '0x6fe17dcf4f0296dc4d1382ee2a79051edb7f02db'; // Polygon
    case 42161:
      return '0x753f0f9ba003dda95eb9284533cf5b0f19e441dc'; // Arbitrum
    case 80001:
      return '0x22dd4ff4631bb0ad56e0ed6274dcce04d96af84e'; // Mumbai
    case 421613:
      return '0xfbc165e5601c9b658b63f71debe06a9f296f1ab7'; // Arbitrum Goerli
  }
  throw new Error(`Unrecognized chain ID: ${chainId.toString()}`);
};

export const chainIdForProxyContract = (address: Address): u32 => {
  const str = address.toHexString();

  // Cannot use a switch with strings...

  if (str == '0xfa7093cdd9ee6932b4eb2c9e1cde7ce00b1fa4b9') {
    return 1; // Ethereum
  }
  if (str == '0xe8bEa99BB438C2f3D533604D33258d74d5eE4824') {
    return 5; // Goerli
  }
  if (str == '0x590162bf4b50f6576a459b75309ee21d92178a10') {
    return 56; // BSC
  }
  if (str == '0x19b620929f97b7b990801496c3b361ca5def8c71') {
    return 137; // Polygon
  }
  if (str == '0x3ee8306321d992483BDC9c69B8F622Ba3FFF05B6') {
    return 42161; // Arbitrum
  }
  if (str == '0xFA7093CDD9EE6932B4eb2c9e1cde7CE00B1FA4b9') {
    return 80001; // Mumbai
  }
  if (str == '0xA0603e598F9Ac2fc7475a3fA08D0794066615D9a') {
    return 421613; // Arbitrum Goerli
  }

  throw new Error(`Unrecognized contract address: ${str}`);
};
