import React, { useState, useEffect } from 'react';
import { useAuth } from '../../utils/contexts';
import { getUserProfileByWalletAddress, updateUserProfile, uploadAvatar } from '../../utils/user';
import { User } from '../../types/types';
import toast from 'react-hot-toast';
import { AddressDisplay } from '../common/AddressDisplay';
import { FaTelegramPlane, FaDiscord, FaTwitter, FaGithub, FaFacebook, FaInternetExplorer } from "react-icons/fa";
import { API_BASE_URI, API_URL } from '../../config/constants';

export const socialNames = ['website', 'twitter', 'telegram', 'discord', 'github', 'facebook']
export const socialIcons = {
  github: <FaGithub className='w-5 h-5' />,
  twitter: <FaTwitter className='w-5 h-5' />,
  telegram: <FaTelegramPlane className='w-5 h-5' />,
  discord: <FaDiscord className='w-5 h-5' />,
  facebook: <FaFacebook className='w-5 h-5' />,
  website: <FaInternetExplorer className='w-5 h-5' />,
}

export const MyProfile: React.FC = () => {
  const { token, walletAddress, handleLogin } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    socialLinks: {} as Record<string, string>,
    roles: [] as string[],
    avatarFile: null as File | null,
    avatarPreview: null as string | null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && walletAddress) {
      fetchUserData();
    }
  }, [token, walletAddress]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const result = await getUserProfileByWalletAddress(token as string, walletAddress as string);
      if(!result.success) {
        toast.error(result.message as string);
        return;
      }
      const socialLinks = result.data.social_links ? 
      Object.fromEntries(
        Object.entries(result.data.social_links).filter(([_, value]) => value !== "")
      ) as Record<string, string> : {};

      setUser({
        ...result.data,
        social_links: socialLinks,
      });

      const _formData = {
        username: result.data.username,
        email: result.data.email || '',
        bio: result.data.bio || '',
        socialLinks: socialLinks,
        roles: result.data.roles ? result.data.roles.split(',') : [],
        avatarFile: result.data.avatar ? new File([], result.data.avatar) : null,
        avatarPreview: result.data.avatar ? result.data.avatar : null,
      };
      setFormData(_formData);
    } catch (error: any) {
      toast.error(error.message as string);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialLinkChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [key]: value },
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, avatarFile: file, avatarPreview: previewUrl }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    console.log("formData", formData.avatarFile?.name);
    try {
      if (!formData.avatarFile?.name.startsWith(API_BASE_URI)) {
        const result = await uploadAvatar(token, formData.avatarFile as File);
        if (result.success) {
          console.log("avatar url: ", result.data.url);
        } else {
          toast.error(result.message as string);
          return;
        }
      }

      const result = await updateUserProfile(token, {
        username: formData.username,
        email: formData.email || null,
        bio: formData.bio || null,
        social_links: formData.socialLinks,
        roles: formData.roles.join(','),
      });
      if(!result.success) {
        toast.error(result.message as string);
        return;
      }
      if (formData.avatarPreview) {
        URL.revokeObjectURL(formData.avatarPreview);
      }
      await fetchUserData();
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return <div className="text-center text-gray-400">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center text-gray-400">Please log in to view your profile.</div>;
  }

  return (
    <div>
      {/* <div className='mb-1 font-semibold'>My Profile</div> */}
      {!token && (
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
      <div className="pixel-box">
        {/* User Info */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="">
            {user.avatar && !isEditing ? (
              <div className='w-16 h-16 rounded-full overflow-hidden flex items-center justify-center'>
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" onError={() => console.log('Image load failed')} />
              </div>
            ) : formData.avatarPreview ? (
              <div className='w-16 h-16 rounded-full overflow-hidden flex items-center justify-center'>
                <img src={formData.avatarPreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 pixel-avatar-round flex items-center justify-center text-2xl">
                {user.username[0].toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl">{user.username}</h2>
            <div className="text-md"><AddressDisplay address={user.wallet_address} /></div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn btn-secondary"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {/* Only read */}
        {!isEditing && (
          <div className="space-y-4">
            {/* <p><span className="font-semibold">Roles:</span> {user.roles ? user.roles.split(',').join(', ') : 'Not set'}</p> */}
            <div><span className="font-semibold">Email:</span> {user.email || 'Not set'}</div>
            <div><span className="font-semibold">Bio:</span> {user.bio || 'Not set'}</div>
            <div>
              <span className="font-semibold">Social Links:</span>
              {user.social_links && Object.keys(user.social_links).length > 0 ? (
                <ul className="list-disc pl-1 mt-2">
                  {Object.entries(user.social_links).map(([key, value]) => (
                    <li key={key} className='flex items-center space-x-3'>
                      <div>{socialIcons[key as keyof typeof socialIcons]}</div>
                      <a href={value as unknown as string} target='_blank' rel="noopener noreferrer" className="text-blue-400 hover:underline">{value}</a>
                    </li>
                  ))}
                </ul>
              ) : (
                ' Not set'
              )}
            </div>
            <p><span className="font-semibold">Joined at:</span> {new Date(user.created_at).toLocaleString()}</p>
            {/* <p><span className="font-semibold">Updated:</span> {new Date(user.updated_at).toLocaleString()}</p> */}
          </div>
        )}

        {/* Edit mode */}
        {isEditing && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold">Avatar</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleAvatarChange}
                className="w-full p-2 pixel-box"
              />
              {formData.avatarFile && (
                <p className="text-gray-400 text-sm mt-1">Selected: {formData.avatarFile.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="input w-full mt-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="input w-full mt-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className="input w-full mt-2 h-24 py-2 px-4"
                rows={3}
              />
            </div>
            {/* <div>
            <label className="block text-sm font-semibold">Roles</label>
            {['issuer', 'promoter', 'manager', 'participant'].map((roles) => (
              <label key={roles} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.roles.includes(roles)}
                  onChange={() => handleRoleChange(roles)}
                  className="text-blue-600"
                />
                <span>{roles.charAt(0).toUpperCase() + roles.slice(1)}</span>
              </label>
            ))}
          </div> */}
            <div>
              <label className="block text-sm font-semibold">Social Links</label>
              {socialNames.map((key) => (
                <div key={key} className="flex items-center space-x-2 mt-2">
                  <div className="flex w-6 items-center gap-2">{socialIcons[key as keyof typeof socialIcons]}</div>
                  <div className="w-32">{key}</div>
                  <input
                    type="url"
                    value={formData.socialLinks[key] || ''}
                    onChange={(e) => handleSocialLinkChange(key, e.target.value)}
                    className="input w-full"
                  />
                </div>
              ))}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};