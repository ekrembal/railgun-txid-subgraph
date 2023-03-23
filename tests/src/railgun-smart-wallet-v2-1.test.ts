import {
  describe,
  test,
  afterEach,
  clearStore,
  assert,
} from 'matchstick-as/assembly/index';
import { BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { createNullifiedEvent, createShield } from '../util/event-utils.test';
import { handleNullified, handleShield } from '../../src/railgun-smart-wallet';
import { bigIntToBytes } from '../../src/utils';
import {
  assertCommonCommitmentFields,
  assertCommonFields,
} from '../util/assert.test';
import {
  MOCK_TOKEN_ERC20_HASH,
  MOCK_TOKEN_ERC20_TUPLE,
  MOCK_TOKEN_ERC721_HASH,
  MOCK_TOKEN_ERC721_TUPLE,
} from '../util/models.test';
import { Shield as ShieldEvent } from '../../generated/RailgunSmartWallet/RailgunSmartWallet';

describe('railgun-smart-wallet-v2.1', () => {
  afterEach(() => {
    clearStore();
  });

  test('Should handle Shield (v2.1 new shield) event', () => {
    const treeNumber = BigInt.fromString('2000');
    const startPosition = BigInt.fromString('3000');

    const hash: BigInt[] = [
      BigInt.fromString('1111'),
      BigInt.fromString('2222'),
    ];

    const commitments: Array<ethereum.Value>[] = [
      [
        // npk
        ethereum.Value.fromBytes(bigIntToBytes(BigInt.fromString('4100'))),
        // token
        ethereum.Value.fromTuple(MOCK_TOKEN_ERC20_TUPLE),
        // value
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString('4300')),
      ],
      [
        // npk
        ethereum.Value.fromBytes(bigIntToBytes(BigInt.fromString('4600'))),
        // token
        ethereum.Value.fromTuple(MOCK_TOKEN_ERC721_TUPLE),
        // value
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString('4800')),
      ],
    ];

    const shieldCiphertext: Array<ethereum.Value>[] = [
      [
        // encryptedBundle
        ethereum.Value.fromBytesArray([
          Bytes.fromHexString('0x1111'),
          Bytes.fromHexString('0x2222'),
        ]),
        // shieldKey
        ethereum.Value.fromBytes(Bytes.fromHexString('0x1234')),
      ],
      [
        // encryptedBundle
        ethereum.Value.fromBytesArray([
          Bytes.fromHexString('0x3333'),
          Bytes.fromHexString('0x4444'),
        ]),
        // shieldKey
        ethereum.Value.fromBytes(Bytes.fromHexString('0x5678')),
      ],
    ];

    const fees = [BigInt.fromString('6666'), BigInt.fromString('9999')];

    const event = createShield<ShieldEvent>(
      treeNumber,
      startPosition,
      commitments,
      shieldCiphertext,
      fees,
    );

    handleShield(event);

    assert.entityCount('Token', 2);
    assert.entityCount('CommitmentPreimage', 2);
    assert.entityCount('ShieldCommitment', 2);

    const expectedIDs = [
      '0x000000000000000000000000000000000000000000000000000000000000d007000000000000000000000000000000000000000000000000000000000000b80b',
      '0x000000000000000000000000000000000000000000000000000000000000d007000000000000000000000000000000000000000000000000000000000000b90b',
    ];

    for (let i = 0; i < expectedIDs.length; i++) {
      const expectedID = expectedIDs[i];
      assertCommonCommitmentFields(
        'ShieldCommitment',
        expectedID,
        event,
        treeNumber,
        startPosition,
        BigInt.fromI32(i),
      );

      assert.fieldEquals(
        'CommitmentPreimage',
        expectedID,
        'npk',
        commitments[i][0].toBytes().toHexString(),
      );
      assert.fieldEquals(
        'CommitmentPreimage',
        expectedID,
        'value',
        commitments[i][2].toBigInt().toString(),
      );
      assert.fieldEquals(
        'CommitmentPreimage',
        expectedID,
        'token',
        [MOCK_TOKEN_ERC20_HASH, MOCK_TOKEN_ERC721_HASH][i],
      );

      assert.fieldEquals(
        'ShieldCommitment',
        expectedID,
        'encryptedBundle',
        '[' +
          shieldCiphertext[i][0]
            .toBytesArray()
            .map<string>((b) => b.toHexString())
            .join(', ') +
          ']', // ex. [0x1111, 0x2222]
      );
      assert.fieldEquals(
        'ShieldCommitment',
        expectedID,
        'shieldKey',
        shieldCiphertext[i][1].toBytes().toHexString(),
      );
      assert.fieldEquals(
        'ShieldCommitment',
        expectedID,
        'fee',
        fees[i].toString(),
      );
    }
  });

  test('Should handle Nullified event', () => {
    const treeNumber = changetype<i32>(2000);
    const nullifiers = [
      Bytes.fromHexString('0x3000'),
      Bytes.fromHexString('0x4000'),
    ];
    const event = createNullifiedEvent(treeNumber, nullifiers);

    handleNullified(event);

    assert.entityCount('Nullifier', 2);

    const expectedIDs = [
      '0x000000000000000000000000000000000000000000000000000000000000d0070000000000000000000000000000000000000000000000000000000000300000',
      '0x000000000000000000000000000000000000000000000000000000000000d0070000000000000000000000000000000000000000000000000000000000400000',
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
        nullifiers[i].toHexString(),
      );
    }
  });
});
