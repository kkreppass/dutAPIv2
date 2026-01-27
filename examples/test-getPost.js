// /api/getPost 테스트 코드

async function testGetPost() {
  try {
    // 1️⃣ 엔트리스토리 목록 조회 요청
    console.log("📝 Step 1: 엔트리스토리 목록 조회 중...");
    const getRes = await fetch(
      "http://localhost:3000/api/getPost?category=free&display=10&sort=created",
      {
        method: "GET",
        headers: {
          "content-type": "application/json",
        },
      },
    );

    const getData = await getRes.json();
    console.log("📊 Get Response Status:", getRes.status);
    console.log("📊 Get Response Data:", getData);
    if (!getRes.ok) {
      console.error("❌ 요청 실패", getData.error || "Unknown error");
      if (getData.message) console.error("Message:", getData.message);
      return getData;
    }

    const list = getData?.data?.data?.discussList?.list || [];
    console.log("📊 글 목록:", list);
    console.log("✅ 엔트리스토리 목록 조회 성공! 총", list.length, "개");

    return getData;
  } catch (err) {
    console.error("❌ 오류 발생:", err.message);
    return { status: false, error: err.message };
  }
}

// 테스트 실행
testGetPost();
