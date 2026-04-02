import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  UserPlus, 
  Trophy, 
  ChevronRight, 
  ChevronLeft, 
  Crown, 
  Grid3X3, 
  Castle,
  RotateCcw,
  Info
} from 'lucide-react';
import { TerrainType, Player, Territory, TERRAIN_COLORS, TERRAIN_NAMES } from './types';

const TERRAINS: TerrainType[] = ['wheat', 'forest', 'lake', 'swamp', 'grassland', 'mine'];

export default function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [newPlayerName, setNewPlayerName] = useState('');

  const addPlayer = () => {
    if (!newPlayerName.trim()) return;
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name: newPlayerName.trim(),
      territories: [],
      bonus5x5: false,
      bonusCenter: false,
    };
    setPlayers([...players, newPlayer]);
    setNewPlayerName('');
    if (!activePlayerId) setActivePlayerId(newPlayer.id);
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
    if (activePlayerId === id) {
      const remaining = players.filter(p => p.id !== id);
      setActivePlayerId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const updatePlayer = (id: string, updates: Partial<Player>) => {
    setPlayers(players.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const addTerritory = (playerId: string, terrain: TerrainType) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    const newTerritory: Territory = {
      id: crypto.randomUUID(),
      terrain,
      size: 1,
      crowns: 0,
    };

    updatePlayer(playerId, {
      territories: [...player.territories, newTerritory],
    });
  };

  const removeTerritory = (playerId: string, territoryId: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    updatePlayer(playerId, {
      territories: player.territories.filter(t => t.id !== territoryId),
    });
  };

  const updateTerritory = (playerId: string, territoryId: string, updates: Partial<Territory>) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    updatePlayer(playerId, {
      territories: player.territories.map(t => t.id === territoryId ? { ...t, ...updates } : t),
    });
  };

  const calculateScore = (player: Player) => {
    const territoryScore = player.territories.reduce((acc, t) => acc + (t.size * t.crowns), 0);
    const bonusScore = (player.bonus5x5 ? 10 : 0) + (player.bonusCenter ? 5 : 0);
    return territoryScore + bonusScore;
  };

  const activePlayer = useMemo(() => 
    players.find(p => p.id === activePlayerId), 
    [players, activePlayerId]
  );

  const sortedPlayers = useMemo(() => 
    [...players].sort((a, b) => calculateScore(b) - calculateScore(a)),
    [players]
  );

  const [showHelp, setShowHelp] = useState(false);

  const resetAll = () => {
    if (window.confirm('Tem certeza que deseja resetar todos os jogadores e pontuações?')) {
      setPlayers([]);
      setActivePlayerId(null);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-stone-800 flex items-center gap-2">
              <Trophy className="text-yellow-600" />
              Kingdomino Score
            </h1>
            <p className="text-stone-500">Contabilize as pontuações do seu reino</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowHelp(!showHelp)}
              className="p-2.5 bg-white hover:bg-stone-50 text-stone-600 rounded-xl border border-stone-200 transition-colors shadow-sm"
              title="Como jogar"
            >
              <Info size={22} />
            </button>
            <button 
              onClick={resetAll}
              className="px-5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl flex items-center gap-2 transition-colors font-medium shadow-sm"
            >
              <RotateCcw size={18} />
              Resetar
            </button>
          </div>
        </header>

        {/* Help Section */}
        <AnimatePresence>
          {showHelp && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
                <h3 className="font-bold text-xl text-stone-800 flex items-center gap-2">
                  <Info size={22} className="text-blue-500" />
                  Como funciona a pontuação?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-stone-600">
                  <div className="space-y-3">
                    <p className="font-bold text-stone-700 text-base">Cálculo por Território:</p>
                    <p>Cada território (grupo de peças adjacentes do mesmo tipo) vale:</p>
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 font-mono text-center text-lg font-bold text-stone-800">
                      (Peças) × (Coroas)
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="font-bold text-stone-700 text-base">Bônus:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                        <span><span className="font-bold text-stone-800">+10 pontos</span> se o reino (5x5) estiver completo (sem buracos).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <span><span className="font-bold text-stone-800">+5 pontos</span> se o castelo estiver exatamente no centro do reino.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar: Players List */}
          <div className="lg:col-span-1 space-y-6">
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-stone-700">
                <UserPlus size={20} className="text-stone-400" />
                Jogadores
              </h2>
              
              <div className="flex gap-3 mb-6">
                <input 
                  type="text" 
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
                  placeholder="Nome do jogador..."
                  className="flex-1 px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-sm"
                />
                <button 
                  onClick={addPlayer}
                  className="p-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl transition-colors shadow-md active:scale-95"
                >
                  <Plus size={24} />
                </button>
              </div>

              <div className="space-y-3">
                {players.map((player) => {
                  const isWinner = players.length > 1 && calculateScore(player) === calculateScore(sortedPlayers[0]) && calculateScore(player) > 0;
                  return (
                    <div 
                      key={player.id}
                      className={`group flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer relative ${
                        activePlayerId === player.id 
                          ? 'bg-yellow-50 border-yellow-200 border shadow-sm' 
                          : 'hover:bg-stone-50 border-transparent border'
                      }`}
                      onClick={() => setActivePlayerId(player.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shrink-0 shadow-sm ${
                          activePlayerId === player.id ? 'bg-yellow-500 text-white' : 'bg-stone-200 text-stone-600'
                        }`}>
                          {player.name[0].toUpperCase()}
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-stone-800 leading-none flex items-center gap-2">
                            {player.name}
                            {isWinner && <Trophy size={14} className="text-yellow-600" />}
                          </p>
                          <p className="text-xs font-medium text-stone-400 mt-1.5">{calculateScore(player)} pts</p>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removePlayer(player.id);
                        }}
                        className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })}
                {players.length === 0 && (
                  <p className="text-center text-stone-400 py-10 text-sm italic">Nenhum jogador adicionado</p>
                )}
              </div>
            </section>

            {/* Leaderboard */}
            {players.length > 0 && (
              <section className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
                <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-stone-700">
                  <Trophy size={20} className="text-yellow-600" />
                  Ranking
                </h2>
                <div className="space-y-4">
                  {sortedPlayers.map((player, index) => (
                    <div key={player.id} className="flex items-center justify-between p-1">
                      <div className="flex items-center gap-4">
                        <span className={`text-sm font-black w-6 ${index === 0 ? 'text-yellow-600' : 'text-stone-400'}`}>
                          {index + 1}º
                        </span>
                        <span className="text-stone-700 font-medium">{player.name}</span>
                      </div>
                      <span className="font-black text-stone-900 bg-stone-100 px-3 py-1 rounded-lg text-sm">{calculateScore(player)}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Main Content: Player Scoring */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {activePlayer ? (
                <motion.div 
                  key={activePlayer.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-stone-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                      <div>
                        <h2 className="text-3xl font-black text-stone-800">{activePlayer.name}</h2>
                        <p className="text-stone-500 font-medium">Configure os territórios do reino</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => updatePlayer(activePlayer.id, { territories: [], bonus5x5: false, bonusCenter: false })}
                          className="p-3 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                          title="Limpar territórios deste jogador"
                        >
                          <Trash2 size={24} />
                        </button>
                        <div className="bg-stone-900 text-white px-8 py-4 rounded-[1.5rem] flex items-center gap-4 shadow-xl">
                          <span className="text-stone-400 text-xs uppercase tracking-[0.2em] font-black">Total</span>
                          <span className="text-4xl font-black">{calculateScore(activePlayer)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Add Terrains */}
                    <div className="mb-10">
                      <h3 className="text-xs font-black text-stone-400 uppercase tracking-[0.15em] mb-5">Adicionar Território</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                        {TERRAINS.map((terrain) => (
                          <button
                            key={terrain}
                            onClick={() => addTerritory(activePlayer.id, terrain)}
                            className={`flex flex-col items-center gap-3 p-4 rounded-2xl transition-all hover:scale-105 active:scale-95 ${TERRAIN_COLORS[terrain]} text-white shadow-md group`}
                          >
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                              <Plus size={24} />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-wider">{TERRAIN_NAMES[terrain]}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Territories List */}
                    <div className="space-y-6">
                      <h3 className="text-xs font-black text-stone-400 uppercase tracking-[0.15em] mb-5">Territórios</h3>
                      <div className="space-y-4">
                        {activePlayer.territories.map((territory) => (
                          <motion.div 
                            layout
                            key={territory.id}
                            className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-5 sm:p-6 bg-stone-50 rounded-3xl border border-stone-100 group relative shadow-sm"
                          >
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                              <div className={`w-14 h-14 rounded-2xl ${TERRAIN_COLORS[territory.terrain]} flex items-center justify-center text-white shrink-0 shadow-md`}>
                                <span className="text-[11px] font-black leading-tight text-center px-1 uppercase tracking-tighter">{TERRAIN_NAMES[territory.terrain]}</span>
                              </div>
                              <div className="sm:hidden flex-1">
                                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">{TERRAIN_NAMES[territory.terrain]}</p>
                                <p className="font-black text-xl text-stone-800">{territory.size * territory.crowns} pts</p>
                              </div>
                              <button 
                                onClick={() => removeTerritory(activePlayer.id, territory.id)}
                                className="sm:hidden p-3 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                              >
                                <Trash2 size={22} />
                              </button>
                            </div>
                            
                            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
                              {/* Size Control */}
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Tamanho</label>
                                <div className="flex items-center gap-3">
                                  <button 
                                    onClick={() => updateTerritory(activePlayer.id, territory.id, { size: Math.max(1, territory.size - 1) })}
                                    className="w-12 h-12 sm:w-10 sm:h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center hover:bg-stone-100 transition-colors shadow-sm active:scale-95"
                                  >
                                    <ChevronLeft size={22} />
                                  </button>
                                  <span className="flex-1 sm:w-8 text-center font-black text-2xl text-stone-800">{territory.size}</span>
                                  <button 
                                    onClick={() => updateTerritory(activePlayer.id, territory.id, { size: territory.size + 1 })}
                                    className="w-12 h-12 sm:w-10 sm:h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center hover:bg-stone-100 transition-colors shadow-sm active:scale-95"
                                  >
                                    <ChevronRight size={22} />
                                  </button>
                                </div>
                              </div>
                              
                              {/* Crowns Control */}
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Coroas</label>
                                <div className="flex items-center gap-3">
                                  <button 
                                    onClick={() => updateTerritory(activePlayer.id, territory.id, { crowns: Math.max(0, territory.crowns - 1) })}
                                    className="w-12 h-12 sm:w-10 sm:h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center hover:bg-stone-100 transition-colors shadow-sm active:scale-95"
                                  >
                                    <ChevronLeft size={22} />
                                  </button>
                                  <div className="flex-1 sm:w-10 flex items-center justify-center gap-2">
                                    <span className="font-black text-2xl text-stone-800">{territory.crowns}</span>
                                    <Crown size={18} className="text-yellow-500" />
                                  </div>
                                  <button 
                                    onClick={() => updateTerritory(activePlayer.id, territory.id, { crowns: territory.crowns + 1 })}
                                    className="w-12 h-12 sm:w-10 sm:h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center hover:bg-stone-100 transition-colors shadow-sm active:scale-95"
                                  >
                                    <ChevronRight size={22} />
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="text-right px-6 hidden sm:block border-l border-stone-200 ml-2">
                              <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-1">Subtotal</p>
                              <p className="font-black text-2xl text-stone-800">{territory.size * territory.crowns} pts</p>
                            </div>

                            <button 
                              onClick={() => removeTerritory(activePlayer.id, territory.id)}
                              className="hidden sm:block p-3 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                            >
                              <Trash2 size={22} />
                            </button>
                          </motion.div>
                        ))}
                        {activePlayer.territories.length === 0 && (
                          <div className="text-center py-12 bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200">
                            <Info className="mx-auto text-stone-300 mb-2" size={32} />
                            <p className="text-stone-400 text-sm">Adicione territórios para começar a pontuar</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bonuses */}
                    <div className="mt-12 pt-8 border-t border-stone-100">
                      <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mb-4">Bônus Adicionais</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          onClick={() => updatePlayer(activePlayer.id, { bonus5x5: !activePlayer.bonus5x5 })}
                          className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                            activePlayer.bonus5x5 
                              ? 'bg-green-50 border-green-200 text-green-700' 
                              : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
                          }`}
                        >
                          <div className={`p-2 rounded-xl ${activePlayer.bonus5x5 ? 'bg-green-500 text-white' : 'bg-stone-100 text-stone-400'}`}>
                            <Grid3X3 size={20} />
                          </div>
                          <div className="text-left">
                            <p className="font-bold">Reino Completo</p>
                            <p className="text-xs opacity-70">+10 pontos (Grade 5x5 cheia)</p>
                          </div>
                        </button>

                        <button
                          onClick={() => updatePlayer(activePlayer.id, { bonusCenter: !activePlayer.bonusCenter })}
                          className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                            activePlayer.bonusCenter 
                              ? 'bg-blue-50 border-blue-200 text-blue-700' 
                              : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
                          }`}
                        >
                          <div className={`p-2 rounded-xl ${activePlayer.bonusCenter ? 'bg-blue-500 text-white' : 'bg-stone-100 text-stone-400'}`}>
                            <Castle size={20} />
                          </div>
                          <div className="text-left">
                            <p className="font-bold">Castelo Centralizado</p>
                            <p className="text-xs opacity-70">+5 pontos (Castelo no centro)</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl shadow-sm border border-stone-200 min-h-[400px]">
                  <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6">
                    <Trophy size={40} className="text-stone-300" />
                  </div>
                  <h2 className="text-xl font-bold text-stone-800 mb-2">Selecione um Jogador</h2>
                  <p className="text-stone-500 max-w-xs">Adicione ou selecione um jogador na lista ao lado para começar a contabilizar os pontos.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
