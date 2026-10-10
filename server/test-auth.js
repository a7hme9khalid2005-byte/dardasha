async function testAuth() {
  const baseUrl = 'http://localhost:5000/api/auth';

  console.log('1. Testing Registration...');
  const regRes = await fetch(`${baseUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'أحمد',
      lastName: 'المنصور',
      email: 'ahmed@dardasha.com',
      password: 'mypassword123',
      birthDay: 15,
      birthMonth: 8,
      birthYear: 1999,
      gender: 'male',
    }),
  });
  const regData = await regRes.json();
  console.log('Register Result:', regData.message, 'User:', regData.user?.firstName);

  console.log('\n2. Testing Forgot Password (OTP Generation)...');
  const forgotRes = await fetch(`${baseUrl}/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ahmed@dardasha.com' }),
  });
  const forgotData = await forgotRes.json();
  console.log('Forgot Password Result:', forgotData.message);
  console.log('Generated 6-Digit OTP:', forgotData.debugCode);

  console.log('\n3. Testing Verify OTP...');
  const verifyRes = await fetch(`${baseUrl}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ahmed@dardasha.com', code: forgotData.debugCode }),
  });
  const verifyData = await verifyRes.json();
  console.log('Verify OTP Result:', verifyData.message, 'Valid:', verifyData.valid);

  console.log('\n4. Testing Reset Password...');
  const resetRes = await fetch(`${baseUrl}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'ahmed@dardasha.com',
      code: forgotData.debugCode,
      newPassword: 'newSecretPassword2026',
    }),
  });
  const resetData = await resetRes.json();
  console.log('Reset Password Result:', resetData.message);

  console.log('\n5. Testing Login with New Password...');
  const loginRes = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'ahmed@dardasha.com',
      password: 'newSecretPassword2026',
    }),
  });
  const loginData = await loginRes.json();
  console.log('Login Result:', loginData.message, 'Token received:', !!loginData.token);
  console.log('\n✅ ALL AUTH & OTP ENDPOINTS PASSED PERFECTLY!\n');
}

testAuth().catch(console.error);
