import React, { useState, useEffect, useRef } from "react";
import { Comment, OrderedUser, OrderedToken } from "../../types/types";
import { commentUser, deleteCommentUser, deleteCommentToken, getCommentsUser, getCommentsToken, likeCommentUser, unlikeCommentUser, likeCommentToken, unlikeCommentToken, commentToken } from "../../utils/user";
import { formatDistanceToNow } from 'date-fns';
import toast from "react-hot-toast";
import { useAuth, useDeviceType } from "../../utils/contexts";

type CommentBoxProps = {
  setIsOpen: (isOpen: boolean) => void;
  token: string;
  orderedData: OrderedUser | OrderedToken;
  type: "user" | "token";
  expanded: boolean;
}

export const CommentBox: React.FC<CommentBoxProps> = ({ 
  setIsOpen,
  token,
  orderedData,
  type,
  expanded
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [newReply, setNewReply] = useState("");
  const [sendCommentLoading, setSendCommentLoading] = useState(false);
  const [sendReplyLoading, setSendReplyLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialLoaded = useRef(false);
  const { walletAddress } = useAuth();

  const loadMoreComments = async () => {
    console.log("nextPage", page)
    const result = type === "user" ? 
      await getCommentsUser(token, (orderedData as OrderedUser).userId as number, null, 10, page * 10) : 
      await getCommentsToken(token, (orderedData as OrderedToken).mint as string, null, 10, page * 10);
    if(!result.success) {
      toast.error(result.message as string);
      return;
    }
    setComments((prev) => [...prev, ...result.data as Comment[]]);
    const nextPage = page + 1;
    setPage(nextPage);
    if (nextPage >= 5) setHasMore(false); // TODO: handle loading more
  };

  const handleScroll = () => {
    if (!containerRef.current || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      console.log("=== loadMoreComments ===")
      loadMoreComments();
    }
  };

  useEffect(() => {
    if(!initialLoaded.current) {
      initialLoaded.current = true;
      loadMoreComments();
    }
  }, [])

  // Listen scrolling
  useEffect(() => {
    const container = containerRef.current;
    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, [page, hasMore]);

  // Toggle like
  const toggleLike = async (commentId: number | string, isReply: boolean = false) => {
    const currentLike = comments.find((comment) => comment.id === commentId)?.liked;
    let result;
    if (!currentLike) {
      result = type === 'user' ? 
        await likeCommentUser(token, commentId as number, (orderedData as OrderedUser).userId as number) : 
        await likeCommentToken(token, commentId as number, (orderedData as OrderedToken).mint as string);
    } else {
      result = type === 'user' ? 
      await unlikeCommentUser(token, commentId as number, (orderedData as OrderedUser).userId as number) : 
      await unlikeCommentToken(token, commentId as number, (orderedData as OrderedToken).mint as string);
    }

    if (!result.success) {
      toast.error(result.message as string);
      return;
    }

    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            liked: !comment.liked,
            likes: comment.liked ? comment.likes - 1 : comment.likes + 1,
          };
        }
        if (isReply && comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply.id === commentId
                ? {
                    ...reply,
                    liked: !reply.liked,
                    likes: reply.liked ? reply.likes - 1 : reply.likes + 1,
                  }
                : reply
            ),
          };
        }
        return comment;
      })
    );
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      return;
    }
    setSendCommentLoading(true);
    const result = type === 'user' ? 
      await commentUser(token, (orderedData as OrderedUser).userId as number, newComment, null):
      await commentToken(token, (orderedData as OrderedToken).mint as string, newComment, null);
    setSendCommentLoading(false);
    if(!result.success) {
      toast.error(result.message as string);
      setNewComment("");
      return;
    }

    const currentUser = result.data.user;
    setComments((prev) => [
      {
        id: parseInt(result.data.comment_id),
        userId: currentUser.user_id as number,
        username: currentUser.username as string,
        walletAddress: currentUser.wallet_address as string,
        avatar: currentUser.avatar as string,
        content: newComment,
        createdAt: new Date().toISOString(),
        likes: 0,
        liked: false,
        totalReplies: 0,
        replies: [],
      },
      ...prev,
    ]);
    setNewComment("");
  };

  const handleReplySubmit = async (e: React.FormEvent, commentId: number) => {
    e.preventDefault();
    if (!newReply.trim()) {
      setReplyTo(null);
      return;
    }

    setSendReplyLoading(true);
    const result = type === 'user' ? 
      await commentUser(token, (orderedData as OrderedUser).userId as number, newReply, commentId):
      await commentToken(token, (orderedData as OrderedToken).mint as string, newReply, commentId);
    setSendReplyLoading(false);
    if(!result.success) {
      toast.error(result.message as string);
      setReplyTo(null);
      setNewReply("");
      return;
    }
    const currentUser = result.data.user;
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              totalReplies: comment.totalReplies + 1,
              replies: [
                {
                  id: parseInt(result.data.comment_id),
                  userId: currentUser.user_id as number,
                  username: currentUser.username as string,
                  walletAddress: currentUser.wallet_address as string,
                  avatar: currentUser.avatar as string,
                  content: newReply,
                  createdAt: new Date().toISOString(),
                  likes: 0,
                  totalReplies: 0,
                  liked: false,
                },
                ...(comment.replies || []),
              ],
            }
          : comment
      )
    );
    setNewReply("");
    setReplyTo(null);
  };

  const deleteComment = async (commentId: number, replyId: number | null) => {
    const result = type === 'user' ? 
      await deleteCommentUser(token, commentId, replyId, (orderedData as OrderedUser).userId as number):
      await deleteCommentToken(token, commentId, replyId, (orderedData as OrderedToken).mint as string);
    if(!result.success) {
      toast.error(result.message as string);
      return;
    }

    if (replyId === null) {
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    } else {
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                totalReplies: comment.totalReplies - 1,
                replies: comment.replies?.filter((reply) => reply.id !== replyId),
              }
            : comment
        )
      );
    }
  }

  const openReply = async (commentId: number) => {
    const result = type === 'user' ? 
      await getCommentsUser(token, (orderedData as OrderedUser).userId as number, commentId, 0, 0): // return all records
      await getCommentsToken(token, (orderedData as OrderedToken).mint as string, commentId, 0, 0);
    if(!result.success) {
      toast.error(result.message as string);
      return;
    }
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              replies: [
                ...comment.replies || [],
                ...result.data as Comment[],
              ],
            }
          : comment
      )
    );
  };

  const closeReply = (commentId: number) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              replies: [],
            }
          : comment
      )
    );
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black ${expanded ? 'md:left-64' : 'md:left-20'}`}>
      <div className="flex justify-end text-2xl mr-3 mt-1 cursor-pointer" onClick={() => setIsOpen(false)}>x</div>

      <div>
        <form onSubmit={handleCommentSubmit} className="join flex mb-4 px-3">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full input mt-2 join-item"
          />
          <button
            type="submit"
            className="mt-2 btn btn-secondary join-item"
            disabled={sendCommentLoading}
          >
            Send
          </button>
        </form>
      </div>

      <div ref={containerRef} className="space-y-4 max-h-96 h-96 overflow-y-auto px-3">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-2">
            {/* Root comments */}
            <div className="flex space-x-3">
              <img
                src={comment.avatar}
                alt={comment.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex gap-2 text-sm font-semibold">
                  <div className="text-gray-400">{comment.username}</div>
                  {comment.walletAddress === orderedData.admin && <div className="text-blue-400">Host</div>}
                  {comment.walletAddress === walletAddress && <div className="text-blue-400">You</div>}
                  <div className="text-gray-300">@{formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                  })}
                  </div>
                </div>
                <div className="text-sm">{comment.content}</div>
                <div className="flex justify-between mt-1 text-xs text-gray-400">
                  <div className="flex space-x-3">                    
                    {comment.replies && comment.replies?.length > 0 ? 
                    <button onClick={() => closeReply(comment.id)}>
                      Hide replies |
                    </button> : 
                    comment.totalReplies ? <button onClick={() => openReply(comment.id)}>
                      Show {comment.totalReplies} replies |
                    </button> : ''
                    }
                    <button onClick={() => window.open(`/social-user-details/${comment.walletAddress}`, "_blank")}>
                      Visit
                    </button>
                  </div>

                  <div className="flex space-x-3 mr-3 -mt-1.5">
                    <button
                      onClick={() => toggleLike(comment.id, false)}
                      className={`flex items-center space-x-1 ${
                        comment.liked ? "text-red-500" : "text-gray-400"
                      }`}
                    >
                      <div className="text-xl">{comment.liked ? "♥" : "♡"}</div>
                      <div className="">{comment.likes}</div>
                    </button>
                    {walletAddress === comment.walletAddress && <button
                      onClick={() => deleteComment(comment.id, null)}
                      className="hover:underline text-black"
                    >
                      <svg fill="none" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M16 2v4h6v2h-2v14H4V8H2V6h6V2h8zm-2 2h-4v2h4V4zm0 4H6v12h12V8h-4zm-5 2h2v8H9v-8zm6 0h-2v8h2v-8z" fill="currentColor"/> </svg>
                    </button>}
                    <button
                      onClick={() => replyTo ? setReplyTo(null) : setReplyTo(comment.id as number)}
                      className="hover:underline text-black"
                    >
                      {replyTo ? 
                      <svg fill="none" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M20 2H2v20h2V4h16v12H6v2H4v2h2v-2h16V2h-2zM6 7h12v2H6V7zm8 4H6v2h8v-2z" fill="currentColor"/> </svg> :
                      <svg fill="none" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M20 2H2v20h2V4h16v12H6v2H4v2h2v-2h16V2h-2z" fill="currentColor"/> </svg>
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Reply input */}
            {replyTo === comment.id && (
              <form
                onSubmit={(e) => handleReplySubmit(e, comment.id as number)}
                className="join flex pl-12"
              >
                <input
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder={`Reply to ${comment.username}...`}
                  className="w-full input join-item mb-3"
                />
                <button
                  type="submit"
                  className="btn btn-secondary join-item"
                  disabled={sendReplyLoading}
                >
                  Reply
                </button>
              </form>
            )}

            {/* Reply */}
            {comment.replies?.map((reply) => (
              <div key={reply.id} className="flex space-x-3 pl-12">
                <img
                  src={reply.avatar}
                  alt={reply.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex gap-2 text-sm font-semibold">
                    <div className="text-gray-400">{reply.username}</div>
                    {reply.walletAddress === orderedData.admin && <div className="text-blue-400">Host</div>}
                    {comment.walletAddress === walletAddress && <div className="text-blue-400">You</div>}
                    <div className="text-gray-300">@{formatDistanceToNow(new Date(reply.createdAt), {
                      addSuffix: true,
                    })}
                    </div>
                  </div>

                  <div className="text-sm">{reply.content}</div>
                  <div className="flex justify-between mt-1 text-xs text-gray-400 mr-3">
                    <button onClick={() => window.open(`/social-user-details/${reply.walletAddress}`, "_blank")}>
                      Visit
                    </button>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => toggleLike(reply.id, true)}
                        className={`flex items-center space-x-1 ${
                          reply.liked ? "text-red-500" : "text-gray-400"
                        }`}
                      >
                        <div className="text-xl">{reply.liked ? "♥" : "♡"}</div>
                        <div>{reply.likes}</div>
                      </button>
                      {walletAddress === reply.walletAddress && <button
                        onClick={() => deleteComment(comment.id, reply.id)}
                        className="hover:underline text-black"
                      >
                        <svg fill="none" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M16 2v4h6v2h-2v14H4V8H2V6h6V2h8zm-2 2h-4v2h4V4zm0 4H6v12h12V8h-4zm-5 2h2v8H9v-8zm6 0h-2v8h2v-8z" fill="currentColor"/> </svg>
                      </button>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
        {hasMore && (
          <p className="text-center text-gray-400 text-sm">Loading more...</p>
        )}
      </div>
    </div>
  );
};