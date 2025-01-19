import React, { useState, useContext } from "react";
import NavBar from "../modules/NavBar";
import { Send, Clock, Users, Trophy } from "lucide-react";
import SinglePost from "../modules/SinglePost";
import NewPostInput from "../modules/NewPostInput";
import { UserContext } from "../App";

const Feed = () => {
  const { user } = useContext(UserContext);
  const [posts, setPosts] = useState([]);

  const addNewPost = (postObj) => {
    setPosts(
      [
        {
          ...postObj,
          timestamp: new Date().toLocaleString(),
        },
      ].concat(posts)
    );
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
        image={postObj.image}
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
