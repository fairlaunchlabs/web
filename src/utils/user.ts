import axios from 'axios';
import { API_URL } from '../config/constants';
import { Activity, OrderedUser, User, Comment, OrderedToken } from '../types/types';

type AuthResponse = {
  success: boolean;
  token: string;
}

export const login = async (walletAddress: string, signature: string, message: string): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/user/login`, {
    wallet_address: walletAddress,
    signature,
    message,
  });
  return response.data;
};

export const register = async (
  walletAddress: string,
  username: string,
  roles: string,
  signature: string,
  message: string
): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/user/register`, {
    wallet_address: walletAddress,
    username,
    roles,
    signature,
    message,
  });
  return response.data;
};

export const followUser = async (token: string, followeeId: number): Promise<{success: boolean, message?: string}> => {
  const response = await axios.post(
    `${API_URL}/user/follow`,
    { target_id: followeeId.toString(), target_type: 'user' },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const followToken = async (token: string, followeeId: string): Promise<{success: boolean, message?: string}> => {
  const response = await axios.post(
    `${API_URL}/user/follow`,
    { target_id: followeeId, target_type: 'token' },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const unfollowUser = async (token: string, followeeId: number): Promise<{success: boolean, message?: string}> => {
  const response = await axios.post(
    `${API_URL}/user/unfollow`,
    { target_id: followeeId.toString(), target_type: 'user' },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const unfollowToken = async (token: string, followeeId: string): Promise<{success: boolean, message?: string}> => {
  const response = await axios.post(
    `${API_URL}/user/unfollow`,
    { target_id: followeeId, target_type: 'token' },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const likeUser = async (token: string, likeeId: number): Promise<{success: boolean, message?: string}> => {
  const response = await axios.post(
    `${API_URL}/user/like`,
    { target_id: likeeId.toString(), target_type: 'user' },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

export const likeToken = async (token: string, likeeId: string): Promise<{success: boolean, message?: string}> => {
  const response = await axios.post(
    `${API_URL}/user/like`,
    { target_id: likeeId, target_type: 'token' },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

export const unlikeUser = async (token: string, unlikeeId: number): Promise<{success: boolean, message?: string}> => {
  const response = await axios.post(
    `${API_URL}/user/unlike`,
    { target_id: unlikeeId.toString(), target_type: 'user' },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

export const unlikeToken = async (token: string, unlikeeId: string): Promise<{success: boolean, message?: string}> => {
  const response = await axios.post(
    `${API_URL}/user/unlike`,
    { target_id: unlikeeId, target_type: 'token' },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

export const getFollowing = async (token: string): Promise<User[]> => {
  const response = await axios.get(`${API_URL}/user/following`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const isRegistered = async (walletAddress: string): Promise<boolean> => {
  const response = await axios.get(`${API_URL}/user/isregistered`, {
    params: { wallet_address: walletAddress },
  });
  return response.data.isRegistered;
};

export const getActivities = async (token: string, max: number = 20): Promise<Activity[]> => {
  const response = await axios.get(`${API_URL}/user/activities`, {
    params: { max },
    headers: { Authorization: `Bearer ${token}` },
  });
  const result: Activity[] = [];
  for (const activity of response.data.activities) {
    result.push({
      id: activity.id,
      targetId: activity.target_id,
      targetType: activity.target_type,
      targetUsername: activity.target_username,
      targetWalletAddress: activity.target_wallet_address,
      userUsername: activity.user_username,
      userWalletAddress: activity.user_wallet_address,
      activityType: activity.activity_type,
      userId: activity.user_id,
      avatar: activity.avatar,
      content: activity.content,
      createdAt: activity.created_at,
    })
  }
  return result;
};

export const updateUserProfile = async (token: string, data: any): Promise<void> => {
  await axios.post(`${API_URL}/user/update-profile`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getUserProfileByWalletAddress = async (token: string, walletAddress: string): Promise<User> => {
  const response = await axios.get(`${API_URL}/user/user`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { wallet_address: walletAddress },
  });
  return response.data.user;
};

export const getUserProfileByUserId = async (token: string, id: string): Promise<User> => {
  const response = await axios.get(`${API_URL}/user/user`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { id },
  });
  return response.data.user;
};

export const uploadAvatar = async (token: string, file: File): Promise<{ success: boolean; message: string; url: string }> => {
  const formData = new FormData();
  formData.append('avatar', file);
  const response = await axios.post(`${API_URL}/user/upload-avatar`, formData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// ============== Users list API ==================
export const getDevelopers = async (token: string, limit: number = 20): Promise<OrderedUser[]> => {
  const response = await axios.get(`${API_URL}/user/get-developers`, {
    params: { limit },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.users;
};

export const getReferrals = async (token: string, limit: number = 20): Promise<OrderedUser[]> => {
  const response = await axios.get(`${API_URL}/user/get-referrers`, {
    params: { limit },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.users;
};

export const getValueManagers = async (token: string, limit: number = 20): Promise<OrderedUser[]> => {
  const response = await axios.get(`${API_URL}/user/get-value-managers`, {
    params: { limit },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.users;
};

export const getSearchByKey = async (token: string, key: string, limit: number = 20): Promise<OrderedUser[]> => {
  const response = await axios.get(`${API_URL}/user/search-by`, {
    params: { key, limit },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.users;
};

// ============== Token API ================
export const getTokenDataByMint = async (token: string, mint: string): Promise<OrderedToken> => {
  const response = await axios.get(`${API_URL}/user/token`, {
    params: { mint },
    headers: { Authorization: `Bearer ${token}` },
  });
  const orderedToken = response.data.tokens[0];
  const result = {
    mint: orderedToken.mint,
    admin: orderedToken.admin,
    userId: orderedToken.user_id,
    isFollowedByMe: orderedToken.is_followed_by_me,
    isLikedByMe: orderedToken.is_liked_by_me,
    tokenName: orderedToken.token_name,
    tokenSymbol: orderedToken.token_symbol,
    tokenUri: orderedToken.token_uri,
    timestamp: orderedToken.timestamp,
    totalFollowee: orderedToken.total_followee,
    totalLike: orderedToken.total_like,
    totalComments: orderedToken.total_comments,
    valueManager: orderedToken.value_manager,
  } as OrderedToken;
  return result;
};

// ============== Comment API ==================
export const commentUser = async (token: string, targetId: number, content: string,  parentId: number | null) => {
  const response = await axios.post(`${API_URL}/user/comment`, 
    { target_id: targetId.toString(), target_type: 'user', content, parent_id: parentId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data; // comment_id, user
}

export const commentToken = async (token: string, targetId: string, content: string,  parentId: number | null) => {
  const response = await axios.post(`${API_URL}/user/comment`, 
    { target_id: targetId, target_type: 'token', content, parent_id: parentId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data; // comment_id
}

export const deleteCommentUser = async (token: string, commentId: number, replyId: number | null, targetId: number) => {
  const response = await axios.post(`${API_URL}/user/delete_comment`, 
    { comment_id: commentId, target_type: 'user', reply_id: replyId, target_id: targetId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

export const deleteCommentToken = async (token: string, commentId: number, replyId: number | null, targetId: string) => {
  const response = await axios.post(`${API_URL}/user/delete_comment`, 
    { comment_id: commentId, target_type: 'token', reply_id: replyId, target_id: targetId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

export const getCommentsUser = async (token: string, targetId: number, parentId: number | null, limit: number = 10, offset: number = 0): Promise<Comment[]> => {
  console.log(token, targetId, parentId, limit, offset)
  const response = await axios.get(`${API_URL}/user/get_comments`, {
    params: { target_id: targetId.toString(), target_type: 'user', parent_id: parentId, limit, offset },
    headers: { Authorization: `Bearer ${token}` },
  });
  const comments = response.data.comments;
  const result = new Array<Comment>();
  for (let i = 0; i < comments.length; i++) {
    result.push({
      id: comments[i].id,
      username: comments[i].username,
      avatar: comments[i].avatar,
      content: comments[i].content,
      likes: comments[i].likes,
      liked: comments[i].liked,
      createdAt: comments[i].created_at,
      userId: comments[i].user_id,
      walletAddress: comments[i].wallet_address,
      totalReplies: comments[i].total_replies,
    })
  }
  return result as Comment[];
}

export const getCommentsToken = async (token: string, targetId: string, parentId: number | null, limit: number = 10, offset: number = 0): Promise<Comment[]> => {
  console.log(token, targetId, parentId, limit, offset)
  const response = await axios.get(`${API_URL}/user/get_comments`, {
    params: { target_id: targetId, target_type: 'token', parent_id: parentId, limit, offset },
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("response", response);
  const comments = response.data.comments;
  const result = new Array<Comment>();
  for (let i = 0; i < comments.length; i++) {
    result.push({
      id: comments[i].id,
      username: comments[i].username,
      avatar: comments[i].avatar,
      content: comments[i].content,
      likes: comments[i].likes,
      liked: comments[i].liked,
      createdAt: comments[i].created_at,
      userId: comments[i].user_id,
      walletAddress: comments[i].wallet_address,
      totalReplies: comments[i].total_replies,
    })
  }
  return result as Comment[];
}

export const likeCommentUser = async (token: string, commentId: number, targetId: number) => {
  const response = await axios.post(`${API_URL}/user/like_comment`, 
    { comment_id: commentId, target_type: "user", target_id: targetId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

export const likeCommentToken = async (token: string, commentId: number, targetId: string) => {
  const response = await axios.post(`${API_URL}/user/like_comment`, 
    { comment_id: commentId, target_type: 'token', target_id: targetId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

export const unlikeCommentUser = async (token: string, commentId: number, targetId: number) => {
  const response = await axios.post(`${API_URL}/user/unlike_comment`, 
    { comment_id: commentId, target_type: "user", target_id: targetId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

export const unlikeCommentToken = async (token: string, commentId: number, targetId: string) => {
  const response = await axios.post(`${API_URL}/user/unlike_comment`, 
    { comment_id: commentId, target_type: 'token', target_id: targetId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}
