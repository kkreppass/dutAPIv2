// /api/write 테스트 코드

async function testWrite() {
  try {
    // 1️⃣ CSRF 토큰 먼저 가져오기
    console.log("📝 Step 1: CSRF 토큰 요청 중...");
    const csrfRes = await fetch("http://localhost:3000/api/csrftoken", {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    });

    const csrfData = await csrfRes.json();
    console.log("✅ CSRF 응답:", csrfData.status);

    if (!csrfData.status || !csrfData.csrfToken) {
      console.error("❌ CSRF 토큰 요청 실패");
      console.error("Response:", csrfData);
      return;
    }

    const csrfToken = csrfData.csrfToken;
    console.log("✅ csrfToken:", csrfToken);

    // 2️⃣ 로그인해서 xToken 받기
    console.log("\n📝 Step 2: 로그인 요청 중...");
    const loginRes = await fetch("http://localhost:3000/api/xToken", {
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

    const loginData = await loginRes.json();
    console.log("✅ 로그인 응답:", loginData.status);

    if (!loginData.status || !loginData.xToken) {
      console.error("❌ 로그인 실패 또는 xToken 없음");
      console.error("Response:", loginData);
      return;
    }

    const xToken = loginData.xToken;
    console.log("✅ xToken:", xToken);

    // 3️⃣ /api/write에 글 작성 요청 보내기
    console.log("\n📝 Step 3: 글 작성 요청 중...");
    const writeRes = await fetch("http://localhost:3000/api/writeEntrystory", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        content: "테스트 콘텐츠입니다. 작성 성공!",
        xToken,
        csrfToken,
      }),
    });

    const writeData = await writeRes.json();
    console.log("📊 Write Response Status:", writeRes.status);
    console.log("📊 Write Response Data:", writeData);

    // 도배 방지 또는 GraphQL 에러 체크
    if (writeData.errors) {
      if (writeData.statusCode === 2003) {
        console.error(
          "🚫 글 작성이 제한되었습니다! 같은 내용 반복 입력 또는 너무 많은 글 입력이 의심됩니다.",
        );
        console.error("Message:", writeData.message);
      } else {
        console.error("❌ GraphQL 에러 발생!");
        console.error("Errors:", writeData.errors);
        console.error("Message:", writeData.message);
      }
      return writeData;
    }

    if (writeData.status) {
      console.log("✅ 글 작성 성공!");
      console.log("생성된 Entry:", writeData.data);
    } else {
      console.error("❌ 글 작성 실패");
      console.error("Error:", writeData.error);
    }

    return writeData;
  } catch (err) {
    console.error("❌ 오류 발생:", err.message);
    return { status: false, error: err.message };
  }
}

// 테스트 실행
testWrite();
