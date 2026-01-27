/**
 * todo:
 * -nodemon 고치기
 * -github 업로드
 * -노팁작성
 */
import express from "express";
import cors from "cors";
import * as cheerio from "cheerio";
import { createSessionClient } from "./lib/httpSession.js";
import {
  SIGNIN_BY_USERNAME,
  CREATE_ENTRYSTORY,
  CREATE_COMMENT,
  SELECT_ENTRYSTORY,
  GET_USERS,
  SEARCH_FOLLOWERS,
  SEARCH_FOLLOWINGS,
} from "./lib/graphql.js";
import {
  headersSignin,
  headersGraphQL,
  headersGetHTML,
  headersWrite,
  headersGetPost,
  headersGetUsers,
  UA,
} from "./lib/headers.js";

const app = express();
app.use(express.json());

// 개발 중엔 Vite에서 proxy로 붙일 거라 CORS가 꼭 필요하진 않지만,
// 나중에 분리 배포할 수도 있으니 일단 기본값으로 켜둠
app.use(cors({ origin: true, credentials: true }));

// 전역 세션 클라이언트 (모든 라우터에서 공유)
const { client: globalClient } = createSessionClient();

app.get("/api/csrftoken", async (req, res) => {
  try {
    // 1) HTML 가져오기
    const r = await globalClient.get("https://playentry.org", {
      headers: headersGetHTML(),
    });

    // 2) HTML 파싱
    const $ = cheerio.load(r.data);

    // 3) meta csrf-token 추출
    const csrfToken = $('meta[name="csrf-token"]').attr("content");

    if (!csrfToken) {
      return res.status(404).json({
        status: false,
        error: "csrf-token not found",
      });
    }

    // 4) JSON 응답
    res.json({
      status: true,
      csrfToken,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: false,
      error: "failed to fetch or parse playentry.org",
    });
  }
});

app.post("/api/xToken", async (req, res) => {
  try {
    const { username, password, rememberme = false } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: false,
        error: "username and password are required",
      });
    }

    // 1️⃣ GET /signin → CSRF 토큰 + 세션 쿠키 자동 저장 (전역 세션)
    const signinRes = await globalClient.get("https://playentry.org/signin", {
      headers: headersSignin(),
    });

    // CSRF 토큰 추출
    const $ = cheerio.load(signinRes.data);
    const csrfToken = $('meta[name="csrf-token"]').attr("content");

    if (!csrfToken) {
      return res.status(404).json({
        status: false,
        error: "csrf-token not found",
      });
    }

    // 2️⃣ POST /graphql → 로그인 (전역 세션의 쿠키 자동 전송)
    const graphqlRes = await globalClient.post(
      "https://playentry.org/graphql",
      {
        query: SIGNIN_BY_USERNAME,
        variables: {
          username,
          password,
          rememberme,
        },
      },
      {
        headers: headersGraphQL(csrfToken),
      },
    );

    // GET / → NEXT_DATA에서 xToken 추출 (전역 세션 유지)
    const mainPageRes = await globalClient.get("https://playentry.org/", {
      headers: headersGetHTML(),
    });

    const $main = cheerio.load(mainPageRes.data);
    const nextDataScript =
      $main("script#__NEXT_DATA__").html() || $main("script#NEXT_DATA").html();

    let xToken = null;
    if (nextDataScript) {
      try {
        const nextData = JSON.parse(nextDataScript);
        // 재귀적으로 xToken 찾기
        const findXToken = (obj) => {
          if (typeof obj !== "object" || obj === null) return null;
          if ("xToken" in obj && obj.xToken) return obj.xToken;

          for (const value of Object.values(obj)) {
            const result = findXToken(value);
            if (result) return result;
          }
          return null;
        };

        xToken = findXToken(nextData);
      } catch (parseErr) {
        console.error("Failed to parse NEXT_DATA:", parseErr.message);
      }
    }

    // 결과 반환
    res.json({
      status: true,
      data: graphqlRes.data,
      xToken,
      nextDataScript:
        typeof nextDataScript === "string" ? nextDataScript : null,
      mainPageHtml:
        typeof mainPageRes.data === "string" ? mainPageRes.data : null,
    });
  } catch (err) {
    console.error("Error:", err.message);
    if (err.response) {
      console.error("Response status:", err.response.status);
      console.error("Response data:", err.response.data);
    }
    res.status(500).json({
      status: false,
      error: err.message || "failed to login",
      details: err.response?.data,
    });
  }
});

