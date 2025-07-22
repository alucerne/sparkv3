export default function TestPage() {
  return (
    <div className="min-h-screen bg-green-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-green-900 mb-4">
          ✅ SPARK AI - Deployment Test
        </h1>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Status: Working!</h2>
          <p className="text-gray-600 mb-4">
            If you can see this page, the Next.js app is deployed and working correctly.
          </p>
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="font-semibold mb-2">Environment Info:</h3>
            <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
            <p><strong>Build Time:</strong> {new Date().toISOString()}</p>
            <p><strong>Domain:</strong> spark.audiencelab.io</p>
          </div>
        </div>
      </div>
    </div>
  );
} 