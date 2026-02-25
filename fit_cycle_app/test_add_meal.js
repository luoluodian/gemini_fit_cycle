const axios = require('axios');

async function testAddMeal() {
  const baseURL = 'http://localhost:3000'; // Assume backend is running
  
  // 1. Login to get token
  // ... Or use a known valid token
  const token = 'YOUR_TOKEN_HERE'; // I need a token
  
  try {
    const res = await axios.post(`${baseURL}/records/meal`, {
      date: '2026-02-24',
      mealType: 'breakfast',
      foodId: 1,
      quantity: 100
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Success:', res.data);
  } catch (e) {
    console.error('Error:', e.response ? e.response.data : e.message);
  }
}
