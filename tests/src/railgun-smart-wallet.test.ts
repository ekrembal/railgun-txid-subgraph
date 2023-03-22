import {
  describe,
  test,
  afterEach,
  clearStore,
  assert,
} from 'matchstick-as/assembly/index';
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import {
  createGeneratedCommitmentBatchEvent,
  createNullifiersEvent,
} from '../util/event-utils.test';
import {
  handleGeneratedCommitmentBatch,
  handleNullifier,
} from '../../src/railgun-smart-wallet';
import { bigIntToBytes } from '../../src/utils';
import { assertCommonFields } from '../util/assert.test';
import { MOCK_TOKEN_ADDRESS } from '../util/models.test';

describe('railgun-smart-wallet', () => {
  afterEach(() => {
    clearStore();
  });

  test('Should handle Nullifiers event', () => {
    const treeNumber = BigInt.fromString('2000');
    const nullifiers = [BigInt.fromString('3000'), BigInt.fromString('4000')];
    const event = createNullifiersEvent(treeNumber, nullifiers);

    handleNullifier(event);

    assert.entityCount('Nullifier', 2);

    const expectedIDs = [
      '0x000000000000000000000000000000000000000000000000000000000000d007000000000000000000000000000000000000000000000000000000000000b80b',
      '0x000000000000000000000000000000000000000000000000000000000000d007000000000000000000000000000000000000000000000000000000000000a00f',
    ];

    for (let i = 0; i < expectedIDs.length; i++) {
      const expectedID = expectedIDs[i];
      assertCommonFields('Nullifier', expectedID, event);

      assert.fieldEquals(
        'Nullifier',
        expectedID,
        'treeNumber',
        treeNumber.toString(),
      );
      assert.fieldEquals(
        'Nullifier',
        expectedID,
        'nullifier',
        bigIntToBytes(nullifiers[i]).toHexString(),
      );
    }
  });

  test('Should handle GenerateCommitmentBatch event', () => {
    const treeNumber = BigInt.fromString('2000');
    const startPosition = BigInt.fromString('3000');

    const token1: Array<ethereum.Value> = [
      // tokenAddress
      ethereum.Value.fromAddress(MOCK_TOKEN_ADDRESS),
      // tokenType
      ethereum.Value.fromI32(0),
      // tokenSubID
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString('4200')),
    ];
    const token1Tuple = changetype<ethereum.Tuple>(token1);
    const token2: Array<ethereum.Value> = [
      // tokenAddress
      ethereum.Value.fromAddress(MOCK_TOKEN_ADDRESS),
      // tokenType
      ethereum.Value.fromI32(1),
      // tokenSubID
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString('4700')),
    ];
    const token2Tuple = changetype<ethereum.Tuple>(token2);
    const commitments: Array<ethereum.Value>[] = [
      [
        // npk
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString('4100')),
        // token
        ethereum.Value.fromTuple(token1Tuple),
        // value
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString('4300')),
      ],
      [
        // npk
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString('4600')),
        // token
        ethereum.Value.fromTuple(token2Tuple),
        // value
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString('4800')),
      ],
    ];
    const encryptedRandom = [
      [BigInt.fromString('10000'), BigInt.fromString('11000')],
      [BigInt.fromString('12000'), BigInt.fromString('13000')],
    ];
    const event = createGeneratedCommitmentBatchEvent(
      treeNumber,
      startPosition,
      commitments,
      encryptedRandom,
    );

    handleGeneratedCommitmentBatch(event);

    assert.entityCount('LegacyGeneratedCommitment', 2);

    const expectedIDs = [
      '0x000000000000000000000000000000000000000000000000000000000000d007000000000000000000000000000000000000000000000000000000000000b80b',
      '0x000000000000000000000000000000000000000000000000000000000000d007000000000000000000000000000000000000000000000000000000000000a00f',
    ];

    for (let i = 0; i < expectedIDs.length; i++) {
      const expectedID = expectedIDs[i];
      assertCommonFields('LegacyGeneratedCommitment', expectedID, event);

      assert.fieldEquals(
        'LegacyGeneratedCommitment',
        expectedID,
        'treeNumber',
        treeNumber.toString(),
      );
    }
  });
});
