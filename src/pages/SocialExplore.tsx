import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useAuth } from '../utils/contexts';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { AddressDisplay } from '../components/common/AddressDisplay';
import { OrderedUser, Role } from '../types/types';
import { getDevelopers, getReferrals, getSearchByKey, getValueManagers } from '../utils/user';
import toast from 'react-hot-toast';
import { generateDefaultUsername } from "../utils/format";
import { API_URL, DEFAULT_IMAGE } from '../config/constants';

export type SocialExploreProps = {
  expanded: boolean;
};

export const mergeUserData = (originalData: any[]): OrderedUser[] => {
  const userMap = new Map<string, OrderedUser>();

  originalData.forEach((item) => {
    const admin = item.admin;

    if (userMap.has(admin)) {
      const existing = userMap.get(admin)!;
      (existing.role as Role[]).push(item.role);
      (existing.tokenCount as number[]).push(item.token_count);
    } else {
      userMap.set(admin, {
        admin: admin,
        role: [item.role],
        tokenCount: [item.token_count],
        userId: item.user_id,
        username: item.username,
        email: item.email,
        bio: item.bio,
        socialLinks: item.social_links,
        avatar: item.avatar,
        totalLike: item.total_like,
        totalComments: item.total_comments,
        totalFollower: item.total_follower,
        totalFollowee: item.total_followee,
        isFollowedByMe: item.is_followed_by_me as number === 1,
        isFollowingMe: item.is_following_me as number === 1,
        isLikedByMe: item.is_liked_by_me as number === 1,
        isLikingMe: item.is_liking_me as number === 1,
      });
    }
  });
  return Array.from(userMap.values());
}

export const SocialExplore: React.FC<SocialExploreProps> = ({ expanded }) => {
  const { token, walletAddress, handleLogin, logout } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<OrderedUser[]>([]);
  const [developerRoleSelected, setDeveloperRoleSelected] = useState(false);
  const [urcProviderRoleSelected, setUrcProviderRoleSelected] = useState(false);
  const [valueManagerRoleSelected, setValueManagerRoleSelected] = useState(false);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      let results = new Array<OrderedUser>;
      if (developerRoleSelected) results = results.concat(await getDevelopers(token as string, 10));
      if (urcProviderRoleSelected) results = results.concat(await getReferrals(token as string, 10));
      if (valueManagerRoleSelected) results = results.concat(await getValueManagers(token as string, 10));
      results = mergeUserData(results);
      console.log(results)
      setFilteredUsers(results);  
      setLoading(false);
    }
    getData();
  }, [developerRoleSelected, urcProviderRoleSelected, valueManagerRoleSelected]);

  const handleCardClick = (user: OrderedUser) => {
    navigate(`/social-user-details/${user.admin}`);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter username or wallet address to search');
      return;
    }
    setLoading(true);
    let results = await getSearchByKey(token as string, searchTerm);
    results = mergeUserData(results);
    setFilteredUsers(results);  
    setLoading(false);
  }
  
  return (
    <div className={`space-y-3 md:p-4 md:mb-20 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
      <PageHeader title="Social Explore" bgImage="/bg/group1/22.jpg" />
      {!token || !walletAddress && (
        <div className="text-center mt-10">
          <p className="text-gray-300 mb-4">Please log in to view your feed.</p>
          <p className="text-gray-300 mb-4">{API_URL}</p>
          <button
            onClick={handleLogin}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Connect Wallet
          </button>
        </div>
      )}

      {/* Search box */}
      <div className="mx-auto w-full flex flex-col gap-4">
        <div className="join w-full">
          <div className='relative join-item flex-1'>
            <input
              type="text"
              placeholder="Enter username or wallet address"
              className='input search-input w-full pl-10'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button
              className="search-btn join-item btn-primary w-24"
              onClick={handleSearch}
              disabled={loading}
            >
            {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Search'}
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex space-x-1">
          <button
            onClick={() => setDeveloperRoleSelected(!developerRoleSelected)}
            className={`btn ${developerRoleSelected ? 'btn-primary' : 'btn-outline'}`}
          >
            Developer
          </button>
          <button
            onClick={() => setUrcProviderRoleSelected(!urcProviderRoleSelected)}
            className={`btn ${urcProviderRoleSelected ? 'btn-primary' : 'btn-outline'}`}
          >
            URC Provider
          </button>
          <button
            onClick={() => setValueManagerRoleSelected(!valueManagerRoleSelected)}
            className={`btn ${valueManagerRoleSelected ? 'btn-primary' : 'btn-outline'}`}
          >
            V.Manager
          </button>
      </div>

      {/* List of result */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {filteredUsers.map((user) => (
          <div
            key={user.admin}
            onClick={() => handleCardClick(user)}
            className="pixel-box cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className=''>
                <div className='w-16 h-16 rounded-full overflow-hidden flex items-center justify-center'>
                  <img src={user.avatar ? user.avatar : DEFAULT_IMAGE} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              </div>
              <div>
                <h3 className="text-lg">{user.username ? user.username : generateDefaultUsername(user.admin)}</h3>
                <div className="text-sm">
                  <AddressDisplay address={user.admin} />
                </div>
              </div>
            </div>
            <div className="mt-2 text-sm">
              <div className='flex justify-between'>
                <div className='flex'>
                  <div className='mr-2 text-lg'>{user.totalFollowee}</div>
                  <div className='text-gray-500 mt-[5px]'>Followees</div>
                </div>
                <div className='flex'>
                  <div className='mr-2 text-lg'>{user.totalFollower}</div>
                  <div className='text-gray-500 mt-[5px]'>Followers</div>
                </div>
              </div>
              <div className='flex justify-between'>
                <div className='flex'>
                  <div className='mr-2 text-lg'>{user.totalLike}</div>
                  <div className='text-gray-500 mt-[5px]'>Likes</div>
                </div>
              </div>
              <div className='mt-2 flex flex-col-3 justify-between'>
              {(user.role as Role[]).map((roleName, index) => (
                <div key={index}>
                  {roleName === Role.ISSUER && <div className='flex'><div className='text-gray-500 mr-2'>Launched: </div><div className='text-lg -mt-1'>{(user.tokenCount as number[])[index]}</div></div>}
                  {roleName === Role.PROMOTER && <div className='flex'><div className='text-gray-500 mr-2'>Referred: </div><div className='text-lg -mt-1'>{(user.tokenCount as number[])[index]}</div></div>}
                  {roleName === Role.MANAGER && <div className='flex'><div className='text-gray-500 mr-2'>Managed: </div><div className='text-lg -mt-1'>{(user.tokenCount as number[])[index]}</div></div>}
                </div>
              ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
