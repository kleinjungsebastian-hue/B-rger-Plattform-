import React from 'react';

const Barrierefreiheit = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white my-12 rounded-xl shadow-sm border border-gray-100">
      <h1 className="text-3xl font-bold text-afd-dark mb-8 border-b pb-4">Erklärung zur Barrierefreiheit</h1>
      
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <section>
          <p>
            Die AfD Fraktion Nümbrecht ist stets bemüht, das Projekt "Wir für Nümbrecht" im Einklang mit den nationalen Rechtsvorschriften zur Umsetzung der Richtlinie (EU) 2016/2102 für alle Bürger einfach und barrierefrei zugänglich zu machen.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-afd-dark mb-3">1. Stand der Vereinbarkeit</h2>
          <p>
            Wir legen höchsten Wert auf Inklusion im digitalen Raum. Diese Plattform wurde von Anfang an so konzipiert, dass hohe Farbkontraste (Dunkelblau auf Weiß), große Schaltflächen und eine große, serifenlose Typografie die Lesbarkeit vereinfachen.
            Sie ist nach aktuellem Stand mit den Vorgaben der Barrierefreie-Informationstechnik-Verordnung (BITV 2.0) weitestgehend vereinbar.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-afd-dark mb-3">2. Noch nicht barrierefreie Inhalte</h2>
          <p>
            Die Entwicklung der Plattform ist ein laufender Prozess. Die nachstehend aufgeführten Inhalte sind derzeit unter Umständen noch nicht zu 100 % barrierefrei für bestimmte Screenreader:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Die Navigation durch Tastatur-Shortcuts im interaktiven Ticket-Formular.</li>
            <li>Inhalte, die von anderen Nutzern als Fließtext ohne Formatierung in das Bürger-Forum eingereicht werden.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-afd-dark mb-3">3. Wir nehmen Feedback ernst (Kontakt)</h2>
          <p>
            Sind Ihnen Mängel beim barrierefreien Zugang zu Inhalten von "Wir für Nümbrecht" aufgefallen? Möchten Sie uns auf Barrieren hinweisen? Sie können uns gerne jederzeit kontaktieren:
          </p>
          <p className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <strong>AfD Fraktion Nümbrecht</strong><br/>
            E-Mail: [muster@afd-nuembrecht.de]<br/>
            Betreff: Feedback zur Barrierefreiheit
          </p>
        </section>

      </div>
    </div>
  );
};

export default Barrierefreiheit;
