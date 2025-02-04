/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/fair_mint_token.json`.
 */
export type FairMintToken = {
  "address": "8GM2N7qQjzMyhqewu8jpDgzUh2BJbtBxSY1WzSFeFm6U",
  "metadata": {
    "name": "fairMintToken",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "claimTokens",
      "docs": [
        "Claim tokens"
      ],
      "discriminator": [
        108,
        216,
        210,
        231,
        0,
        212,
        42,
        64
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
          "name": "recipentAta",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
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
      "name": "closeToken",
      "docs": [
        "Close token"
      ],
      "discriminator": [
        26,
        74,
        236,
        151,
        104,
        64,
        183,
        249
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
              }
            ]
          }
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenVault",
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
          "name": "tokenProgram",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
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
      "name": "delegateValueManager",
      "docs": [
        "Delegate value manager"
      ],
      "discriminator": [
        65,
        71,
        81,
        199,
        83,
        64,
        181,
        167
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
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
        },
        {
          "name": "newValueManager",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "initializeSystem",
      "docs": [
        "Initialize system"
      ],
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
          "name": "systemConfigAccount",
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
      "docs": [
        "Initialize token"
      ],
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
          "name": "payer",
          "writable": true,
          "signer": true
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
          "name": "wsolMint"
        },
        {
          "name": "wsolVault",
          "writable": true
        },
        {
          "name": "systemConfigAccount",
          "writable": true
        },
        {
          "name": "protocolFeeAccount",
          "writable": true
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
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "legacyTokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
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
      "docs": [
        "Mint tokens"
      ],
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
                "kind": "account",
                "path": "tokenProgram"
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
          "name": "wsolVault",
          "writable": true
        },
        {
          "name": "systemConfigAccount"
        },
        {
          "name": "referrerAta"
        },
        {
          "name": "referrerMain",
          "writable": true
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
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "legacyTokenProgram",
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
          "name": "codeHash",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "proxyBurnLpTokens",
      "docs": [
        "Burn lp tokens"
      ],
      "discriminator": [
        215,
        41,
        48,
        70,
        81,
        221,
        246,
        105
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "mint",
          "docs": [
            "token mint"
          ],
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
          "name": "ownerLpToken",
          "docs": [
            "Owner lp tokan account - config account"
          ],
          "writable": true
        },
        {
          "name": "lpMint",
          "writable": true
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
          "name": "cpSwapProgram",
          "address": "CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C"
        },
        {
          "name": "owner",
          "docs": [
            "Pays to mint the position"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "mint",
          "docs": [
            "Token mint"
          ],
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
              }
            ]
          }
        },
        {
          "name": "configAccount",
          "docs": [
            "Config account"
          ],
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
          "name": "authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  110,
                  100,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "poolState",
          "docs": [
            "pool state"
          ],
          "writable": true
        },
        {
          "name": "ownerLpToken",
          "docs": [
            "Owner lp tokan account"
          ],
          "writable": true
        },
        {
          "name": "token0Account",
          "docs": [
            "The payer's token account for token_0"
          ],
          "writable": true
        },
        {
          "name": "token1Account",
          "docs": [
            "The payer's token account for token_1"
          ],
          "writable": true
        },
        {
          "name": "token0Vault",
          "docs": [
            "The address that holds pool tokens for token_0"
          ],
          "writable": true
        },
        {
          "name": "token1Vault",
          "docs": [
            "The address that holds pool tokens for token_1"
          ],
          "writable": true
        },
        {
          "name": "tokenProgram",
          "docs": [
            "token Program"
          ],
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "tokenProgram2022",
          "docs": [
            "Token program 2022"
          ],
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "vault0Mint",
          "docs": [
            "The mint of token_0 vault"
          ]
        },
        {
          "name": "vault1Mint",
          "docs": [
            "The mint of token_1 vault"
          ]
        },
        {
          "name": "lpMint",
          "writable": true
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
          "name": "lpTokenAmount",
          "type": "u64"
        },
        {
          "name": "maximumToken0Amount",
          "type": "u64"
        },
        {
          "name": "maximumToken1Amount",
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
          "name": "cpSwapProgram",
          "address": "CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C"
        },
        {
          "name": "creator",
          "docs": [
            "Address paying to create the pool. Can be only the value manager(defaule value manager is the creator of the mint)"
          ],
          "writable": true,
          "signer": true
        },
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
              }
            ]
          }
        },
        {
          "name": "configAccount",
          "docs": [
            "POM config account"
          ],
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
          "name": "ammConfig",
          "docs": [
            "Which config the pool belongs to."
          ]
        },
        {
          "name": "authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  110,
                  100,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "poolState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "ammConfig"
              },
              {
                "kind": "account",
                "path": "token0Mint"
              },
              {
                "kind": "account",
                "path": "token1Mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "token0Mint",
          "docs": [
            "Token_0 mint, the key must smaller then token_1 mint."
          ]
        },
        {
          "name": "token1Mint",
          "docs": [
            "Token_1 mint, the key must grater then token_0 mint."
          ]
        },
        {
          "name": "lpMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "creatorToken0",
          "docs": [
            "payer token0 account"
          ],
          "writable": true
        },
        {
          "name": "creatorToken1",
          "docs": [
            "creator token1 account"
          ],
          "writable": true
        },
        {
          "name": "creatorLpToken",
          "writable": true
        },
        {
          "name": "token0Vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              },
              {
                "kind": "account",
                "path": "token0Mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "token1Vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              },
              {
                "kind": "account",
                "path": "token1Mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "createPoolFee",
          "docs": [
            "create pool fee account"
          ],
          "writable": true,
          "address": "DNXgeM9EiiaAbaWvwjHj9fQQLAX5ZsfHyvmYUNRAdNC8"
        },
        {
          "name": "observationState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  98,
                  115,
                  101,
                  114,
                  118,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "tokenProgram",
          "docs": [
            "Program to create mint account and mint tokens"
          ],
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "token0Program",
          "docs": [
            "Spl token program or token program 2022"
          ]
        },
        {
          "name": "token1Program",
          "docs": [
            "Spl token program or token program 2022"
          ]
        },
        {
          "name": "associatedTokenProgram",
          "docs": [
            "Program to create an ATA for receiving position NFT"
          ],
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "docs": [
            "To create a new program account"
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "docs": [
            "Sysvar for program account"
          ],
          "address": "SysvarRent111111111111111111111111111111111"
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
          "name": "initAmount0",
          "type": "u64"
        },
        {
          "name": "initAmount1",
          "type": "u64"
        },
        {
          "name": "openTime",
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
          "name": "cpSwapProgram",
          "address": "CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C"
        },
        {
          "name": "payer",
          "docs": [
            "The user performing the swap"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "mint",
          "docs": [
            "Token mint"
          ],
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
              }
            ]
          }
        },
        {
          "name": "configAccount",
          "docs": [
            "Config account"
          ],
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
          "name": "authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  110,
                  100,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "ammConfig",
          "docs": [
            "The factory state to read protocol fees"
          ]
        },
        {
          "name": "poolState",
          "docs": [
            "pool state"
          ],
          "writable": true
        },
        {
          "name": "inputTokenAccount",
          "docs": [
            "The user token account for input token"
          ],
          "writable": true
        },
        {
          "name": "outputTokenAccount",
          "docs": [
            "The user token account for output token"
          ],
          "writable": true
        },
        {
          "name": "inputVault",
          "docs": [
            "The vault token account for input token"
          ],
          "writable": true
        },
        {
          "name": "outputVault",
          "docs": [
            "The vault token account for output token"
          ],
          "writable": true
        },
        {
          "name": "inputTokenProgram",
          "docs": [
            "SPL program for input token transfers"
          ]
        },
        {
          "name": "outputTokenProgram",
          "docs": [
            "SPL program for output token transfers"
          ]
        },
        {
          "name": "inputTokenMint",
          "docs": [
            "The mint of input token"
          ]
        },
        {
          "name": "outputTokenMint",
          "docs": [
            "The mint of output token"
          ]
        },
        {
          "name": "observationState",
          "docs": [
            "The program account for the most recent oracle observation"
          ],
          "writable": true
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
          "name": "cpSwapProgram",
          "address": "CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C"
        },
        {
          "name": "payer",
          "docs": [
            "The user performing the swap"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "mint",
          "docs": [
            "Token mint"
          ],
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
              }
            ]
          }
        },
        {
          "name": "configAccount",
          "docs": [
            "Config account"
          ],
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
          "name": "authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  110,
                  100,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "ammConfig",
          "docs": [
            "The factory state to read protocol fees"
          ]
        },
        {
          "name": "poolState",
          "docs": [
            "pool state"
          ],
          "writable": true
        },
        {
          "name": "inputTokenAccount",
          "docs": [
            "The user token account for input token"
          ],
          "writable": true
        },
        {
          "name": "outputTokenAccount",
          "docs": [
            "The user token account for output token"
          ],
          "writable": true
        },
        {
          "name": "inputVault",
          "docs": [
            "The vault token account for input token"
          ],
          "writable": true
        },
        {
          "name": "outputVault",
          "docs": [
            "The vault token account for output token"
          ],
          "writable": true
        },
        {
          "name": "inputTokenProgram",
          "docs": [
            "SPL program for input token transfers"
          ]
        },
        {
          "name": "outputTokenProgram",
          "docs": [
            "SPL program for output token transfers"
          ]
        },
        {
          "name": "inputTokenMint",
          "docs": [
            "The mint of input token"
          ]
        },
        {
          "name": "outputTokenMint",
          "docs": [
            "The mint of output token"
          ]
        },
        {
          "name": "observationState",
          "docs": [
            "The program account for the most recent oracle observation"
          ],
          "writable": true
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
          "name": "cpSwapProgram",
          "address": "CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C"
        },
        {
          "name": "owner",
          "docs": [
            "Pays to mint the position"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "mint",
          "docs": [
            "Token mint"
          ],
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
              }
            ]
          }
        },
        {
          "name": "configAccount",
          "docs": [
            "Config account"
          ],
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
          "name": "authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  110,
                  100,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "poolState",
          "docs": [
            "pool state"
          ],
          "writable": true
        },
        {
          "name": "ownerLpToken",
          "docs": [
            "Owner lp token account"
          ],
          "writable": true
        },
        {
          "name": "token0Account",
          "docs": [
            "The owner's token account for receive token_0"
          ],
          "writable": true
        },
        {
          "name": "token1Account",
          "docs": [
            "The owner's token account for receive token_1"
          ],
          "writable": true
        },
        {
          "name": "token0Vault",
          "docs": [
            "The address that holds pool tokens for token_0"
          ],
          "writable": true
        },
        {
          "name": "token1Vault",
          "docs": [
            "The address that holds pool tokens for token_1"
          ],
          "writable": true
        },
        {
          "name": "tokenProgram",
          "docs": [
            "token Program"
          ],
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "tokenProgram2022",
          "docs": [
            "Token program 2022"
          ],
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "vault0Mint",
          "docs": [
            "The mint of token_0 vault"
          ]
        },
        {
          "name": "vault1Mint",
          "docs": [
            "The mint of token_1 vault"
          ]
        },
        {
          "name": "lpMint",
          "writable": true
        },
        {
          "name": "memoProgram",
          "docs": [
            "memo program"
          ],
          "address": "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
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
          "name": "lpTokenAmount",
          "type": "u64"
        },
        {
          "name": "minimumToken0Amount",
          "type": "u64"
        },
        {
          "name": "minimumToken1Amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "refund",
      "docs": [
        "Refund"
      ],
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
          "name": "wsolVault",
          "writable": true
        },
        {
          "name": "payerWsolVault",
          "writable": true
        },
        {
          "name": "protocolFeeAccount"
        },
        {
          "name": "protocolWsolVault",
          "writable": true
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
          "name": "tokenProgram",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "legacyTokenProgram",
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
      "name": "revokeUpdateMetadataAuthority",
      "docs": [
        "Revoke update token2022 metadata authority"
      ],
      "discriminator": [
        16,
        230,
        0,
        225,
        47,
        138,
        113,
        90
      ],
      "accounts": [
        {
          "name": "metadata",
          "writable": true
        },
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
              }
            ]
          }
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
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemConfigAccount",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
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
      "name": "setReferrerCode",
      "docs": [
        "Set referrer code"
      ],
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
          "name": "payer",
          "writable": true,
          "signer": true
        },
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
              }
            ]
          }
        },
        {
          "name": "referrerAta",
          "writable": true
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
          "name": "codeAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  100,
                  101,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "codeHash"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
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
          "name": "codeHash",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "updateSystem",
      "docs": [
        "Update system"
      ],
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
          "writable": true,
          "signer": true
        },
        {
          "name": "systemConfigAccount",
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
          "type": "u64"
        },
        {
          "name": "updateMetadataFee",
          "type": "u64"
        },
        {
          "name": "customizedDeployFee",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateTokenMetadata",
      "docs": [
        "Update token metadata"
      ],
      "discriminator": [
        243,
        6,
        8,
        23,
        126,
        181,
        251,
        158
      ],
      "accounts": [
        {
          "name": "metadata",
          "writable": true
        },
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
                "path": "metadata_params.name"
              },
              {
                "kind": "arg",
                "path": "metadata_params.symbol"
              }
            ]
          }
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
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemConfigAccount",
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
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
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
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "ammConfig",
      "discriminator": [
        218,
        244,
        33,
        104,
        203,
        203,
        43,
        111
      ]
    },
    {
      "name": "codeAccountData",
      "discriminator": [
        223,
        104,
        233,
        118,
        230,
        133,
        135,
        33
      ]
    },
    {
      "name": "observationState",
      "discriminator": [
        122,
        174,
        197,
        53,
        129,
        9,
        165,
        132
      ]
    },
    {
      "name": "poolState",
      "discriminator": [
        247,
        237,
        227,
        245,
        215,
        195,
        222,
        70
      ]
    },
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
      "name": "closeTokenEvent",
      "discriminator": [
        203,
        9,
        156,
        247,
        207,
        50,
        200,
        219
      ]
    },
    {
      "name": "freezeTokenEvent",
      "discriminator": [
        82,
        18,
        159,
        89,
        129,
        1,
        145,
        83
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
      "name": "thawTokenEvent",
      "discriminator": [
        50,
        242,
        230,
        113,
        49,
        117,
        236,
        112
      ]
    },
    {
      "name": "updateTokenMetadataEvent",
      "discriminator": [
        203,
        161,
        251,
        30,
        78,
        127,
        196,
        227
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
      "name": "accountIsNotFrozen",
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
      "name": "refundTokensIsZero",
      "msg": "Refund tokens is zero"
    },
    {
      "code": 6033,
      "name": "invalidLiquidityTokensRatio",
      "msg": "Invalid liquidity tokens ratio, should be > 0 and <= 50"
    },
    {
      "code": 6034,
      "name": "invalidReduceRatio",
      "msg": "Invalid reduce ratio, should be >= 50 and < 100"
    },
    {
      "code": 6035,
      "name": "invalidEpochesPerEra",
      "msg": "Invalid epoches per era, should be > 0"
    },
    {
      "code": 6036,
      "name": "invalidTargetSecondsPerEpoch",
      "msg": "Invalid target seconds per epoch, should be > 0"
    },
    {
      "code": 6037,
      "name": "invalidTargetEras",
      "msg": "Invalid target eras, should be > 0"
    },
    {
      "code": 6038,
      "name": "invalidInitialMintSize",
      "msg": "Invalid initial mint size, should be > 0"
    },
    {
      "code": 6039,
      "name": "invalidInitialTargetMintSizePerEpoch",
      "msg": "Invalid initial target mint size per epoch, should be > 0"
    },
    {
      "code": 6040,
      "name": "initialMintSizeOfEpochTooSmall",
      "msg": "Initial mint size of epoch too small, should be 10 * mint size per minting"
    },
    {
      "code": 6041,
      "name": "userBalanceNotEnoughForRefund",
      "msg": "User token balance not enough for refund"
    },
    {
      "code": 6042,
      "name": "vaultBalanceNotEnoughForRefund",
      "msg": "Vault token balance not enough for refund"
    },
    {
      "code": 6043,
      "name": "onlySystemAdminAllowed",
      "msg": "Only system admin allowed"
    },
    {
      "code": 6044,
      "name": "systemAlreadyInitialized",
      "msg": "System already initialized"
    },
    {
      "code": 6045,
      "name": "wrongSystemConfigAccount",
      "msg": "Wrong system config account"
    },
    {
      "code": 6046,
      "name": "invalidFeeAccount",
      "msg": "Invalid fee account"
    },
    {
      "code": 6047,
      "name": "invalidTokenVault",
      "msg": "Invalid token vault"
    },
    {
      "code": 6048,
      "name": "invalidWsolVault",
      "msg": "Invalid wsol vault"
    },
    {
      "code": 6049,
      "name": "invalidWsolMint",
      "msg": "Invalid wsol mint"
    },
    {
      "code": 6050,
      "name": "invalidTokenVaultOwner",
      "msg": "Invalid token vault owner"
    },
    {
      "code": 6051,
      "name": "mintNotStarted",
      "msg": "Mint has not started"
    },
    {
      "code": 6052,
      "name": "wrongReferrerCode",
      "msg": "Wrong referrer account"
    },
    {
      "code": 6053,
      "name": "wrongCodeHash",
      "msg": "Wrong code hash"
    },
    {
      "code": 6054,
      "name": "wrongMintAddress",
      "msg": "Wrong mint address"
    },
    {
      "code": 6055,
      "name": "mintHasStarted",
      "msg": "Mint has started"
    },
    {
      "code": 6056,
      "name": "invalidTokenMint",
      "msg": "Invalid token mint"
    },
    {
      "code": 6057,
      "name": "invalidTokenOwner",
      "msg": "Invalid token owner"
    },
    {
      "code": 6058,
      "name": "tokenHasDelegate",
      "msg": "Token has delegate"
    },
    {
      "code": 6059,
      "name": "numericOverflow",
      "msg": "Numeric overflow"
    },
    {
      "code": 6060,
      "name": "insufficientFunds",
      "msg": "Insufficient funds"
    },
    {
      "code": 6061,
      "name": "amountConversionError",
      "msg": "Amount conversion error"
    },
    {
      "code": 6062,
      "name": "burnOperationFailed",
      "msg": "Burn operation failed"
    },
    {
      "code": 6063,
      "name": "refundInProgress",
      "msg": "Refund in progress"
    },
    {
      "code": 6064,
      "name": "aountConversionError",
      "msg": "Amount conversion error"
    },
    {
      "code": 6065,
      "name": "divideByZero",
      "msg": "Division by zero"
    },
    {
      "code": 6066,
      "name": "invalidRatio",
      "msg": "Invalid ratio value"
    },
    {
      "code": 6067,
      "name": "precisionError",
      "msg": "Calculation precision error"
    },
    {
      "code": 6068,
      "name": "amountExceedsMaximum",
      "msg": "Amount exceeds maximum allowed"
    },
    {
      "code": 6069,
      "name": "transferFailed",
      "msg": "Transfer failed"
    },
    {
      "code": 6070,
      "name": "exceedMaxU64",
      "msg": "Exceed max u64"
    },
    {
      "code": 6071,
      "name": "referrerMainAccountEmpty",
      "msg": "Referrer main account empty"
    },
    {
      "code": 6072,
      "name": "payerMustSign",
      "msg": "Payer must sign"
    },
    {
      "code": 6073,
      "name": "invalidPayerAccount",
      "msg": "Invalid payer account"
    },
    {
      "code": 6074,
      "name": "invalidCodeHash",
      "msg": "Invalid code hash"
    },
    {
      "code": 6075,
      "name": "invalidResetInterval",
      "msg": "Invalid reset interval"
    },
    {
      "code": 6076,
      "name": "tokenAlreadyInitialized",
      "msg": "Token already initialized"
    },
    {
      "code": 6077,
      "name": "invalidTokenName",
      "msg": "Invalid token name"
    },
    {
      "code": 6078,
      "name": "invalidTokenSymbol",
      "msg": "Invalid token symbol"
    },
    {
      "code": 6079,
      "name": "invalidTokenUri",
      "msg": "Invalid token uri"
    },
    {
      "code": 6080,
      "name": "metadataAlreadyInitialized",
      "msg": "Metadata already initialized"
    },
    {
      "code": 6081,
      "name": "invalidProtocolFeeRate",
      "msg": "Invalid protocol fee rate, max 50000 which is 50%"
    },
    {
      "code": 6082,
      "name": "invalidRefundFeeRate",
      "msg": "Invalid refund fee rate, max 50000 which is 50%"
    },
    {
      "code": 6083,
      "name": "mintInProgress",
      "msg": "Mint in progress"
    },
    {
      "code": 6084,
      "name": "setReferrerCodeProcess",
      "msg": "Set referrer code processing"
    },
    {
      "code": 6085,
      "name": "payerAmountTooLow",
      "msg": "Payer amount too low"
    },
    {
      "code": 6086,
      "name": "configSupplyNotMatchMintSupply",
      "msg": "Config supply not match mint supply"
    },
    {
      "code": 6087,
      "name": "insufficientBalanceForDeployment",
      "msg": "Insufficient balance for deployment"
    },
    {
      "code": 6088,
      "name": "sendInitializingFeeFailed",
      "msg": "Send initializing fee failed"
    },
    {
      "code": 6089,
      "name": "invalidMintAccount",
      "msg": "Invalid mint account"
    },
    {
      "code": 6090,
      "name": "invalidFreezeAuthority",
      "msg": "Invalid freeze authority"
    },
    {
      "code": 6091,
      "name": "invalidMintAuthority",
      "msg": "Invalid mint authority"
    },
    {
      "code": 6092,
      "name": "invalidTokenProgram",
      "msg": "Invalid token program"
    },
    {
      "code": 6093,
      "name": "refundOnlyAllowedInTargetEras",
      "msg": "Refund only allowed in target eras"
    },
    {
      "code": 6094,
      "name": "revokeFreezeAuthorityNotApplied",
      "msg": "Revoke freeze authority not applied"
    },
    {
      "code": 6095,
      "name": "revokeFreezeAuthorityApplied",
      "msg": "Revoke freeze authority applied"
    },
    {
      "code": 6096,
      "name": "invalidMetadataAccount",
      "msg": "Invalid metadata account"
    },
    {
      "code": 6097,
      "name": "invalidMasterEditionAccount",
      "msg": "Invalid master edition account"
    },
    {
      "code": 6098,
      "name": "isNotCurrentlyTransferring",
      "msg": "The token is not currently transferring"
    },
    {
      "code": 6099,
      "name": "amountTooBig",
      "msg": "The amount is too big"
    },
    {
      "code": 6100,
      "name": "invalidMintTokenVaultAccount",
      "msg": "Invalid mint token vault account"
    },
    {
      "code": 6101,
      "name": "wrongProgramId",
      "msg": "Wrong program id"
    },
    {
      "code": 6102,
      "name": "mintTokenVaultOwnerAlreadyInitialized",
      "msg": "Mint token vault owner already initialized"
    },
    {
      "code": 6103,
      "name": "invalidMintVaultOwner",
      "msg": "Invalid mint vault owner"
    },
    {
      "code": 6104,
      "name": "graduateFrozenPeriodNotOver",
      "msg": "Graduate frozen period not over, need to wait 2 epochs after target era arrived!"
    },
    {
      "code": 6105,
      "name": "onlyValueManagerAllowed",
      "msg": "Only value manager allowed"
    },
    {
      "code": 6106,
      "name": "invalidMint",
      "msg": "Invalid mint"
    },
    {
      "code": 6107,
      "name": "invalidValueManager",
      "msg": "Invalid value manager"
    },
    {
      "code": 6108,
      "name": "invalidProtocolFeeAccount",
      "msg": "Invalid protocol fee account"
    }
  ],
  "types": [
    {
      "name": "ammConfig",
      "docs": [
        "Holds the current owner of the factory"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "docs": [
              "Bump to identify PDA"
            ],
            "type": "u8"
          },
          {
            "name": "disableCreatePool",
            "docs": [
              "Status to control if new pool can be create"
            ],
            "type": "bool"
          },
          {
            "name": "index",
            "docs": [
              "Config index"
            ],
            "type": "u16"
          },
          {
            "name": "tradeFeeRate",
            "docs": [
              "The trade fee, denominated in hundredths of a bip (10^-6)"
            ],
            "type": "u64"
          },
          {
            "name": "protocolFeeRate",
            "docs": [
              "The protocol fee"
            ],
            "type": "u64"
          },
          {
            "name": "fundFeeRate",
            "docs": [
              "The fund fee, denominated in hundredths of a bip (10^-6)"
            ],
            "type": "u64"
          },
          {
            "name": "createPoolFee",
            "docs": [
              "Fee for create a new pool"
            ],
            "type": "u64"
          },
          {
            "name": "protocolOwner",
            "docs": [
              "Address of the protocol fee owner"
            ],
            "type": "pubkey"
          },
          {
            "name": "fundOwner",
            "docs": [
              "Address of the fund fee owner"
            ],
            "type": "pubkey"
          },
          {
            "name": "padding",
            "docs": [
              "padding"
            ],
            "type": {
              "array": [
                "u64",
                16
              ]
            }
          }
        ]
      }
    },
    {
      "name": "closeTokenEvent",
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
          }
        ]
      }
    },
    {
      "name": "codeAccountData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "referralAccount",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "freezeTokenEvent",
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
            "type": "u64"
          },
          {
            "name": "initialTargetMintSizePerEpoch",
            "type": "u64"
          },
          {
            "name": "feeRate",
            "type": "u64"
          },
          {
            "name": "liquidityTokensRatio",
            "type": "f64"
          },
          {
            "name": "startTimestamp",
            "type": "u64"
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
            "type": "u64"
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
          },
          {
            "name": "valueManager",
            "type": "pubkey"
          },
          {
            "name": "wsolVault",
            "type": "pubkey"
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
            "type": "u64"
          },
          {
            "name": "mintStateData",
            "type": {
              "defined": {
                "name": "tokenMintState"
              }
            }
          },
          {
            "name": "mintFee",
            "type": "u64"
          },
          {
            "name": "referrerFee",
            "type": "u64"
          },
          {
            "name": "wsolVault",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "observation",
      "docs": [
        "The element of observations in ObservationState"
      ],
      "serialization": "bytemuckunsafe",
      "repr": {
        "kind": "c",
        "packed": true
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "blockTimestamp",
            "docs": [
              "The block timestamp of the observation"
            ],
            "type": "u64"
          },
          {
            "name": "cumulativeToken0PriceX32",
            "docs": [
              "the cumulative of token0 price during the duration time, Q32.32, the remaining 64 bit for overflow"
            ],
            "type": "u128"
          },
          {
            "name": "cumulativeToken1PriceX32",
            "docs": [
              "the cumulative of token1 price during the duration time, Q32.32, the remaining 64 bit for overflow"
            ],
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "observationState",
      "serialization": "bytemuckunsafe",
      "repr": {
        "kind": "c",
        "packed": true
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initialized",
            "docs": [
              "Whether the ObservationState is initialized"
            ],
            "type": "bool"
          },
          {
            "name": "observationIndex",
            "docs": [
              "the most-recently updated index of the observations array"
            ],
            "type": "u16"
          },
          {
            "name": "poolId",
            "type": "pubkey"
          },
          {
            "name": "observations",
            "docs": [
              "observation array"
            ],
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "observation"
                  }
                },
                100
              ]
            }
          },
          {
            "name": "padding",
            "docs": [
              "padding for feature update"
            ],
            "type": {
              "array": [
                "u64",
                4
              ]
            }
          }
        ]
      }
    },
    {
      "name": "poolState",
      "serialization": "bytemuckunsafe",
      "repr": {
        "kind": "c",
        "packed": true
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ammConfig",
            "docs": [
              "Which config the pool belongs"
            ],
            "type": "pubkey"
          },
          {
            "name": "poolCreator",
            "docs": [
              "pool creator"
            ],
            "type": "pubkey"
          },
          {
            "name": "token0Vault",
            "docs": [
              "Token A"
            ],
            "type": "pubkey"
          },
          {
            "name": "token1Vault",
            "docs": [
              "Token B"
            ],
            "type": "pubkey"
          },
          {
            "name": "lpMint",
            "docs": [
              "Pool tokens are issued when A or B tokens are deposited.",
              "Pool tokens can be withdrawn back to the original A or B token."
            ],
            "type": "pubkey"
          },
          {
            "name": "token0Mint",
            "docs": [
              "Mint information for token A"
            ],
            "type": "pubkey"
          },
          {
            "name": "token1Mint",
            "docs": [
              "Mint information for token B"
            ],
            "type": "pubkey"
          },
          {
            "name": "token0Program",
            "docs": [
              "token_0 program"
            ],
            "type": "pubkey"
          },
          {
            "name": "token1Program",
            "docs": [
              "token_1 program"
            ],
            "type": "pubkey"
          },
          {
            "name": "observationKey",
            "docs": [
              "observation account to store oracle data"
            ],
            "type": "pubkey"
          },
          {
            "name": "authBump",
            "type": "u8"
          },
          {
            "name": "status",
            "docs": [
              "Bitwise representation of the state of the pool",
              "bit0, 1: disable deposit(vaule is 1), 0: normal",
              "bit1, 1: disable withdraw(vaule is 2), 0: normal",
              "bit2, 1: disable swap(vaule is 4), 0: normal"
            ],
            "type": "u8"
          },
          {
            "name": "lpMintDecimals",
            "type": "u8"
          },
          {
            "name": "mint0Decimals",
            "docs": [
              "mint0 and mint1 decimals"
            ],
            "type": "u8"
          },
          {
            "name": "mint1Decimals",
            "type": "u8"
          },
          {
            "name": "lpSupply",
            "docs": [
              "lp mint supply"
            ],
            "type": "u64"
          },
          {
            "name": "protocolFeesToken0",
            "docs": [
              "The amounts of token_0 and token_1 that are owed to the liquidity provider."
            ],
            "type": "u64"
          },
          {
            "name": "protocolFeesToken1",
            "type": "u64"
          },
          {
            "name": "fundFeesToken0",
            "type": "u64"
          },
          {
            "name": "fundFeesToken1",
            "type": "u64"
          },
          {
            "name": "openTime",
            "docs": [
              "The timestamp allowed for swap in the pool."
            ],
            "type": "u64"
          },
          {
            "name": "padding",
            "docs": [
              "padding for future updates"
            ],
            "type": {
              "array": [
                "u64",
                32
              ]
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
            "type": "u64"
          },
          {
            "name": "supply",
            "type": "u64"
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
            "name": "codeHash",
            "type": "pubkey"
          },
          {
            "name": "activeTimestamp",
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
            "type": "u64"
          },
          {
            "name": "updateMetadataFee",
            "type": "u64"
          },
          {
            "name": "customizedDeployFee",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "thawTokenEvent",
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
            "name": "targetEras",
            "type": "u32"
          },
          {
            "name": "mintStateData",
            "type": {
              "defined": {
                "name": "tokenMintState"
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
            "name": "feeRate",
            "type": "u64"
          },
          {
            "name": "maxSupply",
            "type": "u64"
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
            "type": "u64"
          },
          {
            "name": "initialTargetMintSizePerEpoch",
            "type": "u64"
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
            "name": "wsolVault",
            "type": "pubkey"
          },
          {
            "name": "mintTokenVault",
            "type": "pubkey"
          },
          {
            "name": "startTimestamp",
            "type": "u64"
          },
          {
            "name": "isProcessing",
            "type": "bool"
          },
          {
            "name": "valueManager",
            "type": "pubkey"
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
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "name",
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
            "type": "u64"
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
            "type": "u64"
          },
          {
            "name": "startTimestampEpoch",
            "type": "u64"
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
            "type": "u64"
          },
          {
            "name": "quantityMintedEpoch",
            "type": "u64"
          },
          {
            "name": "targetMintSizeEpoch",
            "type": "u64"
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
          },
          {
            "name": "graduateEpoch",
            "type": "u32"
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
            "name": "usageCount",
            "type": "u32"
          },
          {
            "name": "codeHash",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "activeTimestamp",
            "type": "u64"
          },
          {
            "name": "isProcessing",
            "type": "bool"
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
          },
          {
            "name": "isProcessing",
            "type": "bool"
          },
          {
            "name": "vaultTokens",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "updateTokenMetadataEvent",
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
            "name": "admin",
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
            "name": "metadataAccount",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
