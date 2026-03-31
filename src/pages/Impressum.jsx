import React from 'react';

const Impressum = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white min-h-[60vh] my-12 rounded-xl shadow-sm border border-gray-100">
      <h1 className="text-3xl font-bold text-afd-dark mb-8 border-b pb-4">Impressum</h1>
      
      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="text-xl font-bold text-afd-dark mb-3">Angaben gemäß § 5 TMG</h2>
          <p>
            Anbieter dieser Website und verantwortlich für den Inhalt:<br/><br/>
            <strong>AfD Fraktion Nümbrecht</strong><br/>
            [Straße und Hausnummer der Geschäftsstelle / Postfach]<br/>
            [PLZ] Nümbrecht
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-afd-dark mb-3">Vertreten durch:</h2>
          <p>
            [Vorname Nachname des Fraktionsvorsitzenden]
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-afd-dark mb-3">Kontakt:</h2>
          <p>
            Telefon: [Telefonnummer]<br/>
            E-Mail: [muster@afd-nuembrecht.de]
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-afd-dark mb-3">Streitschlichtung</h2>
          <p>
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
            <a href="https://ec.europa.eu/consumers/odr" className="text-afd-blue hover:underline ml-1" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a>.<br/>
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Impressum;
