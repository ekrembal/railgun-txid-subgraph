import {
  assert,
  describe,
  test,
  newMockEvent,
} from 'matchstick-as/assembly/index';
import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { idFrom3PaddedBigInts } from '../../src/id';

describe('id', () => {
  test('Should create ID from 3 padded bigints', () => {
    assert.bytesEquals(
      idFrom3PaddedBigInts(BigInt.fromString('1'), BigInt.fromString('2'), BigInt.fromString('3')),
      Bytes.fromHexString(
        '0x000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003',
      ),
    );
  });

});
