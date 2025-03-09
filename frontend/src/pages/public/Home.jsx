import React from 'react';
import HospitalAppBar from './Appbar';
import HeroSection from './HeroSection';
import AdvancedHospitalFooter from './Footer';
import WhyChooseUs from './WhyChooseUs';

const Home = () => {
  return (
    <div>
      {/* <HospitalAppBar /> */}
      <HeroSection/>
      <WhyChooseUs/>
      {/* <AdvancedHospitalFooter/> */}
    </div>
  );
};

export default Home;