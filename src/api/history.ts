import axios from 'axios';

export const api = axios.create();

export type MatchRecordPayload = {
  playerName: string;
  score: number;
  duration: number;
  reason: 'TIME' | 'DEATH';
  config: any;
};

export const saveMatchHistory = async (payload: MatchRecordPayload) => {
  const response = await api.post('/api/history', payload);
  return response.data;
};
