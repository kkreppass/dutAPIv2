# DutAPIv2

PlayEntry.org와 통신하기 위한 헬퍼 API입니다. CSRF/xToken 획득, entrystory 작성(!!) & 조회, 사용자 검색 등을 기존 Plain API 대비 훨씬 간편하게 할 수 있게 해줍니다.

## Start

다운로드 후, Terminal에 아래 명령어를 입력하세요.

```bash
npm install
npm run dev   # http://localhost:3000
```

## Important

- Base URL: `http://localhost:3000`
- 모든 응답은 JSON. 오류 시 `error`/`message` 필드를 확인하세요.
- 쓰기 API는 CSRF 토큰과 xToken이 모두 필요합니다. `/api/csrftoken` → `/api/xToken` 순으로 호출 후 사용하세요.

## API 목록

### GET /api/csrftoken

- 용도: 메인 페이지에서 CSRF 토큰 추출
- Request: 없음
- Response: `{ status: true, csrfToken }`

### POST /api/xToken

- 용도: 로그인을 통해 NEXT_DATA에서 xToken 추출
- Body: `{ username: string, password: string, rememberme?: boolean }`
- Response: `{ status: true, data: <graphql signin result>, xToken, nextDataScript?, mainPageHtml? }`
- Error: 400 (필수값 누락), 500 (로그인 실패 등)

### POST /api/writeEntrystory

- 용도: Entrystory 글 작성
- Body: `{ content: string, xToken: string, csrfToken: string }`
- Response: `{ status: true, data: <graphql result> }`
- Error 케이스:
  - 400: GraphQL 형식 오류 등
  - 429: statusCode 2000 (공유 24시간 제한), 2003 (도배/변수 오류)
  - 403: statusCode 402 (captcha 필요)

### POST /api/writeComment

- 용도: 댓글 작성 (글 아이디만 알면 게시판 종류 상관없이 다 달수 있을겁니다 아마도요(?))
- Body: `{ content: string, target: string, xToken: string, csrfToken: string }`
- Response: `{ status: true, data: <graphql result> }`
- Error 케이스:
  - 400: GraphQL 형식 오류
  - 429: statusCode 2003 (도배/변수 오류)
  - 403: statusCode 402 (captcha 필요)

### GET /api/getPost

- 용도: 전체 글 목록 조회
- Query: `category` (default free), `display` (default 10), `sort` (default created)
- Response: `{ data: <graphql result> }` → 목록은 `data.data.discussList.list`
- Error: 400(GraphQL 형식 오류), 404(CSRF 없음)

### GET /api/getUserPost

- 용도: 특정 사용자의 글 목록 조회(놀랍게도 다른사람것도 조회 가능)
- Query: `user`(필수), `category`(default free), `display`(default 8), `sort`(default created)
- Response: `{ data: <graphql result> }` → 목록은 `data.data.discussList.list`
- Error: 400(GraphQL 형식 오류), 404(CSRF 없음)

### GET /api/finduser

- 용도: 닉네임으로 사용자 검색
- Query: `nickname` (필수)
- Response(성공): `{ userId, userData }`
- Error: 400(GraphQL 형식 오류), 404(User not found), 500(Internal)

## 라이브러리 파일

- Header: [lib/headers.js](lib/headers.js)
- GraphQL Query: [lib/graphql.js](lib/graphql.js)
- Session/Cookie Client: [lib/httpSession.js](lib/httpSession.js)

## 테스트 스크립트 (프론트 폴더)

- 로그인: `frontend/src/test-login.js`
- 글 작성: `frontend/src/test-write.js`
- 댓글: `frontend/src/test-comment.js`
- 목록 조회: `frontend/src/test-getPost.js`, `frontend/src/test-getUserPost.js`
- 사용자 검색: `frontend/src/test-finduser.js`
