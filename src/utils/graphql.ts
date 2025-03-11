import { gql } from '@apollo/client';

export const queryInitializeTokenEvent = gql`
query GetInitializedTokenEvents($orderBy: String!) {
    initializeTokenEventEntities(
        where: { status: 1 }
        first: 50
        orderBy: $orderBy
        orderDirection: desc
    ) {
        id
        txId
        admin
        tokenId
        mint
        configAccount
        metadataAccount
        tokenVault
        timestamp
        tokenName
        tokenSymbol
        tokenUri
        supply
        currentEra
        currentEpoch
        elapsedSecondsEpoch
        startTimestampEpoch
        lastDifficultyCoefficientEpoch
        difficultyCoefficientEpoch
        mintSizeEpoch
        quantityMintedEpoch
        targetMintSizeEpoch
        totalMintFee
        totalReferrerFee
        totalTokens
        targetEras
        epochesPerEra
        targetSecondsPerEpoch
        reduceRatio
        initialMintSize
        initialTargetMintSizePerEpoch
        feeRate
        liquidityTokensRatio
        startTimestamp
        status
        metadataTimestamp
        valueManager
        wsolVault
        graduateEpoch
    }
}`;

export const queryHotInitializeTokenEvent = gql`
query QueryHotInitializeTokenEvent($orderBy: String!) {
    initializeTokenEventEntities(
        where: { status: 1 }
        first: 100 
        orderBy: $orderBy
        orderDirection: desc
    ) {
        id
        currentEra
        targetEras
        txId
        admin
        tokenId
        mint
        configAccount
        metadataAccount
        tokenVault
        timestamp
        tokenName
        tokenSymbol
        tokenUri
        supply
        currentEpoch
        elapsedSecondsEpoch
        startTimestampEpoch
        lastDifficultyCoefficientEpoch
        difficultyCoefficientEpoch
        mintSizeEpoch
        quantityMintedEpoch
        targetMintSizeEpoch
        totalMintFee
        totalReferrerFee
        totalTokens
        epochesPerEra
        targetSecondsPerEpoch
        reduceRatio
        initialMintSize
        initialTargetMintSizePerEpoch
        feeRate
        liquidityTokensRatio
        startTimestamp
        status
        metadataTimestamp
        valueManager
        wsolVault
        graduateEpoch
    }
}`;

export const queryMyDeployments = gql`
query GetMyDeployments($wallet: String!, $skip: Int!, $first: Int!) {
    initializeTokenEventEntities(
        where: { admin: $wallet, status: 1 }
        skip: $skip
        first: $first
        orderBy: timestamp
        orderDirection: desc
    ) {
        id
        txId
        admin
        tokenId
        mint
        configAccount
        metadataAccount
        tokenVault
        timestamp
        tokenName
        tokenSymbol
        tokenUri
        supply
        currentEra
        currentEpoch
        elapsedSecondsEpoch
        startTimestampEpoch
        lastDifficultyCoefficientEpoch
        difficultyCoefficientEpoch
        mintSizeEpoch
        quantityMintedEpoch
        targetMintSizeEpoch
        totalMintFee
        totalReferrerFee
        totalTokens
        targetEras
        epochesPerEra
        targetSecondsPerEpoch
        reduceRatio
        initialMintSize
        initialTargetMintSizePerEpoch
        feeRate
        liquidityTokensRatio
        startTimestamp
        status
        metadataTimestamp
        valueManager
        wsolVault
        graduateEpoch
    }
}`;

export const queryMyDelegatedTokens = gql`
query GetMyDelegatedTokens($wallet: String!, $skip: Int!, $first: Int!) {
    initializeTokenEventEntities(
        where: { valueManager: $wallet, status: 1 }
        skip: $skip
        first: $first
        orderBy: timestamp
        orderDirection: desc
    ) {
        id
        txId
        admin
        tokenId
        mint
        configAccount
        metadataAccount
        tokenVault
        timestamp
        tokenName
        tokenSymbol
        tokenUri
        supply
        currentEra
        currentEpoch
        elapsedSecondsEpoch
        startTimestampEpoch
        lastDifficultyCoefficientEpoch
        difficultyCoefficientEpoch
        mintSizeEpoch
        quantityMintedEpoch
        targetMintSizeEpoch
        totalMintFee
        totalReferrerFee
        totalTokens
        targetEras
        epochesPerEra
        targetSecondsPerEpoch
        reduceRatio
        initialMintSize
        initialTargetMintSizePerEpoch
        feeRate
        liquidityTokensRatio
        startTimestamp
        status
        metadataTimestamp
        valueManager
        wsolVault
        graduateEpoch
    }
}`;

