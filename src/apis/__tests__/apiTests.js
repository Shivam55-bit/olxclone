// src/apis/__tests__/apiTests.js
// Comprehensive API integration tests for OLX Clone

import { BASE_URL } from '../api';
import { registerUser, loginUser, refreshToken } from '../authApi';
import { 
  getTopPicks, 
  getNearbyItems, 
  getFollowingItems,
  getItemsByCategory,
  getRecommendations,
  getTrendingAds 
} from '../homeApi';
import { 
  getMyAds, 
  getAdById, 
  getAllAds, 
  createAd, 
  updateAd, 
  deleteAd,
  getSimilarAds 
} from '../adApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Test Configuration
 */
const TEST_CONFIG = {
  baseUrl: BASE_URL,
  timeout: 30000,
  testUser: {
    username: 'testuser_' + Date.now(),
    email: 'test' + Date.now() + '@example.com',
    full_name: 'Test User',
    phone_number: '+919876543210',
    password: 'TestPassword123!'
  }
};

/**
 * Test Results Storage
 */
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  results: []
};

/**
 * Helper function to log test results
 */
const logTestResult = (testName, passed, response, error = null) => {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ PASS: ${testName}`);
  } else {
    testResults.failed++;
    console.log(`❌ FAIL: ${testName}`);
    if (error) {
      console.log(`   Error: ${error.message}`);
    }
  }
  
  testResults.results.push({
    test: testName,
    passed,
    response: passed ? response : null,
    error: error ? error.message : null,
    timestamp: new Date().toISOString()
  });
};

/**
 * Test API endpoint accessibility
 */
const testEndpointAccessibility = async () => {
  console.log('\n🧪 Testing API Endpoint Accessibility...');
  
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/docs`);
    logTestResult('API Documentation Accessible', response.ok, response.status);
  } catch (error) {
    logTestResult('API Documentation Accessible', false, null, error);
  }
};

/**
 * Test Authentication Flow
 */
const testAuthenticationFlow = async () => {
  console.log('\n🧪 Testing Authentication Flow...');
  
  // Test 1: User Registration
  try {
    const registerResponse = await registerUser(TEST_CONFIG.testUser);
    logTestResult('User Registration', !!registerResponse, registerResponse);
  } catch (error) {
    logTestResult('User Registration', false, null, error);
    return; // Stop auth tests if registration fails
  }

  // Test 2: User Login
  try {
    const loginResponse = await loginUser({
      email: TEST_CONFIG.testUser.email,
      password: TEST_CONFIG.testUser.password
    });
    logTestResult('User Login', !!loginResponse.access_token, loginResponse);
    
    // Store token for other tests
    if (loginResponse.access_token) {
      await AsyncStorage.setItem('access_token', loginResponse.access_token);
    }
  } catch (error) {
    logTestResult('User Login', false, null, error);
  }

  // Test 3: Token Refresh
  try {
    const refreshResponse = await refreshToken();
    logTestResult('Token Refresh', !!refreshResponse, refreshResponse);
  } catch (error) {
    logTestResult('Token Refresh', false, null, error);
  }
};

/**
 * Test Home API Endpoints
 */
const testHomeEndpoints = async () => {
  console.log('\n🧪 Testing Home API Endpoints...');

  // Test 1: Get Top Picks
  try {
    const topPicks = await getTopPicks();
    logTestResult('Get Top Picks', !!topPicks, topPicks);
  } catch (error) {
    logTestResult('Get Top Picks', false, null, error);
  }

  // Test 2: Get Nearby Items
  try {
    const nearbyItems = await getNearbyItems();
    logTestResult('Get Nearby Items', !!nearbyItems, nearbyItems);
  } catch (error) {
    logTestResult('Get Nearby Items', false, null, error);
  }

  // Test 3: Get Following Items
  try {
    const followingItems = await getFollowingItems();
    logTestResult('Get Following Items', !!followingItems, followingItems);
  } catch (error) {
    logTestResult('Get Following Items', false, null, error);
  }

  // Test 4: Get Items by Category
  try {
    const categoryItems = await getItemsByCategory('Electronics');
    logTestResult('Get Items by Category', !!categoryItems, categoryItems);
  } catch (error) {
    logTestResult('Get Items by Category', false, null, error);
  }

  // Test 5: Get Recommendations
  try {
    const recommendations = await getRecommendations();
    logTestResult('Get Recommendations', !!recommendations, recommendations);
  } catch (error) {
    logTestResult('Get Recommendations', false, null, error);
  }

  // Test 6: Get Trending Ads
  try {
    const trendingAds = await getTrendingAds();
    logTestResult('Get Trending Ads', !!trendingAds, trendingAds);
  } catch (error) {
    logTestResult('Get Trending Ads', false, null, error);
  }
};

/**
 * Test Ads API Endpoints
 */
