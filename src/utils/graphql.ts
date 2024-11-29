import { gql } from '@apollo/client';

export const queryInitializeTokenEvent = gql`
query GetInitializedTokenEvents($skip: Int!, $first: Int!) {
    initializeTokenEventEntities(
        skip: $skip
        first: $first
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
    }
}`;

export const queryInitializeTokenEventBySearch = gql`
query GetInitializedTokenEvents($skip: Int!, $first: Int!, $searchQuery: String!) {
    initializeTokenEventEntities(
        skip: $skip
        first: $first
        where: {
            or: [
                { tokenName_contains_nocase: $searchQuery },
                { tokenSymbol_contains_nocase: $searchQuery },
                { admin_contains_nocase: $searchQuery },
                { mint_contains_nocase: $searchQuery }
            ]
        }
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
    }
}`;

export const queryMyInitializedTokenEvent = gql`
query GetMyInitializedTokens($admin: String!, $skip: Int!, $first: Int!) {
    initializeTokenEventEntities(
        where: { admin: $admin }
        skip: $skip
        first: $first
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
    }
}`;

export const queryMintTokenEvent = gql`
query GetMintTokenEvents($skip: Int!, $first: Int!) {
    mintTokenEntities(
        skip: $skip
        first: $first
        orderBy: timestamp
        orderDirection: desc
    ) {
        id
        txId
        sender
        mint
        configAccount
        tokenVault
        referralAccount
        referrerMain
        referrerAta
        refundAccount
        timestamp
        admin
        supply
        currentEra
        currentEpoch
        elapsedSecondsEpoch
        startTimestampEpoch
        lastDifficultyCoefficient
        difficultyCoefficient
        mintSizeEpoch
        quantityMintedEpoch
        targetMintSizeEpoch
        totalMintFee
        totalReferrerFee
        totalTokens
        tokenName
        tokenSymbol
        tokenUri
        targetEras
        epochesPerEra
        targetSecondsPerEpoch
        reduceRatio
        initialMintSize
        initialTargetMintSizePerEpoch
        feeRate
        liquidityTokensRatio
        lastDifficultyCoefficientEpoch
        difficultyCoefficientEpoch
    }
}`;

export const queryTokenTransactions = gql`
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
        where: { mint_in: $mints }
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
    }
}`;