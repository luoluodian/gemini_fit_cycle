const axios = require('axios');

const baseURL = 'http://localhost:3000';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIxIiwiaWF0IjoxNzcwMDg4NDMyLCJleHAiOjE3NzA2OTMyMzJ9.S4lgYfSNOF7f0QpNdPhqUWzQJPrr9Jboxk8I4y4NxaI';

const api = axios.create({
  baseURL,
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

async function runTests() {
  console.log('--- P-2 API CRUD Tests ---');
  let planId;

  try {
    // 1. Create
    console.log('\n1. Testing POST /diet-plans (Create)');
    const createRes = await api.post('/diet-plans', {
      name: '测试增肌计划',
      description: '这是一个自动测试生成的计划',
      type: 'muscle-gain',
      cycleDays: 7,
      cycleCount: 4,
      targetCalories: 2500,
      targetProtein: 150,
      targetFat: 70,
      targetCarbs: 300
    });
    console.log('✅ Create Success:', createRes.data.data.id);
    planId = createRes.data.data.id;

    // 2. List
    console.log('\n2. Testing GET /diet-plans (List)');
    const listRes = await api.get('/diet-plans');
    console.log('✅ List Count:', listRes.data.data.length);

    // 3. Detail
    console.log(`\n3. Testing GET /diet-plans/${planId} (Detail)`);
    const detailRes = await api.get(`/diet-plans/${planId}`);
    console.log('✅ Detail Name:', detailRes.data.data.name);

    // 4. Update
    console.log(`\n4. Testing PUT /diet-plans/${planId} (Update)`);
    const updateRes = await api.put(`/diet-plans/${planId}`, {
      name: '测试增肌计划-修改后',
      status: 'active'
    });
    console.log('✅ Update Success:', updateRes.data.data.name);

    // 5. Delete
    console.log(`\n5. Testing DELETE /diet-plans/${planId} (Delete)`);
    const deleteRes = await api.delete(`/diet-plans/${planId}`);
    console.log('✅ Delete Success:', deleteRes.data.data.success);

  } catch (error) {
    console.error('❌ Test Failed:', error.response?.data || error.message);
  }
}

runTests();
