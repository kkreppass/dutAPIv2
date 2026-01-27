// /api/xtoken 테스트 코드
async function testLogin() {
  try {
    const response = await fetch("http://localhost:3000/api/xToken", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        username: "fetchtestaccount01",
        password: "fetchtest123",
        rememberme: false,
      }),
    });

    const result = await response.json();
    console.log("Response Status:", response.status);
    console.log("Response Data:", result);
    return result;
  } catch (err) {
    console.error("Error:", err.message);
    return { status: false, error: err.message };
  }
}

// 테스트 실행
testLogin();
