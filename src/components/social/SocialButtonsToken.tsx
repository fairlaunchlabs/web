import { FC } from "react"
import { OrderedToken } from "../../types/types"
import toast from "react-hot-toast"
import { followToken, likeToken, unfollowToken, unlikeToken } from "../../utils/user"

interface SocialButtonsTokenProps {
  tokenData: OrderedToken | null;
  mint: string;
  token: string | null;
  isCommentOpen: boolean;
  setIsCommentOpen: (bool: boolean) => void;
  fetchTokenData: () => void;
}

export const SocialButtonsToken: FC<SocialButtonsTokenProps> = ({ 
  mint, 
  setIsCommentOpen, 
  token, 
  isCommentOpen, 
  tokenData, 
  fetchTokenData 
}) => {  
  const follow = async () => {
    const response = await followToken(token as string, mint);
    if (response.success) {
      // toast.success(response.message as string);
      fetchTokenData();
    } else {
      toast.error(response.message as string);
    }
  }

  const unfollow = async () => {
    const response = await unfollowToken(token as string, mint);
    if (response.success) {
      // toast.success(response.message as string);
      fetchTokenData();
    } else {
      toast.error(response.message as string);
    }
  }

  const like = async () => {
    const response = await likeToken(token as string, mint);
    if (response.success) {
      // toast.success(response.message as string);
      fetchTokenData();
    } else {
      toast.error(response.message as string);
    }
  }

  const unlike = async () => {
    const response = await unlikeToken(token as string, mint);
    if (response.success) {
      // toast.success(response.message as string);
      fetchTokenData();
    } else {
      toast.error(response.message as string);
    }
  }

  return (
    <div className="flex justify-between gap-5">
      <div className="flex flex-col justify-center text-white">
        {!tokenData?.isFollowedByMe ? 
        <div className="cursor-pointer" onClick={() => follow()}>
          <svg fill="none" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M3 3h18v18H3V3zm16 16V5H5v14h14zm-6-8h4v2h-4v4h-2v-4H7v-2h4V7h2v4z" fill="currentColor"/> </svg>
        </div>
        :
        <div style={{ color: 'red' }} className="cursor-pointer" onClick={() => unfollow()}>
          <svg fill="currentColor" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M5 3H3v18h18V3H5zm14 2v14H5V5h14zm-3 6H8v2h8v-2z" fill="currentColor"/> </svg>
        </div>}
        <div className="text-center text-sm">{tokenData?.totalFollowee}</div>
      </div>

      <div className="flex flex-col justify-center text-white">{!tokenData?.isLikedByMe ?
        <div>
          <div className="cursor-pointer" onClick={() => like()}>
            <svg fill="none" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M9 2H5v2H3v2H1v6h2v2h2v2h2v2h2v2h2v2h2v-2h2v-2h2v-2h2v-2h2v-2h2V6h-2V4h-2V2h-4v2h-2v2h-2V4H9V2zm0 2v2h2v2h2V6h2V4h4v2h2v6h-2v2h-2v2h-2v2h-2v2h-2v-2H9v-2H7v-2H5v-2H3V6h2V4h4z" fill="currentColor"/> </svg>
          </div>
        </div> :
        <div>
          <div style={{ color: 'red' }} className="cursor-pointer" onClick={() => unlike()}>
            <svg fill="currentColor" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M9 2H5v2H3v2H1v6h2v2h2v2h2v2h2v2h2v2h2v-2h2v-2h2v-2h2v-2h2v-2h2V6h-2V4h-2V2h-4v2h-2v2h-2V4H9V2zm0 2v2h2v2h2V6h2V4h4v2h2v6h-2v2h-2v2h-2v2h-2v2h-2v-2H9v-2H7v-2H5v-2H3V6h2V4h4z" fill="currentColor"/> </svg>
          </div>
        </div>}
        <div className="text-center text-sm">{tokenData?.totalLike}</div>
      </div>

      <div className="flex flex-col justify-center text-white">
        {!isCommentOpen ?
        <div className="cursor-pointer" onClick={() => setIsCommentOpen(true)}>
          <svg fill="none" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M20 2H2v20h2V4h16v12H6v2H4v2h2v-2h16V2h-2z" fill="currentColor"/> </svg>
        </div>
        :
        <div className="cursor-pointer" onClick={() => setIsCommentOpen(false)}>
          <svg fill="none" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M20 2H2v20h2V4h16v12H6v2H4v2h2v-2h16V2h-2zM6 7h12v2H6V7zm8 4H6v2h8v-2z" fill="currentColor"/> </svg>
        </div>}
        <div className="text-center text-sm">{tokenData?.totalComments}</div>
      </div>

      {/* <div>Following me: {user.isFollowingMe ? 'Yes' : 'No'}</div> */}
      {/* <div>Liking me: {user.isLikingMe ? 'Yes' : 'No'}</div> */}
    </div>
  )
}