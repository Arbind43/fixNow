const Razorpay = require('razorpay');

async function testKeys() {
  const secrets = [
    'jOyhHH9DuF1nBl170O1ZWYUx',
    'jOyhHH9DuF1nBl17O01ZWYUx',
    'jOyhHH9DuF1nBl17001ZWYUx',
    'jOyhHH9DuF1nBl17OO1ZWYUx'
  ];

  for (const secret of secrets) {
    try {
      const instance = new Razorpay({
        key_id: 'rzp_test_T5R4ashh1CTggS',
        key_secret: secret,
      });
      const order = await instance.orders.create({ amount: 500, currency: 'INR' });
      console.log(`✅ SUCCESS WITH SECRET: ${secret}`);
      return;
    } catch (e) {
      console.log(`❌ FAILED WITH SECRET: ${secret} - ${e.error ? e.error.description : e.message}`);
    }
  }
}

testKeys();
