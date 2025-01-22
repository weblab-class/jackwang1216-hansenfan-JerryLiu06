import React, { useState, useEffect, useContext } from "react";
import NavBar from "../modules/NavBar";
import { Send, Clock, Users, Trophy } from "lucide-react";
import SinglePost from "../modules/SinglePost";
import NewPostInput from "../modules/NewPostInput";
import { UserContext } from "../App";

const Feed = () => {
  const { user } = useContext(UserContext);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Fetch posts when component mounts
    console.log("Fetching posts...");
    fetch("/api/posts", {
      credentials: "include", // Important! This sends cookies with the request
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((postObjs) => {
        console.log("Received posts:", postObjs);
        setPosts(postObjs);
      })
      .catch((error) => {
        console.error("Error fetching posts:", error);
      });
  }, []);

  const addNewPost = (postObj) => {
    console.log("Adding new post:", postObj);
    fetch("/api/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: postObj.content,
        imageUrl: postObj.image, // This is what we send to the server
      }),
      credentials: "include", // Important! This sends cookies with the request
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((newPost) => {
        console.log("Successfully added post:", newPost);
        // Transform the response to match what SinglePost expects
        const transformedPost = {
          ...newPost,
          image: newPost.imageUrl, // Convert imageUrl to image for display
        };
        setPosts([transformedPost].concat(posts));
      })
      .catch((error) => {
        console.error("Error adding post:", error);
      });
  };

  let postsList = null;
  const hasPosts = posts.length !== 0;
  if (hasPosts) {
    postsList = posts.map((postObj) => (
      <SinglePost
        key={`Post_${postObj._id}`}
        _id={postObj._id}
        creator_name={postObj.creator_name}
        content={postObj.content}
        timestamp={postObj.timestamp}
        image={postObj.imageUrl || postObj.image} // Handle both property names
      />
    ));
  } else {
    postsList = <div>No posts yet!</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <NavBar />
      <main className="ml-24 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="feed-container">
            <NewPostInput addNewPost={addNewPost} />
            {postsList}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Feed;
