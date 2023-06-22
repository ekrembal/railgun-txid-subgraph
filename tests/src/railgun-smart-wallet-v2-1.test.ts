import {
  describe,
  test,
  afterEach,
  clearStore,
  assert,
} from 'matchstick-as/assembly/index';
import { BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import {
  createTransactEvent,
} from '../util/event-utils.test';
import {
  handleTransact,
} from '../../src/railgun-smart-wallet-events';
import { bigIntToBytes, reversedBytesToBigInt } from '../../src/utils';
import {
  assertCommonCommitmentFields,
} from '../util/assert.test';

import {
  getCiphertextData,
  getCiphertextIV,
  getCiphertextTag,
} from '../../src/ciphertext';

describe('railgun-smart-wallet-v2.1', () => {
  afterEach(() => {
    clearStore();
  });

  test('Should handle Transact event', () => {
    const treeNumber = BigInt.fromString('2000');
    const startPosition = BigInt.fromString('3000');

    const hash: Bytes[] = [
      Bytes.fromHexString('0x4455'),
      Bytes.fromHexString('0x6677'),
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
      '0x00000000000000000000000000000000000000000000000000000000000007d00000000000000000000000000000000000000000000000000000000000000bb8',
      '0x00000000000000000000000000000000000000000000000000000000000007d00000000000000000000000000000000000000000000000000000000000000bb9',
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
        reversedBytesToBigInt(hash[i]),
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
      assert.fieldEquals(
        'CommitmentCiphertext',
        expectedID,
        'blindedSenderViewingKey',
        ciphertext[i][1].toBytes().toHexString(),
      );
      assert.fieldEquals(
        'CommitmentCiphertext',
        expectedID,
        'blindedReceiverViewingKey',
        ciphertext[i][2].toBytes().toHexString(),
      );
      assert.fieldEquals(
        'CommitmentCiphertext',
        expectedID,
        'annotationData',
        ciphertext[i][3].toBytes().toHexString(),
      );
      assert.fieldEquals(
        'CommitmentCiphertext',
        expectedID,
        'memo',
        ciphertext[i][4].toBytes().toHexString(),
      );

      assert.fieldEquals(
        'TransactCommitment',
        expectedID,
        'ciphertext',
        expectedID,
      );
    }
  });
});
