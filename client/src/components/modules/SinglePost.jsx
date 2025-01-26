import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Card.css";

const SinglePost = (props) => {
  const [showModal, setShowModal] = useState(false);
  // Get current timestamp if not provided
  const timestamp = props.timestamp || new Date().toLocaleString();

  return (
    <>
      <div className="bg-gray-800 rounded-lg p-4 mb-4 shadow-lg border border-gray-700">
        <div className="flex justify-between items-start mb-2">
          <Link 
            to={`/profile/${props.creator_id}`}
            className="text-lg font-bold text-white hover:text-purple-400 transition-colors"
          >
            {props.creator_name}
          </Link>
          <span className="text-sm text-gray-400">{timestamp}</span>
        </div>
        <div className="text-gray-300 mb-3">{props.content}</div>
        {props.image && (
          <div className="mt-2">
            <img
              src={props.image}
              alt="Post attachment"
              className="rounded-lg max-h-96 w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setShowModal(true)}
            />
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && props.image && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <img
            src={props.image}
            alt="Full size post attachment"
            className="max-h-[90vh] max-w-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white text-xl bg-white/10 w-10 h-10 rounded-full hover:bg-white/20"
            onClick={() => setShowModal(false)}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
};

export default SinglePost;
