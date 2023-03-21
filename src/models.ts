// Sync with graphql enum in schema.graphql
export enum CommitmentType {
  ShieldCommitment = 'ShieldCommitment',
  TransactCommitment = 'TransactCommitment',
  LegacyGeneratedCommitment = 'LegacyGeneratedCommitment',
  LegacyEncryptedCommitment = 'LegacyEncryptedCommitment',
}

// Sync with graphql enum in schema.graphql
export enum TokenType {
  ERC20 = 'ERC20',
  ERC721 = 'ERC721',
  ERC1155 = 'ERC1155',
}
