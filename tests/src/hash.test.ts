import { assert, describe, test } from 'matchstick-as/assembly';
import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { getNoteHash } from '../../src/hash';
import { bigIntToBytes } from '../../src/utils';
import { createMockPoseidonT4Call } from '../util/mock-calls.test';

describe('hash', () => {
  test('Should create note hash for live shield commitment', () => {
    createMockPoseidonT4Call(
      BigInt.fromUnsignedBytes(
        Bytes.fromHexString(
          '0x12a1f22c8e1f7feb6923ac7118fc66aaa19ebbb1abbbba9b8a271d06b2277abd', // npk
        ),
      ),
      BigInt.fromUnsignedBytes(
        Bytes.fromHexString(
          '0x000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7', // token hash
        ),
      ),
      BigInt.fromUnsignedBytes(
        Bytes.fromHexString(
          '0x0000000000000000000000001b70cc71', // value
        ),
      ),
      BigInt.fromUnsignedBytes(
        Bytes.fromHexString(
          '0x04300939ad6f444712784a719c6d0bbe1b49a0b4d16983a6324bbbac136a83c7', // hash
        ),
      ),
    );

    assert.bytesEquals(
      bigIntToBytes(
        getNoteHash(
          Bytes.fromHexString(
            '0x12a1f22c8e1f7feb6923ac7118fc66aaa19ebbb1abbbba9b8a271d06b2277abd', // npk
          ),
          Bytes.fromHexString(
            '0x000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7', // token hash
          ),
          BigInt.fromUnsignedBytes(
            Bytes.fromHexString(
              '0x0000000000000000000000001b70cc71', // value
            ),
          ),
        ),
      ),
      Bytes.fromHexString(
        '0x04300939ad6f444712784a719c6d0bbe1b49a0b4d16983a6324bbbac136a83c7',
      ),
    );
  });
});
