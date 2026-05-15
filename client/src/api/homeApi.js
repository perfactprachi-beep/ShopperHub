import api from './axios.js';

export async function fetchHomeData() {
  const { data } = await api.get('/home');
  return data.data;
}
