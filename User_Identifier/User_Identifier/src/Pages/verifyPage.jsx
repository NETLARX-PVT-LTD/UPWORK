// VerifyPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UploadImage from "./UploadImage";
import PageNotFound from "./pageNotFound";
import axios from "axios";

const VerifyPage = () => {
  const { code } = useParams(); // ✅ path param from URL
  const [status, setStatus] = useState(false);

  useEffect(() => {
    const verifyCode = async () => {
      if (code) {
        try {
          const response = await axios.get(`http://localhost:5000/api/verify/${code}`);
          const data = response.data;
          if (data.secureCode == code) {
            setStatus(true);
          } else {
            setStatus(false);
          }
        } catch (error) {
          setStatus(false);
        }
      } else {
        setStatus(false);
      }
    };
    verifyCode();
  }, [code]);

  return (
    <div>
      {status ? (
        <UploadImage />
      ) : (
        <PageNotFound />
      )}
    </div>
  );
};

export default VerifyPage;
