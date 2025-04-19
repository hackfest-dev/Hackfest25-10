import React from 'react'

function Landing() {
  return (
    <div className='flex justify-center items-center h-[100vh]'>
      <div>
        Landing Page
      </div>
      <button>
        <a href="/register" className="bg-blue-500 text-white px-4 py-2 rounded">
          Register
        </a>
      </button>
    </div>
  )
}

export default Landing