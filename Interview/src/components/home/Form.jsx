import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import GenerateLink from "./generateLink";

const Form = () => {
  const navigate = useNavigate();
  const [showLink, setShowLink] = useState(false);

  return (
    <div className="flex justify-center items-center min-h-[200px] bg-gray-100 min-w-[500px]">
        {!showLink ? <form className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md space-y-5">
        <h2 className="text-2xl font-bold text-gray-700 text-center">Registration Form</h2>

        <div>
          <label className="block text-gray-600 mb-1">Name</label>
          <input
            type="text"
            name="name"
            className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
          />
        </div>

        <div>
          <label className="block text-gray-600 mb-1">Email</label>
          <input
            type="email"
            name="email"
            className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
          />
        </div>

        <div>
          <label className="block text-gray-600 mb-1">Branch</label>
          <input
            type="text"
            name="branch"
            className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
          />
        </div>

        <div>
          <label className="block text-gray-600 mb-1">Phone no.</label>
          <input
            type="text"
            name="phone"
            className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
          />
        </div>

        <div>
          <label className="block text-gray-600 mb-1">Place</label>
          <input
            type="text"
            name="place"
            className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowLink(true)}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition cursor-pointer"
        >
          Submit
        </button>
      </form> : <GenerateLink />}
    </div>
  );
};

export default Form;
