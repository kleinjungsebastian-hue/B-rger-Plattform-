import React from 'react';

const Datenschutz = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white my-12 rounded-xl shadow-sm border border-gray-100">
      <h1 className="text-3xl font-bold text-afd-dark mb-8 border-b pb-4">Datenschutzerklärung</h1>
      
      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-afd-dark mb-4">1. Datenschutz auf einen Blick</h2>
          <h3 className="text-lg font-bold mb-2">Allgemeine Hinweise</h3>
          <p>
            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website ("Wir für Nümbrecht") besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-afd-dark mb-4">2. Hosting und Datenbank</h2>
          <h3 className="text-lg font-bold mb-2">Technologiepartner (Supabase / Netlify)</h3>
          <p>
            Wir hosten die Inhalte und die Datenbank unserer Website über externe Anbieter. 
            Wenn Sie Einträge im Bürger-Forum oder im Ticket-System vornehmen, werden diese Daten auf den Servern von unserem Cloud-Datenbank-Anbieter <strong>Supabase</strong> gespeichert. 
            Diese Datenverarbeitung beruht auf Art. 6 Abs. 1 lit. f DSGVO zur Bereitstellung eines funktionierenden und sicheren Kommunikationsportals.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-afd-dark mb-4">3. Datenerfassung auf der Website</h2>
          <h3 className="text-lg font-bold mb-2">Kontaktformular / Ticket-System</h3>
          <p>
            Wenn Sie uns per Kontaktformular (Ticket-System) Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten (wie z.B. Name oder Synonym) zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
          </p>
          <p className="mt-2">
            Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder zur Durchführung vorvertraglicher Maßnahmen erforderlich ist.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-afd-dark mb-4">4. Ihre Rechte</h2>
          <p>
            Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. Hierzu sowie zu weiteren Fragen zum Thema Datenschutz können Sie sich jederzeit an uns unter der im Impressum angegebenen Adresse wenden.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Datenschutz;
