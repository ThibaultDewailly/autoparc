import { BrowserRouter as Router } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4">
            <h1 className="text-3xl font-bold text-gray-900">AutoParc</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 px-4">
          <p className="text-gray-600">Gestion de Flotte - MVP en développement</p>
        </main>
      </div>
    </Router>
  )
}

export default App