export const queryInitializeTokenEventBySearch = gql`
query GetInitializedTokenEvents($skip: Int!, $first: Int!, $searchQuery: String!) {
    initializeTokenEventEntities(
        skip: $skip
        first: $first
        where: {
            and: [
                {
                    or: [
                        { tokenName_contains_nocase: $searchQuery },
                        { tokenSymbol_contains_nocase: $searchQuery },
                        { admin_contains_nocase: $searchQuery },
                        { mint_contains_nocase: $searchQuery }
                    ]
                },
                { status: 1 }
            ]
        }
        orderBy: difficultyCoefficientEpoch
        orderDirection: desc
    ) {
        id
        txId
        admin
        tokenId
        mint
        configAccount
        metadataAccount
        tokenVault
        timestamp
        tokenName
        tokenSymbol
        tokenUri
        supply
        currentEra
        currentEpoch
        elapsedSecondsEpoch
        startTimestampEpoch
        lastDifficultyCoefficientEpoch
        difficultyCoefficientEpoch
        mintSizeEpoch
        quantityMintedEpoch
        targetMintSizeEpoch
        totalMintFee
        totalReferrerFee
        totalTokens
        targetEras
        epochesPerEra
        targetSecondsPerEpoch
        reduceRatio
        initialMintSize
        initialTargetMintSizePerEpoch
        feeRate
        liquidityTokensRatio
        startTimestamp
        status
        metadataTimestamp
        valueManager
        wsolVault
        graduateEpoch
    }
}`;

export const queryInitializeTokenEventByMints = gql`
query GetInitializedTokenEvents($orderBy: String!, $mints: [String!]) {
    initializeTokenEventEntities(
        where: { mint_in: $mints, status: 1 }
        first: 50
        orderBy: $orderBy
        orderDirection: desc
    ) {
        id
        txId
        admin
        tokenId
        mint
        configAccount
        metadataAccount
        tokenVault
        timestamp
        tokenName
        tokenSymbol
        tokenUri
        supply
        currentEra
        currentEpoch
        elapsedSecondsEpoch
        startTimestampEpoch
        lastDifficultyCoefficientEpoch
        difficultyCoefficientEpoch
        mintSizeEpoch
        quantityMintedEpoch
        targetMintSizeEpoch
        totalMintFee
        totalReferrerFee
        totalTokens
        targetEras
        epochesPerEra
        targetSecondsPerEpoch
        reduceRatio
        initialMintSize
        initialTargetMintSizePerEpoch
        feeRate
        liquidityTokensRatio
        startTimestamp
        status
        metadataTimestamp
        valueManager
        wsolVault
        graduateEpoch
    }
}`;

export const queryTokenMintTransactions = gql`
query GetTokenTransactions($mint: String!, $skip: Int!, $first: Int!) {
    mintTokenEntities(
        where: { mint: $mint }
        skip: $skip
        first: $first
        orderBy: timestamp
        orderDirection: desc
    ) {
        id
        txId
        sender
        timestamp
        currentEra
        currentEpoch
        mintSizeEpoch
    }
}
`;

export const queryAllTokenMintForChart = gql`
query GetTokenTransactions($mint: String!, $skip: Int!, $first: Int!) {
    mintTokenEntities(
        where: { mint: $mint }
        skip: $skip
        first: $first
        orderBy: timestamp
    ) {
        timestamp
        mintSizeEpoch
    }
}
`;

export const queryTokenRefundTransactions = gql`
query GetTokenTransactions($mint: String!, $skip: Int!, $first: Int!) {
    refundEventEntities(
        where: { mint: $mint }
        skip: $skip
        first: $first
        orderBy: timestamp
        orderDirection: desc
    ) {
        id
        txId
        sender
        timestamp
        burnAmountFromUser
        burnAmountFromVault
        refundFee
        refundAmountIncludingFee
    }
}
`;

export const queryHolders = gql`
query GetHolders($mint: String!, $skip: Int!, $first: Int!) {
    holdersEntities(
        where: { mint: $mint }
        skip: $skip
        first: $first
        orderBy: amount
        orderDirection: desc
    ) {
        owner
        amount
    }
}
`;

