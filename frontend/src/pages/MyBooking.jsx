import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import MyBookings from '../components/MyBookings';

const MyBooking = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      <Navbar />
      <main className="flex-1">
        <MyBookings />
      </main>
      <Footer />
    </div>
  );
};

export default MyBooking;
