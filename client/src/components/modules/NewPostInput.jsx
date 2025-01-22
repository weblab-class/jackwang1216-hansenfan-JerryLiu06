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
    <div className="bg-gray-800 rounded-lg p-4 mb-4 shadow-lg border border-gray-700">
      <input
        type="text"
        placeholder="How did you step outside of your comfort zone today?"
        value={value}
        onChange={handleChange}
        className="w-full p-2 mb-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
      />
      
      {!imagePreview && (
        <div className="text-center p-8 border-2 border-dashed border-gray-700 rounded-lg mb-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            ref={fileInputRef}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="flex flex-col items-center gap-2 cursor-pointer text-gray-400 hover:text-gray-300"
          >
            <Image className="w-8 h-8" />
            <span>Upload a photo of your bold moment</span>
            <span className="text-sm">(required)</span>
          </label>
        </div>
      )}
      
      {imagePreview && (
        <div className="relative mb-2">
          <img 
            src={imagePreview} 
            alt="Preview" 
            className="max-h-60 rounded-lg object-cover w-full"
          />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-400">
          {imagePreview ? (
            <span className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Photo added
            </span>
          ) : (
            <span className="text-red-400">* Photo required</span>
          )}
        </div>
        <button
          type="submit"
          className={`px-4 py-2 rounded-lg transition-colors ${
            value && imagePreview
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
          onClick={handleSubmit}
          disabled={!value || !imagePreview || uploading}
        >
          {uploading ? "Processing..." : "Post"}
        </button>
      </div>
    </div>
  );
};

export default NewPostInput;
