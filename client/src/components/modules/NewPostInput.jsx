import React, { useState, useRef, useContext } from "react";
import { Image } from "lucide-react";
import { UserContext } from "../App";
import imageCompression from "browser-image-compression";
import "./Card.css";

const NewPostInput = ({ addNewPost }) => {
  const { user } = useContext(UserContext);
  const [value, setValue] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    
    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error("Error compressing image:", error);
      return file;
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setUploading(true);
      try {
        const compressedFile = await compressImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
          setUploading(false);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error("Error handling image upload:", error);
        setUploading(false);
      }
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (value === "" || !imagePreview) return; // Require both text and image
    if (!user) return; // Don't allow posting if not logged in
    if (uploading) return; // Don't allow posting while image is being processed
    
    addNewPost({
      _id: "id" + Math.random().toString(36).substr(2, 9),
      creator_name: user.name,
      content: value,
      image: imagePreview,
    });
    setValue("");
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!user) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 mb-4 shadow-lg border border-gray-700 text-center text-gray-400">
        Please log in to post
      </div>
    );
  }

  return (
    <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-xl border border-gray-700/50 transition-all duration-200 hover:border-purple-500/30">
      <input
        type="text"
        placeholder="How did you step outside of your comfort zone today?"
        value={value}
        onChange={handleChange}
        className="w-full p-3 mb-4 bg-gray-900/90 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 placeholder:text-gray-500"
      />
      
      {!imagePreview && (
        <div className="text-center p-8 border-2 border-dashed border-gray-700/50 rounded-xl mb-4 transition-all duration-200 hover:border-purple-500/30 group">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            ref={fileInputRef}
            className="hidden"
            id="imageInput"
          />
          <label
            htmlFor="imageInput"
            className="cursor-pointer flex flex-col items-center gap-2 text-gray-400 group-hover:text-purple-400 transition-colors duration-200"
          >
            <Image className="w-8 h-8" />
            <span>Click to add an image</span>
          </label>
        </div>
      )}

      {imagePreview && (
        <div className="relative mb-4">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-xl"
          />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 bg-gray-900/80 text-white p-2 rounded-full hover:bg-red-500/80 transition-colors duration-200"
          >
            ×
          </button>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!value || !imagePreview || uploading}
        className={`w-full py-2.5 px-4 rounded-xl font-medium transition-all duration-200
          ${value && imagePreview && !uploading
            ? 'bg-purple-600 hover:bg-purple-700 text-white'
            : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'}`}
      >
        {uploading ? 'Processing...' : 'Post'}
      </button>
    </div>
  );
};

export default NewPostInput;
