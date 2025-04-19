import React from 'react';
import { Heart, Share2, MessageCircle } from 'lucide-react';


const Card= ({ title, description, imageUrl, author, date }) => {
  return (
    <div className="max-w-md bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      <img 
        src={imageUrl} 
        alt={title} 
        className="w-full h-48 object-cover"
      />
      
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">{title}</h2>
        <p className="text-gray-600 mb-4">{description}</p>
        
        <div className="flex items-center mb-4">
          <img 
            src={author.avatar} 
            alt={author.name}
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <p className="font-medium text-gray-800">{author.name}</p>
            <p className="text-gray-500 text-sm">{date}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button className="flex items-center text-gray-600 hover:text-red-500 transition-colors">
            <Heart className="h-5 w-5 mr-1" />
            <span>Like</span>
          </button>
          
          <button className="flex items-center text-gray-600 hover:text-blue-500 transition-colors">
            <MessageCircle className="h-5 w-5 mr-1" />
            <span>Comment</span>
          </button>
          
          <button className="flex items-center text-gray-600 hover:text-green-500 transition-colors">
            <Share2 className="h-5 w-5 mr-1" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card;