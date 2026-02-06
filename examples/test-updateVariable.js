// /api/updateVariable 테스트 코드

async function testUpdateVariable() {
  try {
    const response = await fetch("http://localhost:3000/api/updateVariable", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        // variables 내의 id
        variableId: "uu7k",
        // 상위 id
        id: "6985f8b7cbfcb9384f8497df",
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
testUpdateVariable();
