import React, { useState } from 'react'
import { Outlet } from 'react-router'
import Header from '../components/Header'
import Footer from '../components/Footer'

const MainLayout = () => {
  const [cart, setCart] = useState([]);

  return (
    <div className='min-h-screen \ dark:bg-gray-800 flex flex-col'>
        <Header cart={cart} />
      <main className='grow overflow-hidden  mt-[140px]'>
        <Outlet context={{ cart, setCart }}/>
      </main>
      <Footer/>
    </div>
  )
}

export default MainLayout
