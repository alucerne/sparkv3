export default function TestPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        SPARK AI Test Page
      </h1>
      <p className="text-gray-600">
        If you can see this page, the Next.js app is working correctly.
      </p>
      <div className="mt-4 p-4 bg-blue-50 rounded">
        <h2 className="font-semibold">Environment Variables:</h2>
        <p>NEXT_PUBLIC_SPARK_API_URL: {process.env.NEXT_PUBLIC_SPARK_API_URL || 'not set'}</p>
        <p>NODE_ENV: {process.env.NODE_ENV}</p>
      </div>
    </div>
  );
} 