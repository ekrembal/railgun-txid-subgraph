import {
  assert,
  describe,
  test,
  beforeAll,
  afterAll,
} from 'matchstick-as/assembly/index';
import { Bytes, BigInt, ByteArray } from '@graphprotocol/graph-ts';
import { bigIntToBytes } from '../src/utils';

describe('utils', () => {
  beforeAll(() => {});

  afterAll(() => {});

  test('Should convert byte array to Bytes type', () => {
    assert.bytesEquals(
      Bytes.fromByteArray(ByteArray.fromHexString('0x1234')),
      Bytes.fromHexString('0x1234'),
    );
  });

  test('Should convert bigint to Bytes type', () => {
    assert.bytesEquals(
      bigIntToBytes(BigInt.fromString('2')),
      Bytes.fromHexString('0x02'),
    );
  });
});
