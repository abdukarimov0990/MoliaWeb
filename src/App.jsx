import React from 'react'
import { createBrowserRouter, RouterProvider, Route, createRoutesFromElements } from 'react-router'
import MainLayout from './layout/MainLayout'
import Home from './pages/Home'
import News from './pages/News'
import About from './pages/Abous'
import Game from './pages/Game'
import Contact from './pages/Contact'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<MainLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/news" element={<News />} />
      <Route path="/about" element={<About />} />
      <Route path="/game" element={<Game />} />
      <Route path="/contact" element={<Contact />} />


    </Route>
  )
)

const App = () => {
  return (
    <RouterProvider router={router} />
  )
}

export default App
