import React, { useState } from "react";

const GenerateLink = () => {
  const [link, setLink] = useState("");

  // Function to generate random link
  const generateRandomLink = () => {
    const randomString = Math.random().toString(36).substring(2, 10); // random 8-char string
    const newLink = `http://localhost:5173/test/${randomString}`;
    setLink(newLink);
  };

  return (
    <div className="flex justify-center items-center min-h-[200px] bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md space-y-6 text-center">
        <h2 className="text-2xl font-bold text-gray-700">Generate Random Link</h2>

        <button
          onClick={generateRandomLink}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Generate Link
        </button>

        {link && (
          <div className="mt-4 p-3 bg-gray-50 border rounded-lg">
            <p className="text-gray-700 font-medium">Your Link:</p>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 break-words hover:underline"
            >
              {link}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateLink;