app.post("/api/writeEntrystory", async (req, res) => {
  try {
    const { content, xToken, csrfToken } = req.body;

    if (!content) {
      return res.status(400).json({
        status: false,
        error: "content is required",
      });
    }

    if (!xToken || !csrfToken) {
      return res.status(400).json({
        status: false,
        error: "xToken and csrfToken are required (use /api/xToken first)",
      });
    }

    // 헤더 모듈화
    const writeRes = await globalClient.post(
      "https://playentry.org/graphql",
      {
        query: CREATE_ENTRYSTORY,
        variables: {
          content,
        },
      },
      {
        headers: headersWrite(csrfToken, xToken),
      },
    );

    // GraphQL 에러 체크 (도배 방지, captcha 등)
    if (writeRes.data?.errors && writeRes.data.errors.length > 0) {
      const firstError = writeRes.data.errors[0];
      const statusCode = firstError.statusCode;

      // statusCode 2000은 작품 공유 후 24시간 제한
      if (statusCode === 2000) {
        return res.status(429).json({
          status: false,
          error: "share cooldown",
          message: "작품 공유 후 24시간 동안은 글을 쓸 수 없습니다.",
          errors: writeRes.data.errors,
          statusCode,
        });
      }

      // statusCode 2003은 도배 방지 또는 잘못된 변수 입력
      if (statusCode === 2003) {
        return res.status(429).json({
          status: false,
          error: "spam prevention or invalid variables",
          message:
            "spam 방지에 걸렸거나 variables를 잘못 입력했습니다. 요청 내용을 확인한 후 잠시 후 다시 시도해주세요.",
          errors: writeRes.data.errors,
          statusCode,
        });
      }

      // statusCode 402는 captcha 필요
      if (statusCode === 402) {
        return res.status(403).json({
          status: false,
          error: "captcha required",
          message: "captcha 인증이 필요합니다. 다시 시도해주세요.",
          errors: writeRes.data.errors,
          statusCode,
        });
      }

      return res.status(400).json({
        status: false,
        error: "GraphQL error",
        message:
          firstError.message ||
          "GraphQL 형식이 잘못되었습니다. Network 요청의 형식을 수정한 후 다시 시도해주세요.",
        errors: writeRes.data.errors,
        statusCode,
      });
    }
    res.json({
      status: true,
      data: writeRes.data,
    });
  } catch (err) {
    console.error("Error:", err.message);
    if (err.response) {
      console.error("Response status:", err.response.status);
      console.error("Response data:", err.response.data);
    }
    res.status(500).json({
      status: false,
      error: err.message || "failed to write entry",
      details: err.response?.data,
    });
  }
});

app.post("/api/writeComment", async (req, res) => {
  try {
    const { content, target, xToken, csrfToken } = req.body;

    if (!content || !target) {
      return res.status(400).json({
        status: false,
        error: "content and target are required",
      });
    }

    if (!xToken || !csrfToken) {
      return res.status(400).json({
        status: false,
        error: "xToken and csrfToken are required (use /api/xToken first)",
      });
    }

    // POST /graphql/CREATE_COMMENT → 새로운 헤더 스펙 적용
    const commentRes = await globalClient.post(
      "https://playentry.org/graphql",
      {
        query: CREATE_COMMENT,
        variables: {
          content,
          target,
          targetSubject: "discuss",
          targetType: "individual",
        },
      },
      {
        headers: headersWrite(csrfToken, xToken),
      },
    );

    // GraphQL 에러 체크 (도배 방지, captcha 등)
    if (commentRes.data?.errors && commentRes.data.errors.length > 0) {
      const firstError = commentRes.data.errors[0];
      const statusCode = firstError.statusCode;

      // statusCode 2003은 도배 방지 또는 잘못된 변수 입력
      if (statusCode === 2003) {
        return res.status(429).json({
          status: false,
          error: "spam prevention or invalid variables",
          message:
            "spam 방지에 걸렸거나 variables를 잘못 입력했습니다. 요청 내용을 확인한 후 잠시 후 다시 시도해주세요.",
          errors: commentRes.data.errors,
          statusCode,
        });
      }

      // statusCode 402는 captcha 필요
      if (statusCode === 402) {
        return res.status(403).json({
          status: false,
          error: "captcha required",
          message: "captcha 인증이 필요합니다. 다시 시도해주세요.",
          errors: commentRes.data.errors,
          statusCode,
        });
      }

      return res.status(400).json({
        status: false,
        error: "GraphQL error",
        message:
          firstError.message ||
          "GraphQL 형식이 잘못되었습니다. Network 요청의 형식을 수정한 후 다시 시도해주세요.",
        errors: commentRes.data.errors,
        statusCode,
      });
    }

    res.json({
      status: true,
      data: commentRes.data,
    });
  } catch (err) {
    console.error("Error:", err.message);
    if (err.response) {
      console.error("Response status:", err.response.status);
      console.error("Response data:", err.response.data);
    }
    res.status(500).json({
      status: false,
      error: err.message || "failed to write comment",
      details: err.response?.data,
    });
  }
});

