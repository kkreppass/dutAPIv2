/**
 * ============================================================================
 * graphql.js - PlayEntry.org GraphQL 쿼리 정의 모듈
 * ============================================================================
 *
 * PlayEntry.org API와 통신하기 위한 GraphQL 쿼리 및 뮤테이션을 정의합니다.
 *
 * [포함된 쿼리/뮤테이션]
 *
 * 1. 인증 (Authentication)
 *    - SIGNIN_BY_USERNAME: 사용자명으로 로그인
 *
 * 2. 커뮤니티 (엔트리스토리)
 *    - CREATE_ENTRYSTORY: 새 게시글 작성
 *    - SELECT_ENTRYSTORY: 게시글 목록 조회
 *    - CREATE_COMMENT: 댓글 작성
 *
 * 3. 사용자 검색
 *    - GET_USERS: 닉네임으로 사용자 검색
 *    - SEARCH_FOLLOWINGS: 팥로잉 목록 검색
 *    - SEARCH_FOLLOWERS: 팥로워 목록 검색
 *
 * [사용 방법]
 * import { SIGNIN_BY_USERNAME, CREATE_ENTRYSTORY } from './lib/graphql.js';
 *
 * const response = await client.post('https://playentry.org/graphql', {
 *   query: SIGNIN_BY_USERNAME,
 *   variables: { username: 'user', password: 'pass' }
 * });
 *
 * ============================================================================
 */

export const SIGNIN_BY_USERNAME = `
  mutation SIGNIN_BY_USERNAME(
    $username: String!
    $password: String!
    $rememberme: Boolean
    $captchaValue: String
    $captchaKey: String
    $captchaType: String
  ) {
    signinByUsername(
      username: $username
      password: $password
      rememberme: $rememberme
      captchaValue: $captchaValue
      captchaKey: $captchaKey
      captchaType: $captchaType
    ) {
      id
      username
      nickname
    }
  }
`;

export const CREATE_ENTRYSTORY = `
  mutation CREATE_ENTRYSTORY(
    $content: String
    $text: String
    $image: String
    $sticker: ID
    $stickerItem: ID
    $cursor: String
  ) {
    createEntryStory(
      content: $content
      text: $text
      image: $image
      sticker: $sticker
      stickerItem: $stickerItem
      cursor: $cursor
    ) {
      warning
      discuss {
        id
        title
        content
        seContent
        created
        commentsLength
        likesLength
        favorite
        visit
        category
        prefix
        groupNotice
        user {
          id
          nickname
          profileImage {
            id
            name
            label {
              ko
              en
              ja
              vn
            }
            filename
            imageType
            dimension {
              width
              height
            }
            trimmed {
              filename
              width
              height
            }
          }
          status {
            following
            follower
          }
          description
          role
          mark {
            id
            name
            label {
              ko
              en
              ja
              vn
            }
            filename
            imageType
            dimension {
              width
              height
            }
            trimmed {
              filename
              width
              height
            }
          }
        }
        images {
          filename
          imageUrl
        }
        sticker {
          id
          name
          label {
            ko
            en
            ja
            vn
          }
          filename
          imageType
          dimension {
            width
            height
          }
          trimmed {
            filename
            width
            height
          }
        }
        progress
        thumbnail
        reply
        bestComment {
          id
          user {
            id
            nickname
            profileImage {
              id
              name
              label {
                ko
                en
                ja
                vn
              }
              filename
              imageType
              dimension {
                width
                height
              }
              trimmed {
                filename
                width
                height
              }
            }
            status {
              following
              follower
            }
            description
            role
            mark {
              id
              name
              label {
                ko
                en
                ja
                vn
              }
              filename
              imageType
              dimension {
                width
                height
              }
              trimmed {
                filename
                width
                height
              }
            }
          }
          content
          created
          removed
          blamed
          blamedBy
          commentsLength
          likesLength
          isLike
          hide
          pinned
          image {
            id
            name
            label {
              ko
              en
              ja
              vn
            }
            filename
            imageType
            dimension {
              width
              height
            }
            trimmed {
              filename
              width
              height
            }
          }
          sticker {
            id
            name
            label {
              ko
              en
              ja
              vn
            }
            filename
            imageType
            dimension {
              width
              height
            }
            trimmed {
              filename
              width
              height
            }
          }
        }
        blamed
        description1
        description2
        description3
        tags
      }
    }
  }
`;

export const CREATE_COMMENT = `
    mutation CREATE_COMMENT(
        
    $content: String
    $image: String
    $sticker: ID
    $stickerItem: ID
    $target: String
    $targetSubject: String
    $targetType: String
    $groupId: ID

    ) {
        createComment(
            
    content: $content
    image: $image
    sticker: $sticker
    stickerItem: $stickerItem
    target: $target
    targetSubject: $targetSubject
    targetType: $targetType
    groupId: $groupId

        ) {
            warning
            comment {
                
    id
    user {
        
    id
    nickname
    profileImage {
        
    id
    name
    label {
        
    ko
    en
    ja
    vn

    }
    filename
    imageType
    dimension {
        
    width
    height

    }
    trimmed {
        filename
        width
        height
    }

    }
    status {
        following
        follower
    }
    description
    role
    mark {
        
    id
    name
    label {
        
    ko
    en
    ja
    vn

    }
    filename
    imageType
    dimension {
        
    width
    height

    }
    trimmed {
        filename
        width
        height
    }
 
    }

    }
    content
    created
    removed
    blamed
    blamedBy
    commentsLength
    likesLength
    isLike
    hide
    pinned
    image {
        
    id
    name
    label {
        
    ko
    en
    ja
    vn

    }
    filename
    imageType
    dimension {
        
    width
    height

    }
    trimmed {
        filename
        width
        height
    }

    }
    sticker {
        
    id
    name
    label {
        
    ko
    en
    ja
    vn

    }
    filename
    imageType
    dimension {
        
    width
    height

    }
    trimmed {
        filename
        width
        height
    }

    }

            }
        }
    }
`;

