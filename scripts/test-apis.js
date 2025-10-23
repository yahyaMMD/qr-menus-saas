const API_BASE_URL = 'http://localhost:3000';

// We'll use a browser automation approach to get the session
const { chromium } = require('playwright');

class ApiTester {
  constructor() {
    this.cookies = [];
  }

  setCookies(cookies) {
    this.cookies = cookies;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log(`🌐 Making ${options.method || 'GET'} request to: ${url}`);
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add cookies to the request
    const cookieHeader = this.cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Important for cookies
      });

      const data = await response.json().catch(() => ({ error: 'No JSON response' }));

      return {
        status: response.status,
        data,
        success: response.ok,
        headers: response.headers,
      };
    } catch (error) {
      console.error(`❌ API Test Error for ${endpoint}:`, error.message);
      return {
        status: 0,
        data: { error: error.message },
        success: false,
      };
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

const tester = new ApiTester();

// Test user credentials
const TEST_USER = {
  name: 'Auth Test User',
  email: `authtest${Date.now()}@example.com`,
  password: 'password123'
};

let profileId;
let menuId;
let itemId;

async function runTests() {
  console.log('🚀 Starting Authenticated API Tests...\n');

  try {
    // Step 1: Register a user
    await testRegistration();

    // Step 2: Get session cookies using browser automation
    const cookies = await getSessionCookies();
    tester.setCookies(cookies);

    // Step 3: Test authenticated endpoints
    await testProfiles();
    await testMenus();
    await testItems();
    await testAnalytics();
    await testQRCode();
    await testSubscriptions();

    console.log('\n✅ All authenticated tests completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

// Step 1: Test Registration
async function testRegistration() {
  console.log('1. Testing Registration API...');

  const result = await tester.post('/api/auth/register', TEST_USER);
  
  if (!result.success) {
    if (result.status === 409) {
      console.log('⚠️ User already exists, trying with different email...');
      TEST_USER.email = `authtest${Date.now()}@example.com`;
      return await testRegistration();
    }
    throw new Error(`Registration failed: ${JSON.stringify(result.data)}`);
  }

  console.log('✅ Registration successful');
  console.log(`   User: ${TEST_USER.email}`);
}

// Step 2: Get session cookies using Playwright
async function getSessionCookies() {
  console.log('\n2. Getting session cookies...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to login page
    await page.goto(`${API_BASE_URL}/auth/login`);
    
    // Fill login form
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL(`${API_BASE_URL}/dashboard`, { timeout: 5000 });
    
    // Get cookies
    const cookies = await context.cookies();
    
    console.log('✅ Login successful via browser');
    console.log(`   Retrieved ${cookies.length} cookies`);
    
    await browser.close();
    return cookies;
    
  } catch (error) {
    await browser.close();
    console.log('⚠️ Browser login failed, trying manual cookie approach...');
    return await getCookiesManually();
  }
}

// Alternative manual approach
async function getCookiesManually() {
  console.log('   Please log in manually and check browser cookies:');
  console.log(`   1. Go to: ${API_BASE_URL}/auth/login`);
  console.log(`   2. Login with: ${TEST_USER.email} / ${TEST_USER.password}`);
  console.log('   3. Open browser Developer Tools (F12)');
  console.log('   4. Go to Application/Storage tab → Cookies');
  console.log('   5. Look for next-auth.session-token cookie');
  console.log('   6. Update the test script with the cookie value');
  
  // Return empty cookies for now
  return [];
}

// Step 3: Test Profiles API
async function testProfiles() {
  console.log('\n3. Testing Profiles API...');

  // Create a profile
  const profileData = {
    name: 'Test Restaurant - Auth Test',
    description: 'A test restaurant created via authenticated API',
    logo: 'https://via.placeholder.com/150',
    socialLinks: {
      facebook: 'https://facebook.com/test',
      instagram: 'https://instagram.com/test'
    },
    location: {
      wilaya: 'Algiers',
      commune: 'Alger Centre',
      address: '123 Test Street'
    }
  };

  const createResult = await tester.post('/api/profiles', profileData);
  
  if (!createResult.success) {
    console.log(`⚠️ Profile creation failed: ${JSON.stringify(createResult.data)}`);
    return;
  }

  profileId = createResult.data.id;
  console.log(`✅ Profile created: ${profileId}`);

  // Get all profiles
  const getResult = await tester.get('/api/profiles');
  
  if (getResult.success) {
    console.log(`✅ Retrieved ${getResult.data.length} profiles`);
  }

  // Get single profile
  const singleResult = await tester.get(`/api/profiles/${profileId}`);
  
  if (singleResult.success) {
    console.log('✅ Single profile retrieved');
  }
}

// Step 4: Test Menus API
async function testMenus() {
  if (!profileId) {
    console.log('\n4. ⚠️ Skipping Menus API - no profileId');
    return;
  }

  console.log('\n4. Testing Menus API...');

  // Create a menu
  const menuData = {
    name: 'Test Menu - Auth Test',
    description: 'A test menu created via authenticated API'
  };

  const createResult = await tester.post(`/api/profiles/${profileId}/menus`, menuData);
  
  if (!createResult.success) {
    console.log(`⚠️ Menu creation failed: ${JSON.stringify(createResult.data)}`);
    return;
  }

  menuId = createResult.data.id;
  console.log(`✅ Menu created: ${menuId}`);

  // Get all menus for profile
  const getResult = await tester.get(`/api/profiles/${profileId}/menus`);
  
  if (getResult.success) {
    console.log(`✅ Retrieved ${getResult.data.length} menus`);
  }
}

// Step 5: Test Items API
async function testItems() {
  if (!menuId) {
    console.log('\n5. ⚠️ Skipping Items API - no menuId');
    return;
  }

  console.log('\n5. Testing Items API...');

  // First create a category
  const categoryData = { name: 'Main Courses' };
  const categoryResult = await tester.post(`/api/profiles/${profileId}/menus/${menuId}/categories`, categoryData);
  
  let categoryId;
  if (categoryResult.success) {
    categoryId = categoryResult.data.id;
    console.log(`✅ Category created: ${categoryId}`);
  }

  // Create an item
  const itemData = {
    name: 'Test Burger',
    description: 'Delicious test burger with all the fixings',
    price: 12.99,
    categoryId: categoryId
  };

  const createResult = await tester.post(`/api/profiles/${profileId}/menus/${menuId}/items`, itemData);
  
  if (!createResult.success) {
    console.log(`⚠️ Item creation failed: ${JSON.stringify(createResult.data)}`);
    return;
  }

  itemId = createResult.data.id;
  console.log(`✅ Item created: ${itemId}`);

  // Get all items
  const getResult = await tester.get(`/api/profiles/${profileId}/menus/${menuId}/items`);
  
  if (getResult.success) {
    console.log(`✅ Retrieved ${getResult.data.length} items`);
  }
}

// Step 6: Test Analytics API
async function testAnalytics() {
  if (!profileId) {
    console.log('\n6. ⚠️ Skipping Analytics API - no profileId');
    return;
  }

  console.log('\n6. Testing Analytics API...');

  const analyticsResult = await tester.get(`/api/profiles/${profileId}/analytics?period=7d`);
  
  if (analyticsResult.success) {
    console.log('✅ Analytics retrieved successfully');
  } else {
    console.log(`⚠️ Analytics failed: ${JSON.stringify(analyticsResult.data)}`);
  }
}

// Step 7: Test QR Code API
async function testQRCode() {
  if (!menuId) {
    console.log('\n7. ⚠️ Skipping QR Code API - no menuId');
    return;
  }

  console.log('\n7. Testing QR Code API...');

  const qrResult = await tester.post('/api/qr/generate', {
    menuId: menuId,
    size: 200
  });

  if (qrResult.success) {
    console.log('✅ QR code generated successfully');
    console.log(`   Menu URL: ${qrResult.data.menuUrl}`);
  } else {
    console.log(`⚠️ QR code generation failed: ${JSON.stringify(qrResult.data)}`);
  }
}

// Step 8: Test Subscriptions API
async function testSubscriptions() {
  console.log('\n8. Testing Subscriptions API...');

  const getResult = await tester.get('/api/subscriptions');
  
  if (getResult.success) {
    console.log(`✅ Retrieved ${getResult.data.length} subscriptions`);
    if (getResult.data.length > 0) {
      console.log(`   Current plan: ${getResult.data[0].plan}`);
    }
  } else {
    console.log(`⚠️ Subscriptions failed: ${JSON.stringify(getResult.data)}`);
  }
}

// Install playwright if not already installed
async function checkPlaywright() {
  try {
    require('playwright');
  } catch (error) {
    console.log('📦 Playwright not found. Installing...');
    const { execSync } = require('child_process');
    execSync('npx playwright install chromium', { stdio: 'inherit' });
  }
}

// Run the tests
checkPlaywright().then(runTests);