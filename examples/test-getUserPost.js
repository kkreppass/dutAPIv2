// /api/getUserPost 테스트 코드

async function testGetUserPost() {
  try {
    // 1️⃣ 특정 사용자의 엔트리스토리 목록 조회 요청
    console.log("📝 Step 1: 사용자별 엔트리스토리 목록 조회 중...");
    const userId = "62e0f3af3d80d5006290ab89"; // 테스트할 사용자 ID

    const getRes = await fetch(
      `http://localhost:3000/api/getUserPost?category=free&user=${userId}&display=8&sort=created`,
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
    const total = getData?.data?.data?.discussList?.total || 0;
    console.log("✅ 사용자별 엔트리스토리 목록 조회 성공!");
    console.log("📊 조회된 항목 수:", list.length);
    console.log("📊 전체 개수:", total);

    if (list[0]) {
      const firstItem = list[0];
      console.log("\n📄 첫 번째 항목:");
      console.log("   ID:", firstItem.id);
      console.log("   작성자:", firstItem.user?.nickname);
      console.log(
        "   내용:",
        (firstItem.content?.substring(0, 50) || "").concat("..."),
      );
      console.log("   댓글 수:", firstItem.commentsLength);
      console.log("   좋아요 수:", firstItem.likesLength);
    }

    return getData;
  } catch (err) {
    console.error("❌ 오류 발생:", err.message);
    return { status: false, error: err.message };
  }
}

// 테스트 실행
testGetUserPost();
