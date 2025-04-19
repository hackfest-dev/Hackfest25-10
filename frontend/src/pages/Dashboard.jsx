import React from 'react'
import MetaMaskIntegration from '../components/Wallet'

function Dashboard() {
  return (
    
    // <div className='flex flex-col w-full'>
    //   <div className='flex justify-end w-[100%] bg-red-500 border-red-600'>
    //     <div className='w-[20%] bg-white h-[100vh]'>
    //       {/* <MetaMaskIntegration /> */}
    //     </div>
    //   </div>
    // </div>
    <div>
      <div className='flex justify-end w-[100%] bg-red-500 border-red-600'>
        <div className='w-[100%] bg-white h-[100vh]'>
          <MetaMaskIntegration />
        </div>
      </div>
      <div className='flex justify-center items-center h-screen'>
        <h1 className='text-3xl font-bold'>Welcome to the Dashboard</h1>
      </div>
    </div>
  )
}

export default Dashboard