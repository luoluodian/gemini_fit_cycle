
const axios = require('axios');

const baseURL = 'http://localhost:3000';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIxIiwiaWF0IjoxNzcwMDg4ODAwLCJleHAiOjE3NzA2OTM2MDB9.qkXf3Em3S8Ukb0452W1qgpy6ML7qH_65OEjYXmtDCk8';

const api = axios.create({
  baseURL,
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

async function runTests() {
  console.log('--- P-3 Template Batch Save Tests ---');
  let planId;

  try {
    // 1. Create a base plan
    console.log('\n1. Creating a base plan...');
    const createRes = await api.post('/diet-plans', {
      name: '批量保存测试计划',
      type: 'carb-cycle',
      cycleDays: 2
    });
    planId = createRes.data.data.id;
    console.log('✅ Base plan created, ID:', planId);

    // 2. Batch Save Templates (Nested JSON)
    console.log('\n2. Testing POST /diet-plans/:id/templates (Batch Save)');
    const templatesPayload = {
      templates: [
        {
          dayNumber: 1,
          carbType: 'low',
          targetCalories: 1800,
          meals: [
            {
              mealTypeId: 1, // 早餐
              scheduledTime: '08:00',
              items: [
                { customName: '鸡蛋', quantity: 2, unit: '个', calories: 140 },
                { customName: '全麦面包', quantity: 50, unit: 'g', calories: 120 }
              ]
            },
            {
              mealTypeId: 2, // 午餐
              scheduledTime: '12:00',
              items: [
                { customName: '鸡胸肉', quantity: 150, unit: 'g', calories: 200 }
              ]
            }
          ]
        },
        {
          dayNumber: 2,
          carbType: 'high',
          targetCalories: 2200,
          meals: [
            {
              mealTypeId: 1,
              scheduledTime: '08:00',
              items: [
                { customName: '燕麦片', quantity: 100, unit: 'g', calories: 350 }
              ]
            }
          ]
        }
      ]
    };

    const saveRes = await api.post(`/diet-plans/${planId}/templates`, templatesPayload);
    console.log('✅ Batch Save Success:', saveRes.data.data.success);

    // 3. Verify via Detail
    console.log('\n3. Verifying data via GET /diet-plans/:id');
    const detailRes = await api.get(`/diet-plans/${planId}`);
    const days = detailRes.data.data.planDays;
    
    console.log('Days count:', days.length);
    if (days.length === 2) {
      console.log('Day 1 target calories:', days[0].targetCalories);
      console.log('Day 1 meals count:', days[0].planMeals.length);
      console.log('Day 1 first meal items count:', days[0].planMeals[0].mealItems.length);
      console.log('✅ Data verification PASSED');
    } else {
      console.error('❌ Data verification FAILED: Expected 2 days, got', days.length);
    }

  } catch (error) {
    console.error('❌ Test Failed:', error.response?.data || error.message);
  }
}

runTests();
