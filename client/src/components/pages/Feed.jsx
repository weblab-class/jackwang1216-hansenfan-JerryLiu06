import React, { useState, useEffect } from "react";
import { get, post as apiPost } from "../../utilities";
import { Image as ImageIcon, Heart, MessageCircle, Share2, Calendar, Trophy, X } from "lucide-react";
import NavBar from "../modules/NavBar.jsx";

const PostCard = ({ post, onLike, onComment, userId }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const formattedDate = new Date(post.timestamp).toLocaleDateString();
  const isLiked = post.likes && post.likes.includes(userId);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      const response = await apiPost(`/api/posts/${post._id}/like`);
      if (onLike) onLike(post._id, response.likes);
    } catch (err) {
      console.error("Error liking post:", err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isCommenting) return;

    setIsCommenting(true);
    try {
      const response = await apiPost(`/api/posts/${post._id}/comment`, { content: newComment });
      if (onComment) onComment(post._id, response.comments);
      setNewComment("");
    } catch (err) {
      console.error("Error commenting on post:", err);
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <>
      <div className="relative group">
        <div className="absolute -inset-px bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl opacity-70 blur group-hover:opacity-100 transition-opacity" />
        <div className="relative bg-[#12141A] rounded-xl border border-white/10 overflow-hidden">
          {/* Post Header */}
          <div className="p-4 flex items-center space-x-3 border-b border-white/10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
              {post.creator_name[0]}
            </div>
            <div>
              <h3 className="font-medium text-white">{post.creator_name}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="p-4 space-y-4">
            <p className="text-gray-200">{post.content}</p>
            {post.imageUrl && (
              <div className="relative h-64 rounded-lg overflow-hidden cursor-pointer" onClick={() => setShowImageModal(true)}>
                <img
                  src={post.imageUrl}
                  alt="Post content"
                  className="absolute inset-0 w-full h-full object-cover hover:opacity-90 transition-opacity"
                />
              </div>
            )}
          </div>

          {/* Post Actions */}
          <div className="px-4 py-3 border-t border-white/10 flex items-center space-x-6">
            <button 
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center space-x-2 transition-colors ${
                isLiked ? "text-pink-400" : "text-gray-400 hover:text-pink-400"
              } ${isLiking ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              <span>{post.likes ? post.likes.length : 0}</span>
            </button>
            <button 
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments ? post.comments.length : 0}</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="px-4 py-3 border-t border-white/10 space-y-4">
              {/* Comment Form */}
              <form onSubmit={handleComment} className="flex space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-2 bg-white/5 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || isCommenting}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post
                </button>
              </form>

              {/* Comments List */}
              <div className="space-y-3">
                {post.comments && post.comments.map((comment, index) => (
                  <div key={index} className="flex space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm">
                      {comment.creator_name[0]}
                    </div>
                    <div className="flex-1 bg-white/5 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">{comment.creator_name}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(comment.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {showImageModal && (
        <ImageModal
          imageUrl={post.imageUrl}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </>
  );
};

const ImageModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="relative w-full h-full flex items-center justify-center">
        <img
          src={imageUrl}
          alt="Enlarged view"
          className="max-w-full max-h-full object-contain"
          onClick={(e) => e.stopPropagation()}
          style={{ maxHeight: 'calc(100vh - 2rem)' }}
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

const NewPostForm = ({ onSubmit }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState("");

  useEffect(() => {
    // Fetch completed challenges when component mounts
    const loadCompletedChallenges = async () => {
      try {
        const challenges = await get("/api/challenges/completed");
        setCompletedChallenges(challenges);
      } catch (err) {
        console.error("Error loading completed challenges:", err);
      }
    };
    loadCompletedChallenges();
  }, []);

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !image || !selectedChallenge) return;

    setIsSubmitting(true);
    try {
      const imageUrl = await convertToBase64(image);
      const challenge = completedChallenges.find(c => c._id === selectedChallenge);
      await onSubmit({ 
        content, 
        imageUrl, 
        challenge: selectedChallenge,
        challengeTitle: challenge.title
      });
      setContent("");
      setImage(null);
      setSelectedChallenge("");
    } catch (err) {
      console.error("Error creating post:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#12141A] rounded-xl border border-white/10 p-4 space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your boldness..."
          className="w-full px-4 py-3 bg-white/5 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          rows="3"
        />
        <div className="space-y-3">
          <select
            value={selectedChallenge}
            onChange={(e) => setSelectedChallenge(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          >
            <option value="">Select a completed challenge</option>
            {completedChallenges.map((challenge) => (
              <option key={challenge._id} value={challenge._id}>
                {challenge.title}
              </option>
            ))}
          </select>
          {!selectedChallenge && content.trim() && (
            <p className="text-yellow-500 text-sm">Please select a challenge for your post</p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => document.getElementById("image-input").click()}
            className={`flex items-center space-x-2 px-4 py-2 ${
              image ? 'bg-purple-500/20 text-purple-300' : 'bg-white/5 text-gray-400'
            } rounded-lg hover:bg-white/10 transition-colors`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>{image ? 'Image Selected' : 'Add Image (Required)'}</span>
          </button>
          <button
            type="submit"
            disabled={!content.trim() || !image || !selectedChallenge || isSubmitting}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Post
          </button>
        </div>
        <input
          id="image-input"
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="hidden"
          required
        />
        {!image && content.trim() && (
          <p className="text-yellow-500 text-sm">Please add an image to your post</p>
        )}
      </form>
      {image && (
        <div className="relative h-32 rounded-lg overflow-hidden">
          <img
            src={URL.createObjectURL(image)}
            alt="Upload preview"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <button
            onClick={() => setImage(null)}
            className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    get("/api/whoami").then((user) => {
      if (user._id) {
        setUserId(user._id);
      }
    });
    loadPosts();
  }, []);

  const loadPosts = () => {
    get("/api/posts").then((postsObjs) => {
      setPosts(postsObjs);
    });
  };

  const handleNewPost = async (post) => {
    try {
      await apiPost("/api/post", post);
      loadPosts();
    } catch (err) {
      console.error("Error creating post:", err);
    }
  };

  const handleLike = (postId, newLikes) => {
    setPosts(currentPosts =>
      currentPosts.map(post =>
        post._id === postId
          ? { ...post, likes: newLikes }
          : post
      )
    );
  };

  const handleComment = (postId, newComments) => {
    setPosts(currentPosts =>
      currentPosts.map(post =>
        post._id === postId
          ? { ...post, comments: newComments }
          : post
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0B0F] pt-16">
      <NavBar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <NewPostForm onSubmit={handleNewPost} />
        <div className="space-y-6 mt-8">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              userId={userId}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Feed;
