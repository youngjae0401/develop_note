---
title: "[Python] PyInstaller exe 파일이 실행되지 않는 오류"
description: "pyinstaller로 exe 배포 파일을 생성한 후에 파일이 실행되지 않는 오류에 대해서 알아보자."
excerpt: ""

categories:
  - Python

tags:
  - [PyInstaller]
  - [pyinstaller]
  - [exe]
  - [mac]
  - [Security & Privacy]
  - [security]
  - [privacy]
  - [개인정보 보호 및 보안]
  - [응용 프로그램]
  - [문제 리포트]
  - [screenshot]
  - [pdf]
  - [pyautogui]

permalink: /python/pyinstaller-exe-error/

toc: true
toc_sticky: true

date: 2024-06-24
last_modified_at: 2024-06-24
---

**[지난 포스팅](https://devriker.com/etc/screenshot-convert-to-pdf/)**에서 **파이썬으로 자동으로 스크린샷을 찍고 PDF로 변환하는 프로그램**을 작성했다.

개인적으로 또는 주변 지인들만 사용할 목적이라 단순히 파이썬 파일로만 남겼었는데 비개발자가 사용하기에 추가 설명이 필요했던 부분이 있었고, 파이썬과 관련 패키지를 설치를 해야하는 번거로움이 있었기 때문에 .exe 파일로 배포를 해보자고 생각했다.

그래서 이번 포스팅에서는 .exe 파일로 배포하면서 발생했던 문제와 해결 방법을 작성했다.

* * *

### # 개발 환경
* Python 3.12.4
* pip 24.0
* macOS Sonoma 14.2.1

* * *

우선, .exe 배포 파일을 만들기 위해 **[PyInstaller](https://pyinstaller.org/en/stable/)** 패키지를 설치했다.

```bash
brew install pyinstaller
```

> pyinstaller로 배포 파일을 생성하면 **build**와 **dist** 경로가 생성되는데 **dist** 경로에 생성되는 파일만 확인하면 된다.

* * *

### # 과정1
파이썬 파일이 있는 경로로 이동 후에 아래와 같이 커맨드를 실행했다.

```bash
pyinstaller -F -w screenshot_convert_to_pdf.py
```

> `-F`는 1개의 exe 파일로 변환해준다. <br>
> `-w`는 콘솔 윈도우 표시를 하지 않는다.

<br>

#### # 과정1에 대한 문제 발생
프로그램이 실행되고 모든 값을 입력한 후에 PDF 변환을 시도하니 아래와 같은 오류가 발생했다.
![과정1 실패](/assets/images/posts/pyinstaller-exe-error/1.png "1")

그래서 디버깅을 하기 위해 `-w`을 제거하고 아래와 같이 명령어를 실행했다.
```bash
pyinstaller -F screenshot_convert_to_pdf.py
```

* * *

### # 과정2
파이썬 파일이 있는 경로로 이동 후에 아래와 같이 커맨드를 실행했다.

```bash
pyinstaller -F screenshot_convert_to_pdf.py
```

<br>

#### # 과정2에 대한 문제 발생
프로그램은 정상적으로 작동되었다. 디버깅에도 문제가 없었다. <br>
하지만, 스크린샷 이미지와 PDF 파일이 생성되지 않았다.

* * *

### # 과정3
파일이 생성되지 않는 것을 보니 경로 또는 권한의 문제라고 생각이 들었다. <br>
그래서 사용자가 저장할 경로를 선택하고 그 경로에 저장되게끔 코드를 수정했다. (코드는 ***[Github](https://github.com/youngjae0401/screenshot_convert_to_pdf)***에 남겨두었다.)

그러고나서 다시 배포 파일을 생성하고 실행했는데 정상적으로 작동했다. 👍 🎉

![과정2 성공](/assets/images/posts/pyinstaller-exe-error/2.png "2")
![과정2 성공](/assets/images/posts/pyinstaller-exe-error/3.png "3")

하지만 끝날 때까지 끝난 게 아니다. `-w` 옵션을 다시 넣고 배포 파일을 생성해야 한다.

* * *

### # 과정4
파이썬 파일이 있는 경로로 이동 후에 아래와 같이 다시 커맨드를 실행했다.

```bash
pyinstaller -F -w screenshot_convert_to_pdf.py
```

<br>

#### # 과정4에 대한 문제 발생
역시.. 끝날 때까지 끝난 게 아니다. <br>
파일이 저장은 되지만 같은 화면이 계속 저장되었다. <br>
이 말인즉슨, 키보드가 작동하지 않았다는 것이다. (pyautogui.press)

* * *

### # 과정5
키보드에 접근하지 못했기 때문에 macOS 설정 > 개인정보 보호 및 보안(Security & Privacy)에서 문제가 있을 거라 생각되었다. <br>

왜냐하면 과정3에서는 키보드에 접근할 수 있었기 때문이다. <br>
**과정3의 터미널에는 접근이 허용되어 있고, 과정4의 .exe 파일에서는 접근이 허용되지 않았다고 생각했다.** <br>
그래서 개인정보 보호 및 보안에서 이곳저곳을 보다가 **손쉬운 사용** 설정을 확인했다. <br>

마침, 터미널에는 접근이 허용되어 있었고 .exe 파일은 없었다. <br>
그래서 .exe 파일을 추가한 후, 다시 시도했더니 잘 작동되었다. 💪💪💪 <br>
추가로 조금 더 완성도를 높이기 위해 아래 커맨드를 실행해서 .exe 파일에 아이콘을 입혔다.

```bash
pyinstaller -F -w --icon=cat.ico screenshot_convert_to_pdf.py
```

> `--icon<FILE_NAME.ico>`은 GUI에 아이콘을 추가한다.

* * *

### # 최종 결과 및 설정 사항

**[macOS 기준 설정 사항]**
1. 설정 ➡️ 개인정보 보호 및 보안 ➡️ 화면 및 시스템 오디오 녹음 ➡️ 화면 기록 및 시스템 오디오에 .exe 파일 추가 및 활성화
2. 설정 ➡️ 개인정보 보호 및 보안 ➡️ 손쉬운 사용에 .exe 파일 추가 및 활성화

![최종 결과](/assets/images/posts/pyinstaller-exe-error/r1.png "결과1")
![최종 결과](/assets/images/posts/pyinstaller-exe-error/r2.png "결과2")
![최종 결과](/assets/images/posts/pyinstaller-exe-error/r3.png "결과3")
![최종 결과](/assets/images/posts/pyinstaller-exe-error/r4.png "결과4")
![최종 결과](/assets/images/posts/pyinstaller-exe-error/r5.png "결과5")

이제 dist에 있는 .exe 파일만으로 모든 사용자가 사용법만 익힌 후에 사용할 수 있을 것 같다. 😎