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

async function runV7Tests() {
  console.log('🚀 Starting V7 Plan Flow Integration Tests...');
  let planId;
  let dayId;

  try {
    // 1. Create Plan (DRAFT)
    console.log('\n--- Step 1: Create Plan (POST /diet-plans) ---');
    const createRes = await api.post('/diet-plans', {
      name: 'V7 集成测试计划',
      type: 'carb-cycle',
      cycleDays: 7,
      cycleCount: 4
    });
    planId = createRes.data.data.id;
    console.log('✅ Plan Created, ID:', planId);

    // 2. Batch Init Days
    console.log('\n--- Step 2: Init Days (POST /diet-plans/:id/init-days) ---');
    const initRes = await api.post(`/diet-plans/${planId}/init-days`, {
      days: [
        { dayNumber: 1, carbType: 'high', targetCalories: 2200 },
        { dayNumber: 2, carbType: 'low', targetCalories: 1600 }
      ]
    });
    console.log('✅ Days Initialized:', initRes.data.data.count);

    // 3. Get Plan Detail to find a Day ID
    console.log('\n--- Step 3: Fetch Detail to find Day ID ---');
    const detailRes = await api.get(`/diet-plans/${planId}`);
    const days = detailRes.data.data.planDays;
    dayId = days[0].id;
    console.log('✅ Found Day ID:', dayId, 'for Day Number:', days[0].dayNumber);

    // 4. Get Single Day Detail
    console.log('\n--- Step 4: Fetch Day Detail (GET /diet-plans/days/:dayId/detail) ---');
    const dayDetailRes = await api.get(`/diet-plans/days/${dayId}/detail`);
    console.log('✅ Day Detail Loaded, Day Number:', dayDetailRes.data.data.dayNumber);

    // 5. Full Update Day
    console.log('\n--- Step 5: Full Update Day (PUT /diet-plans/days/:dayId/full-update) ---');
    await api.put(`/diet-plans/days/${dayId}/full-update`, {
      isConfigured: true,
      meals: [
        {
          mealTypeId: 1,
          scheduledTime: '08:00',
          items: [
            { customName: '测试鸡蛋', quantity: 2, unit: '个', calories: 140, protein: 12, fat: 10, carbs: 2 }
          ]
        }
      ]
    });
    console.log('✅ Day Updated Successfully');

    // 6. Final List Verification
    console.log('\n--- Step 6: List Verification (GET /diet-plans) ---');
    const listRes = await api.get('/diet-plans');
    const myPlan = listRes.data.data.items.find(p => p.id == planId);
    console.log('✅ Plan found in list, status:', myPlan.status);

    console.log('\n✨ ALL V7 FLOW TESTS PASSED! ✨');

  } catch (error) {
    console.error('❌ Test Failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error Message:', error.message);
    }
    process.exit(1);
  }
}

runV7Tests();