---
title: "Utterances 적용"
excerpt: "블로그에 Utterances를 적용하기"

categories:
  - GitHub Blog

tags:
  - [utterances]
  - [blog]

permalink: /blog/utterances/

toc: true
toc_sticky: true

date: 2022-06-16
last_modified_at: 2022-06-16
---

댓글 서비스인 DISQUS를 적용하고 거의 사용하진 않았지만, 무겁고 디자인이 마음에 들지 않았다.
그래서 다른 댓글 서비스인 Utterances를 적용하기로 했다.
## [Utterances](https://github.com/apps/utterances)를 적용해보자.
`적용 기준은 Jekyll Clean Blog 입니다.`
* * *

#### Step 1
Utterances INSTALL
![과정1](/assets/images/posts/utterances/1.png "1")
* * *

#### Step 2
comments 용도로 repository를 만들었기 때문에 Only select repositories를 선택했다.
![과정2](/assets/images/posts/utterances/2.png "2")
* * *

#### Step 3
comments 용도로 만들었던 repo를 입력했다.
![과정3](/assets/images/posts/utterances/3.png "3")
* * *

#### Step 4
블로그 글 경로를 이슈의 제목으로 설정했다.
![과정4](/assets/images/posts/utterances/4.png "4")
* * *

#### Step 5
label 입력은 선택사항이지만 Comment라고 명시했고 테마는 블로그 색상과 비슷하게 Github Light로 선택했다.(본인에 맞게 선택)
적용할 스크립트 태그 Copy
![과정5](/assets/images/posts/utterances/5.png "5")
* * *

#### Step 6
_includes/utterances.html 파일 생성 후 복사한 스크립트 태그 삽입
![과정6](/assets/images/posts/utterances/6.png "6")
* * *

#### Step 7
_layouts/post.html 파일에서 원하는 위치에 위 이미지와 동일하게 삽입
![과정7](/assets/images/posts/utterances/7.png "7")
* * *

#### Step 8
적용이 되는지 확인
![과정8](/assets/images/posts/utterances/8.png "8")
* * *

#### Step 9
작성 테스트
![과정9](/assets/images/posts/utterances/9.png "9")
* * *

#### Step 10
4번에서 설정한대로 블로그 글 경로로 생성된다는 것을 확인
![과정10_1](/assets/images/posts/utterances/10_1.png "10_1")
![과정10_2](/assets/images/posts/utterances/10_2.png "10_2")
* * *