import { Bytes, BigInt, Address } from '@graphprotocol/graph-ts';
import { PoseidonT4 } from '../generated/PoseidonT4/PoseidonT4';
import { getPoseidonT4ContractAddress } from './contracts';

export const poseidonT4Hash = (
  input1: BigInt,
  input2: BigInt,
  input3: BigInt,
): BigInt => {
  const contractAddress = Address.fromString(getPoseidonT4ContractAddress(1));
  const poseidonContract = PoseidonT4.bind(contractAddress);
  let callResult = poseidonContract.try_poseidon1([input1, input2, input3]);
  if (callResult.reverted) {
    throw new Error('Poseidon hash call reverted');
  }
  return callResult.value;
};

export const getNoteHash = (
  npk: Bytes,
  tokenHash: Bytes,
  value: BigInt,
): BigInt => {
  return poseidonT4Hash(
    BigInt.fromUnsignedBytes(npk),
    BigInt.fromUnsignedBytes(tokenHash),
    value,
  );
};
