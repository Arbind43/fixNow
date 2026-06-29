const axios = require('axios');

// Quick test to see what the profile API actually returns
async function test() {
  // We need to login first to get a token
  try {
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'sumkumari1900@gmail.com',
      password: 'pass@1234'
    });
    const token = loginRes.data.data?.token || loginRes.data.token;
    console.log('Login success, token:', token ? 'got token' : 'NO TOKEN');

    const profileRes = await axios.get('http://localhost:5000/api/technicians/me/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('\n--- PROFILE API RESPONSE ---');
    console.log(JSON.stringify(profileRes.data, null, 2));
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}

test();
