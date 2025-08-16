import React, { useState } from 'react'
import axios from 'axios';

const Email = () => {
    const [email, setEmail] = useState('');
    const handleEmail = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/send', { email });
            const data = response.data;
            if(data.error){
                console.error(data.error);
            }else{
                console.log(data.message);
            }
        } catch (error) {
            console.error(`Error sending email: ${error}`);
        }
    }
    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <h1 className="text-3xl font-bold">Email</h1>
            <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="border border-gray-300 w-72 p-2 rounded" />
            <button onClick={handleEmail} className="bg-blue-500 text-white p-2 rounded">Submit</button>
        </div>
    )
}

export default Email;