app.get("/api/getPost", async (req, res) => {
  try {
    //category: qna, tips, free ...
    const { category = "free", display = 10, sort = "created" } = req.query;

    if (!category || !display || !sort) {
      return res.status(400).json({
        status: false,
        error: "category, display, and sort are required",
      });
    }

    // 1️⃣ CSRF 토큰 먼저 가져오기
    const csrfRes = await globalClient.get("https://playentry.org", {
      headers: headersGetHTML(),
    });

    const $ = cheerio.load(csrfRes.data);
    const csrfToken = $('meta[name="csrf-token"]').attr("content");

    if (!csrfToken) {
      return res.status(404).json({
        status: false,
        error: "csrf-token not found",
      });
    }

    // GraphQL 요청으로 엔트리스토리 목록 조회
    const getRes = await globalClient.post(
      "https://playentry.org/graphql/SELECT_ENTRYSTORY",
      {
        query: SELECT_ENTRYSTORY,
        variables: {
          category,
          searchType: "scroll",
          term: "all",
          discussType: "entrystory",
          pageParam: {
            display: parseInt(display),
            sort,
          },
        },
      },
      {
        headers: headersGetPost(csrfToken),
      },
    );

    // GraphQL 에러 체크
    if (getRes.data?.errors && getRes.data.errors.length > 0) {
      return res.status(400).json({
        error: "GraphQL error",
        message:
          getRes.data.errors[0].message ||
          "GraphQL 형식이 잘못되었습니다. Network 요청의 형식을 수정한 후 다시 시도해주세요. ",
      });
    }

    res.json({
      data: getRes.data,
    });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
});

app.get("/api/getUserPost", async (req, res) => {
  try {
    const {
      category = "free",
      user,
      display = 8,
      sort = "created",
    } = req.query;

    if (!user) {
      return res.status(400).json({
        status: false,
        error: "user is required",
      });
    }

    // 1️⃣ CSRF 토큰 먼저 가져오기
    const csrfRes = await globalClient.get("https://playentry.org", {
      headers: headersGetHTML(),
    });

    const $ = cheerio.load(csrfRes.data);
    const csrfToken = $('meta[name="csrf-token"]').attr("content");

    if (!csrfToken) {
      return res.status(404).json({
        status: false,
        error: "csrf-token not found",
      });
    }

    // GraphQL 요청으로 사용자별 엔트리스토리 목록 조회
    const getRes = await globalClient.post(
      "https://playentry.org/graphql/SELECT_ENTRYSTORY",
      {
        query: SELECT_ENTRYSTORY,
        variables: {
          category,
          user,
          term: "all",
          searchType: "scroll",
          pageParam: {
            display: parseInt(display),
            sort,
          },
        },
      },
      {
        headers: headersGetPost(csrfToken),
      },
    );

    // GraphQL 에러 체크
    if (getRes.data?.errors && getRes.data.errors.length > 0) {
      return res.status(400).json({
        error: "GraphQL error",
        message:
          getRes.data.errors[0].message ||
          "GraphQL 형식이 잘못되었습니다. Network 요청의 형식을 수정한 후 다시 시도해주세요.",
      });
    }

    res.json({
      data: getRes.data,
    });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
});

app.get("/api/finduser", async (req, res) => {
  try {
    const { nickname } = req.query;

    if (!nickname) {
      return res.status(400).json({
        error: "nickname is required",
      });
    }

    // 대표 유저 ID 배열
    const followingSearchUsers = [
      "604db5a187ee84008ea66612",
      "64b2a6db174aa2002c44e5cb",
      "5aff8922436cc75c8b765561",
      "673dcca110a4443165e635a3",
      "68c67da7c1968cccfa5bcb25",
      "68395c274fe29f1458ce31a3",
      "6826b4d449e97a83e37d64b7",
      "62e0f3af3d80d5006290ab89",
    ];
    const followerSearchUsers = [
      "5eb4e5b596464e006313bfbb",
      "56fb599eeb995ec92b901334",
      "62e0f3af3d80d5006290ab89",
    ];

    // 팔로잉/팔로워 목록에서 닉네임 검색하는 함수
    const searchInFollowList = async (userId, searchType, csrfToken) => {
      const query =
        searchType === "following" ? SEARCH_FOLLOWINGS : SEARCH_FOLLOWERS;
      const url = "https://playentry.org/graphql";
      const displayValue = searchType === "following" ? 1 : 8;

      try {
        const searchRes = await globalClient.post(
          url,
          {
            query,
            variables: {
              user: userId,
              query: nickname,
              pageParam: {
                display: displayValue,
              },
            },
            operationName:
              searchType === "following"
                ? "SELECT_FOLLOWINGS"
                : "SELECT_FOLLOWERS",
          },
          {
            headers: headersGetUsers(csrfToken),
          },
        );

        const listKey = searchType === "following" ? "followings" : "followers";
        const list = searchRes.data?.data?.[listKey]?.list || [];

        if (list.length > 0) {
          const userField = searchType === "following" ? "follow" : "user";
          const foundUser = list.find(
            (item) => item[userField]?.nickname === nickname,
          );

          if (foundUser) {
            return {
              found: true,
              userId: foundUser[userField].id,
              userData: foundUser[userField],
            };
          }
        }

        return { found: false };
      } catch (err) {
        return { found: false, error: err.message };
      }
    };

    // CSRF 토큰 가져오기
    const csrfRes = await globalClient.get("https://playentry.org", {
      headers: headersGetHTML(),
    });

    const $ = cheerio.load(csrfRes.data);
    const csrfToken = $('meta[name="csrf-token"]').attr("content");

    if (!csrfToken) {
      return res.status(404).json({
        error: "csrf-token not found",
      });
    }

    // Step 1: 직접 검색
    const searchRes = await globalClient.post(
      "https://space.playentry.org/graphql/getUsers",
      {
        query: GET_USERS,
        variables: {
          param: {
            nickname,
            display: 1,
          },
        },
        operationName: "getUsers",
      },
      {
        headers: headersGetUsers(csrfToken),
      },
    );

    if (searchRes.data?.errors && searchRes.data.errors.length > 0) {
      return res.status(400).json({
        error: "GraphQL error",
        message: searchRes.data.errors[0].message,
      });
    }

    const userList = searchRes.data?.data?.getUsers?.list || [];

    if (userList.length > 0 && userList[0].nickname === nickname) {
      return res.json({
        userId: userList[0].id,
        userData: userList[0],
      });
    }

    // Step 2: 팔로잉/팔로워 목록에서 검색
    const followingPromises = followingSearchUsers.map((userId) =>
      searchInFollowList(userId, "following", csrfToken),
    );
    const followingResults = await Promise.all(followingPromises);
    const foundInFollowing = followingResults.find((r) => r.found);

    if (foundInFollowing) {
      return res.json({
        userId: foundInFollowing.userId,
        userData: foundInFollowing.userData,
      });
    }

    const followerPromises = followerSearchUsers.map((userId) =>
      searchInFollowList(userId, "followers", csrfToken),
    );
    const followerResults = await Promise.all(followerPromises);
    const foundInFollowers = followerResults.find((r) => r.found);

    if (foundInFollowers) {
      return res.json({
        userId: foundInFollowers.userId,
        userData: foundInFollowers.userData,
      });
    }

    // 모든 검색에서 찾지 못함
    return res.status(404).json({
      error: "User not found",
      message: `No user found with nickname: ${nickname}`,
    });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
});

app.listen(3000, () => console.log("Backend: http://localhost:3000"));
