import { FC, useState } from "react";
import { InitiazlizedTokenData } from "../../types/types";
import { TokenCardSimple } from "../mintTokens/TokenCardSimple";
import { token } from "@coral-xyz/anchor/dist/cjs/utils";

export type ScrollCardsProps = {
    tokens: InitiazlizedTokenData[];
}
export const ScrollCards: FC<ScrollCardsProps> = ({ tokens }) => {
    const [isScrolling, setIsScrolling] = useState(false);
    return (
        <div 
            className="scroll-wrapper -mx-4 overflow-hidden"
            onMouseDown={() => setIsScrolling(true)}
            onTouchStart={() => setIsScrolling(true)}
            onMouseUp={() => setIsScrolling(false)}
            onTouchEnd={() => setIsScrolling(false)}
            onMouseLeave={() => setIsScrolling(false)}
        >
            <div className={`scroll-content flex py-1 ${isScrolling ? 'paused' : ''}`}>
                <div className="flex gap-5 px-4" style={{ 
                    width: `${tokens.length * 164}px` 
                    // 164 is the width of (TokenCardMobile - 2)* 4 + 20px, for example: TokenCardMobile width is 38, here should be (38-2)*4 + 20px = 164px
                    // Why should add 20px? Because the gap is 20px (5*4)
                }}>
                    {tokens.map((token: InitiazlizedTokenData) => 
                        // with should be TokenCardSimple width - 2, for example: TokenCardSimple width is 38, here should be 36
                        <div key={token.tokenId} className="flex-none w-36">
                            <TokenCardSimple token={token} />
                        </div>
                    )}
                </div>
                <div className="flex gap-5 px-4" style={{ 
                    width: `${tokens.length * 164}px`
                }}>
                    {tokens.map((token: InitiazlizedTokenData) => 
                        <div key={`dup-${token.tokenId}`} className="flex-none w-36">
                            <TokenCardSimple token={token} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}