import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Form from "../components/home/Form";

const Home = () => {
  const navigate = useNavigate();
  const [formLink, setFormLink] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <header className="flex justify-between items-center px-8 py-4 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-blue-600">Candidates</h1>
        <nav className="space-x-6">
          <button
            onClick={() => navigate("/")}
            className="text-gray-700 hover:text-blue-600"
          >
            Home
          </button>
          <button
            onClick={() => navigate("/about")}
            className="text-gray-700 hover:text-blue-600"
          >
            About
          </button>
          <button
            onClick={() => navigate("/contact")}
            className="text-gray-700 hover:text-blue-600"
          >
            Contact
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center text-center px-6">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
          Hi, <span className="text-blue-600">Candidate</span> 👋
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mb-6">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Cum magnam
          temporibus ipsa fugiat nemo? Optio eum temporibus culpa nesciunt eos
          in voluptates aliquam vero deleniti quae. Cupiditate labore ipsa
          soluta.
        </p>

        {/* CTA Buttons */}
        {formLink ? (
          <Form />
        ) : (
          <div className="space-x-4">
            <button
              onClick={() => setFormLink(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
            >
              Click Here And fill form
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-inner py-4 text-center text-gray-500">
        © {new Date().getFullYear()} Netlarx Private Ltd. All Rights Reserved.
      </footer>
    </div>
  );
};

export default Home;
