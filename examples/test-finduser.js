// /api/finduser 테스트 코드

async function testFindUser() {
  try {
    // 1️⃣ 사용자 검색 요청
    console.log("📝 Step 1: 사용자 검색 중...");
    const searchNickname = "김잔상"; // 검색할 닉네임 입력

    const findRes = await fetch(
      `http://localhost:3000/api/finduser?nickname=${encodeURIComponent(searchNickname)}`,
      {
        method: "GET",
        headers: {
          "content-type": "application/json",
        },
      },
    );

    const findData = await findRes.json();
    console.log("📊 Find Response Status:", findRes.status);
    console.log("📊 Find Response Data:", findData);
    if (findRes.ok && findData?.userId && findData?.userData) {
      console.log("✅ 사용자 찾음!");
      console.log("📋 사용자 정보:");
      console.log("   User ID:", findData.userId);
      console.log("   Nickname:", findData.userData?.nickname);
      console.log("   Avatar:", findData.userData?.spaceAvatarThumbnail);
      console.log("   Space World ID:", findData.userData?.spaceWorld?.id);
      return findData;
    }

    // 404 Not Found 또는 기타 에러 응답 처리
    console.error("❌ 사용자 검색 실패");
    if (findData?.message) console.error("Message:", findData.message);
    if (findData?.error) console.error("Error:", findData.error);

    return findData;
  } catch (err) {
    console.error("❌ 오류 발생:", err.message);
    return { status: false, error: err.message };
  }
}

// 테스트 실행
testFindUser();
