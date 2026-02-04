
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
  console.log('--- P-4 Plan Status Management Tests ---');
  let planAId, planBId;

  try {
    // 1. Create two plans
    console.log('\n1. Creating Plan A and Plan B...');
    const resA = await api.post('/diet-plans', { name: 'Plan A', type: 'custom' });
    const resB = await api.post('/diet-plans', { name: 'Plan B', type: 'custom' });
    planAId = resA.data.data.id;
    planBId = resB.data.data.id;
    console.log(`✅ Created Plan A (ID: ${planAId}) and Plan B (ID: ${planBId})`);

    // 2. Activate Plan A
    console.log(`\n2. Activating Plan A (${planAId})...`);
    await api.post(`/diet-plans/${planAId}/activate`);
    
    const detailA = await api.get(`/diet-plans/${planAId}`);
    console.log('Plan A Status:', detailA.data.data.status);
    console.log('Plan A StartDate:', detailA.data.data.startDate);
    if (detailA.data.data.status === 'active' && detailA.data.data.startDate) {
      console.log('✅ Plan A activation and auto-date success');
    } else {
      throw new Error('Plan A activation failed');
    }

    // 3. Activate Plan B (Testing Single Active Principle)
    console.log(`\n3. Activating Plan B (${planBId})...`);
    await api.post(`/diet-plans/${planBId}/activate`);

    const finalA = await api.get(`/diet-plans/${planAId}`);
    const finalB = await api.get(`/diet-plans/${planBId}`);
    
    console.log('Plan A Status (should be paused):', finalA.data.data.status);
    console.log('Plan B Status (should be active):', finalB.data.data.status);

    if (finalA.data.data.status === 'paused' && finalB.data.data.status === 'active') {
      console.log('✅ Single Active Principle verified: Plan A was automatically paused');
    } else {
      throw new Error('Single Active Principle violation');
    }

    // 4. Pause Plan B
    console.log(`\n4. Pausing Plan B (${planBId})...`);
    await api.post(`/diet-plans/${planBId}/pause`);
    const pausedB = await api.get(`/diet-plans/${planBId}`);
    console.log('Plan B Status:', pausedB.data.data.status);
    if (pausedB.data.data.status === 'paused') {
      console.log('✅ Manual pause verified');
    } else {
      throw new Error('Manual pause failed');
    }

    // Cleanup
    console.log('\n5. Cleaning up...');
    await api.delete(`/diet-plans/${planAId}`);
    await api.delete(`/diet-plans/${planBId}`);
    console.log('✅ Cleanup complete');

  } catch (error) {
    console.error('❌ Test Failed:', error.response?.data || error.message);
  }
}

runTests();
