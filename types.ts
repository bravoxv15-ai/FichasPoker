
export enum View {
  MENU = 'menu',
  GAME = 'game'
}

export enum Tab {
  TABLE = 'table',
  BANK = 'bank',
  LOBBY = 'lobby'
}

export interface ChipDenomination {
  val: number;
  color: string;
  text: string;
  border: string;
  glow: string;
}

export interface TableState {
  [key: number]: number;
}

export interface Player {
  uid: string;
  name: string;
  bank: number;
  table: TableState;
  lastUpdate: number;
}

export interface GameState {
  players: Record<string, Player>;
  currentRoomId: string | null;
}
