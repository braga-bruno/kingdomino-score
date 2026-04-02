export type TerrainType = 'wheat' | 'forest' | 'lake' | 'swamp' | 'grassland' | 'mine';

export interface Territory {
  id: string;
  terrain: TerrainType;
  size: number;
  crowns: number;
}

export interface Player {
  id: string;
  name: string;
  territories: Territory[];
  bonus5x5: boolean;
  bonusCenter: boolean;
}

export const TERRAIN_COLORS: Record<TerrainType, string> = {
  wheat: 'bg-yellow-400',
  forest: 'bg-green-700',
  lake: 'bg-blue-500',
  swamp: 'bg-amber-800',
  grassland: 'bg-green-400',
  mine: 'bg-gray-700',
};

export const TERRAIN_NAMES: Record<TerrainType, string> = {
  wheat: 'Trigo',
  forest: 'Floresta',
  lake: 'Lago',
  swamp: 'Pântano',
  grassland: 'Pradaria',
  mine: 'Mina',
};
