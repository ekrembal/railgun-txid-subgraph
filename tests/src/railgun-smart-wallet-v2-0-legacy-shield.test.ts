import {
  describe,
  test,
  afterEach,
  clearStore,
  assert,
} from 'matchstick-as/assembly/index';
import { BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { createShield } from '../util/event-utils.test';
import { handleShieldLegacyPreMar23 } from '../../src/railgun-smart-wallet';
import { assertCommonCommitmentFields } from '../util/assert.test';
import {
  MOCK_TOKEN_ERC20_HASH,
  MOCK_TOKEN_ERC20_TUPLE,
  MOCK_TOKEN_ERC721_HASH,
  MOCK_TOKEN_ERC721_TUPLE,
} from '../util/models.test';
import { bigIntToBytes } from '../../src/utils';
import { Shield1 as LegacyShieldEvent } from '../../generated/RailgunSmartWallet/RailgunSmartWallet';
import { createMockPoseidonT4Call } from '../util/mock-calls.test';

describe('railgun-smart-wallet-v2.0-legacy-shield', () => {
  afterEach(() => {
    clearStore();
  });

  test('Should handle Shield (v2.0 legacy shield) event', () => {
    const treeNumber = BigInt.fromString('2000');
    const startPosition = BigInt.fromString('3000');

    const hash: BigInt[] = [
      BigInt.fromString('4444'),
      BigInt.fromString('5555'),
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

    for (let i = 0; i < commitments.length; i++) {
      const commitment = commitments[i];
      createMockPoseidonT4Call(
        BigInt.fromUnsignedBytes(commitment[0].toBytes()),
        i === 0
          ? BigInt.fromUnsignedBytes(Bytes.fromHexString(MOCK_TOKEN_ERC20_HASH))
          : BigInt.fromUnsignedBytes(
              Bytes.fromHexString(MOCK_TOKEN_ERC721_HASH),
            ),
        commitment[2].toBigInt(),
        hash[i],
      );
    }

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

    const event = createShield<LegacyShieldEvent>(
      treeNumber,
      startPosition,
      commitments,
      shieldCiphertext,
      null, // fees
    );

    handleShieldLegacyPreMar23(event);

    assert.entityCount('Token', 2);
    assert.entityCount('CommitmentPreimage', 2);
    assert.entityCount('ShieldCommitment', 2);

    const expectedIDs = [
      '0xd007000000000000000000000000000000000000000000000000000000000000b80b000000000000000000000000000000000000000000000000000000000000',
      '0xd007000000000000000000000000000000000000000000000000000000000000b90b000000000000000000000000000000000000000000000000000000000000',
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
        hash[i],
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
      assert.fieldEquals('ShieldCommitment', expectedID, 'fee', 'null');
    }
  });
});
