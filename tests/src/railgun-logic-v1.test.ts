import {
  describe,
  test,
  afterEach,
  clearStore,
  assert,
} from 'matchstick-as/assembly/index';
import { BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import {
  createCommitmentBatchEvent,
  createGeneratedCommitmentBatchEvent,
  createNullifiersEvent,
} from '../util/event-utils.test';
import {
  handleCommitmentBatch,
  handleGeneratedCommitmentBatch,
  handleNullifiers,
} from '../../src/railgun-smart-wallet';
import { bigIntToBytes } from '../../src/utils';
import {
  assertCommonCommitmentFields,
  assertCommonFields,
  assertTokenFields,
} from '../util/assert.test';
import {
  MOCK_TOKEN_ERC20_HASH,
  MOCK_TOKEN_ERC20_TUPLE,
  MOCK_TOKEN_ERC721_HASH,
  MOCK_TOKEN_ERC721_TUPLE,
} from '../util/models.test';
import {
  getCiphertextData,
  getCiphertextIV,
  getCiphertextTag,
} from '../../src/ciphertext';
import { createMockPoseidonT4Call } from '../util/mock-calls.test';

describe('railgun-logic-v1', () => {
  afterEach(() => {
    clearStore();
  });

  test('Should handle Nullifiers event', () => {
    const treeNumber = BigInt.fromString('2000');
    const nullifiers = [BigInt.fromString('3000'), BigInt.fromString('4000')];
    const event = createNullifiersEvent(treeNumber, nullifiers);

    handleNullifiers(event);

    assert.entityCount('Nullifier', 2);

    const expectedIDs = [
      '0xd007000000000000000000000000000000000000000000000000000000000000b80b000000000000000000000000000000000000000000000000000000000000',
      '0xd007000000000000000000000000000000000000000000000000000000000000a00f000000000000000000000000000000000000000000000000000000000000',
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

    const hash: BigInt[] = [
      BigInt.fromString('4444'),
      BigInt.fromString('5555'),
    ];

    const commitments: Array<ethereum.Value>[] = [
      [
        // npk
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString('4100')),
        // token
        ethereum.Value.fromTuple(MOCK_TOKEN_ERC20_TUPLE),
        // value
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString('4300')),
      ],
      [
        // npk
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString('4600')),
        // token
        ethereum.Value.fromTuple(MOCK_TOKEN_ERC721_TUPLE),
        // value
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString('4800')),
      ],
    ];

    for (let i = 0; i < commitments.length; i++) {
      const commitment = commitments[i];
      createMockPoseidonT4Call(
        commitment[0].toBigInt(),
        i === 0
          ? BigInt.fromUnsignedBytes(Bytes.fromHexString(MOCK_TOKEN_ERC20_HASH))
          : BigInt.fromUnsignedBytes(
              Bytes.fromHexString(MOCK_TOKEN_ERC721_HASH),
            ),
        commitment[2].toBigInt(),
        hash[i],
      );
    }

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

    assert.entityCount('Token', 2);
    assert.entityCount('CommitmentPreimage', 2);
    assert.entityCount('LegacyGeneratedCommitment', 2);

    assertTokenFields(MOCK_TOKEN_ERC20_HASH, MOCK_TOKEN_ERC20_TUPLE);
    assertTokenFields(MOCK_TOKEN_ERC721_HASH, MOCK_TOKEN_ERC721_TUPLE);

    const expectedIDs = [
      '0xd007000000000000000000000000000000000000000000000000000000000000b80b000000000000000000000000000000000000000000000000000000000000',
      '0xd007000000000000000000000000000000000000000000000000000000000000b90b000000000000000000000000000000000000000000000000000000000000',
    ];

    for (let i = 0; i < expectedIDs.length; i++) {
      const expectedID = expectedIDs[i];
      assertCommonCommitmentFields(
        'LegacyGeneratedCommitment',
        expectedID,
        event,
        treeNumber,
        startPosition,
        BigInt.fromI32(i),
        hash[i],
      );

      assert.fieldEquals(
        'LegacyGeneratedCommitment',
        expectedID,
        'preimage',
        expectedID,
      );

      assert.fieldEquals(
        'CommitmentPreimage',
        expectedID,
        'npk',
        bigIntToBytes(commitments[i][0].toBigInt()).toHexString(),
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
        'LegacyGeneratedCommitment',
        expectedID,
        'encryptedRandom',
        `[${bigIntToBytes(
          encryptedRandom[i][0],
        ).toHexString()}, ${bigIntToBytes(
          encryptedRandom[i][1],
        ).toHexString()}]`, // ex. [0x1111, 0x2222]
      );
    }
  });

  test('Should handle CommitmentBatch event', () => {
    const treeNumber = BigInt.fromString('2000');
    const startPosition = BigInt.fromString('3000');

    const hash: BigInt[] = [
      BigInt.fromString('4444'),
      BigInt.fromString('5555'),
    ];

    const ciphertext: Array<ethereum.Value>[] = [
      [
        // ciphertext
        ethereum.Value.fromUnsignedBigIntArray([
          BigInt.fromString(
            '4000000000000000000000000000000000000000000000000000000000',
          ),
          BigInt.fromString(
            '5000000000000000000000000000000000000000000000000000000000',
          ),
          BigInt.fromString(
            '6000000000000000000000000000000000000000000000000000000000',
          ),
        ]),
        // ephemeralKeys
        ethereum.Value.fromUnsignedBigIntArray([
          BigInt.fromString('6000'),
          BigInt.fromString('7000'),
        ]),
        // memo
        ethereum.Value.fromUnsignedBigIntArray([
          BigInt.fromString('8000'),
          BigInt.fromString('9000'),
        ]),
      ],
      [
        // ciphertext
        ethereum.Value.fromUnsignedBigIntArray([
          BigInt.fromString(
            '14000000000000000000000000000000000000000000000000000000000',
          ),
          BigInt.fromString(
            '15000000000000000000000000000000000000000000000000000000000',
          ),
          BigInt.fromString(
            '16000000000000000000000000000000000000000000000000000000000',
          ),
        ]),
        // ephemeralKeys
        ethereum.Value.fromUnsignedBigIntArray([
          BigInt.fromString('16000'),
          BigInt.fromString('17000'),
        ]),
        // memo
        ethereum.Value.fromUnsignedBigIntArray([
          BigInt.fromString('18000'),
          BigInt.fromString('19000'),
        ]),
      ],
    ];
    const event = createCommitmentBatchEvent(
      treeNumber,
      startPosition,
      hash,
      ciphertext,
    );

    handleCommitmentBatch(event);

    assert.entityCount('Ciphertext', 2);
    assert.entityCount('LegacyCommitmentCiphertext', 2);
    assert.entityCount('LegacyEncryptedCommitment', 2);

    const expectedIDs = [
      '0xd007000000000000000000000000000000000000000000000000000000000000b80b000000000000000000000000000000000000000000000000000000000000',
      '0xd007000000000000000000000000000000000000000000000000000000000000b90b000000000000000000000000000000000000000000000000000000000000',
    ];

    for (let i = 0; i < expectedIDs.length; i++) {
      const expectedID = expectedIDs[i];
      assertCommonCommitmentFields(
        'LegacyEncryptedCommitment',
        expectedID,
        event,
        treeNumber,
        startPosition,
        BigInt.fromI32(i),
        hash[i],
      );

      const ciphertextBytesArray: Bytes[] = ciphertext[i][0]
        .toBigIntArray()
        .map<Bytes>((bigint) => bigIntToBytes(bigint));

      assert.fieldEquals(
        'Ciphertext',
        expectedID,
        'iv',
        getCiphertextIV(ciphertextBytesArray).toHexString(),
      );
      assert.fieldEquals(
        'Ciphertext',
        expectedID,
        'tag',
        getCiphertextTag(ciphertextBytesArray).toHexString(),
      );

      const ciphertextDataStrings = getCiphertextData(ciphertextBytesArray).map<
        string
      >((byte) => byte.toHexString());
      assert.fieldEquals(
        'Ciphertext',
        expectedID,
        'data',
        `[${ciphertextDataStrings[0]}, ${ciphertextDataStrings[1]}]`, // ex. [0x1111, 0x2222]
      );

      assert.fieldEquals(
        'LegacyEncryptedCommitment',
        expectedID,
        'ciphertext',
        expectedID,
      );
      assert.fieldEquals(
        'LegacyCommitmentCiphertext',
        expectedID,
        'ephemeralKeys',
        `[${ciphertext[i][1]
          .toBigIntArray()
          .map<Bytes>((bigint) => bigIntToBytes(bigint))[0]
          .toHexString()}, ${ciphertext[i][1]
          .toBigIntArray()
          .map<Bytes>((bigint) => bigIntToBytes(bigint))[1]
          .toHexString()}]`, // ex. [0x1111, 0x2222]
      );
      assert.fieldEquals(
        'LegacyCommitmentCiphertext',
        expectedID,
        'memo',
        `[${ciphertext[i][2]
          .toBigIntArray()
          .map<Bytes>((bigint) => bigIntToBytes(bigint))[0]
          .toHexString()}, ${ciphertext[i][2]
          .toBigIntArray()
          .map<Bytes>((bigint) => bigIntToBytes(bigint))[1]
          .toHexString()}]`, // ex. [0x1111, 0x2222]
      );

      assert.fieldEquals(
        'LegacyEncryptedCommitment',
        expectedID,
        'ciphertext',
        expectedID,
      );
    }
  });

  test('Should handle CommitmentBatch event - position 256 ID mismatch', () => {
    const treeNumber = BigInt.fromString('0');
    const startPosition = BigInt.fromString('256');

    const hash: BigInt[] = [BigInt.fromString('4444')];

    const ciphertext: Array<ethereum.Value>[] = [
      [
        // ciphertext
        ethereum.Value.fromUnsignedBigIntArray([
          BigInt.fromString(
            '4000000000000000000000000000000000000000000000000000000000',
          ),
          BigInt.fromString(
            '5000000000000000000000000000000000000000000000000000000000',
          ),
          BigInt.fromString(
            '6000000000000000000000000000000000000000000000000000000000',
          ),
        ]),
        // ephemeralKeys
        ethereum.Value.fromUnsignedBigIntArray([
          BigInt.fromString('6000'),
          BigInt.fromString('7000'),
        ]),
        // memo
        ethereum.Value.fromUnsignedBigIntArray([
          BigInt.fromString('8000'),
          BigInt.fromString('9000'),
        ]),
      ],
    ];
    const event = createCommitmentBatchEvent(
      treeNumber,
      startPosition,
      hash,
      ciphertext,
    );

    handleCommitmentBatch(event);

    const expectedID =
      '0x00000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000';

    assertCommonCommitmentFields(
      'LegacyEncryptedCommitment',
      expectedID,
      event,
      treeNumber,
      startPosition,
      BigInt.fromString('0'),
      hash[0],
    );
  });
});