const testAdsEndpoints = async () => {
  console.log('\n🧪 Testing Ads API Endpoints...');

  // Test 1: Get All Ads
  try {
    const allAds = await getAllAds();
    logTestResult('Get All Ads', !!allAds, allAds);
  } catch (error) {
    logTestResult('Get All Ads', false, null, error);
  }

  // Test 2: Get My Ads
  try {
    const myAds = await getMyAds();
    logTestResult('Get My Ads', !!myAds, myAds);
  } catch (error) {
    logTestResult('Get My Ads', false, null, error);
  }

  let createdAdId = null;

  // Test 3: Create Ad
  try {
    const testAdData = {
      title: 'Test Ad - ' + Date.now(),
      description: 'This is a test advertisement created by API tests',
      price: 1000,
      category: 'Electronics',
      condition: 'new',
      location: 'Test City',
      contact_phone: '+919876543210'
    };

    const createResponse = await createAd(testAdData);
    logTestResult('Create Ad', !!createResponse && createResponse.success !== false, createResponse);
    
    if (createResponse && createResponse.id) {
      createdAdId = createResponse.id;
    }
  } catch (error) {
    logTestResult('Create Ad', false, null, error);
  }

  // Test 4: Get Ad by ID (if we created one)
  if (createdAdId) {
    try {
      const adById = await getAdById(createdAdId);
      logTestResult('Get Ad by ID', !!adById, adById);
    } catch (error) {
      logTestResult('Get Ad by ID', false, null, error);
    }

    // Test 5: Get Similar Ads
    try {
      const similarAds = await getSimilarAds(createdAdId);
      logTestResult('Get Similar Ads', !!similarAds, similarAds);
    } catch (error) {
      logTestResult('Get Similar Ads', false, null, error);
    }

    // Test 6: Update Ad
    try {
      const updatedData = {
        title: 'Updated Test Ad - ' + Date.now(),
        price: 1200
      };
      const updateResponse = await updateAd(createdAdId, updatedData);
      logTestResult('Update Ad', !!updateResponse && updateResponse.success !== false, updateResponse);
    } catch (error) {
      logTestResult('Update Ad', false, null, error);
    }

    // Test 7: Delete Ad (cleanup)
    try {
      const deleteResponse = await deleteAd(createdAdId);
      logTestResult('Delete Ad', !!deleteResponse && deleteResponse.success !== false, deleteResponse);
    } catch (error) {
      logTestResult('Delete Ad', false, null, error);
    }
  }
};

/**
 * Test Error Handling
 */
const testErrorHandling = async () => {
  console.log('\n🧪 Testing Error Handling...');

  // Test 1: Invalid Login
  try {
    await loginUser({
      email: 'invalid@email.com',
      password: 'wrongpassword'
    });
    logTestResult('Invalid Login Error Handling', false, null, new Error('Should have failed'));
  } catch (error) {
    logTestResult('Invalid Login Error Handling', true, error.message);
  }

  // Test 2: Invalid Ad ID
  try {
    await getAdById('invalid-ad-id-12345');
    logTestResult('Invalid Ad ID Error Handling', false, null, new Error('Should have failed'));
  } catch (error) {
    logTestResult('Invalid Ad ID Error Handling', true, error.message);
  }

  // Test 3: Unauthorized Request (without token)
  try {
    await AsyncStorage.removeItem('access_token');
    await getMyAds();
    logTestResult('Unauthorized Request Error Handling', false, null, new Error('Should have failed'));
  } catch (error) {
    logTestResult('Unauthorized Request Error Handling', true, error.message);
  }
};

/**
 * Run All API Tests
 */
export const runAllAPITests = async () => {
  console.log('🚀 Starting Comprehensive API Integration Tests...');
  console.log(`📍 Testing against: ${TEST_CONFIG.baseUrl}`);
  
  const startTime = Date.now();
  
  // Clear previous test results
  testResults = {
    passed: 0,
    failed: 0,
    total: 0,
    results: []
  };

  // Run all test suites
  await testEndpointAccessibility();
  await testAuthenticationFlow();
  await testHomeEndpoints();
  await testAdsEndpoints();
  await testErrorHandling();

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  // Print final results
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${testResults.passed}/${testResults.total}`);
  console.log(`❌ Failed: ${testResults.failed}/${testResults.total}`);
  console.log(`⏱️  Duration: ${duration}s`);
  console.log(`📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  // Log detailed results
  console.log('\n📋 DETAILED RESULTS:');
  testResults.results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.passed ? '✅' : '❌'} ${result.test}`);
    if (!result.passed && result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  return testResults;
};

/**
 * Test individual endpoint
 */
export const testEndpoint = async (endpointName, testFunction) => {
  console.log(`🧪 Testing: ${endpointName}`);
  
  try {
    const response = await testFunction();
    console.log(`✅ ${endpointName} - SUCCESS`);
    console.log('Response:', response);
    return { success: true, response };
  } catch (error) {
    console.log(`❌ ${endpointName} - FAILED`);
    console.log('Error:', error.message);
    return { success: false, error: error.message };
  }
};

export default {
  runAllAPITests,
  testEndpoint,
  testResults
};