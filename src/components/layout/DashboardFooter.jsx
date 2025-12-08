import React from 'react';
import { Link } from 'react-router-dom';
import { PiInfo } from 'react-icons/pi';

const DashboardFooter = () => {
  return (
    <footer className="w-full text-center p-2 shrink-0 border-t border-gray-200 bg-white text-gray-800">
      © Copyright CSPIT - CHARUSAT
      <span className="font-light px-2">|</span>
      All rights reserved
      <span className="font-light px-2">|</span>
      <Link
        to="/developers"
        className="font-bold text-gray-800 hover:text-black"
      >
        <PiInfo className="inline-block text-lg -mt-1" /> About
      </Link>
      <span className="font-light px-2">|</span>
      <a
        href="mailto:scope@charusat.ac.in"
        className="font-bold text-gray-800 hover:text-black"
      >
        <PiInfo className="inline-block text-lg -mt-1" /> Help
      </a>
    </footer>
  );
};

export default DashboardFooter;