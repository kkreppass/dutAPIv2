/**
 * ============================================================================
 * convertToFetch.js 사용 메뉴얼
 * ============================================================================
 *
 * 이 모듈은 Express 서버에서 발생한 axios 요청을 JavaScript fetch 코드로 변환합니다.
 * 디버깅이나 클라이언트 코드 생성 시 유용합니다.
 *
 * [사용 방법]
 *
 * 1. 모듈 import:
 *    import { axiosToFetchCode, setLastRequest, getLastRequestAsFetch } from './lib/convertToFetch.js';
 *
 * 2. 요청 추적하기:
 *    axios 요청 직후 setLastRequest를 호출하여 마지막 요청을 저장합니다.
 *
 *    예시:
 *    const response = await globalClient.post('https://api.example.com/graphql', {
 *      query: SOME_QUERY,
 *      variables: { username, password }
 *    }, {
 *      headers: headersGraphQL(csrfToken)
 *    });
 *
 *    setLastRequest(
 *      'https://api.example.com/graphql',
 *      'POST',
 *      headersGraphQL(csrfToken),
 *      { query: SOME_QUERY, variables: { username, password } }
 *    );
 *
 * 3. fetch 코드 가져오기:
 *
 *    방법 A - 직접 변환:
 *    const fetchCode = axiosToFetchCode(
 *      url,
 *      method,
 *      headers,
 *      data
 *    );
 *
 *    방법 B - 마지막 요청 가져오기:
 *    const fetchCode = getLastRequestAsFetch();
 *
 * 4. 응답에 포함하기:
 *    res.json({
 *      status: true,
 *      data: response.data,
 *      fetchCode: fetchCode  // 디버깅용
 *    });
 *
 * [주의사항]
 * - setLastRequest는 전역 상태를 사용하므로 동시 요청 시 덮어쓰기될 수 있습니다.
 * - 프로덕션 환경에서는 fetchCode 반환을 제거하는 것을 권장합니다.
 * - 민감한 정보(비밀번호, 토큰 등)가 fetch 코드에 포함될 수 있으니 주의하세요.
 *
 * ============================================================================
 */

/**
 * Axios 요청을 JavaScript fetch 코드 문자열로 변환
 * @param {string} url - 요청 URL
 * @param {string} method - HTTP 메서드 (GET, POST 등)
 * @param {object} headers - 헤더 객체
 * @param {object} data - 요청 body 데이터
 * @returns {string} JavaScript fetch 코드
 */
export function axiosToFetchCode(
  url,
  method = "GET",
  headers = {},
  data = null,
) {
  let fetchCode = `fetch("${url}", {\n`;

  // headers 추가
  if (Object.keys(headers).length > 0) {
    fetchCode += `  "headers": {\n`;
    Object.entries(headers).forEach(([key, value]) => {
      const escapedValue = String(value)
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n");
      fetchCode += `    "${key}": "${escapedValue}",\n`;
    });
    fetchCode += `  },\n`;
  }

  // body 추가 (POST, PUT, PATCH 등)
  if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
    const bodyJson = JSON.stringify(data);
    const escapedBody = bodyJson.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    fetchCode += `  "body": "${escapedBody}",\n`;
  }

  // method 추가
  if (method !== "GET") {
    fetchCode += `  "method": "${method}",\n`;
  }

  // credentials 추가 (쿠키 포함)
  fetchCode += `  "credentials": "include"\n`;
  fetchCode += `});`;

  return fetchCode;
}

/**
 * 요청 정보를 저장하는 전역 상태
 */
let lastRequest = null;

export function setLastRequest(url, method, headers, data) {
  lastRequest = { url, method, headers, data };
}

export function getLastRequestAsFetch() {
  if (!lastRequest) {
    return "No recent request found";
  }
  return axiosToFetchCode(
    lastRequest.url,
    lastRequest.method,
    lastRequest.headers,
    lastRequest.data,
  );
}
