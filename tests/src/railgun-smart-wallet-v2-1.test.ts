import {
  describe,
  test,
  afterEach,
  clearStore,
  assert,
} from 'matchstick-as/assembly/index';
import { Address, BigInt, Bytes, ethereum, log } from '@graphprotocol/graph-ts';
import {
  createNullifiedEvent,
  createShield,
  createTransactEvent,
  createUnshieldEvent,
} from '../util/event-utils.test';
import {
  handleNullified,
  handleShield,
  handleTransact,
  handleUnshield,
} from '../../src/railgun-smart-wallet';
import { bigIntToBytes } from '../../src/utils';
import {
  assertCommonCommitmentFields,
  assertCommonFields,
  assertTokenFields,
} from '../util/assert.test';
import {
  MOCK_TOKEN_ADDRESS,
  MOCK_TOKEN_ERC20_HASH,
  MOCK_TOKEN_ERC20_TUPLE,
  MOCK_TOKEN_ERC721_HASH,
  MOCK_TOKEN_ERC721_TUPLE,
  MOCK_WALLET_ADDRESS_1,
  MOCK_WALLET_ADDRESS_2,
} from '../util/models.test';
import { Shield as ShieldEvent } from '../../generated/RailgunSmartWallet/RailgunSmartWallet';
import {
  getCiphertextData,
  getCiphertextIV,
  getCiphertextTag,
} from '../../src/ciphertext';

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

  test('Should handle Unshield event', () => {
    const tos: Address[] = [MOCK_WALLET_ADDRESS_1, MOCK_WALLET_ADDRESS_2];
    const tokens: ethereum.Value[][] = [
      MOCK_TOKEN_ERC20_TUPLE,
      MOCK_TOKEN_ERC721_TUPLE,
    ];
    const amounts: BigInt[] = [
      BigInt.fromString('1000'),
      BigInt.fromString('2000'),
    ];
    const fees: BigInt[] = [
      BigInt.fromString('3000'),
      BigInt.fromString('4000'),
    ];

    const events = [
      createUnshieldEvent(tos[0], tokens[0], amounts[0], fees[0]),
      createUnshieldEvent(tos[1], tokens[1], amounts[1], fees[1]),
    ];

    // Needs separate mock hash for separate index.
    events[1].transaction.hash = Bytes.fromHexString(
      '0x0101010101010101010101010101010101010101',
    );

    handleUnshield(events[0]);
    handleUnshield(events[1]);

    assert.entityCount('Token', 2);
    assert.entityCount('Unshield', 2);

    assertTokenFields(MOCK_TOKEN_ERC20_HASH, MOCK_TOKEN_ERC20_TUPLE);
    assertTokenFields(MOCK_TOKEN_ERC721_HASH, MOCK_TOKEN_ERC721_TUPLE);

    const expectedIDs = [
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      '0x010101010101010101010101010101010101010101000000',
    ];

    for (let i = 0; i < expectedIDs.length; i++) {
      const expectedID = expectedIDs[i];
      assertCommonFields('Unshield', expectedID, events[i]);

      assert.fieldEquals('Unshield', expectedID, 'to', tos[i].toHexString());
      assert.fieldEquals(
        'Unshield',
        expectedID,
        'token',
        [MOCK_TOKEN_ERC20_HASH, MOCK_TOKEN_ERC721_HASH][i],
      );
      assert.fieldEquals(
        'Unshield',
        expectedID,
        'amount',
        amounts[i].toString(),
      );
      assert.fieldEquals('Unshield', expectedID, 'fee', fees[i].toString());
    }
  });

  test('Should handle Transact event', () => {
    const treeNumber = BigInt.fromString('2000');
    const startPosition = BigInt.fromString('3000');

    const hash: Bytes[] = [
      Bytes.fromHexString('0x1111'),
      Bytes.fromHexString('0x2222'),
    ];

    const ciphertext: Array<ethereum.Value>[] = [
      [
        // ciphertext
        ethereum.Value.fromBytesArray([
          Bytes.fromHexString(
            '0x4000000000000000000300000000000000200000000000000010000000',
          ),
          Bytes.fromHexString(
            '0x5000000000000000600000000050000000000000400000000000300000',
          ),
          Bytes.fromHexString(
            '0x6000000000000000600000000050000100000000400000000000300000',
          ),
        ]),

        // blindedSenderViewingKey
        ethereum.Value.fromBytes(Bytes.fromHexString('0x6000')),

        // blindedReceiverViewingKey
        ethereum.Value.fromBytes(Bytes.fromHexString('0x7000')),

        // annotationData
        ethereum.Value.fromBytes(Bytes.fromHexString('0x8000')),

        // memo
        ethereum.Value.fromBytes(Bytes.fromHexString('0x9000')),
      ],
      [
        // ciphertext
        ethereum.Value.fromBytesArray([
          Bytes.fromHexString(
            '0x014000000000000000000300000000000000200000000000000010000000',
          ),
          Bytes.fromHexString(
            '0x015000000000000000600000000050000000000000400000000000300000',
          ),
          Bytes.fromHexString(
            '0x016000000000000060000000005000010000000040000000000030000000',
          ),
        ]),

        // blindedSenderViewingKey
        ethereum.Value.fromBytes(Bytes.fromHexString('0x016000')),

        // blindedReceiverViewingKey
        ethereum.Value.fromBytes(Bytes.fromHexString('0x017000')),

        // annotationData
        ethereum.Value.fromBytes(Bytes.fromHexString('0x018000')),

        // memo
        ethereum.Value.fromBytes(Bytes.fromHexString('0x019000')),
      ],
    ];

    const event = createTransactEvent(
      treeNumber,
      startPosition,
      hash,
      ciphertext,
    );

    handleTransact(event);

    assert.entityCount('Ciphertext', 2);
    assert.entityCount('CommitmentCiphertext', 2);
    assert.entityCount('TransactCommitment', 2);

    const expectedIDs = [
      '0x000000000000000000000000000000000000000000000000000000000000d007000000000000000000000000000000000000000000000000000000000000b80b',
      '0x000000000000000000000000000000000000000000000000000000000000d007000000000000000000000000000000000000000000000000000000000000b90b',
    ];

    for (let i = 0; i < expectedIDs.length; i++) {
      const expectedID = expectedIDs[i];
      assertCommonCommitmentFields(
        'TransactCommitment',
        expectedID,
        event,
        treeNumber,
        startPosition,
        BigInt.fromI32(i),
      );

      const ciphertextBytesArray: Bytes[] = ciphertext[i][0].toBytesArray();

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
        'CommitmentCiphertext',
        expectedID,
        'ciphertext',
        expectedID,
      );
      // // TODO
      // assert.fieldEquals(
      //   'CommitmentCiphertext',
      //   expectedID,
      //   'blindedSenderViewingKey',
      //   expectedID,
      // );
      // // TODO
      // assert.fieldEquals(
      //   'CommitmentCiphertext',
      //   expectedID,
      //   'blindedReceiverViewingKey',
      //   expectedID,
      // );
      // // TODO
      // assert.fieldEquals(
      //   'CommitmentCiphertext',
      //   expectedID,
      //   'annotationData',
      //   expectedID,
      // );
      // // TODO
      // assert.fieldEquals(
      //   'CommitmentCiphertext',
      //   expectedID,
      //   'memo',
      //   expectedID,
      // );

      assert.fieldEquals(
        'TransactCommitment',
        expectedID,
        'ciphertext',
        expectedID,
      );
    }
  });
});
