import { useState } from 'react'
import { seedDatabase } from '../utils/seedData'
import { useNavigate } from 'react-router-dom'

export default function SeedData() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const navigate = useNavigate()

  const handleSeed = async () => {
    setLoading(true)
    const result = await seedDatabase()
    setResult(result)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-minsu-primary to-minsu-secondary flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Seed Database</h1>
          <p className="text-gray-600">Add sample disciplinary cases to your Firestore database</p>
        </div>

        {!result ? (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">This will add 5 sample cases:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li> 1 Pending case (Academic Dishonesty)</li>
                <li> 2 Active cases (Misconduct, Disrespect)</li>
                <li> 2 Resolved cases (Attendance, Dress Code)</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Make sure you've enabled Authentication and set Firestore rules before seeding!
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/app/dashboard')}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSeed}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-[#2563eb] hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? 'Seeding...' : 'Seed Database'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            {result.success ? (
              <>
                <h2 className="text-2xl font-bold text-green-600">Success!</h2>
                <p className="text-gray-700">
                  Added {result.count} sample cases to your database.
                </p>
                <button
                  onClick={() => navigate('/app/dashboard')}
                  className="px-8 py-3 bg-[#2563eb] hover:bg-blue-700 text-white rounded-lg font-semibold"
                >
                  Go to Dashboard
                </button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-red-600">Error</h2>
                <p className="text-gray-700">{result.error}</p>
                <div className="space-y-3">
                  <button
                    onClick={() => setResult(null)}
                    className="w-full px-6 py-3 bg-[#2563eb] hover:bg-blue-700 text-white rounded-lg font-semibold"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate('/app/dashboard')}
                    className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
