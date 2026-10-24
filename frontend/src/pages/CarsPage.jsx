import React from 'react'
import Navbar from '../components/Navbar'
import { Car } from 'lucide-react'
import Footer from '../components/Footer'
import Cars from '../components/Cars'

const CarsPage = () => {
  return (
    <div>
      <Navbar/>
      <Cars/>
      <Footer/>
    </div>
  )
}

export default CarsPage
