export default function InsightsPage() {
  const qna = [
    {
      q: "Why is budgeting important?",
      a: "Budgeting helps you control spending, track your goals, and make better financial decisions.",
    },
    {
      q: "What is fund management?",
      a: "It’s the process of handling financial assets to maximize returns and reduce risks.",
    },
    {
      q: "How does expense tracking help?",
      a: "Tracking expenses helps identify spending patterns and cut unnecessary costs.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 text-gray-800">
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-700">Financial Insights</h1>
      <p className="text-center text-lg mb-12">
        Learn the key principles of financial wellness, budgeting, and fund management.
      </p>

      <div className="space-y-8">
        {qna.map((item, index) => (
          <div key={index} className="bg-blue-50 p-6 rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">{item.q}</h2>
            <p className="text-gray-700">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}