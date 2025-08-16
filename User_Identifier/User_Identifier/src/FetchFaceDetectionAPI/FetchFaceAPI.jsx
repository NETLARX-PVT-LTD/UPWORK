import axios from 'axios'
import React from 'react'
import { useEffect } from 'react'

const FetchFaceAPI = () => {
    useEffect(() => {
        const fetchData = async () => {
            const response = await axios.post('https://dldetection.cognitiveservices.azure.com/face/v1.0/detect')
            const data = response.data;
            console.log(data)
        }
        fetchData()
    },[])
  return (
    <div>FetchFaceAPI</div>
  )
}

export default FetchFaceAPI