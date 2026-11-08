import axios from 'axios';

// Клиент для запросов к нашему api. Пути пишем без префикса: api.get('/users') уйдёт на /api/users.
export const api = axios.create({ baseURL: '/api' });
