import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-3xl font-bold text-gray-900">� Finance Dashboard</h1>
            <nav className="flex space-x-4">
              <Link 
                to="/" 
                className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg font-medium"
              >
                Dashboard
              </Link>
              <Link 
                to="/chat" 
                className="px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
              >
                AI Assistant
              </Link>
              <Link 
                to="/cards" 
                className="px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
              >
                Credit Cards
              </Link>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Welcome, {user?.firstName || user?.email}!
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Your Financial Assistant</h2>
          <p className="text-gray-600 text-lg mb-6">
            Get personalized financial advice from our AI-powered chatbot, manage your credit cards, and track your spending all in one place!
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/chat"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              🤖 Start Chat with AI Assistant
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link 
              to="/cards"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              💳 Manage Credit Cards
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-3">Investment Advice</h3>
            </div>
            <p className="text-gray-600">Get AI-powered investment recommendations tailored to your financial goals.</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-3">Expense Tracking</h3>
            </div>
            <p className="text-gray-600 mb-4">Track your credit card transactions and analyze spending patterns.</p>
            <Link 
              to="/cards"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Add Transaction →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-3">Savings Strategy</h3>
            </div>
            <p className="text-gray-600">Discover effective ways to save money and build your emergency fund.</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Questions to Get Started</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Link to="/chat" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">💡 "How should I start investing?"</p>
              <p className="text-sm text-gray-600 mt-1">Get beginner-friendly investment advice</p>
            </Link>
            <Link to="/chat" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">🏦 "How much should I save each month?"</p>
              <p className="text-sm text-gray-600 mt-1">Learn about the 50/30/20 rule and more</p>
            </Link>
            <Link to="/chat" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">📊 "What's a good emergency fund size?"</p>
              <p className="text-sm text-gray-600 mt-1">Build financial security step by step</p>
            </Link>
            <Link to="/chat" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">🎯 "How to pay off debt faster?"</p>
              <p className="text-sm text-gray-600 mt-1">Strategic debt elimination plans</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
