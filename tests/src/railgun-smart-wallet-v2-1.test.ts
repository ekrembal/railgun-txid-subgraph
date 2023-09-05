import { Address, Bytes, ethereum, BigInt, log } from "@graphprotocol/graph-ts";
import {
  describe,
  test,
  afterEach,
  clearStore,
  assert,
} from "matchstick-as/assembly/index";

import {
  TransactCall,
  Transact1Call,
  TransactCall_transactionsBoundParamsStruct,
  TransactCall_transactionsBoundParamsCommitmentCiphertextStruct,
} from "../../generated/RailgunSmartWallet/RailgunSmartWallet";
import { getBoundParammsHash } from "../../src/railgun-smart-wallet-events";

describe("railgun-smart-wallet-v2.1", () => {
  afterEach(() => {
    clearStore();
  });

  test("Should calculate bound params hash", () => {
    // Bound params from tx: https://goerli.etherscan.io/tx/0xd11cadb34edd5c16d861526b5a5953906f2de7f3ff5322659dafbb45c2f7e331
    // [
    //   "0",
    //   "65536",
    //   "1",
    //   "5",
    //   "0x0000000000000000000000000000000000000000",
    //   "0x0000000000000000000000000000000000000000000000000000000000000000",
    //   [
    //     [
    //       [
    //         "0xaac3f322b4787f1d219eb4e4d43737425940dbbfb4956819e09db24f29048e53",
    //         "0xc35f1f4ffb25d67d7f24e2ba9f9d95770168fe5fda79bd457fd321bcd4252b1d",
    //         "0xdde3219e0d7ebc13149a073dc01a40b569845e71f40ab59863d1f79d7ae556d3",
    //         "0xa475d41b22d341faaa04591d0bf81fc302817a162f1372efae059258e60fb7a4",
    //       ],
    //       "0xded2dc8080552bc868b0409bb58a4d3546236fedf6206f96d24a7bf52c67b2a8",
    //       "0xded2dc8080552bc868b0409bb58a4d3546236fedf6206f96d24a7bf52c67b2a8",
    //       "0xf3ec517f50899c70f5e4f7e2bd31a2cd58391a976691afc72226bd34efd6a5ba085482f7a9ce5439e343a9a890ae5f797a57fb79fcc0c57945266ca7de8a",
    //       "0x",
    //     ],
    //   ],
    // ]);
    const commitmentChipertext = [
      ethereum.Value.fromFixedSizedArray([
        ethereum.Value.fromBytes(
          Bytes.fromHexString(
            "0xaac3f322b4787f1d219eb4e4d43737425940dbbfb4956819e09db24f29048e53"
          )
        ),
        ethereum.Value.fromBytes(
          Bytes.fromHexString(
            "0xc35f1f4ffb25d67d7f24e2ba9f9d95770168fe5fda79bd457fd321bcd4252b1d"
          )
        ),
        ethereum.Value.fromBytes(
          Bytes.fromHexString(
            "0xdde3219e0d7ebc13149a073dc01a40b569845e71f40ab59863d1f79d7ae556d3"
          )
        ),
        ethereum.Value.fromBytes(
          Bytes.fromHexString(
            "0xa475d41b22d341faaa04591d0bf81fc302817a162f1372efae059258e60fb7a4"
          )
        ),
      ]),
      ethereum.Value.fromBytes(
        Bytes.fromHexString(
          "0xded2dc8080552bc868b0409bb58a4d3546236fedf6206f96d24a7bf52c67b2a8"
        )
      ),
      ethereum.Value.fromBytes(
        Bytes.fromHexString(
          "0xded2dc8080552bc868b0409bb58a4d3546236fedf6206f96d24a7bf52c67b2a8"
        )
      ),
      ethereum.Value.fromBytes(
        Bytes.fromHexString(
          "0xf3ec517f50899c70f5e4f7e2bd31a2cd58391a976691afc72226bd34efd6a5ba085482f7a9ce5439e343a9a890ae5f797a57fb79fcc0c57945266ca7de8a"
        )
      ),
      ethereum.Value.fromBytes(Bytes.fromHexString("0x")),
    ];
    const boundParamsArray: Array<ethereum.Value> = [
      ethereum.Value.fromBytes(Bytes.fromHexString("0x0000")),
      ethereum.Value.fromBytes(Bytes.fromHexString("0x000000000000010000")),
      ethereum.Value.fromBytes(Bytes.fromHexString("0x01")),
      ethereum.Value.fromBytes(Bytes.fromHexString("0x0000000000000005")),
      ethereum.Value.fromBytes(
        Bytes.fromHexString("0x0000000000000000000000000000000000000000")
      ),
      ethereum.Value.fromBytes(
        Bytes.fromHexString(
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        )
      ),
      ethereum.Value.fromArray(commitmentChipertext),
    ];

    const boundParamsTuple: ethereum.Tuple = changetype<ethereum.Tuple>(
      boundParamsArray
    );
    const boundParamsStruct: TransactCall_transactionsBoundParamsStruct = changetype<
      TransactCall_transactionsBoundParamsStruct
    >(boundParamsTuple);

    const boundParamsHash = getBoundParammsHash(boundParamsStruct);
    log.debug(boundParamsHash.toHexString(), []);
    // // BigInt("8804994844791416303636801751915839687408145545116690128263966426603050415857");
    // assert.equals(
    //   ethereum.Value.fromBytes(boundParamsHash),
    //   ethereum.Value.fromBytes(
    //     Bytes.fromHexString(
    //       "0x1377735259C85D95329FA59C2457E13F2D85DFDB161E58FB8B5948D1A20AB6F1"
    //     )
    //   )
    // );
  });
});
