async function testApi() {
  try {
    // 1. Login to get token
    const loginRes = await fetch('http://localhost:3000/auth/wechatAuth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'mock_code' })
    });
    const loginData = await loginRes.json();
    const token = loginData.data.accessToken;
    console.log('Login Success, Token obtained');

    // 2. Fetch food items
    const foodRes = await fetch('http://localhost:3000/food-items?page=1&pageSize=50', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const foodData = await foodRes.json();
    
    console.log('Food API Response:');
    console.log('Total:', foodData.data.total);
    console.log('Items Count:', foodData.data.items.length);
    if (foodData.data.items.length > 0) {
        console.log('First Item Name:', foodData.data.items[0].name);
    }
    
    if (foodData.data.items.length < 5) {
        console.log('Items Detail:', JSON.stringify(foodData.data.items, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testApi();