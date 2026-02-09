// /api/getPost 테스트 코드

async function testGetPost() {
  try {
    const targetCount = 50;
    const display = 10;
    let searchAfter;
    let fetchedCount = 0;
    const contents = [];

    while (fetchedCount < targetCount) {
      const searchAfterParam =
        searchAfter === undefined
          ? ""
          : `&searchAfter=${encodeURIComponent(JSON.stringify(searchAfter))}`;

      const getRes = await fetch(
        `http://localhost:3000/api/getPost?category=free&display=${display}&sort=created${searchAfterParam}`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
          },
        },
      );

      const getData = await getRes.json();
      if (!getRes.ok) {
        console.error("❌ 요청 실패", getData.error || "Unknown error");
        if (getData.message) console.error("Message:", getData.message);
        return getData;
      }

      const list = getData?.data?.data?.discussList?.list || [];
      searchAfter = getData?.data?.data?.discussList?.searchAfter;

      for (const item of list) {
        if (fetchedCount >= targetCount) break;
        if (typeof item?.content === "string") {
          contents.push(item.content);
        } else {
          contents.push("");
        }
        fetchedCount += 1;
      }

      if (!searchAfter || list.length === 0) {
        break;
      }
    }

    console.log(contents.join("\n"));
    return { status: true, fetchedCount };
  } catch (err) {
    console.error("❌ 오류 발생:", err.message);
    return { status: false, error: err.message };
  }
}

// 테스트 실행
testGetPost();