export const SELECT_ENTRYSTORY = `
    query SELECT_ENTRYSTORY(
    $pageParam: PageParam
    $query: String
    $user: String
    $category: String
    $term: String
    $prefix: String
    $progress: String
    $discussType: String
    $searchType: String
    $searchAfter: JSON
    $tag: String
){
        discussList(
    pageParam: $pageParam
    query: $query
    user: $user
    category: $category
    term: $term
    prefix: $prefix
    progress: $progress
    discussType: $discussType
    searchType: $searchType
    searchAfter: $searchAfter
    tag: $tag
) {
            total
            list {
                
	id
    content
    created
    commentsLength
    likesLength
    user {
        
    id
    nickname
    profileImage {
        
    id
    name
    label {
        
    ko
    en
    ja
    vn

    }
    filename
    imageType
    dimension {
        
    width
    height

    }
    trimmed {
        filename
        width
        height
    }

    }
    status {
        following
        follower
    }
    description
    role
    mark {
        
    id
    name
    label {
        
    ko
    en
    ja
    vn

    }
    filename
    imageType
    dimension {
        
    width
    height

    }
    trimmed {
        filename
        width
        height
    }
 
    }

    }
    image {
        
    id
    name
    label {
        
    ko
    en
    ja
    vn

    }
    filename
    imageType
    dimension {
        
    width
    height

    }
    trimmed {
        filename
        width
        height
    }

    }
    sticker {
        
    id
    name
    label {
        
    ko
    en
    ja
    vn

    }
    filename
    imageType
    dimension {
        
    width
    height

    }
    trimmed {
        filename
        width
        height
    }

    }
    isLike

            }
            searchAfter
        }
    }
`;

export const GET_USERS = `
    query getUsers($param: UserSearch!) {
  getUsers(param: $param) {
    list {
      id
      nickname
      spaceAvatarThumbnail
      spaceWorld {
        id
      }
    }
    total
    searchAfter {
      _id
    }
  }
}
`;

export const SEARCH_FOLLOWERS = `
    query SELECT_FOLLOWERS(
        $user: String, 
        $query: String, 
        $pageParam: PageParam, 
        $searchAfter: JSON
    ){
        followers(user: $user, query: $query, pageParam: $pageParam, searchAfter: $searchAfter) {
            searchAfter
            searchTotal
            list {
                
    id
    user {
        id
        role
        nickname
        description
        profileImage {
            
    id
    name
    label {
        
    ko
    en
    ja
    vn

    }
    filename
    imageType
    dimension {
        
    width
    height

    }
    trimmed {
        filename
        width
        height
    }

        }
        status {
            following
            follower
        }
        projects {
            id
            thumb
            name
            category
            categoryCode
        }
    }

            }
        }
    }
`;

export const SEARCH_FOLLOWINGS = `
    query SELECT_FOLLOWINGS(
        $user: String, 
        $query: String, 
        $pageParam: PageParam, 
        $searchAfter: JSON
    ){
        followings(user: $user, query: $query, pageParam: $pageParam, searchAfter: $searchAfter) {
            searchAfter
            searchTotal
            list {
                
    id
    follow {
        id
        role
        nickname
        description
        profileImage {
            
    id
    name
    label {
        
    ko
    en
    ja
    vn

    }
    filename
    imageType
    dimension {
        
    width
    height

    }
    trimmed {
        filename
        width
        height
    }

        }
        status {
            following
            follower
        }
        projects {
            id
            thumb
            name
            category
            categoryCode
        }
    }

            }
        }
    }
`;

export const SELECT_COMMENTS = `
  query SELECT_COMMENTS(
  $pageParam: PageParam
  $target: String
  $searchAfter: JSON
  $likesLength: Int
  $groupId: ID
){
    commentList(
  pageParam: $pageParam
  target: $target
  searchAfter: $searchAfter
  likesLength: $likesLength
  groupId: $groupId
) {
      total
      searchAfter
      likesLength
      list {
        id
  user {
    id
    nickname
    profileImage {
      id
      name
      label {
        ko
        en
        ja
        vn
      }
      filename
      imageType
      dimension {
        width
        height
      }
      trimmed {
        filename
        width
        height
      }
    }
    status {
      following
      follower
    }
    description
    role
    mark {
      id
      name
      label {
        ko
        en
        ja
        vn
      }
      filename
      imageType
      dimension {
        width
        height
      }
      trimmed {
        filename
        width
        height
      }
    }
  }
  content
  created
  removed
  blamed
  blamedBy
  commentsLength
  likesLength
  isLike
  hide
  pinned
  image {
    id
    name
    label {
      ko
      en
      ja
      vn
    }
    filename
    imageType
    dimension {
      width
      height
    }
    trimmed {
      filename
      width
      height
    }
  }
  sticker {
    id
    name
    label {
      ko
      en
      ja
      vn
    }
    filename
    imageType
    dimension {
      width
      height
    }
    trimmed {
      filename
      width
      height
    }
  }
      }
    }
  }
`;
