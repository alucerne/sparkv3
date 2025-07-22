export default function Home() {
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-900 mb-4">
          ✅ SPARK AI is Working!
        </h1>
        <p className="text-xl text-green-700 mb-8">
          The deployment is successful and the app is running.
        </p>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Status Check</h2>
          <p className="text-gray-600 mb-2">✅ Next.js App: Running</p>
          <p className="text-gray-600 mb-2">✅ Domain: sparkv3.vercel.app</p>
          <p className="text-gray-600 mb-2">✅ Build: Successful</p>
          <p className="text-gray-600 mb-2">✅ Routing: Working</p>
          <p className="text-gray-600">🕐 Deployed: {new Date().toISOString()}</p>
        </div>
        <div className="mt-6">
          <a 
            href="/test" 
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Test Page
          </a>
        </div>
      </div>
    </div>
  );
}
