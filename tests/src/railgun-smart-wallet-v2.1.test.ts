import {
  describe,
  test,
  afterEach,
  clearStore,
  assert,
  logStore,
} from 'matchstick-as/assembly/index';
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import {
  createCommitmentBatchEvent,
  createGeneratedCommitmentBatchEvent,
  createNullifiersEvent,
} from '../util/event-utils.test';
import {
  handleCommitmentBatch,
  handleGeneratedCommitmentBatch,
  handleNullifier,
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

describe('railgun-smart-wallet-v2.1', () => {
  afterEach(() => {
    clearStore();
  });
});
