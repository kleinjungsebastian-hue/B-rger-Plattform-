import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative w-full h-[600px] flex items-center">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-afd-dark bg-opacity-70 mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl text-white">
          <h2 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight">
            Ihre Stimme im <br/><span className="text-afd-blue">Gemeinderat Nümbrecht</span>
          </h2>
          <p className="text-xl mb-10 text-gray-200">
            Wir verbinden Bürgerinnen und Bürger direkt mit unserem Gemeinderat. 
            Teilen Sie Ihre Anliegen, diskutieren Sie mit und gestalten Sie unsere Heimat aktiv.
          </p>
          <div className="flex gap-4">
            <Link to="/ticket-system" className="bg-afd-blue hover:bg-afd-dark text-white font-bold py-3 px-8 rounded transition duration-200 shadow-lg inline-block">
              Jetzt Anliegen melden
            </Link>
             <Link to="/forum" className="bg-transparent border-2 border-white hover:bg-white hover:text-afd-dark text-white font-bold py-3 px-8 rounded transition duration-200 inline-block">
              Zum Bürger-Forum
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};


export default HeroSection;
