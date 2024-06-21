---
title: "[ETC] 스크린샷을 PDF로 변환 (feat. ebook)"
description: "자동으로 스크린샷을 저장하고 PDF로 변환해보자."
excerpt: ""

categories:
  - ETC

tags:
  - [ebook]
  - [python]
  - [screenshot]
  - [pdf]
  - [pyautogui]

permalink: /etc/screenshot-convert-to-pdf/

toc: true
toc_sticky: true

date: 2024-06-21
last_modified_at: 2024-06-21
---

### # 만든 이유
주변에서 전자책(ebook)을 PDF로 변환해서 보고 싶다는 얘기를 들은 적이 있었다.

PDF로 변환해서 보고 싶은 이유는 "아이패드에서 PDF에 필기하며 공부를 하고 싶다"였다.

구글링을 해보니 PDF로 변환하고 싶은 니즈가 여럿 있었다.

이미 파이썬으로 만든 프로그램이 있었는데 잘 작동하지도 않았고, 개발자가 아닌 비개발자가 사용하기엔 어려워 보였다.

그래서 한번 만들어보자고 생각했다.

나도 만들긴 했지만.. 비개발자가 사용하기엔 어려움이 있어 설명이 필요하다.. 😭

> 다른 용도로 사용될지는 모르겠지만, 전자책을 PDF로 변환할 경우에는 반드시 **개인 소장용**으로만 사용하길 바랍니다.

* * *

### # 개발 환경
* Python 3.12.4
* pip 24.0
* macOS Sonoma 14.2.1

> Python 관련 패키지는 아래 Github 링크 참고

* * *

### # 사용 방법

사용 방법은 ***[Github](https://github.com/youngjae0401/screenshot_convert_to_pdf)***에 작성을 했지만 이미지로 남겨보았다. <br><br>

#### Step 1
Github에서 다운로드 받은 파일 경로에 가서 `python screenshot_convert_to_pdf.py` 커맨드를 입력하면 아래와 같이 실행된다.
![과정1](/assets/images/posts/screenshot-convert-to-pdf/1.png "1")

<br>

#### Step 2
좌상단 좌표 설정 버튼 클릭 후 OK 클릭
![과정2](/assets/images/posts/screenshot-convert-to-pdf/2.png "2")

<br>

#### Step 3
마우스를 좌상단 좌표 지점으로 이동 후 기다리면 아래와 같이 나온다.
![과정3](/assets/images/posts/screenshot-convert-to-pdf/3.png "3")

<br>

#### Step 4
우하단 좌표 설정 버튼 클릭 후 OK 클릭
![과정4](/assets/images/posts/screenshot-convert-to-pdf/4.png "4")

<br>

#### Step 5
마우스를 우하단 좌표 지점으로 이동 후 기다리면 아래와 같이 나온다.
![과정5](/assets/images/posts/screenshot-convert-to-pdf/5.png "5")

<br>

#### Step 6
다음 페이지 방향키 선택, PDF 파일명 및 총 페이지 수 입력 후 PDF 파일 만들기 버튼 클릭
![과정6](/assets/images/posts/screenshot-convert-to-pdf/6.png "6")

<br>

#### Step 7
아래와 같이 카운트 다운이 시작된다.
![과정7](/assets/images/posts/screenshot-convert-to-pdf/7.png "7")

<br>

#### Step 8
작업이 완료되면 아래와 같이 나온다.
![과정8](/assets/images/posts/screenshot-convert-to-pdf/8.png "8")
![과정9](/assets/images/posts/screenshot-convert-to-pdf/9.png "9")

<br>

#### Step 9
아래와 같이 스크린샷과 PDF 파일이 저장된다.
![과정10](/assets/images/posts/screenshot-convert-to-pdf/10.png "10")

* * *

비록 200여 줄의 간단한 코드지만, 누군가에게는 도움을 줄 수 있다는 게 뿌듯하다. 🙂
