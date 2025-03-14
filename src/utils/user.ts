import axios from 'axios';
import { USER_API_URL } from '../config/constants';
import { Activity, OrderedUser, User, Comment, OrderedToken, UserAPIResponse, FAQ } from '../types/types';

type AuthResponse = {
  success: boolean;
  token: string;
}

export const loadFAQs = async (token: string): Promise<UserAPIResponse> => {
  // TODO: load faqs from server
  console.log("loading faqs from server");
  try {
    const response = await axios.get(`${USER_API_URL}/faqs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message as string
    }
  }
}

export const login = async (walletAddress: string, signature: string, message: string): Promise<AuthResponse> => {
  const response = await axios.post(`${USER_API_URL}/login`, {
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
  const response = await axios.post(`${USER_API_URL}/register`, {
    wallet_address: walletAddress,
    username,
    roles,
    signature,
    message,
  });
  return response.data;
};

export const followUser = async (token: string, followeeId: number): Promise<UserAPIResponse> => {
  try {
    const response = await axios.post(
      `${USER_API_URL}/follow`,
      { target_id: followeeId.toString(), target_type: 'user' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return {
      success: true,
      data: response.data
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message,
    }
  }
};

export const followToken = async (token: string, followeeId: string): Promise<UserAPIResponse> => {
  try {
    const response = await axios.post(
      `${USER_API_URL}/follow`,
      { target_id: followeeId, target_type: 'token' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return {
      success: true,
      data: response.data
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message,
    }
  }
};

export const unfollowUser = async (token: string, followeeId: number): Promise<UserAPIResponse> => {
  try {
    const response = await axios.post(
      `${USER_API_URL}/unfollow`,
      { target_id: followeeId.toString(), target_type: 'user' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return {
      success: true,
      data: response.data
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message,
    }
  }
};

export const unfollowToken = async (token: string, followeeId: string): Promise<UserAPIResponse> => {
  try {
    const response = await axios.post(
      `${USER_API_URL}/unfollow`,
      { target_id: followeeId, target_type: 'token' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return {
      success: true,
      data: response.data
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message,
    }
  }
};

export const likeUser = async (token: string, likeeId: number): Promise<UserAPIResponse> => {
  try {
    const response = await axios.post(
      `${USER_API_URL}/like`,
      { target_id: likeeId.toString(), target_type: 'user' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return {
      success: true,
      data: response.data
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message,
    }
  }
}

export const likeToken = async (token: string, likeeId: string): Promise<UserAPIResponse> => {
  try {
    const response = await axios.post(
      `${USER_API_URL}/like`,
      { target_id: likeeId, target_type: 'token' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return {
      success: true,
      data: response.data
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message,
    }
  }
}

export const unlikeUser = async (token: string, unlikeeId: number): Promise<UserAPIResponse> => {
  try {
    const response = await axios.post(
      `${USER_API_URL}/unlike`,
      { target_id: unlikeeId.toString(), target_type: 'user' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return {
      success: true,
      data: response.data
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message,
    }
  }
}

export const unlikeToken = async (token: string, unlikeeId: string): Promise<UserAPIResponse> => {
  try {
    const response = await axios.post(
      `${USER_API_URL}/unlike`,
      { target_id: unlikeeId, target_type: 'token' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return {
      success: true,
      data: response.data
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message,
    }
  }
}

export const getFollowing = async (token: string): Promise<UserAPIResponse> => {
  try {
    const response = await axios.get(`${USER_API_URL}/following`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return {
      success: true,
      data: response.data as User[],
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message,
    }
  }
};

export const isRegistered = async (walletAddress: string): Promise<UserAPIResponse> => {
  try {
    const response = await axios.get(`${USER_API_URL}/isregistered`, {
      params: { wallet_address: walletAddress },
    });
    return {
      success: true,
      data: {
        isRegistered: response.data.isRegistered,
      },
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message,
    }
  }
};

export const getActivities = async (token: string, max: number = 20): Promise<UserAPIResponse> => {
  try {
    const response = await axios.get(`${USER_API_URL}/activities`, {
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
    return {
      success: true,
      data: result as Activity[],
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message,
    }
  }
};

export const updateUserProfile = async (token: string, data: any): Promise<UserAPIResponse> => {
  try {
    await axios.post(`${USER_API_URL}/update-profile`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return {
      success: true,
      data: {}
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message,
    }
  }
};

export const getUserProfileByWalletAddress = async (token: string, walletAddress: string): Promise<UserAPIResponse> => {
  try {
    const response = await axios.get(`${USER_API_URL}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { wallet_address: walletAddress },
    });
    return {
      success: true,
      data: response.data.user as User
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message as string
    }
  }
};

