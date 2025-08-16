import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
  const [ip, setIP] = useState("");

  const getData = async () => {
    const res = await axios.get("https://api.ipify.org/?format=json");
    const data = res.data;
    console.log("IP Address fetched:", data.ip);
    setIP(data.ip);
  };

  useEffect(() => {
    //passing getData method to the lifecycle method
    getData();
  }, []);
  return (
    <div>
      <div className='flex flex-col items-center justify-center h-screen gap-4'>
        <a href="/email">Verify User</a>
      </div>

    </div>
  )
}

export default Home