/**
 * ============================================================================
 * httpSession.js - 세션 관리 HTTP 클라이언트 생성 모듈
 * ============================================================================
 *
 * 쿠키 세션을 유지하는 axios HTTP 클라이언트를 생성합니다.
 * PlayEntry.org와의 세션 유지가 필요한 연속된 요청에 사용됩니다.
 *
 * [기능]
 * - axios-cookiejar-support를 사용하여 쿠키 자동 관리
 * - tough-cookie CookieJar로 쿠키 저장소 제공
 * - withCredentials 설정으로 쿠키 전송 활성화
 *
 * [사용 방법]
 * import { createSessionClient } from './lib/httpSession.js';
 *
 * const { client, cookieJar } = createSessionClient();
 *
 * // 쿠키가 자동으로 저장되고 이후 요청에 포함됨
 * await client.get('https://playentry.org/signin');
 * await client.post('https://playentry.org/graphql', data);
 *
 * [주의사항]
 * - 동일한 client 인스턴스로 로그인 세션 유지
 * - 여러 세션 관리 시 별도의 client 인스턴스 생성 필요
 *
 * ============================================================================
 */

import axios from "axios";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";

export function createSessionClient() {
  const cookieJar = new CookieJar();

  const client = wrapper(
    axios.create({
      jar: cookieJar,
      withCredentials: true,
    }),
  );

  return { client, cookieJar };
}
