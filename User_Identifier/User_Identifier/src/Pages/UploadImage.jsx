import React, { useRef, useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import Webcam from "react-webcam";

const videoConstraints = {
  width: { ideal: 1920 },  // or 1280, 2560 etc.
  height: { ideal: 1080 },
  facingMode: "user"
};

const dataURLtoFile = (dataurl, filename) => {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};

const VerifyUser = () => {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [showUpload, setShowUpload] = useState({});

  const webcamRef = useRef(null);

  // Capture Image - File1
  const capture = () => {
    const ImageSrc = webcamRef.current.getScreenshot();
    const file = dataURLtoFile(ImageSrc, "webcam.jpg");
    setFile1(file);
  };

  // Handle Change - File2
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "file2") setFile2(files[0]);
  };

  // console.log("File1:", file1);
  // console.log("File2:", file2);

  // GET data in database
  const getUploadedFiles = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/upload`);
      const data = response.data;
      setShowUpload({
        fileUpload1: data.file1Name,
        fileUpload2: data.file2Name,
      });
    } catch (error) {
      console.error("Error fetching uploaded files:", error);
    }
  };

  // POST data to database
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file1 || !file2) {
      alert("Please select both files.");
      return;
    }

    const formData = new FormData();
    formData.append("file1", file1);
    formData.append("file2", file2);
    console.log("Files to be uploaded:", file1, file2);

    try {
      const response = await axios.post(
        `http://localhost:5000/api/upload`,
        formData
      );
      if (response.status === 200) {
        console.log("Files uploaded:", response.data);
      } else {
        console.error("Upload failed.");
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
    getUploadedFiles();
  };

  // console.log("Uploaded files:", showUpload.fileUpload1);

  // Call API on every render
  useEffect(() => {
  getUploadedFiles();
}, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-3xl font-bold text-center mt-10">
        User Verification
      </h1>
      {/* Upload files section */}
      <div className="flex items-center justify-center gap-4 mt-10">
        <div className="flex">
          {/* Here I used Webcam library for capturing the image by camera */}
          <div className="flex flex-col items-center gap-[40px] mt-[40px] mr-[40px]">
            <Webcam
              name="file1"
              audio={false}
              ref={webcamRef}
              height={480}
              screenshotFormat="image/jpeg"
              screenshotQuality={1}
              width={480}
              videoConstraints={videoConstraints}
              style={{
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #ccc",
              }}
            />

            <button
              onClick={capture}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Capture Photo
            </button>
          </div>
          {/* File 1: Face Image */}
          <div>
            {file1 && (
              <div className="mt-4">
                <img
                  src={`http://localhost:5000/${showUpload.fileUpload1.replace(
                    /\\/g,
                    "/"
                  )}`}
                  alt="Captured"
                  className="w-[200px] h-[200px] mt-2 border rounded-[50%] mr-[40px] mt-[40px] cover"
                />
              </div>
            )}
          </div>
          {/* File 2: License */}
          <div className="flex flex-col items-center">
            <label
              htmlFor="file-upload-2"
              className="w-48 h-48 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-[50%] mt-10 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              {showUpload.fileUpload2 ? (
                <img
                  src={`http://localhost:5000/${showUpload.fileUpload2.replace(
                    /\\/g,
                    "/"
                  )}`}
                  alt="Uploaded License"
                  className="w-full h-full object-cover rounded-[50%]"
                />
              ) : (
                <div className="text-center text-gray-600 mt-20">
                  Please upload your Driving License image.
                </div>
              )}
            </label>
            <input
              id="file-upload-2"
              type="file"
              name="file2"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>

      {/* Button to use for submit files */}
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mt-10 hover:bg-blue-600 transition-colors"
        onClick={handleSubmit}
      >
        UPLOAD
      </button>
    </div>
  );
};

export default VerifyUser;
