export default function FormattedResponse({ response, showDisclaimer }) {
  const cleanedResponse = response
    .replace(/\*\*/g, '')        // remove bold markdown
    .replace(/#+\s*/g, '')       // remove markdown headings (#)
    .replace(/\r/g, '');         // remove carriage returns

  const lines = cleanedResponse
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  return (
    <div className="bg-gray-50 text-gray-900 p-4 rounded-lg shadow w-fit max-w-[90%] space-y-2 border border-gray-200">
      {lines.map((line, index) => {
        const isSectionHeading = /^[A-Z][a-zA-Z\s]{2,}$/.test(line) && !line.includes(':') && line.length < 50;
        return isSectionHeading ? (
          <h4 key={index} className="font-bold text-base text-gray-800 mt-4">{line}</h4>
        ) : (
          <p key={index} className="text-sm text-gray-900">{line}</p>
        );
      })}

      {showDisclaimer && (
        <div className="mt-4 text-sm text-yellow-800 bg-yellow-100 border border-yellow-300 p-2 rounded">
          ⚠️ This information is general and does not replace professional medical advice. Always consult a doctor.
        </div>
      )}
    </div>
  );
}
