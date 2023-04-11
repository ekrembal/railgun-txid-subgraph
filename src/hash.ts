import { Bytes, BigInt, Address } from '@graphprotocol/graph-ts';
import { PoseidonT4 } from './class/PoseidonT4';
import { getPoseidonT4ContractAddress } from './contracts';
import { bigIntToBytes } from './utils';

export const poseidonT4Hash = (
  chainId: u32,
  input1: BigInt,
  input2: BigInt,
  input3: BigInt,
): BigInt => {
  const contractAddress = Address.fromString(
    getPoseidonT4ContractAddress(chainId),
  );
  const poseidonContract = PoseidonT4.bind(contractAddress);
  let callResult = poseidonContract.try_poseidon1([input1, input2, input3]);
  if (callResult.reverted) {
    throw new Error('Poseidon hash call reverted');
  }
  return callResult.value;
};

export const getNoteHash = (
  chainId: u32,
  npk: Bytes,
  tokenHash: Bytes,
  value: BigInt,
): Bytes => {
  return bigIntToBytes(
    poseidonT4Hash(
      chainId,
      BigInt.fromUnsignedBytes(npk),
      BigInt.fromUnsignedBytes(tokenHash),
      value,
    ),
  );
};
