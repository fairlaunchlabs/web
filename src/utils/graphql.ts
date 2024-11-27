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
            mintStateAccount
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
            mintStateAccount
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
            mintStateAccount
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
        }
    }`;
