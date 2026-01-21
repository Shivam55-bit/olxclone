// src/apis/testRunner.js
// Simple test runner for API integration tests

import { runAllAPITests, testEndpoint } from './__tests__/apiTests';
import { getTopPicks } from './homeApi';
import { loginUser } from './authApi';

/**
 * Quick test for specific endpoints
 */
export const quickTest = async () => {
  console.log('🚀 Running Quick API Tests...');
  
  // Test 1: Check API documentation availability
  const docTest = await testEndpoint('API Documentation', async () => {
    const response = await fetch('https://olx.fixsservices.com/docs');
    return { accessible: response.ok, status: response.status };
  });

  // Test 2: Test top picks endpoint
  const topPicksTest = await testEndpoint('Get Top Picks', () => getTopPicks());

  // Test 3: Test login with dummy data (should fail gracefully)
  const loginTest = await testEndpoint('Login Validation', async () => {
    try {
      return await loginUser({ email: 'test@test.com', password: 'test' });
    } catch (error) {
      // Expected to fail - we're testing error handling
      return { error_handled: true, message: error.message };
    }
  });

  console.log('\n📊 Quick Test Summary:');
  console.log(`API Documentation: ${docTest.success ? '✅' : '❌'}`);
  console.log(`Top Picks Endpoint: ${topPicksTest.success ? '✅' : '❌'}`);
  console.log(`Error Handling: ${loginTest.success ? '✅' : '❌'}`);
  
  return [docTest, topPicksTest, loginTest];
};

/**
 * Run comprehensive tests
 */
export const runComprehensiveTests = async () => {
  return await runAllAPITests();
};

export default {
  quickTest,
  runComprehensiveTests
};