export const getUserProfileByUserId = async (token: string, id: string): Promise<UserAPIResponse> => {
  try {
    const response = await axios.get(`${USER_API_URL}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { id },
    });
    return {
      success: true,
      data: response.data.user as User
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message as string
    }
  }
};

export const uploadAvatar = async (token: string, file: File): Promise<UserAPIResponse> => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await axios.post(`${USER_API_URL}/upload-avatar`, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return {
      success: true,
      data: response.data
    };  
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message as string
    }
  }
};

// ============== Users list API ==================
export const getDevelopers = async (token: string, limit: number = 20): Promise<UserAPIResponse> => {
  try {
    const response = await axios.get(`${USER_API_URL}/get-developers`, {
      params: { limit },
      headers: { Authorization: `Bearer ${token}` },
    });
    return {
      success: true,
      data: response.data.users as OrderedUser[]
    };  
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message as string
    }
  }
};

export const getReferrals = async (token: string, limit: number = 20): Promise<UserAPIResponse> => {
  try {
    const response = await axios.get(`${USER_API_URL}/get-referrers`, {
      params: { limit },
      headers: { Authorization: `Bearer ${token}` },
    });
    return {
      success: true,
      data: response.data.users as OrderedUser[]
    };  
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message as string
    }
  }
};

export const getValueManagers = async (token: string, limit: number = 20): Promise<UserAPIResponse> => {
  try {
    const response = await axios.get(`${USER_API_URL}/get-value-managers`, {
      params: { limit },
      headers: { Authorization: `Bearer ${token}` },
    });
    return {
      success: true,
      data: response.data.users as OrderedUser[]
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message as string
    }
  }
};

export const getSearchByKey = async (token: string, key: string, limit: number = 20): Promise<UserAPIResponse> => {
  try {
    const response = await axios.get(`${USER_API_URL}/search-by`, {
      params: { key, limit },
      headers: { Authorization: `Bearer ${token}` },
    });
    return {
      success: true,
      data: response.data.users as OrderedUser[]
    }  
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message,
    }
  }
};

// ============== Token API ================
export const getTokenDataByMint = async (token: string, mint: string): Promise<UserAPIResponse> => {
  try {
    const response = await axios.get(`${USER_API_URL}/token`, {
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
    return {
      success: true,
      data: result as OrderedToken
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message,
    }
  }
};

// ============== Comment API ==================
export const commentUser = async (token: string, targetId: number, content: string,  parentId: number | null): Promise<UserAPIResponse> => {
  try {
    const response = await axios.post(`${USER_API_URL}/comment`, 
      { target_id: targetId.toString(), target_type: 'user', content, parent_id: parentId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return {
      success: true,
      data: response.data // comment_id, user
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message,
    }
  }
}

export const commentToken = async (token: string, targetId: string, content: string,  parentId: number | null): Promise<UserAPIResponse> => {
  try {
    const response = await axios.post(`${USER_API_URL}/comment`, 
      { target_id: targetId, target_type: 'token', content, parent_id: parentId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return {
      success: true,
      data: response.data // comment_id
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message,
    }
  }
}

export const deleteCommentUser = async (token: string, commentId: number, replyId: number | null, targetId: number): Promise<UserAPIResponse> => {
  try {
    const response = await axios.post(`${USER_API_URL}/delete_comment`, 
      { comment_id: commentId, target_type: 'user', reply_id: replyId, target_id: targetId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return {
      success: true,
      data: response.data
    }  
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message,
    }
  }
}

export const deleteCommentToken = async (token: string, commentId: number, replyId: number | null, targetId: string): Promise<UserAPIResponse> => {
  try {
    const response = await axios.post(`${USER_API_URL}/delete_comment`, 
    { comment_id: commentId, target_type: 'token', reply_id: replyId, target_id: targetId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return {
    success: true,
    data: response.data
  }
} catch (error: any) {
  return {
    success: false,
    message: error.response?.data?.message,
  }
}
}

export const getCommentsUser = async (token: string, targetId: number, parentId: number | null, limit: number = 10, offset: number = 0): Promise<UserAPIResponse> => {
  try {
    const response = await axios.get(`${USER_API_URL}/get_comments`, {
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
    return {
      success: true,
      data: result as Comment[],
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message,
    }
  }
}

export const getCommentsToken = async (token: string, targetId: string, parentId: number | null, limit: number = 10, offset: number = 0): Promise<UserAPIResponse> => {
  try {
    const response = await axios.get(`${USER_API_URL}/get_comments`, {
      params: { target_id: targetId, target_type: 'token', parent_id: parentId, limit, offset },
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
    return {
      success: true,
      data: result as Comment[],
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message,
    }
  }
}

export const likeCommentUser = async (token: string, commentId: number, targetId: number) : Promise<UserAPIResponse> => {
  try {
    const response = await axios.post(`${USER_API_URL}/like_comment`, 
      { comment_id: commentId, target_type: "user", target_id: targetId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return {
      success: true,
      data: response.data,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message,
    }
  }
}

export const likeCommentToken = async (token: string, commentId: number, targetId: string) : Promise<UserAPIResponse> => {
  try {
    const response = await axios.post(`${USER_API_URL}/like_comment`, 
      { comment_id: commentId, target_type: 'token', target_id: targetId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return {
      success: true,
      data: response.data,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message,
    }
  }
}

export const unlikeCommentUser = async (token: string, commentId: number, targetId: number) : Promise<UserAPIResponse> => {
  try {
    const response = await axios.post(`${USER_API_URL}/unlike_comment`, 
      { comment_id: commentId, target_type: "user", target_id: targetId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return {
      success: true,
      data: response.data,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message,
    }
  }
}

export const unlikeCommentToken = async (token: string, commentId: number, targetId: string): Promise<UserAPIResponse> => {
  try {
    const response = await axios.post(`${USER_API_URL}/unlike_comment`, 
      { comment_id: commentId, target_type: 'token', target_id: targetId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return {
      success: true,
      data: response.data,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message,
    }
  }
}
