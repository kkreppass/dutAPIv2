/**
 * ============================================================================
 * headers.js - HTTP 요청 헤더 생성 모듈
 * ============================================================================
 *
 * PlayEntry.org API 요청 시 필요한 HTTP 헤더를 생성하는 함수들을 제공합니다.
 * 각 엔드포인트와 요청 타입에 맞는 헤더를 반환합니다.
 *
 * [헤더 함수 목록]
 *
 * 1. headersSignin()
 *    - 용도: /signin 페이지 접근 시 사용
 *    - 반환: HTML 요청용 기본 헤더
 *
 * 2. headersGraphQL(csrfToken)
 *    - 용도: GraphQL API 요청 (로그인 등)
 *    - 매개변수: csrfToken (CSRF 토큰)
 *    - 반환: GraphQL 전용 헤더 (CSRF-Token, x-client-type 포함)
 *
 * 3. headersGetHTML()
 *    - 용도: HTML 페이지 조회
 *    - 반환: HTML 요청용 기본 헤더
 *
 * 4. headersWrite(csrfToken, xToken)
 *    - 용도: 게시글/댓글 작성 등 쓰기 작업
 *    - 매개변수: csrfToken, xToken (인증 토큰)
 *    - 반환: 인증이 필요한 작업용 헤더
 *
 * 5. headersGetPost(csrfToken)
 *    - 용도: 게시글 목록 조회
 *    - 매개변수: csrfToken
 *    - 반환: 게시글 조회용 헤더
 *
 * 6. headersGetUsers(csrfToken)
 *    - 용도: 사용자 검색/조회
 *    - 매개변수: csrfToken
 *    - 반환: 사용자 API용 헤더
 *
 * [사용 예시]
 * import { headersGraphQL, headersWrite } from './lib/headers.js';
 *
 * const headers = headersGraphQL(csrfToken);
 * await client.post(url, data, { headers });
 *
 * ============================================================================
 */

export const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/144.0.0.0 Safari/537.36";

export function headersSignin() {
  return {
    "User-Agent": UA,
    Accept: "text/html",
  };
}

export function headersGraphQL(csrfToken) {
  return {
    "Content-Type": "application/json",
    "CSRF-Token": csrfToken,
    "x-client-type": "Client",
    "User-Agent": UA,
    Origin: "https://playentry.org",
    Referer: "https://playentry.org/signin",
  };
}

export function headersGetHTML() {
  return {
    "User-Agent": UA,
    Accept: "text/html",
  };
}

export function headersWrite(csrfToken, xToken) {
  return {
    accept: "*/*",
    "accept-language": "ko,en-US;q=0.9,en;q=0.8,zh-TW;q=0.7,zh;q=0.6",
    "content-type": "application/json",
    "csrf-token": csrfToken,
    priority: "u=1, i",
    "sec-ch-ua":
      '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-client-type": "Client",
    "x-token": xToken,
    "User-Agent": UA,
    Referer:
      "https://playentry.org/community/entrystory/list?sort=created&term=all",
  };
}

export function headersGetPost(csrfToken) {
  return {
    "content-type": "application/json",
    "csrf-token": csrfToken,
  };
}

export function headersGetUsers(csrfToken) {
  return {
    "content-type": "application/json",
    "csrf-token": csrfToken,
  };
}
