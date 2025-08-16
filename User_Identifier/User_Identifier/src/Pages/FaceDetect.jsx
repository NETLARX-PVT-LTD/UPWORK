import React, { useState } from "react";
import axios from "axios";

const FaceDetectComponent = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [faceData, setFaceData] = useState(null);

  const handleDetect = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/face-detect', {
        imageUrl,
      });
      setFaceData(res.data);
    } catch (err) {
      console.error('Detection failed:', err.response?.data || err.message);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="Enter public image URL"
      />
      <button onClick={handleDetect}>Detect Face</button>

      <pre>{JSON.stringify(faceData, null, 2)}</pre>
    </div>
  );
};

export default FaceDetectComponent;
