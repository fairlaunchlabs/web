import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from "../components/common/PageHeader";
import { useAuth } from "../utils/contexts";
import { Activity } from '../types/types';
import { getActivities } from '../utils/user';
import { formatAddress } from '../utils/format';
import { AiFillLike, AiFillStar, AiFillHeart, AiFillBell, AiOutlineLike, AiOutlineHeart } from "react-icons/ai";
import { MdRocketLaunch } from "react-icons/md";
import { USER_API_URL } from '../config/constants';
import toast from 'react-hot-toast';

export type SocialFeedProps = {
  expanded: boolean;
};

export const SocialFeed: React.FC<SocialFeedProps> = ({ expanded }) => {
  const { token, walletAddress, handleLogin, logout } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  // Get activities data max 20
  const fetchActivities = useCallback(async () => {
    if (!token || loading) return;

    setLoading(true);
    try {
      const result = await getActivities(token, 20);
      if (!result.success) {
        toast.error(result.message as string);
        return;
      }
      setActivities(result.data);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchActivities();
    }
  }, [token, fetchActivities]);


  const renderActivity = (activity: Activity) => {
    const { userId, avatar, activityType, targetId, targetType, createdAt, targetWalletAddress, userWalletAddress, targetUsername, userUsername, content } = activity;

    const actionText = {
      like:     'liked',
      unlike:   'unliked',
      comment:  'commented',
      rate:     'rated',
      issue_token: 'launched',
      promote:  'promoted',
      manage:   'managing',
      mint:     'minted',
      follow:   'followed',
      unfollow: 'unfollowed',
      join:     'joined',
      delete_comment: 'deleted comment',
      like_comment: 'liked comment',
      unlike_comment: 'unliked comment'
    }[activityType];

    const emoji = {
      like: <AiFillHeart className='h-4 w-4 text-secondary'/>,
      unlike: <AiOutlineHeart className='h-4 w-4 text-secondary'/>,
      comment: <svg fill="none" className='h-4 w-4' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M20 2H2v20h2V4h16v12H6v2H4v2h2v-2h16V2h-2zm-7 7h3v2h-3v3h-2v-3H8V9h3V6h2v3z" fill="currentColor"/> </svg>,
      delete_comment: <svg fill="none" className='h-4 w-4' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M4 2h18v16H6v2H4v-2h2v-2h14V4H4v18H2V2h2zm12 7H8v2h8V9z" fill="currentColor"/> </svg>,
      rate: <AiFillStar className='h-4 w-4 text-primary'/>,
      follow: <svg fill="none" className='h-4 w-4 text-red-500' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M3 3h18v18H3V3zm16 16V5H5v14h14zm-6-8h4v2h-4v4h-2v-4H7v-2h4V7h2v4z" fill="currentColor"/> </svg>,
      unfollow: <svg fill="none" className='h-4 w-4 text-red-500' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M5 3H3v18h18V3H5zm14 2v14H5V5h14zm-3 6H8v2h8v-2z" fill="currentColor"/> </svg>,
      join: <AiFillBell className='h-4 w-4 text-success'/>,
      like_comment: <AiFillLike className='h-4 w-4 text-secondary'/>,
      unlike_comment: <AiOutlineLike className='h-4 w-4 text-secondary'/>,
      issue_token: <MdRocketLaunch className='h-4 w-4'/>, // TODO: use onchain data
      promote: '📣', // TODO: use onchain data
      manage: '🏛️', // TODO: use onchain data
      mint: '💰', // TODO: use onchain data
    }[activityType];

    const targetLink = targetType === 'user' ? `/social-user-details/${targetWalletAddress}` : `/token/${targetId}`;
    const userLink = `/social-user-details/${userWalletAddress}`;

    return (
      <div
        key={activity.id}
        className="pixel-box mb-4 p-4"
      >
        <div className="flex items-center space-x-2 text-sm">
          <div className='flex items-center'>[{emoji}]</div>
          {/* User information */}
          <a href={userLink} className="flex gap-2 text-blue-400 hover:underline font-semibold flex items-center">
            {avatar && <div>
              <img src={avatar} className='w-5 h-5 rounded-full'/>
            </div>}
            <div>{userUsername || userWalletAddress && formatAddress(userWalletAddress)}</div>
          </a>

          {/* Actions */}
          <div className="">{actionText}</div>
          {activityType !== "join" && 
          <div className="flex">
            <div>{targetType === 'user' ? 'User' : 'Token'}</div>
            {targetId && targetType && (
              <div className="ml-2">
                <a href={targetLink} className="text-blue-400 hover:underline font-semibold flex items-center space-x-1">
                  <span>
                    {targetType === 'user' ? targetUsername || targetWalletAddress && formatAddress(targetWalletAddress) : `${formatAddress(targetId)}`}
                  </span>
                </a>
              </div>
            )}
          </div>}
        </div>

        {activityType === 'comment' && content && (
          <p className="mt-2 text-sm py-2 px-3 bg-primary">
            {content}
          </p>
        )}

        <p className="text-sm mt-2 ml-1">
          {new Date(createdAt).toLocaleString()}
        </p>
      </div>
    );
  };

  return (
    <div className={`space-y-0 md:p-4 md:mb-20 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
      <PageHeader title="Latest activities" bgImage="/bg/group1/23.jpg" />
      {!token && (
        <div className="text-center mt-10">
          <p className="text-gray-300 mb-4">Please log in to view your feed.</p>
          {/* <p className="text-gray-300 mb-4">{USER_API_URL}</p> */}
          <button
            onClick={handleLogin}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Connect Wallet
          </button>
        </div>
      )}

      {/* Activities list */}
      {token && (
        <div className="mt-6">
          {activities.length === 0 && !loading ? (
            <div className="text-gray-400 text-center">No activities yet. Follow some users or tokens!</div>
          ) : (
            <div className="">
              {/* <div className='font-semibold mb-1'>Latest activities</div> */}
              <div>{activities.map(renderActivity)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};