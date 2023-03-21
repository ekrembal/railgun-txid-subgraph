import { newMockEvent } from "matchstick-as"
import { ethereum, Address } from "@graphprotocol/graph-ts"
import {
  ProxyOwnershipTransfer,
  ProxyPause,
  ProxyUnpause,
  ProxyUpgrade
} from "../generated/RailgunSmartWallet/RailgunSmartWallet"

export function createProxyOwnershipTransferEvent(
  previousOwner: Address,
  newOwner: Address
): ProxyOwnershipTransfer {
  let proxyOwnershipTransferEvent = changetype<ProxyOwnershipTransfer>(
    newMockEvent()
  )

  proxyOwnershipTransferEvent.parameters = new Array()

  proxyOwnershipTransferEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  proxyOwnershipTransferEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return proxyOwnershipTransferEvent
}

export function createProxyPauseEvent(): ProxyPause {
  let proxyPauseEvent = changetype<ProxyPause>(newMockEvent())

  proxyPauseEvent.parameters = new Array()

  return proxyPauseEvent
}

export function createProxyUnpauseEvent(): ProxyUnpause {
  let proxyUnpauseEvent = changetype<ProxyUnpause>(newMockEvent())

  proxyUnpauseEvent.parameters = new Array()

  return proxyUnpauseEvent
}

export function createProxyUpgradeEvent(
  previousImplementation: Address,
  newImplementation: Address
): ProxyUpgrade {
  let proxyUpgradeEvent = changetype<ProxyUpgrade>(newMockEvent())

  proxyUpgradeEvent.parameters = new Array()

  proxyUpgradeEvent.parameters.push(
    new ethereum.EventParam(
      "previousImplementation",
      ethereum.Value.fromAddress(previousImplementation)
    )
  )
  proxyUpgradeEvent.parameters.push(
    new ethereum.EventParam(
      "newImplementation",
      ethereum.Value.fromAddress(newImplementation)
    )
  )

  return proxyUpgradeEvent
}
