import { FC } from "react";
import { InitiazlizedTokenData, TokenMetadata, TokenMetadataIPFS } from "../../types/types";

export type MyDeploymentCardProps = {
    token: InitiazlizedTokenData,
    metadata: TokenMetadataIPFS | undefined,
};

export const MyDeploymentCard: FC<MyDeploymentCardProps> = ({ token, metadata }) => {
    return (
        <div className="card bg-base-200 shadow-xl">
            {token.mint}
        </div>
    );
};