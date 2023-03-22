import {
  assert,
  describe,
  test,
  beforeAll,
  afterAll,
} from 'matchstick-as/assembly/index';
import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { getTokenHash } from '../../src/token';

describe('token', () => {
  beforeAll(() => {});

  afterAll(() => {});

  test('Should get token hashes for all token types', () => {
    const tokenAddress = Bytes.fromHexString(
      '0x1234567890123456789012345678901234567890',
    );
    const tokenSubID = Bytes.fromHexString('0x01');

    // ERC20
    assert.bytesEquals(getTokenHash(tokenAddress, 0, tokenSubID), tokenAddress);

    // ERC721
    assert.bytesEquals(
      getTokenHash(tokenAddress, 1, tokenSubID),
      Bytes.fromHexString(
        '075b737079de804169d5e006add4da4942063ab4fce32268c469c49460e52be0',
      ),
    );

    // ERC1155
    assert.bytesEquals(
      getTokenHash(tokenAddress, 2, tokenSubID),
      Bytes.fromHexString(
        '2d0c48e5b759b13bea21d65719c47747f857f47be541ddb0df54fa0a040a7bed',
      ),
    );
  });
});
