import React from 'react';
import { Link } from 'react-router-dom';
import { PiInfo } from 'react-icons/pi'; 

/**
 * A reusable, styled Footer component for the application.
 * It has a transparent, blurred background for a modern look.
 */
export default function Footer() {
    return (
        <footer 
            className="w-full text-center py-4 shrink-0 
                       bg-black/40 backdrop-blur-md 
                       text-gray-100 text-base z-10 
                       border-t border-white/20"
        >
            <div className="flex items-center justify-center gap-x-4 flex-wrap px-4">
                {/* Copyright Information */}
                <span className="font-medium">© Copyright CSPIT - CHARUSAT</span>
                <span className="hidden sm:inline font-light text-gray-400">|</span>
                <span className="font-medium">All rights reserved</span>
                
                {/* Separator for mobile view */}
                <div className="w-full sm:hidden h-2"></div>

                {/* Action Links */}
                <span className="hidden sm:inline font-light text-gray-400">|</span>
                <Link
                    // to="/developers"
                    className="font-semibold text-teal-300 hover:text-white hover:underline transition-colors duration-300"
                >
                    <PiInfo className="inline-block text-lg -mt-1" />
                    {' '}About
                </Link>
                <span className="hidden sm:inline font-light text-gray-400">|</span>
                <a
                    href="mailto:scope@charusat.ac.in"
                    className="font-semibold text-red-400 hover:text-white hover:underline transition-colors duration-300"
                >
                    <PiInfo className="inline-block text-lg -mt-1" />
                    {' '}Help
                </a>
            </div>
        </footer>
    );
}
