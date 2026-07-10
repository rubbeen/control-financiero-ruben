export function testCredentials() {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;
  if (!email || !password) throw new Error('E2E credentials were not initialized by global setup.');
  return { email, password };
}
