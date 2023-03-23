import { Bytes } from '@graphprotocol/graph-ts';
import { hexlify } from './utils';

export const getCiphertextIV = (ciphertext: Bytes[]): Bytes => {
  const ivTag = hexlify(ciphertext[0]);
  const iv = Bytes.fromHexString(ivTag.substring(0, 32));
  return iv;
};

export const getCiphertextTag = (ciphertext: Bytes[]): Bytes => {
  const ivTag = hexlify(ciphertext[0]);
  const tag = Bytes.fromHexString(ivTag.substring(32));
  return tag;
};

export const getCiphertextData = (ciphertext: Bytes[]): Bytes[] => {
  const data = ciphertext.slice(1);
  return data;
};
