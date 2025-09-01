import React from 'react'
import { useNavigate } from 'react-router-dom'

const StickyNavbar = () => {
  const navigate = useNavigate();
  return (
    <div className='sticky top-0 z-50'>
      <ul className='flex space-x-4 justify-between m-10 p-4 rounded-sm text-white bg-gray-500'>
        <div>Logo</div>
        <div>
          <ul className='flex space-x-4'>
            <li onClick={() => navigate('/')}>Home</li>
            <li>About</li>
            <li onClick={() => navigate('/form')}>Form</li>
            {/* <li onClick={() => navigate('/test')}>Test</li> */}
          </ul>
        </div>
        <div>
          <ul>
            <li>Contact</li>
          </ul>
        </div>
      </ul>
    </div>
  )
}

export default StickyNavbar