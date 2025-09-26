import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';

interface CreditCard {
  id: number;
  cardName: string;
  lastFourDigits: string;
  cardType: string;
  expiryMonth: number;
  expiryYear: number;
  creditLimit: number;
  currentBalance: number;
  createdAt: string;
}

interface Transaction {
  id: number;
  amount: number;
  description: string;
  category: string;
  transactionDate: string;
  cardName?: string;
  lastFourDigits?: string;
}

export default function CreditCards() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCardFilter, setSelectedCardFilter] = useState<string>('All');
  
  const [cardForm, setCardForm] = useState({
    cardName: '',
    lastFourDigits: '',
    cardType: 'Visa',
    expiryMonth: 1,
    expiryYear: new Date().getFullYear(),
    creditLimit: ''
  });

  const [transactionForm, setTransactionForm] = useState({
    amount: '',
    description: '',
    category: 'Food',
    transactionDate: new Date().toISOString().split('T')[0]
  });

  const { logout } = useAuth();

  useEffect(() => {
    fetchCards();
    fetchTransactions();
  }, []);

  const fetchCards = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/creditcards`);
      setCards(response.data.cards);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        logout();
      } else {
        setError('Failed to load credit cards');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/creditcards/transactions`);
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/creditcards`, cardForm);
      setShowAddCard(false);
      setCardForm({
        cardName: '',
        lastFourDigits: '',
        cardType: 'Visa',
        expiryMonth: 1,
        expiryYear: new Date().getFullYear(),
        creditLimit: ''
      });
      fetchCards();
    } catch (error) {
      setError('Failed to add credit card');
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard) return;
    
    try {
      await axios.post(`${API_BASE_URL}/api/creditcards/${selectedCard}/transactions`, transactionForm);
      setShowAddTransaction(false);
      setTransactionForm({
        amount: '',
        description: '',
        category: 'Food',
        transactionDate: new Date().toISOString().split('T')[0]
      });
      setSelectedCard(null);
      fetchCards();
      fetchTransactions();
    } catch (error) {
      setError('Failed to add transaction');
    }
  };

  const categories = ['Food', 'Transportation', 'Shopping', 'Entertainment', 'Bills', 'Healthcare', 'Education', 'Other'];
  
  // Filter transactions based on selected category and card
  const filteredTransactions = transactions.filter(transaction => {
    const categoryMatch = selectedCategory === 'All' || transaction.category === selectedCategory;
    const cardMatch = selectedCardFilter === 'All' || 
      (transaction.cardName && transaction.lastFourDigits && 
       `${transaction.cardName} ••${transaction.lastFourDigits}` === selectedCardFilter);
    return categoryMatch && cardMatch;
  });
  const cardTypes = ['Visa', 'Mastercard', 'American Express', 'Discover'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your credit cards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">💳 Credit Card Manager</h1>
            <nav className="flex space-x-4">
              <Link to="/" className="px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors">
                Dashboard
              </Link>
              <Link to="/chat" className="px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors">
                AI Assistant
              </Link>
              <Link to="/cards" className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg font-medium">
                Credit Cards
              </Link>
              <button onClick={logout} className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors">
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Credit Cards Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Your Credit Cards</h2>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  if (cards.length > 0) {
                    setSelectedCard(cards[0].id);
                    setShowAddTransaction(true);
                  }
                }}
                disabled={cards.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                💳 Add Transaction
              </button>
              <button
                onClick={() => setShowAddCard(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Add Card
              </button>
            </div>
          </div>

          {cards.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No credit cards added yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards.map((card) => (
                <div key={card.id} className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white relative">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-blue-100 text-sm">{card.cardType}</p>
                      <p className="font-semibold">{card.cardName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-100 text-sm">Balance</p>
                      <p className="font-bold">${card.currentBalance.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-blue-100 text-sm">Card Number</p>
                    <p className="font-mono">•••• •••• •••• {card.lastFourDigits}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-blue-100 text-sm">Expires</p>
                      <p className="font-mono">{card.expiryMonth.toString().padStart(2, '0')}/{card.expiryYear.toString().slice(-2)}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCard(card.id);
                        setShowAddTransaction(true);
                      }}
                      className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm transition-colors"
                    >
                      Add Transaction
                    </button>
                  </div>
                  {card.creditLimit > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <div className="flex justify-between text-sm">
                        <span>Credit Limit</span>
                        <span>${card.creditLimit.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                        <div 
                          className="bg-white rounded-full h-2" 
                          style={{ width: `${Math.min((card.currentBalance / card.creditLimit) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
            <button
              onClick={() => setShowAddTransaction(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              + Add Transaction
            </button>
          </div>
          
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg mb-2">No transactions recorded yet</p>
              <p className="text-gray-400 text-sm mb-6">Start tracking your spending by adding your first transaction</p>
              <button
                onClick={() => setShowAddTransaction(true)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                💳 Add Your First Transaction
              </button>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">
                        Total Spent
                        {(selectedCategory !== 'All' || selectedCardFilter !== 'All') && 
                          ` (${[
                            selectedCategory !== 'All' ? selectedCategory : null,
                            selectedCardFilter !== 'All' ? selectedCardFilter : null
                          ].filter(Boolean).join(', ')})`
                        }
                      </p>
                      <p className="text-2xl font-bold text-blue-800">
                        ${filteredTransactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-blue-200 p-2 rounded-lg">
                      <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">
                        Transactions
                        {(selectedCategory !== 'All' || selectedCardFilter !== 'All') && 
                          ` (${[
                            selectedCategory !== 'All' ? selectedCategory : null,
                            selectedCardFilter !== 'All' ? selectedCardFilter : null
                          ].filter(Boolean).join(', ')})`
                        }
                      </p>
                      <p className="text-2xl font-bold text-green-800">{filteredTransactions.length}</p>
                    </div>
                    <div className="bg-green-200 p-2 rounded-lg">
                      <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">
                        Avg Transaction
                        {(selectedCategory !== 'All' || selectedCardFilter !== 'All') && 
                          ` (${[
                            selectedCategory !== 'All' ? selectedCategory : null,
                            selectedCardFilter !== 'All' ? selectedCardFilter : null
                          ].filter(Boolean).join(', ')})`
                        }
                      </p>
                      <p className="text-2xl font-bold text-purple-800">
                        ${filteredTransactions.length > 0 ? (filteredTransactions.reduce((sum, t) => sum + t.amount, 0) / filteredTransactions.length).toFixed(2) : '0.00'}
                      </p>
                    </div>
                    <div className="bg-purple-200 p-2 rounded-lg">
                      <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex flex-wrap items-center gap-4 mb-3">
                  {/* Category Filter */}
                  <div className="flex items-center space-x-2">
                    <label htmlFor="category-filter" className="text-sm font-medium text-gray-700">Category:</label>
                    <select
                      id="category-filter"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="All">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Credit Card Filter */}
                  <div className="flex items-center space-x-2">
                    <label htmlFor="card-filter" className="text-sm font-medium text-gray-700">Card:</label>
                    <select
                      id="card-filter"
                      value={selectedCardFilter}
                      onChange={(e) => setSelectedCardFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="All">All Cards</option>
                      {cards.map(card => (
                        <option key={card.id} value={`${card.cardName} ••${card.lastFourDigits}`}>
                          {card.cardName} ••{card.lastFourDigits}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Filter Results and Clear */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {filteredTransactions.length} transactions found
                    {selectedCategory !== 'All' && <span className="text-blue-600 font-medium"> in {selectedCategory}</span>}
                    {selectedCardFilter !== 'All' && <span className="text-green-600 font-medium"> on {selectedCardFilter}</span>}
                  </span>
                  
                  {(selectedCategory !== 'All' || selectedCardFilter !== 'All') && (
                    <button
                      onClick={() => {
                        setSelectedCategory('All');
                        setSelectedCardFilter('All');
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4 font-semibold">Date</th>
                      <th className="text-left py-3 px-4 font-semibold">Description</th>
                      <th className="text-left py-3 px-4 font-semibold">Category</th>
                      <th className="text-left py-3 px-4 font-semibold">Card</th>
                      <th className="text-right py-3 px-4 font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center">
                          <div className="text-gray-500">
                            <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-lg font-medium text-gray-900 mb-2">No transactions found</p>
                            <p className="text-sm text-gray-500">
                              {(selectedCategory !== 'All' || selectedCardFilter !== 'All') 
                                ? 'Try adjusting your filters to see more results'
                                : 'No transactions have been recorded yet'
                              }
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredTransactions
                      .slice(0, 10)
                      .map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-sm">
                          {new Date(transaction.transactionDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{transaction.description}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {transaction.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {transaction.cardName && (
                            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              {transaction.cardName} ••{transaction.lastFourDigits}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-semibold text-gray-900">
                            ${transaction.amount.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredTransactions.length > 10 && (
                  <div className="text-center mt-4 pt-4 border-t">
                    <p className="text-gray-500 text-sm">
                      Showing 10 of {filteredTransactions.length} transactions
                      {(selectedCategory !== 'All' || selectedCardFilter !== 'All') && (
                        <span className="text-blue-600 font-medium">
                          {' '}filtered by{' '}
                          {[
                            selectedCategory !== 'All' ? selectedCategory : null,
                            selectedCardFilter !== 'All' ? selectedCardFilter : null
                          ].filter(Boolean).join(' and ')}
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Add Card Modal */}
      {showAddCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Add Credit Card</h3>
            <form onSubmit={handleAddCard} className="space-y-4">
              <input
                type="text"
                placeholder="Card Name (e.g., Chase Freedom)"
                value={cardForm.cardName}
                onChange={(e) => setCardForm(prev => ({ ...prev, cardName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <input
                type="text"
                placeholder="Last 4 digits"
                value={cardForm.lastFourDigits}
                onChange={(e) => setCardForm(prev => ({ ...prev, lastFourDigits: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={4}
                pattern="[0-9]{4}"
                required
              />
              <label htmlFor="cardType" className="sr-only">Card Type</label>
              <select
                id="cardType"
                aria-label="Card Type"
                value={cardForm.cardType}
                onChange={(e) => setCardForm(prev => ({ ...prev, cardType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {cardTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <select
                  aria-label="Expiry Month"
                  value={cardForm.expiryMonth}
                  onChange={(e) => setCardForm(prev => ({ ...prev, expiryMonth: parseInt(e.target.value) }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {(i + 1).toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <label htmlFor="expiryYear" className="sr-only">Expiry Year</label>
                <select
                  id="expiryYear"
                  aria-label="Expiry Year"
                  value={cardForm.expiryYear}
                  onChange={(e) => setCardForm(prev => ({ ...prev, expiryYear: parseInt(e.target.value) }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
              <input
                type="number"
                placeholder="Credit Limit (optional)"
                value={cardForm.creditLimit}
                onChange={(e) => setCardForm(prev => ({ ...prev, creditLimit: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="0.01"
              />
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddCard(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Add Manual Transaction</h3>
            </div>
            <p className="text-gray-600 text-sm mb-6">Record a transaction that has been applied to your credit card</p>
            
            <form onSubmit={handleAddTransaction} className="space-y-4">
              {/* Card Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Credit Card</label>
                <label htmlFor="select-credit-card" className="block text-sm font-medium text-gray-700 mb-2">Select Credit Card</label>
                <select
                  id="select-credit-card"
                  value={selectedCard || ''}
                  onChange={(e) => setSelectedCard(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  aria-label="Select Credit Card"
                >
                  <option value="">Choose a card...</option>
                  {cards.map(card => (
                    <option key={card.id} value={card.id}>
                      {card.cardName} (••{card.lastFourDigits})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={transactionForm.amount}
                  onChange={(e) => setTransactionForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  placeholder="e.g., Grocery shopping at Walmart"
                  value={transactionForm.description}
                  onChange={(e) => setTransactionForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  aria-label="Transaction Category"
                  value={transactionForm.category}
                  onChange={(e) => setTransactionForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Transaction Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Date</label>
                <input
                  type="date"
                  placeholder="Select transaction date"
                  value={transactionForm.transactionDate}
                  onChange={(e) => setTransactionForm(prev => ({ ...prev, transactionDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTransaction(false);
                    setSelectedCard(null);
                    setTransactionForm({
                      amount: '',
                      description: '',
                      category: 'Food',
                      transactionDate: new Date().toISOString().split('T')[0]
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedCard}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  💳 Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}