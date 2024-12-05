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
        startTimestamp
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
        startTimestamp
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
        startTimestamp
    }
}`;

export const querySetRefererCodeEntityById = gql`
query GetSetRefererCodeEntity($id: ID!) {
    setRefererCodeEventEntity(id: $id) {
        id
        mint
        referralAccount
        referrerAta
        referrerMain
        activeTimestamp
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
