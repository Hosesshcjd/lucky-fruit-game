import React, { useState, useEffect } from 'react';
import { Cherry, Grape, Apple, Gift, Settings, Users, Coins } from 'lucide-react';

const FRUITS = [
  { id: 'cherry', icon: Cherry, color: 'text-red-500', multiplier: 5, name: 'Cherry', emoji: '🍒' },
  { id: 'lemon', color: 'text-yellow-400', multiplier: 5, name: 'Lemon', emoji: '🍋' },
  { id: 'grape', icon: Grape, color: 'text-purple-500', multiplier: 5, name: 'Grape', emoji: '🍇' },
  { id: 'apple', icon: Apple, color: 'text-green-500', multiplier: 10, name: 'Apple', emoji: '🍎' },
  { id: 'watermelon', color: 'text-red-400', multiplier: 15, name: 'Watermelon', emoji: '🍉' },
  { id: 'peach', color: 'text-orange-400', multiplier: 25, name: 'Peach', emoji: '🍑' },
  { id: 'strawberry', color: 'text-pink-500', multiplier: 45, name: 'Strawberry', emoji: '🍓' },
];

const BETS = [100, 1000, 10000, 50000];

export default function LuckyFruitGame() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState('Player1');
  const [users, setUsers] = useState({
    Player1: { balance: 1000, winnings: 0 },
    Player2: { balance: 500, winnings: 0 },
    Player3: { balance: 2000, winnings: 0 },
  });
  
  const [selectedBet, setSelectedBet] = useState(100);
  const [slots, setSlots] = useState([0, 1, 2, 3, 4, 5, 6, 7]);
  const [spinning, setSpinning] = useState(false);
  const [history, setHistory] = useState([]);
  const [roundNumber, setRoundNumber] = useState(1464);
  
  // Admin controls
  const [controlledFruits, setControlledFruits] = useState([]);
  const [forceNextResult, setForceNextResult] = useState(false);

  const getFruitByIndex = (idx) => FRUITS[idx % FRUITS.length];

  const spin = () => {
    if (spinning || users[currentUser].balance < selectedBet) return;
    
    setSpinning(true);
    
    // Deduct bet
    setUsers(prev => ({
      ...prev,
      [currentUser]: {
        ...prev[currentUser],
        balance: prev[currentUser].balance - selectedBet
      }
    }));

    setTimeout(() => {
      let newSlots;
      
      if (forceNextResult && controlledFruits.length === 8) {
        // Use admin-controlled result
        newSlots = controlledFruits.map(fruitId => 
          FRUITS.findIndex(f => f.id === fruitId)
        );
        setForceNextResult(false);
        setControlledFruits([]);
      } else {
        // Random result
        newSlots = Array(8).fill(0).map(() => Math.floor(Math.random() * FRUITS.length));
      }
      
      setSlots(newSlots);
      
      // Calculate winnings
      const counts = {};
      newSlots.forEach(idx => {
        const fruit = getFruitByIndex(idx);
        counts[fruit.id] = (counts[fruit.id] || 0) + 1;
      });
      
      let totalWin = 0;
      Object.entries(counts).forEach(([fruitId, count]) => {
        const fruit = FRUITS.find(f => f.id === fruitId);
        if (count >= 5) {
          totalWin += selectedBet * fruit.multiplier * (count / 5);
        }
      });
      
      if (totalWin > 0) {
        setUsers(prev => ({
          ...prev,
          [currentUser]: {
            balance: prev[currentUser].balance + totalWin,
            winnings: prev[currentUser].winnings + totalWin
          }
        }));
      }
      
      // Add to history
      const newResult = newSlots.map(idx => getFruitByIndex(idx).id);
      setHistory(prev => [newResult, ...prev].slice(0, 8));
      setRoundNumber(prev => prev + 1);
      setSpinning(false);
    }, 2000);
  };

  const FruitDisplay = ({ fruitIndex, size = 16 }) => {
    const fruit = getFruitByIndex(fruitIndex);
    return (
      <div className="flex flex-col items-center justify-center">
        <span className={`text-${size === 16 ? '5xl' : size === 12 ? '4xl' : '2xl'}`}>
          {fruit.emoji}
        </span>
      </div>
    );
  };

  const addMoneyToUser = (username, amount) => {
    setUsers(prev => ({
      ...prev,
      [username]: {
        ...prev[username],
        balance: prev[username].balance + amount
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-4 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-xl p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">Lucky Fruit</h1>
            <p className="text-white text-sm">Round {roundNumber} of today</p>
          </div>
        </div>
        <button
          onClick={() => setIsAdmin(!isAdmin)}
          className={`p-2 rounded-lg ${isAdmin ? 'bg-green-500' : 'bg-white'} transition-colors`}
        >
          <Settings className={`w-6 h-6 ${isAdmin ? 'text-white' : 'text-purple-600'}`} />
        </button>
      </div>

      {/* Admin Panel */}
      {isAdmin && (
        <div className="max-w-4xl mx-auto mb-4 bg-gray-900 rounded-xl p-6 border-4 border-yellow-400">
          <h2 className="text-yellow-400 font-bold text-2xl mb-4 flex items-center gap-2">
            <Settings className="w-6 h-6" /> Admin Control Panel
          </h2>
          
          {/* User Selection */}
          <div className="mb-4">
            <label className="text-white font-semibold mb-2 block">Switch User:</label>
            <div className="flex gap-2">
              {Object.keys(users).map(username => (
                <button
                  key={username}
                  onClick={() => setCurrentUser(username)}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    currentUser === username
                      ? 'bg-yellow-400 text-gray-900'
                      : 'bg-gray-700 text-white'
                  }`}
                >
                  {username}
                </button>
              ))}
            </div>
          </div>

          {/* Add Money */}
          <div className="mb-4">
            <label className="text-white font-semibold mb-2 block">Add Money to Users:</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(users).map(username => (
                <div key={username} className="bg-gray-800 p-3 rounded-lg">
                  <p className="text-white text-sm mb-2">{username}</p>
                  <p className="text-yellow-400 text-xs mb-2">Balance: {users[username].balance}</p>
                  <div className="flex gap-1 flex-wrap">
                    {[100, 1000, 5000, 10000].map(amount => (
                      <button
                        key={amount}
                        onClick={() => addMoneyToUser(username, amount)}
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                      >
                        +{amount}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Control Next Result */}
          <div className="mb-4">
            <label className="text-white font-semibold mb-2 block">Control Next Spin Result:</label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[...Array(8)].map((_, idx) => (
                <div key={idx} className="bg-gray-800 p-2 rounded-lg">
                  <p className="text-white text-xs mb-2">Slot {idx + 1}</p>
                  <select
                    value={controlledFruits[idx] || ''}
                    onChange={(e) => {
                      const newFruits = [...controlledFruits];
                      newFruits[idx] = e.target.value;
                      setControlledFruits(newFruits);
                    }}
                    className="w-full bg-gray-700 text-white rounded p-1 text-xs"
                  >
                    <option value="">Random</option>
                    {FRUITS.map(fruit => (
                      <option key={fruit.id} value={fruit.id}>
                        {fruit.emoji} {fruit.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <button
              onClick={() => setForceNextResult(controlledFruits.filter(f => f).length === 8)}
              disabled={controlledFruits.filter(f => f).length !== 8}
              className={`w-full py-2 rounded-lg font-bold ${
                controlledFruits.filter(f => f).length === 8
                  ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-500'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {forceNextResult ? '✓ Next Spin Controlled' : 'Set Next Result'} ({controlledFruits.filter(f => f).length}/8)
            </button>
          </div>
        </div>
      )}

      {/* Main Game */}
      <div className="max-w-4xl mx-auto bg-gradient-to-b from-orange-900 to-orange-950 rounded-3xl p-6 shadow-2xl border-8 border-yellow-600">
        <div className="text-center mb-4">
          <h2 className="text-4xl font-bold text-yellow-400 mb-2" style={{ textShadow: '0 0 20px rgba(251, 191, 36, 0.5)' }}>
            Lucky Fruit
          </h2>
          <p className="text-yellow-200">Current Player: <span className="font-bold">{currentUser}</span></p>
        </div>

        {/* Fruit Grid */}
        <div className="bg-gradient-to-b from-yellow-900 to-orange-900 rounded-2xl p-6 border-4 border-yellow-500 mb-6">
          <div className="grid grid-cols-4 gap-3 mb-4">
            {slots.slice(0, 4).map((fruitIdx, idx) => {
              const fruit = getFruitByIndex(fruitIdx);
              return (
                <div key={idx} className={`bg-gradient-to-b from-yellow-800 to-orange-900 rounded-xl p-4 border-2 border-yellow-600 flex flex-col items-center justify-center aspect-square ${spinning ? 'animate-pulse' : ''}`}>
                  <FruitDisplay fruitIndex={fruitIdx} size={12} />
                  <p className="text-yellow-200 text-sm mt-2">{fruit.multiplier} times</p>
                </div>
              );
            })}
          </div>

          {/* Lucky Cards */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-3 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
              Lucky
            </div>
            <div className="bg-gradient-to-br from-red-900 to-red-950 rounded-xl p-4 flex items-center justify-center border-4 border-yellow-500">
              <p className="text-6xl font-bold text-yellow-400" style={{ fontFamily: 'monospace' }}>
                08
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-3 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
              Lucky
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {slots.slice(4, 8).map((fruitIdx, idx) => {
              const fruit = getFruitByIndex(fruitIdx);
              return (
                <div key={idx + 4} className={`bg-gradient-to-b from-yellow-800 to-orange-900 rounded-xl p-4 border-2 border-yellow-600 flex flex-col items-center justify-center aspect-square ${spinning ? 'animate-pulse' : ''}`}>
                  <FruitDisplay fruitIndex={fruitIdx} size={12} />
                  <p className="text-yellow-200 text-sm mt-2">{fruit.multiplier} times</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bet Selection */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {BETS.map(bet => (
            <button
              key={bet}
              onClick={() => setSelectedBet(bet)}
              disabled={spinning}
              className={`relative ${
                selectedBet === bet
                  ? 'bg-gradient-to-b from-yellow-400 to-yellow-600 transform scale-105'
                  : 'bg-gradient-to-b from-yellow-600 to-yellow-800'
              } rounded-full h-16 font-bold text-white shadow-lg transition-all hover:scale-105 disabled:opacity-50`}
            >
              <div className="flex items-center justify-center gap-1">
                <Coins className="w-5 h-5" />
                <span>{bet}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Spin Button */}
        <button
          onClick={spin}
          disabled={spinning || users[currentUser].balance < selectedBet}
          className={`w-full py-4 rounded-xl font-bold text-2xl transition-all ${
            spinning || users[currentUser].balance < selectedBet
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transform hover:scale-105'
          }`}
        >
          {spinning ? '🎰 SPINNING...' : users[currentUser].balance < selectedBet ? 'INSUFFICIENT BALANCE' : '🎰 SPIN NOW!'}
        </button>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-gradient-to-br from-yellow-800 to-orange-900 rounded-xl p-4 border-2 border-yellow-600">
            <p className="text-yellow-200 text-sm mb-1">Balance</p>
            <div className="flex items-center gap-2">
              <Coins className="w-6 h-6 text-yellow-400" />
              <p className="text-2xl font-bold text-white">{users[currentUser].balance}</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-800 to-orange-900 rounded-xl p-4 border-2 border-yellow-600">
            <p className="text-yellow-200 text-sm mb-1">Today's Winnings</p>
            <div className="flex items-center gap-2">
              <Gift className="w-6 h-6 text-yellow-400" />
              <p className="text-2xl font-bold text-white">{users[currentUser].winnings}</p>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="mt-6 bg-gradient-to-br from-yellow-800 to-orange-900 rounded-xl p-4 border-2 border-yellow-600">
          <p className="text-yellow-200 mb-3 flex items-center gap-2">
            <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs">new</span>
            Results:
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {history.map((result, idx) => (
              <div key={idx} className="flex gap-1 bg-orange-950 rounded-lg p-2 border border-yellow-700 shrink-0">
                {result.slice(0, 4).map((fruitId, i) => {
                  const fruit = FRUITS.find(f => f.id === fruitId);
                  return <span key={i} className="text-2xl">{fruit.emoji}</span>;
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All Users Balance Display */}
      <div className="max-w-4xl mx-auto mt-4 bg-gray-900 bg-opacity-50 rounded-xl p-4">
        <h3 className="text-white font-bold mb-3">All Players</h3>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(users).map(([username, data]) => (
            <div
              key={username}
              className={`p-3 rounded-lg transition-all ${
                currentUser === username
                  ? 'bg-yellow-400 text-gray-900 transform scale-105'
                  : 'bg-gray-800 text-white'
              }`}
            >
              <p className="font-semibold">{username}</p>
              <p className="text-sm">Balance: {data.balance}</p>
              <p className="text-sm">Won: {data.winnings}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}