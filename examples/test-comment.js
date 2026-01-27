// /api/writeComment 테스트 코드

async function testComment() {
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

    // 3️⃣ /api/writeComment에 댓글 작성 요청 보내기
    console.log("\n📝 Step 3: 댓글 작성 요청 중...");
    const commentRes = await fetch("http://localhost:3000/api/writeComment", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        content: "테스트 댓글입니다. 작성 성공!",
        target: "697858465b8b0bee6b5b6245",
        xToken,
        csrfToken,
      }),
    });

    const commentData = await commentRes.json();
    console.log("📊 Comment Response Status:", commentRes.status);
    console.log("📊 Comment Response Data:", commentData);

    // 도배 방지 또는 GraphQL 에러 체크
    if (commentData.errors) {
      if (commentData.statusCode === 2003) {
        console.error(
          "🚫 댓글 작성이 제한되었습니다! 같은 내용 반복 입력 또는 너무 많은 댓글 입력이 의심됩니다.",
        );
        console.error("Message:", commentData.message);
      } else if (commentData.statusCode === 402) {
        console.error("🚫 CAPTCHA 인증이 필요합니다!");
        console.error("Message:", commentData.message);
      } else {
        console.error("❌ GraphQL 에러 발생!");
        console.error("Errors:", commentData.errors);
        console.error("Message:", commentData.message);
      }
      return commentData;
    }

    if (commentData.status) {
      console.log("✅ 댓글 작성 성공!");
      console.log("생성된 Comment:", commentData.data);
    } else {
      console.error("❌ 댓글 작성 실패");
      console.error("Error:", commentData.error);
    }

    return commentData;
  } catch (err) {
    console.error("❌ 오류 발생:", err.message);
    return { status: false, error: err.message };
  }
}

// 테스트 실행
testComment();
