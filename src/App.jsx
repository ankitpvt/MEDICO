import React, { useState } from 'react';
function App() {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
//   const OPENROUTER_API_KEY = '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';
  const YOUR_SITE_URL = "https://your-symptom-checker.com";
  const YOUR_SITE_NAME = "My Symptom Checker";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!symptoms.trim()) {
      setErrorMessage('Please enter some symptoms to get a diagnosis.');
      return;
    }

    setLoading(true);
    setResponse('');

    try {
      const payload = {
        model: "deepseek/deepseek-chat:free",
        messages: [
          {
            role: "user",
            content: `I have the following symptoms: ${symptoms}. Please tell me the possible diseases, recommended medicines, precautions, and advice.`
          }
        ]
      };

      const apiUrl = "https://openrouter.ai/api/v1/chat/completions";

      const result = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': YOUR_SITE_URL,
          'X-Title': YOUR_SITE_NAME,
        },
        body: JSON.stringify(payload),
      });

      if (!result.ok) {
        const errorData = await result.json();
        console.error('API Error Response:', errorData);

        setErrorMessage(
          `API request failed with status ${result.status}. ` +
          `Error: ${errorData.message || errorData.error?.message || 'Unknown error.'} ` +
          `Please check your OpenRouter API key and permissions.`
        );
        return;
      }

      const data = await result.json();
      const aiResponseContent = data.choices?.[0]?.message?.content;

      if (aiResponseContent) {
        setResponse(aiResponseContent);
      } else {
        setResponse('No valid response received from the AI. Please try again.');
      }

    } catch (error) {
      console.error('Error during API call:', error);
      setErrorMessage(`An unexpected error occurred: ${error.message || 'Please try again later.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-purple-400 via-pink-300 to-yellow-200 flex items-center justify-center p-4 font-sans">
      <div className="backdrop-blur-lg bg-white/70 p-10 rounded-3xl shadow-2xl w-full max-w-2xl border border-white/30">
        <h1 className="text-5xl font-extrabold text-center text-gray-800 mb-8 tracking-tight drop-shadow-lg">
          Symptom Checker
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="symptoms" className="block text-lg font-semibold text-gray-700 mb-2">
              Enter Symptoms:
            </label>
            <input
              id="symptoms"
              type="text"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g., headache, fever, sore throat, cough"
              className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-4 focus:ring-purple-300 focus:border-purple-500 text-base transition duration-200 disabled:opacity-70 disabled:bg-gray-100"
              disabled={loading}
            />
          </div>

          {errorMessage && (
            <div className="bg-red-200 border border-red-400 text-red-800 px-4 py-3 rounded-lg" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline ml-2">{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {loading ? 'Checking...' : 'Check Symptoms'}
          </button>
        </form>

        {loading && (
          <p className="text-center text-purple-700 mt-8 text-lg font-semibold animate-pulse">
            Asking MEDICO for a diagnosis...
          </p>
        )}

        {response && (
          <div className="mt-10 p-6 bg-white/90 rounded-2xl border border-purple-200 shadow-inner">
            <h2 className="text-2xl font-bold text-purple-800 mb-4 flex items-center">
              <span role="img" aria-label="robot icon" className="mr-2">🤖</span> MEDICO Response
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{response}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
