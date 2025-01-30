import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { get, post as apiPost } from "../../utilities";
import { Link, useSearchParams } from "react-router-dom";
import {
  Image as ImageIcon,
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  Trophy,
  X,
  Hourglass,
  HelpCircle,
} from "lucide-react";
import NavBar from "../modules/NavBar.jsx";
import Tutorial from "../modules/Tutorial.jsx";
import LoadingSpinner from "../modules/LoadingSpinner.jsx";

const ChallengeModal = ({ challengeId, onClose }) => {
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChallenge = async () => {
      console.log("Fetching challenge with ID:", challengeId);
      try {
        const response = await get(`/api/challenge/${challengeId}`);
        console.log("Challenge API response:", response);
        if (!response) {
          console.error("No response from challenge API");
          setError("Failed to load challenge details - no response");
          return;
        }
        setChallenge(response);
        setError(null);
      } catch (err) {
        console.error("Error fetching challenge:", err);
        setError(`Failed to load challenge details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (challengeId) {
      console.log("Challenge ID present, fetching data...");
      setLoading(true);
      setError(null);
      fetchChallenge();
    } else {
      console.error("No challenge ID provided");
      setError("No challenge ID provided");
      setLoading(false);
    }
  }, [challengeId]);

  if (!challengeId) {
    console.log("No challengeId, returning null");
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="relative bg-[#12141A] rounded-xl p-6 max-w-lg w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-red-400 text-center py-8">{error}</div>
        ) : challenge ? (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">{challenge.title}</h2>
            <p className="text-gray-400 mb-6">{challenge.description}</p>
          </div>
        ) : (
          <div className="text-red-400 text-center py-8">Challenge data not found</div>
        )}
      </div>
    </div>
  );
};

const PostCard = ({ post, onLike, onComment, userId }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [fullContent, setFullContent] = useState(post.content);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const formattedDate = useMemo(() => new Date(post.timestamp).toLocaleDateString(), [post.timestamp]);

  // Lazy load image URL if post has an image
  useEffect(() => {
    if (post.hasImage && post.imageUrl && !imageUrl) {
      setImageLoading(true);
      setImageError(false);
      
      console.log("Loading image for post:", post._id);
      get(post.imageUrl)
        .then(response => {
          console.log("Image response:", response);
          if (response.imageUrl) {
            setImageUrl(response.imageUrl);
          } else {
            setImageError(true);
          }
        })
        .catch(err => {
          console.error("Error loading image:", err);
          setImageError(true);
        })
        .finally(() => {
          setImageLoading(false);
        });
    }
  }, [post.hasImage, post.imageUrl, post._id]);

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
      post.comments = response.comments; // Update post's comments directly
      if (onComment) onComment(post._id, response.comments);
      setNewComment("");
    } catch (err) {
      console.error("Error commenting on post:", err);
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <div className="bg-[#12141A] rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <Link to={`/profile/${post.creator_id}`} className="text-white font-semibold hover:text-purple-400 transition-colors">
            {post.creator_name}
          </Link>
          <p className="text-gray-400 text-sm">{formattedDate}</p>
        </div>
        {post.challengeTitle && (
          <button
            onClick={() => {
              console.log('Opening challenge modal for:', post.challenge);
              setShowChallengeModal(true);
            }}
            className="flex items-center text-sm text-blue-400 hover:text-blue-300"
          >
            <Trophy className="w-4 h-4 mr-1" />
            {post.challengeTitle}
          </button>
        )}
      </div>

      <p className="text-gray-200 mb-4 whitespace-pre-wrap">{fullContent}</p>

      {post.hasImage && (
        <div className="mb-4 relative min-h-[100px]">
          {imageLoading ? (
            <div className="w-full h-48 bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
              <Hourglass className="w-8 h-8 text-gray-600 animate-spin" />
            </div>
          ) : imageError ? (
            <div className="w-full h-48 bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Failed to load image</p>
              </div>
            </div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt="Post content"
              className="rounded-lg max-h-96 w-auto cursor-pointer opacity-0 transition-opacity duration-300"
              onClick={() => setShowImageModal(true)}
              loading="lazy"
              onLoad={(e) => {
                console.log("Image loaded successfully");
                e.target.classList.add('opacity-100');
              }}
              onError={(e) => {
                console.error("Image failed to load:", imageUrl);
                setImageError(true);
              }}
            />
          ) : null}
        </div>
      )}

      <div className="flex items-center space-x-4 text-gray-400">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center hover:text-red-400 ${isLiking ? 'opacity-50' : ''}`}
        >
          <Heart className={`w-5 h-5 mr-1`} />
          <span>{post.likesCount || 0}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center hover:text-blue-400"
        >
          <MessageCircle className="w-5 h-5 mr-1" />
          <span>{post.commentsCount || 0}</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4 space-y-4">
          {post.recentComments?.map((comment, index) => (
            <div key={index} className="bg-[#1A1C23] rounded-lg p-3">
              <div className="flex justify-between items-start">
                <p className="text-white text-sm font-semibold">{comment.creator_name}</p>
                <p className="text-gray-400 text-xs">
                  {new Date(comment.timestamp).toLocaleDateString()}
                </p>
              </div>
              <p className="text-gray-300 text-sm mt-1">{comment.content}</p>
            </div>
          ))}

          <form onSubmit={handleComment} className="mt-4 flex">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-grow bg-[#1A1C23] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isCommenting}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isCommenting}
              className={`ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                (!newComment.trim() || isCommenting) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Post
            </button>
          </form>
        </div>
      )}

      {showImageModal && imageUrl && (
        <ImageModal imageUrl={imageUrl} onClose={() => setShowImageModal(false)} />
      )}

      {showChallengeModal && post.challenge && (
        <ChallengeModal 
          challengeId={post.challenge} 
          onClose={() => {
            console.log('Closing challenge modal');
            setShowChallengeModal(false);
          }} 
        />
      )}
    </div>
  );
};

const ImageModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <img
          src={imageUrl}
          alt="Enlarged view"
          className="max-w-full max-h-full object-contain"
          onClick={(e) => e.stopPropagation()}
          style={{ maxHeight: "calc(100vh - 2rem)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-100 group-hover/image:from-black/50 group-hover/image:opacity-100 transition-all duration-300" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 hover:scale-110 transition-all duration-300 transform"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

const PointsAwardedModal = ({ points, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1C1F26] rounded-xl p-6 max-w-lg w-full mx-4 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-4">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Points Awarded!</h2>
          <p className="text-gray-400">
            Congratulations! You've earned {points} points for sharing your challenge experience.
          </p>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500/90 to-pink-500/90 text-white font-medium rounded-xl shadow-md shadow-purple-500/20 hover:from-purple-500 hover:to-pink-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            Awesome!
          </button>
        </div>
      </div>
    </div>
  );
};

const NewPostForm = ({ onSubmit, preSelectedChallenge }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState("");
  const [loadingChallenge, setLoadingChallenge] = useState(true);

  // Update selectedChallenge when preSelectedChallenge changes
  useEffect(() => {
    if (preSelectedChallenge) {
      setSelectedChallenge(preSelectedChallenge);
    }
  }, [preSelectedChallenge]);

  // Fetch challenges and validate preSelectedChallenge
  useEffect(() => {
    const loadChallenges = async () => {
      try {
        setLoadingChallenge(true);
        const challenges = await get("/api/challenges");

        // Remove duplicates by title
        const uniqueChallenges = challenges.reduce((acc, current) => {
          const x = acc.find((item) => item.title === current.title);
          if (!x) {
            return acc.concat([current]);
          } else {
            console.log("Duplicate challenge found:", current.title);
            return acc;
          }
        }, []);

        setChallenges(uniqueChallenges);

        if (preSelectedChallenge) {
          const challenge = uniqueChallenges.find((c) => c._id === preSelectedChallenge);
          if (!challenge || challenge.pointsAwarded) {
            console.warn(
              "Pre-selected challenge not found or points already awarded:",
              preSelectedChallenge
            );
            setSelectedChallenge("");
          }
        }
      } catch (err) {
        console.error("Error loading challenges:", err);
      } finally {
        setLoadingChallenge(false);
      }
    };
    loadChallenges();
  }, [preSelectedChallenge]);

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
      const challenge = challenges.find((c) => c._id === selectedChallenge);
      await onSubmit({
        content,
        imageUrl,
        challenge: selectedChallenge,
        challengeTitle: challenge.title,
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
    <div className="relative">
      <div className="bg-[#12141A]/90 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6 space-y-6 shadow-2xl hover:border-purple-500/30 hover:shadow-purple-500/10 transition-all duration-300">
        {loadingChallenge ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your boldness..."
              className="w-full px-5 py-4 bg-white/5 text-white placeholder-gray-400 rounded-xl border border-purple-500/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 hover:bg-white/10 hover:border-purple-500/30 resize-none transition-all duration-200"
              rows="3"
            />
            <div className="space-y-3">
              <div className="flex gap-4">
                <select
                  value={selectedChallenge}
                  onChange={(e) => setSelectedChallenge(e.target.value)}
                  className="flex-1 px-5 py-3 bg-white/5 text-white placeholder-gray-400 rounded-xl border border-purple-500/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-200"
                  required
                >
                  <option value="">Select a challenge</option>
                  {challenges
                    .filter((challenge) => !challenge.pointsAwarded)
                    .map((challenge) => (
                      <option key={challenge._id} value={challenge._id}>
                        {challenge.title} {challenge.completed ? "✓" : "⌛️"}
                      </option>
                    ))}
                </select>
              </div>
              {!selectedChallenge && content.trim() && (
                <p className="text-yellow-500/90 text-sm pl-2 flex items-center gap-2">
                  <span className="block w-1 h-1 rounded-full bg-yellow-500"></span>
                  Select a challenge to continue
                </p>
              )}
            </div>
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => document.getElementById("image-input").click()}
                className={`flex items-center space-x-2 px-5 py-3 rounded-xl border shadow-sm shadow-purple-500/10 transition-all duration-300 ${
                  image
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/40 hover:border-purple-500/50 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/20"
                    : "bg-white/5 text-gray-400 border-purple-500/10 hover:bg-white/15 hover:border-purple-500/30 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/20"
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>{image ? "Image Selected" : "Add Image (Required)"}</span>
              </button>
              <button
                type="submit"
                disabled={!content.trim() || !image || !selectedChallenge || isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-purple-500/90 to-pink-500/90 text-white font-medium rounded-xl shadow-md shadow-purple-500/20 hover:from-purple-500 hover:to-pink-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
              >
                {isSubmitting ? "Posting..." : "Post"}
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
              <p className="text-yellow-500/90 text-sm pl-2 flex items-center gap-2">
                <span className="block w-1 h-1 rounded-full bg-yellow-500"></span>
                Please add an image to your post
              </p>
            )}
          </form>
        )}
        {image && (
          <div className="relative rounded-xl overflow-hidden group/image shadow-sm shadow-purple-500/10">
            <div className="aspect-[16/9]">
              <img
                src={URL.createObjectURL(image)}
                alt="Upload preview"
                className="absolute inset-0 w-full h-full object-cover transform group-hover/image:scale-105 transition-all duration-500"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-100 group-hover/image:from-black/50 group-hover/image:opacity-100 transition-all duration-300" />
            <button
              onClick={() => setImage(null)}
              className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 hover:scale-110 transition-all duration-300 transform"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Feed = () => {
  const [searchParams] = useSearchParams();
  const challengeId = searchParams.get("challenge");
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [awardedPoints, setAwardedPoints] = useState(0);
  const [posts, setPosts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const POSTS_PER_PAGE = 5;
  const [error, setError] = useState(null);

  useEffect(() => {
    get("/api/whoami").then((user) => {
      if (user._id) {
        setUserId(user._id);
      }
    });
  }, []);

  useEffect(() => {
    if (page === 0) {
      setPosts([]); // Clear posts when resetting to page 0
    }
    loadPosts();
  }, [page]);

  // Add intersection observer for infinite scroll
  const observer = useRef();
  const lastPostElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const loadPosts = async () => {
    if (loading || !hasMore) {
      console.log("Skipping loadPosts - loading:", loading, "hasMore:", hasMore);
      return;
    }
    setLoading(true);
    setError(null);
    
    try {
      console.log("Loading posts - page:", page);
      const response = await get("/api/posts", {
        limit: POSTS_PER_PAGE,
        skip: page * POSTS_PER_PAGE,
      });
      
      setPosts((prevPosts) => {
        // Deduplicate posts based on _id
        const newPosts = response.posts.filter(
          newPost => !prevPosts.some(existingPost => existingPost._id === newPost._id)
        );
        return [...prevPosts, ...newPosts];
      });
      
      setHasMore(response.hasMore);
    } catch (err) {
      console.error("Error loading posts:", err);
      setError("Failed to load posts. Please try refreshing the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewPost = async (post) => {
    try {
      const newPost = await apiPost("/api/post", post);
      setPosts((currentPosts) => [newPost, ...currentPosts]);

      // If this post was for a challenge, award points
      if (post.challenge) {
        const response = await apiPost(`/api/challenges/${post.challenge}/award-points`);
        if (response.pointsAwarded) {
          setAwardedPoints(response.pointsAwarded);
          setShowPointsModal(true);
        }
      }
    } catch (err) {
      console.error("Error creating post:", err);
    }
  };

  const handleLike = (postId, newLikes) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) => (post._id === postId ? { ...post, likes: newLikes } : post))
    );
  };

  const handleComment = (postId, newComments) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) => (post._id === postId ? { ...post, comments: newComments } : post))
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0B0F] pt-16">
      <NavBar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <NewPostForm onSubmit={handleNewPost} preSelectedChallenge={challengeId} />
        <div className="space-y-6 mt-8">
          {posts.map((post, index) => {
            if (posts.length === index + 1) {
              return (
                <div ref={lastPostElementRef} key={post._id}>
                  <PostCard
                    post={post}
                    userId={userId}
                    onLike={handleLike}
                    onComment={handleComment}
                  />
                </div>
              );
            } else {
              return (
                <PostCard
                  key={post._id}
                  post={post}
                  userId={userId}
                  onLike={handleLike}
                  onComment={handleComment}
                />
              );
            }
          })}
          {loading && (
            <div className="flex justify-center items-center py-4">
              <LoadingSpinner />
            </div>
          )}
        </div>
      </div>
      {showPointsModal && (
        <PointsAwardedModal
          points={awardedPoints}
          onClose={() => {
            setShowPointsModal(false);
            setAwardedPoints(0);
          }}
        />
      )}
      <Tutorial />
    </div>
  );
};

export default Feed;
