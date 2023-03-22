import {
  assert,
  describe,
  test,
  beforeAll,
  afterAll,
} from 'matchstick-as/assembly/index';
import { Bytes, BigInt, ByteArray } from '@graphprotocol/graph-ts';
import {
  bigIntToBytes,
  hexlify,
  padTo32Bytes,
  reverseBytes,
} from '../../src/utils';

describe('utils', () => {
  beforeAll(() => {});

  afterAll(() => {});

  test('Should hexlify bytes', () => {
    assert.stringEquals(hexlify(Bytes.fromHexString('0x1234')), '1234');
  });

  test('Should pad to 32 bytes', () => {
    assert.bytesEquals(
      padTo32Bytes(Bytes.fromHexString('0x1234')),
      Bytes.fromHexString(
        '0x0000000000000000000000000000000000000000000000000000000000001234',
      ),
    );
  });

  test('Should convert byte array to Bytes type', () => {
    assert.bytesEquals(
      Bytes.fromByteArray(ByteArray.fromHexString('0x1234')),
      Bytes.fromHexString('0x1234'),
    );
  });

  test('Should convert bigint to Bytes type', () => {
    // Big endian
    assert.bytesEquals(
      bigIntToBytes(BigInt.fromString('2')),
      Bytes.fromHexString('0x02'),
    );

    // Little endian
    assert.bytesEquals(
      bigIntToBytes(BigInt.fromI32(2)),
      Bytes.fromHexString('0x02000000'),
    );
    assert.bytesEquals(Bytes.fromI32(2), Bytes.fromHexString('0x02000000'));
  });

  test('Should reverse Bytes, endian friendly', () => {
    assert.bytesEquals(
      reverseBytes(Bytes.fromHexString('0x0001')),
      Bytes.fromHexString('0x0100'),
    );
  });
});
