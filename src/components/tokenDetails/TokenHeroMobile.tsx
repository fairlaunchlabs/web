import { useEffect, useState } from "react";
import { ARSEEDING_GATEWAY_URL, ARWEAVE_GATEWAY_URL } from "../../config/constants";
import { TokenHeroProps, TokenMetadataIPFS } from "../../types/types";
import { fetchImageFromUrlOrCache } from "../../utils/db";
import { addressToColor } from "../../utils/format";
import { ShareButton } from "../common/ShareButton";
import { RenderSocialIcons } from "../mintTokens/RenderSocialIcons";
import { TokenImage } from "../mintTokens/TokenImage";

export const TokenHeroMobile: React.FC<TokenHeroProps> = ({
    token,
    metadata
}) => {
    const [retryCount, setRetryCount] = useState(0);
    const [imageData, setImageData] = useState("");

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        if (metadata?.header) {
            fetchImageFromUrlOrCache(metadata?.header, Number(token?.metadataTimestamp)).then((blobUrl) => {
                setImageData(blobUrl as string);
                setRetryCount(0);
            }).catch((error) => {
                if (retryCount < 3) {
                    const backoffTime = Math.pow(2, retryCount) * 1000;
                    setTimeout(() => {
                        setRetryCount(prev => prev + 1);
                    }, backoffTime);
                }
            });
        }

        return () => {
            isMounted = false;
            controller.abort();
            if (imageData) {
                URL.revokeObjectURL(imageData);
            }
        };
    }, [metadata?.header, retryCount]);

    return (
        <div className="-ml-4 -mt-10 -mr-4 relative">
            {/* Background Image with Blur */}
            <div className="relative w-full aspect-[3/2] overflow-hidden">
                {metadata && imageData !== "" && metadata?.header !== ARWEAVE_GATEWAY_URL + "/" && metadata?.header !== ARSEEDING_GATEWAY_URL + "/" ? (
                    <img
                        src={imageData}
                        alt="Token Header"
                        className="w-full h-full object-cover blur-xs opacity-80"
                        style={{ padding: 0 }}
                    />
                ) : (
                    <div 
                        className="w-full h-full blur-xs opacity-80" 
                        style={{ backgroundColor: addressToColor(token.mint as string)}} 
                    />
                )}
                {/* Optional: Add a subtle overlay for better text readability */}
                {/* <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40" /> */}
            </div>
            
            {/* Content Overlay - 左对齐布局 */}
            <div className="absolute inset-0">
                <div className="h-full flex flex-col justify-between">
                    <div className="p-6 space-y-4">
                    {/* Top Section */}
                    <div className="flex items-start gap-4">
                        {/* Token Image */}
                        <div className="relative">
                            <TokenImage
                                imageUrl={metadata?.image as string} 
                                name={metadata?.name as string} 
                                metadataTimestamp={Number(token.metadataTimestamp)}
                                size={72} 
                                className="rounded-full ring-2 ring-white shadow-xl" 
                            />
                        </div>

                        {/* Token Basic Info */}
                        <div>
                            <div className="badge badge-lg text-xl badge-secondary">
                                {metadata?.symbol}
                            </div>
                            <div className="text-white text-md mt-2 [text-shadow:2px_2px_0_#000000] bg-black/60 px-3 rounded-md">
                                {metadata?.name}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="flex justify-between">
                        <RenderSocialIcons metadata={metadata as TokenMetadataIPFS} />
                        <ShareButton token={token} />
                    </div>
                    </div>
                    {metadata?.description && (
                        <div className='bg-black/60 px-3 py-2 w-full'>
                            <p className="pixel-text text-white text-sm [text-shadow:2px_2px_0_#000000] line-clamp-4">
                                {metadata?.description}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
