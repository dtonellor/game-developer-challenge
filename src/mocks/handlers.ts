import { http, HttpResponse } from 'msw';

type MatchRecord = {
  id: string;
  playerName: string;
  score: number;
  duration: number;
  date: string;
  reason: 'TIME' | 'DEATH';
  config: any;
};

// Simple in-memory / localstorage storage for the mocks
const getRecords = (): MatchRecord[] => {
  const data = localStorage.getItem('pirate-battle-matches');
  return data ? JSON.parse(data) : [];
};

const saveRecord = (record: MatchRecord) => {
  const records = getRecords();
  records.push(record);
  localStorage.setItem('pirate-battle-matches', JSON.stringify(records));
};

export const handlers = [
  http.get('/api/ranking', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = 10;
    
    const records = getRecords().sort((a, b) => b.score - a.score);
    const start = (page - 1) * limit;
    const paginated = records.slice(start, start + limit);
    
    return HttpResponse.json({
      data: paginated,
      total: records.length,
      page,
      totalPages: Math.ceil(records.length / limit)
    });
  }),

  http.get('/api/history', ({ request }) => {
    const url = new URL(request.url);
    const playerName = url.searchParams.get('playerName') || 'Player';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = 10;
    
    const records = getRecords()
      .filter(r => r.playerName === playerName)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
    const start = (page - 1) * limit;
    const paginated = records.slice(start, start + limit);
    
    return HttpResponse.json({
      data: paginated,
      total: records.length,
      page,
      totalPages: Math.ceil(records.length / limit)
    });
  }),

  http.post('/api/history', async ({ request }) => {
    const body = await request.json() as Omit<MatchRecord, 'id' | 'date'>;
    
    const newRecord: MatchRecord = {
      ...body,
      id: Math.random().toString(36).substring(7),
      date: new Date().toISOString(),
    };
    
    saveRecord(newRecord);
    return HttpResponse.json(newRecord, { status: 201 });
  })
];