export const queryMyTokenList = gql`
query GetHolders($owner: String!, $skip: Int!, $first: Int!) {
    holdersEntities(
        where: { owner: $owner }
        skip: $skip
        first: $first
        orderBy: amount
        orderDirection: desc
    ) {
        mint
        amount
    }
}
`;

export const queryTokensByMints = gql`
query GetTokensByMints($skip: Int!, $first: Int!, $mints: [String!]) {
    initializeTokenEventEntities(
        skip: $skip
        first: $first
        where: { mint_in: $mints, status: 1 }
        orderBy: tokenId
        orderDirection: desc
    ) {
        id
        txId
        admin
        tokenId
        mint
        configAccount
        metadataAccount
        tokenVault
        timestamp
        tokenName
        tokenSymbol
        tokenUri
        supply
        currentEra
        currentEpoch
        elapsedSecondsEpoch
        startTimestampEpoch
        lastDifficultyCoefficientEpoch
        difficultyCoefficientEpoch
        mintSizeEpoch
        quantityMintedEpoch
        targetMintSizeEpoch
        totalMintFee
        totalReferrerFee
        totalTokens
        targetEras
        epochesPerEra
        targetSecondsPerEpoch
        reduceRatio
        initialMintSize
        initialTargetMintSizePerEpoch
        feeRate
        liquidityTokensRatio
        startTimestamp
        status
        metadataTimestamp
        valueManager
        wsolVault
        graduateEpoch
    }
}`;

export const querySetRefererCodeEntitiesByOwner = gql`
query GetSetRefererCodeEntity($owner: String!, $skip: Int!, $first: Int!) {
    setRefererCodeEventEntities(
        where: { referrerMain: $owner }
        skip: $skip
        first: $first
        orderBy: id
        orderDirection: desc
    ) {
        id
        mint
        referralAccount
        referrerAta
        referrerMain
        activeTimestamp
    }
}`;

export const queryTotalReferrerBonus = gql`
query GetTotalReferrerBonus($mint: String!, $referrerMain: String!) {
    mintTokenEntities(
        where: {
            mint: $mint, 
            referrerMain: $referrerMain
        }
        orderBy: timestamp
        orderDirection: desc
    ) {
        txId
        sender
        mint
        refundAccount
        referrerMain
        timestamp
        currentEra
        currentEpoch
        mintSizeEpoch
        mintFee
        referrerFee
    }
}`;

export const queryTotalReferrerBonusSum = gql`
query GetTotalReferrerBonusSum($mints: [String]!, $referrerMain: String!) {
    mintTokenEntities(
        mints: $mints, 
        where: {
            referrerMain: $referrerMain
        }
    ) {
        mint
        referrerFee
    }
}`;

export const queryTrades = gql`
query GetTrades($mint: String!, $skip: Int!, $first: Int!) {
    proxySwapBaseEventEntities(
        skip: $skip
        first: $first
        where: { tokenMint: $mint }
        orderBy: blockTimestamp
        orderDirection: desc
    ) {
        id
        txId
        tokenMint
        tokenName
        tokenSymbol
        action
        baseMint
        priceMint
        baseAmount
        priceAmount
        poolState
        blockTimestamp
    }
}`;

export const queryLiquidities = gql`
query GetLiquidities($mint: String!, $skip: Int!, $first: Int!) {
    proxyLiquidityEventEntities(
        skip: $skip
        first: $first
        where: { tokenMint: $mint }
        orderBy: blockTimestamp
        orderDirection: desc
    ) {
        id
        txId
        tokenMint
        tokenName
        tokenSymbol
        action
        token0Mint
        token1Mint
        token0Amount
        token1Amount
        poolState
        lpMint
        lpAmount
        blockTimestamp
    }
}`;

export const queryBurnLp = gql`
query GetBurnLp($mint: String!, $skip: Int!, $first: Int!) {
    proxyBurnLpTokensEventEntities(
        skip: $skip
        first: $first
        where: {tokenMint: $mint}
        orderBy: blockTimestamp
        orderDirection: desc
    ) {
        id
        txId
        tokenMint
        tokenName
        tokenSymbol
        lpMint
        lpAmount
        blockTimestamp
    }
}`;