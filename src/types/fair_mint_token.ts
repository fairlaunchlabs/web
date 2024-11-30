/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/fair_mint_token.json`.
 */
export type FairMintToken = {
  "address": "EVsMFUMpdi9LUCkFm4GCEoMFg2RWnHhjDegpeAyD8ZAp",
  "metadata": {
    "name": "fairMintToken",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "burnTokensFromVault",
      "discriminator": [
        102,
        130,
        14,
        130,
        44,
        134,
        59,
        156
      ],
      "accounts": [
        {
          "name": "mint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  97,
                  105,
                  114,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "tokenName"
              },
              {
                "kind": "arg",
                "path": "tokenSymbol"
              },
              {
                "kind": "account",
                "path": "config_account.admin",
                "account": "tokenConfigData"
              }
            ]
          }
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "tokenVault",
          "writable": true
        },
        {
          "name": "sender",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "tokenName",
          "type": "string"
        },
        {
          "name": "tokenSymbol",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeLiquidityPool",
      "discriminator": [
        155,
        18,
        138,
        107,
        111,
        23,
        178,
        178
      ],
      "accounts": [
        {
          "name": "mint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  97,
                  105,
                  114,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "tokenName"
              },
              {
                "kind": "arg",
                "path": "tokenSymbol"
              },
              {
                "kind": "account",
                "path": "config_account.admin",
                "account": "tokenConfigData"
              }
            ]
          }
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "tokenVault",
          "writable": true
        },
        {
          "name": "protocolFeeAccount",
          "docs": [
            "CHECK the protocol fee account"
          ],
          "writable": true
        },
        {
          "name": "systemConfigAccount"
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "tokenName",
          "type": "string"
        },
        {
          "name": "tokenSymbol",
          "type": "string"
        }
      ]
    },
    {
      "name": "initializeSystem",
      "discriminator": [
        50,
        173,
        248,
        140,
        202,
        35,
        141,
        150
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemConfigData",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  121,
                  115,
                  116,
                  101,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "admin"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initializeToken",
      "discriminator": [
        38,
        209,
        150,
        50,
        190,
        117,
        16,
        54
      ],
      "accounts": [
        {
          "name": "metadata",
          "writable": true
        },
        {
          "name": "mint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  97,
                  105,
                  114,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "metadata_params.name"
              },
              {
                "kind": "arg",
                "path": "metadata_params.symbol"
              },
              {
                "kind": "account",
                "path": "payer"
              }
            ]
          }
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "tokenVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "configAccount"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "systemConfigAccount",
          "writable": true
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "tokenMetadataProgram",
          "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": [
        {
          "name": "metadata",
          "type": {
            "defined": {
              "name": "tokenMetadata"
            }
          }
        },
        {
          "name": "initConfigData",
          "type": {
            "defined": {
              "name": "initializeTokenConfigData"
            }
          }
        }
      ]
    },
    {
      "name": "mintTokens",
      "discriminator": [
        59,
        132,
        24,
        246,
        122,
        39,
        8,
        243
      ],
      "accounts": [
        {
          "name": "mint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  97,
                  105,
                  114,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "tokenName"
              },
              {
                "kind": "arg",
                "path": "tokenSymbol"
              },
              {
                "kind": "account",
                "path": "config_account.admin",
                "account": "tokenConfigData"
              }
            ]
          }
        },
        {
          "name": "destination",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "refundAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  102,
                  117,
                  110,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "tokenVault",
          "writable": true
        },
        {
          "name": "systemConfigAccount"
        },
        {
          "name": "referralAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  102,
                  101,
                  114,
                  114,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "referrerMain"
              }
            ]
          }
        },
        {
          "name": "referrerAta"
        },
        {
          "name": "referrerMain",
          "writable": true
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": [
        {
          "name": "tokenName",
          "type": "string"
        },
        {
          "name": "tokenSymbol",
          "type": "string"
        },
        {
          "name": "referralCode",
          "type": "u64"
        }
      ]
    },
    {
      "name": "proxyDeposit",
      "docs": [
        "deposit instruction"
      ],
      "discriminator": [
        99,
        49,
        91,
        137,
        172,
        25,
        207,
        21
      ],
      "accounts": [
        {
          "name": "ammProgram"
        },
        {
          "name": "amm",
          "writable": true
        },
        {
          "name": "ammAuthority"
        },
        {
          "name": "ammOpenOrders"
        },
        {
          "name": "ammTargetOrders",
          "writable": true
        },
        {
          "name": "ammLpMint",
          "writable": true
        },
        {
          "name": "ammCoinVault",
          "writable": true
        },
        {
          "name": "ammPcVault",
          "writable": true
        },
        {
          "name": "market"
        },
        {
          "name": "marketEventQueue"
        },
        {
          "name": "userTokenCoin",
          "writable": true
        },
        {
          "name": "userTokenPc",
          "writable": true
        },
        {
          "name": "userTokenLp",
          "writable": true
        },
        {
          "name": "userOwner",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "maxCoinAmount",
          "type": "u64"
        },
        {
          "name": "maxPcAmount",
          "type": "u64"
        },
        {
          "name": "baseSide",
          "type": "u64"
        }
      ]
    },
    {
      "name": "proxyInitialize",
      "docs": [
        "Initiazlize a swap pool"
      ],
      "discriminator": [
        185,
        41,
        170,
        16,
        237,
        245,
        76,
        134
      ],
      "accounts": [
        {
          "name": "ammProgram"
        },
        {
          "name": "amm",
          "writable": true
        },
        {
          "name": "ammAuthority"
        },
        {
          "name": "ammOpenOrders",
          "writable": true
        },
        {
          "name": "ammLpMint",
          "writable": true
        },
        {
          "name": "ammCoinMint"
        },
        {
          "name": "ammPcMint"
        },
        {
          "name": "ammCoinVault",
          "writable": true
        },
        {
          "name": "ammPcVault",
          "writable": true
        },
        {
          "name": "ammTargetOrders",
          "writable": true
        },
        {
          "name": "ammConfig"
        },
        {
          "name": "createFeeDestination",
          "writable": true
        },
        {
          "name": "marketProgram",
          "address": "srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX"
        },
        {
          "name": "market"
        },
        {
          "name": "userWallet",
          "writable": true,
          "signer": true
        },
        {
          "name": "userTokenCoin",
          "writable": true
        },
        {
          "name": "userTokenPc",
          "writable": true
        },
        {
          "name": "userTokenLp",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "sysvarRent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "nonce",
          "type": "u8"
        },
        {
          "name": "openTime",
          "type": "u64"
        },
        {
          "name": "initPcAmount",
          "type": "u64"
        },
        {
          "name": "initCoinAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "proxySwapBaseIn",
      "docs": [
        "swap_base_in instruction"
      ],
      "discriminator": [
        250,
        174,
        212,
        217,
        47,
        84,
        212,
        231
      ],
      "accounts": [
        {
          "name": "ammProgram"
        },
        {
          "name": "amm",
          "writable": true
        },
        {
          "name": "ammAuthority"
        },
        {
          "name": "ammOpenOrders",
          "writable": true
        },
        {
          "name": "ammCoinVault",
          "writable": true
        },
        {
          "name": "ammPcVault",
          "writable": true
        },
        {
          "name": "marketProgram"
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "marketBids",
          "writable": true
        },
        {
          "name": "marketAsks",
          "writable": true
        },
        {
          "name": "marketEventQueue",
          "writable": true
        },
        {
          "name": "marketCoinVault",
          "writable": true
        },
        {
          "name": "marketPcVault",
          "writable": true
        },
        {
          "name": "marketVaultSigner",
          "writable": true
        },
        {
          "name": "userTokenSource",
          "writable": true
        },
        {
          "name": "userTokenDestination",
          "writable": true
        },
        {
          "name": "userSourceOwner",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amountIn",
          "type": "u64"
        },
        {
          "name": "minimumAmountOut",
          "type": "u64"
        }
      ]
    },
    {
      "name": "proxySwapBaseOut",
      "docs": [
        "swap_base_out instruction"
      ],
      "discriminator": [
        194,
        15,
        252,
        249,
        72,
        54,
        250,
        85
      ],
      "accounts": [
        {
          "name": "ammProgram"
        },
        {
          "name": "amm",
          "writable": true
        },
        {
          "name": "ammAuthority"
        },
        {
          "name": "ammOpenOrders",
          "writable": true
        },
        {
          "name": "ammCoinVault",
          "writable": true
        },
        {
          "name": "ammPcVault",
          "writable": true
        },
        {
          "name": "marketProgram"
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "marketBids",
          "writable": true
        },
        {
          "name": "marketAsks",
          "writable": true
        },
        {
          "name": "marketEventQueue",
          "writable": true
        },
        {
          "name": "marketCoinVault",
          "writable": true
        },
        {
          "name": "marketPcVault",
          "writable": true
        },
        {
          "name": "marketVaultSigner",
          "writable": true
        },
        {
          "name": "userTokenSource",
          "writable": true
        },
        {
          "name": "userTokenDestination",
          "writable": true
        },
        {
          "name": "userSourceOwner",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "maxAmountIn",
          "type": "u64"
        },
        {
          "name": "amountOut",
          "type": "u64"
        }
      ]
    },
    {
      "name": "proxyWithdraw",
      "docs": [
        "withdraw instruction"
      ],
      "discriminator": [
        118,
        12,
        163,
        77,
        70,
        15,
        67,
        252
      ],
      "accounts": [
        {
          "name": "ammProgram"
        },
        {
          "name": "amm",
          "writable": true
        },
        {
          "name": "ammAuthority"
        },
        {
          "name": "ammOpenOrders",
          "writable": true
        },
        {
          "name": "ammTargetOrders",
          "writable": true
        },
        {
          "name": "ammLpMint",
          "writable": true
        },
        {
          "name": "ammCoinVault",
          "writable": true
        },
        {
          "name": "ammPcVault",
          "writable": true
        },
        {
          "name": "marketProgram"
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "marketCoinVault",
          "writable": true
        },
        {
          "name": "marketPcVault",
          "writable": true
        },
        {
          "name": "marketVaultSigner"
        },
        {
          "name": "userTokenLp",
          "writable": true
        },
        {
          "name": "userTokenCoin",
          "writable": true
        },
        {
          "name": "userTokenPc",
          "writable": true
        },
        {
          "name": "userOwner",
          "writable": true,
          "signer": true
        },
        {
          "name": "marketEventQ",
          "writable": true
        },
        {
          "name": "marketBids",
          "writable": true
        },
        {
          "name": "marketAsks",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "refund",
      "discriminator": [
        2,
        96,
        183,
        251,
        63,
        208,
        46,
        46
      ],
      "accounts": [
        {
          "name": "mint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  97,
                  105,
                  114,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "tokenName"
              },
              {
                "kind": "arg",
                "path": "tokenSymbol"
              },
              {
                "kind": "account",
                "path": "config_account.admin",
                "account": "tokenConfigData"
              }
            ]
          }
        },
        {
          "name": "refundAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  102,
                  117,
                  110,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "payer"
              }
            ]
          }
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "tokenAta",
          "writable": true
        },
        {
          "name": "tokenVault",
          "writable": true
        },
        {
          "name": "protocolFeeAccount",
          "docs": [
            "CHECK the protocol fee account"
          ],
          "writable": true
        },
        {
          "name": "systemConfigAccount"
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "tokenName",
          "type": "string"
        },
        {
          "name": "tokenSymbol",
          "type": "string"
        }
      ]
    },
    {
      "name": "resetConfigData",
      "discriminator": [
        198,
        180,
        69,
        197,
        9,
        214,
        70,
        30
      ],
      "accounts": [
        {
          "name": "mint"
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "admin",
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "initConfigData",
          "type": {
            "defined": {
              "name": "initializeTokenConfigData"
            }
          }
        }
      ]
    },
    {
      "name": "setReferrerCode",
      "discriminator": [
        129,
        47,
        113,
        211,
        151,
        134,
        156,
        250
      ],
      "accounts": [
        {
          "name": "mint",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  97,
                  105,
                  114,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "tokenName"
              },
              {
                "kind": "arg",
                "path": "tokenSymbol"
              },
              {
                "kind": "account",
                "path": "config_account.admin",
                "account": "tokenConfigData"
              }
            ]
          }
        },
        {
          "name": "referralAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  102,
                  101,
                  114,
                  114,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "payer"
              }
            ]
          }
        },
        {
          "name": "configAccount"
        },
        {
          "name": "systemConfigAccount"
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "referrerAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "payer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": [
        {
          "name": "tokenName",
          "type": "string"
        },
        {
          "name": "tokenSymbol",
          "type": "string"
        },
        {
          "name": "renewCode",
          "type": "bool"
        }
      ]
    },
    {
      "name": "thawTokens",
      "discriminator": [
        213,
        203,
        119,
        211,
        114,
        41,
        205,
        220
      ],
      "accounts": [
        {
          "name": "mint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  97,
                  105,
                  114,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "tokenName"
              },
              {
                "kind": "arg",
                "path": "tokenSymbol"
              },
              {
                "kind": "account",
                "path": "config_account.admin",
                "account": "tokenConfigData"
              }
            ]
          }
        },
        {
          "name": "destination",
          "writable": true
        },
        {
          "name": "configAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "tokenName",
          "type": "string"
        },
        {
          "name": "tokenSymbol",
          "type": "string"
        }
      ]
    },
    {
      "name": "transferTokens",
      "discriminator": [
        54,
        180,
        238,
        175,
        74,
        85,
        126,
        188
      ],
      "accounts": [
        {
          "name": "mint",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  97,
                  105,
                  114,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "tokenName"
              },
              {
                "kind": "arg",
                "path": "tokenSymbol"
              },
              {
                "kind": "account",
                "path": "config_account.admin",
                "account": "tokenConfigData"
              }
            ]
          }
        },
        {
          "name": "source",
          "writable": true
        },
        {
          "name": "destination",
          "writable": true
        },
        {
          "name": "sender",
          "writable": true,
          "signer": true
        },
        {
          "name": "configAccount"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "tokenName",
          "type": "string"
        },
        {
          "name": "tokenSymbol",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "transferTokensFromVault",
      "discriminator": [
        81,
        253,
        152,
        193,
        254,
        180,
        186,
        237
      ],
      "accounts": [
        {
          "name": "mint",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  97,
                  105,
                  114,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "tokenName"
              },
              {
                "kind": "arg",
                "path": "tokenSymbol"
              },
              {
                "kind": "account",
                "path": "config_account.admin",
                "account": "tokenConfigData"
              }
            ]
          }
        },
        {
          "name": "destination",
          "writable": true
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "tokenVault",
          "writable": true
        },
        {
          "name": "sender",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "tokenName",
          "type": "string"
        },
        {
          "name": "tokenSymbol",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateSystem",
      "discriminator": [
        63,
        147,
        183,
        92,
        22,
        242,
        219,
        4
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true
        },
        {
          "name": "systemConfigData",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  121,
                  115,
                  116,
                  101,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "admin"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "referralUsageMaxCount",
          "type": "u32"
        },
        {
          "name": "protocolFeeRate",
          "type": "u64"
        },
        {
          "name": "protocolFeeAccount",
          "type": "pubkey"
        },
        {
          "name": "refundFeeRate",
          "type": "u64"
        },
        {
          "name": "referrerResetIntervalSeconds",
          "type": "i64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "systemConfigData",
      "discriminator": [
        192,
        35,
        167,
        45,
        153,
        226,
        213,
        45
      ]
    },
    {
      "name": "tokenConfigData",
      "discriminator": [
        38,
        179,
        204,
        76,
        50,
        176,
        214,
        81
      ]
    },
    {
      "name": "tokenReferralData",
      "discriminator": [
        136,
        185,
        38,
        182,
        42,
        126,
        118,
        45
      ]
    },
    {
      "name": "tokenRefundData",
      "discriminator": [
        16,
        160,
        38,
        231,
        81,
        131,
        138,
        105
      ]
    }
  ],
  "events": [
    {
      "name": "initializeLiquidityPoolEvent",
      "discriminator": [
        40,
        247,
        136,
        40,
        244,
        33,
        51,
        51
      ]
    },
    {
      "name": "initializeTokenEvent",
      "discriminator": [
        108,
        41,
        10,
        194,
        65,
        120,
        212,
        118
      ]
    },
    {
      "name": "mintEvent",
      "discriminator": [
        197,
        144,
        146,
        149,
        66,
        164,
        95,
        16
      ]
    },
    {
      "name": "refundEvent",
      "discriminator": [
        176,
        159,
        218,
        59,
        94,
        213,
        129,
        218
      ]
    },
    {
      "name": "setRefererCodeEvent",
      "discriminator": [
        156,
        230,
        12,
        212,
        118,
        228,
        15,
        218
      ]
    },
    {
      "name": "thawTokensEvent",
      "discriminator": [
        188,
        44,
        120,
        199,
        148,
        39,
        154,
        13
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "onlyDefaultAdminAllowed",
      "msg": "Only default admin allowed"
    },
    {
      "code": 6001,
      "name": "onlyAdminAllowed",
      "msg": "Only admin allowed"
    },
    {
      "code": 6002,
      "name": "notStarted",
      "msg": "Minting has not started"
    },
    {
      "code": 6003,
      "name": "exceedMaxSupply",
      "msg": "Exceed max supply"
    },
    {
      "code": 6004,
      "name": "configDataNotSet",
      "msg": "Config data not set"
    },
    {
      "code": 6005,
      "name": "overflow",
      "msg": "overflow"
    },
    {
      "code": 6006,
      "name": "mintEnd",
      "msg": "Mint is ended"
    },
    {
      "code": 6007,
      "name": "onlyOwnerAllowed",
      "msg": "Only owner allowed"
    },
    {
      "code": 6008,
      "name": "onlyOwnerAtaAllowed",
      "msg": "Only owner ATA allowed"
    },
    {
      "code": 6009,
      "name": "onlyMintAllowed",
      "msg": "Only mint allowed"
    },
    {
      "code": 6010,
      "name": "onlyMintAccountAllowed",
      "msg": "Only mint account allowed"
    },
    {
      "code": 6011,
      "name": "wrongFeeVault",
      "msg": "Wrong fee vault"
    },
    {
      "code": 6012,
      "name": "notEnoughSolToPayFee",
      "msg": "Not enough SOL to pay fee"
    },
    {
      "code": 6013,
      "name": "notFrozen",
      "msg": "Account is not frozen"
    },
    {
      "code": 6014,
      "name": "wrongReferrerAta",
      "msg": "Wrong referrer ATA address"
    },
    {
      "code": 6015,
      "name": "referrerCodeNotSet",
      "msg": "Referrer code not set"
    },
    {
      "code": 6016,
      "name": "referrerCodeNotAvailable",
      "msg": "Referrer code not active"
    },
    {
      "code": 6017,
      "name": "wrongReferrerOwner",
      "msg": "Wrong referrer owner"
    },
    {
      "code": 6018,
      "name": "referrerCodeResetFrozen",
      "msg": "Referrer code reset frozen"
    },
    {
      "code": 6019,
      "name": "referrerCodeExceedMaxUsage",
      "msg": "Referrer code exceed max usage"
    },
    {
      "code": 6020,
      "name": "wrongReferralCode",
      "msg": "Wrong referral code"
    },
    {
      "code": 6021,
      "name": "wrongReferrerAtaOwner",
      "msg": "Wrong referrer ATA owner"
    },
    {
      "code": 6022,
      "name": "canNotUseYourselfCode",
      "msg": "Can not use yourself code"
    },
    {
      "code": 6023,
      "name": "wrongReferrerMainAddress",
      "msg": "Wrong referrer main address"
    },
    {
      "code": 6024,
      "name": "referrerAtaNotReady",
      "msg": "Referrer ATA is not ready"
    },
    {
      "code": 6025,
      "name": "referrerAtaBalanceNotEnough",
      "msg": "Referrer ATA's balance is not enough"
    },
    {
      "code": 6026,
      "name": "deployerReferrerAtaIsReady",
      "msg": "Deployer Referrer ATA is ready"
    },
    {
      "code": 6027,
      "name": "wrongTokenProgram",
      "msg": "Wrong token program"
    },
    {
      "code": 6028,
      "name": "targetErasNotReached",
      "msg": "Target eras not reached"
    },
    {
      "code": 6029,
      "name": "wrongProtocolFeeAccount",
      "msg": "Wrong protocol fee account"
    },
    {
      "code": 6030,
      "name": "onlyUserAccountAllowed",
      "msg": "Only user account allowed"
    },
    {
      "code": 6031,
      "name": "notEnoughTokensToRefund",
      "msg": "Not enough tokens to refund"
    },
    {
      "code": 6032,
      "name": "invalidLiquidityTokensRatio",
      "msg": "Invalid liquidity tokens ratio, should be > 0 and <= 50"
    },
    {
      "code": 6033,
      "name": "invalidReduceRatio",
      "msg": "Invalid reduce ratio, should be >= 50 and < 100"
    },
    {
      "code": 6034,
      "name": "invalidEpochesPerEra",
      "msg": "Invalid epoches per era, should be > 0"
    },
    {
      "code": 6035,
      "name": "invalidTargetSecondsPerEpoch",
      "msg": "Invalid target seconds per epoch, should be > 0"
    },
    {
      "code": 6036,
      "name": "invalidTargetEras",
      "msg": "Invalid target eras, should be > 0"
    },
    {
      "code": 6037,
      "name": "invalidInitialMintSize",
      "msg": "Invalid initial mint size, should be > 0"
    },
    {
      "code": 6038,
      "name": "invalidInitialTargetMintSizePerEpoch",
      "msg": "Invalid initial target mint size per epoch, should be > 0"
    },
    {
      "code": 6039,
      "name": "initialMintSizeOfEpochTooSmall",
      "msg": "Initial mint size of epoch too small, should be 10 * mint size per minting"
    },
    {
      "code": 6040,
      "name": "userBalanceNotEnoughForRefund",
      "msg": "User token balance not enough for refund"
    },
    {
      "code": 6041,
      "name": "vaultBalanceNotEnoughForRefund",
      "msg": "Vault token balance not enough for refund"
    },
    {
      "code": 6042,
      "name": "onlySystemAdminAllowed",
      "msg": "Only system admin allowed"
    },
    {
      "code": 6043,
      "name": "invalidTokenVault",
      "msg": "Invalid token vault"
    },
    {
      "code": 6044,
      "name": "invalidTokenVaultOwner",
      "msg": "Invalid token vault owner"
    }
  ],
  "types": [
    {
      "name": "initializeLiquidityPoolEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "configAccount",
            "type": "pubkey"
          },
          {
            "name": "tokenVault",
            "type": "pubkey"
          },
          {
            "name": "protocolFeeAccount",
            "type": "pubkey"
          },
          {
            "name": "payer",
            "type": "pubkey"
          },
          {
            "name": "tokenProgram",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "initializeTokenConfigData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "targetEras",
            "type": "u32"
          },
          {
            "name": "epochesPerEra",
            "type": "u64"
          },
          {
            "name": "targetSecondsPerEpoch",
            "type": "u64"
          },
          {
            "name": "reduceRatio",
            "type": "f64"
          },
          {
            "name": "initialMintSize",
            "type": "f64"
          },
          {
            "name": "initialTargetMintSizePerEpoch",
            "type": "f64"
          },
          {
            "name": "feeRate",
            "type": "u64"
          },
          {
            "name": "liquidityTokensRatio",
            "type": "f64"
          }
        ]
      }
    },
    {
      "name": "initializeTokenEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "metadata",
            "type": {
              "defined": {
                "name": "tokenMetadata"
              }
            }
          },
          {
            "name": "initConfigData",
            "type": {
              "defined": {
                "name": "initializeTokenConfigData"
              }
            }
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "tokenId",
            "type": "u64"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "configAccount",
            "type": "pubkey"
          },
          {
            "name": "metadataAccount",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "tokenVault",
            "type": "pubkey"
          },
          {
            "name": "mintStateData",
            "type": {
              "defined": {
                "name": "tokenMintState"
              }
            }
          }
        ]
      }
    },
    {
      "name": "mintEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "sender",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "configAccount",
            "type": "pubkey"
          },
          {
            "name": "tokenVault",
            "type": "pubkey"
          },
          {
            "name": "referralAccount",
            "type": "pubkey"
          },
          {
            "name": "referrerMain",
            "type": "pubkey"
          },
          {
            "name": "referrerAta",
            "type": "pubkey"
          },
          {
            "name": "refundAccount",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "mintStateData",
            "type": {
              "defined": {
                "name": "tokenMintState"
              }
            }
          }
        ]
      }
    },
    {
      "name": "refundEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "sender",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "refundAccount",
            "type": "pubkey"
          },
          {
            "name": "configAccount",
            "type": "pubkey"
          },
          {
            "name": "tokenVault",
            "type": "pubkey"
          },
          {
            "name": "tokenAta",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "supply",
            "type": "f64"
          },
          {
            "name": "totalTokens",
            "type": "u64"
          },
          {
            "name": "totalMintFee",
            "type": "u64"
          },
          {
            "name": "refundFee",
            "type": "u64"
          },
          {
            "name": "refundAmountIncludingFee",
            "type": "u64"
          },
          {
            "name": "burnAmountFromVault",
            "type": "u64"
          },
          {
            "name": "burnAmountFromUser",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "setRefererCodeEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "referralAccount",
            "type": "pubkey"
          },
          {
            "name": "referrerAta",
            "type": "pubkey"
          },
          {
            "name": "payer",
            "type": "pubkey"
          },
          {
            "name": "tokenProgram",
            "type": "pubkey"
          },
          {
            "name": "oldCode",
            "type": "u64"
          },
          {
            "name": "newCode",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "systemConfigData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "count",
            "type": "u64"
          },
          {
            "name": "referralUsageMaxCount",
            "type": "u32"
          },
          {
            "name": "protocolFeeRate",
            "type": "f64"
          },
          {
            "name": "protocolFeeAccount",
            "type": "pubkey"
          },
          {
            "name": "refundFeeRate",
            "type": "f64"
          },
          {
            "name": "referrerResetIntervalSeconds",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "thawTokensEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "destination",
            "type": "pubkey"
          },
          {
            "name": "configAccount",
            "type": "pubkey"
          },
          {
            "name": "tokenProgram",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "tokenConfigData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "tokenId",
            "type": "u64"
          },
          {
            "name": "feeRate",
            "type": "u64"
          },
          {
            "name": "maxSupply",
            "type": "f64"
          },
          {
            "name": "targetEras",
            "type": "u32"
          },
          {
            "name": "epochesPerEra",
            "type": "u64"
          },
          {
            "name": "targetSecondsPerEpoch",
            "type": "u64"
          },
          {
            "name": "reduceRatio",
            "type": "f64"
          },
          {
            "name": "initialMintSize",
            "type": "f64"
          },
          {
            "name": "initialTargetMintSizePerEpoch",
            "type": "f64"
          },
          {
            "name": "liquidityTokensRatio",
            "type": "f64"
          },
          {
            "name": "tokenVault",
            "type": "pubkey"
          },
          {
            "name": "mintStateData",
            "type": {
              "defined": {
                "name": "tokenMintState"
              }
            }
          }
        ]
      }
    },
    {
      "name": "tokenMetadata",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "tokenMintState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "supply",
            "type": "f64"
          },
          {
            "name": "currentEra",
            "type": "u32"
          },
          {
            "name": "currentEpoch",
            "type": "u64"
          },
          {
            "name": "elapsedSecondsEpoch",
            "type": "i64"
          },
          {
            "name": "startTimestampEpoch",
            "type": "i64"
          },
          {
            "name": "lastDifficultyCoefficientEpoch",
            "type": "f64"
          },
          {
            "name": "difficultyCoefficientEpoch",
            "type": "f64"
          },
          {
            "name": "mintSizeEpoch",
            "type": "f64"
          },
          {
            "name": "quantityMintedEpoch",
            "type": "f64"
          },
          {
            "name": "targetMintSizeEpoch",
            "type": "f64"
          },
          {
            "name": "totalMintFee",
            "type": "u64"
          },
          {
            "name": "totalReferrerFee",
            "type": "u64"
          },
          {
            "name": "totalTokens",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "tokenReferralData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "referrerMain",
            "type": "pubkey"
          },
          {
            "name": "referrerAta",
            "type": "pubkey"
          },
          {
            "name": "code",
            "type": "u64"
          },
          {
            "name": "usageCount",
            "type": "u32"
          },
          {
            "name": "activeTimestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "tokenRefundData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "totalTokens",
            "type": "u64"
          },
          {
            "name": "totalMintFee",
            "type": "u64"
          },
          {
            "name": "totalReferrerFee",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
