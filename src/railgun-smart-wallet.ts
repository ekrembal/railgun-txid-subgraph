import {
  ProxyOwnershipTransfer as ProxyOwnershipTransferEvent,
  ProxyPause as ProxyPauseEvent,
  ProxyUnpause as ProxyUnpauseEvent,
  ProxyUpgrade as ProxyUpgradeEvent
} from "../generated/RailgunSmartWallet/RailgunSmartWallet"
import {
  ProxyOwnershipTransfer,
  ProxyPause,
  ProxyUnpause,
  ProxyUpgrade
} from "../generated/schema"

export function handleProxyOwnershipTransfer(
  event: ProxyOwnershipTransferEvent
): void {
  let entity = new ProxyOwnershipTransfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleProxyPause(event: ProxyPauseEvent): void {
  let entity = new ProxyPause(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleProxyUnpause(event: ProxyUnpauseEvent): void {
  let entity = new ProxyUnpause(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleProxyUpgrade(event: ProxyUpgradeEvent): void {
  let entity = new ProxyUpgrade(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousImplementation = event.params.previousImplementation
  entity.newImplementation = event.params.newImplementation

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
