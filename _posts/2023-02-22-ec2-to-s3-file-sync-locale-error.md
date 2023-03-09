---
title: "[AWS] EC2에서 S3로 업로드 시 한글 파일명에 대한 에러"
excerpt: "EC2에 있는 한글 파일명 이미지를 S3에 업로드 시에 발생된 에러를 해결해보자"

categories:
    - Infra

tags:
    - [ec2]
    - [s3]
    - [locale]

permalink: /infra/ec2-to-s3-file-upload-locale-error/

toc: true
toc_sticky: true

date: 2023-02-22
last_modified_at: 2023-02-22
---

지난 포스팅에서 EC2에 있는 이미지들을 webp로 컨버팅하고 S3에 업로드하는 방법을 작성했다. <br>
진행하면서 발생된 에러와 해결했던 내용을 포스팅해보겠다. <br>
처음에 동기화했던 명령어는 아래와 같다.

```bash
aws s3 sync {PATH} s3://{BUCKET NAME}
```

순조롭게 진행되었고, 대략 **26G**를 업로드하는데 **50분**정도 소요되었다.
업로드가 다 되고 모든 이미지 파일이 성공적으로 업로드 되었는지 확인하기 위해 EC2 서버의 파일 개수와 S3에 업로드된 파일 개수와 비교해보았는데, 약 1,000개정도의 파일이 누락되었다.
왜지? 안타깝게도 단순히 명령어만 실행했기 때문에 실패에 대한 로그는 알 수 없었다. <br>
그래서 이미 업로드된 파일은 패스하고 업로드 되지 않은 파일에 대해서만 다시 업로드를 하기로 했다.

* * *

아래와 같이 쉘 스크립트 파일을 생성해서 실행했다.
```bash
#!/bin/bash

DIR="{PATH}"
S3_DIR="{BUCKET NAME}"
LOG_FILE="{LOG FILE NAME}.txt"

aws s3 sync --exclude "*" --include "*" --no-progress "$DIR" "$S3_DIR" 2>&1 | tee /dev/tty | awk 'BEGIN {FS="[:\r]"} /failed:/{print $3}' >> "$LOG_FILE"

if [ ! -s "$LOG_FILE" ]; then
    echo "All files synced successfully"
else
    echo "Some files failed to sync, see $LOG_FILE for details"
fi
```

* * *

하지만 아래와 같은 에러가 발생했고, 해당 경로에 있는 파일을 확인해보니 한글 파일명이었다. <br>
검색해보니 `locale` 세팅을 해주어야 한다고 한다.
```bash
warning: Skipping file '\xeb\xb0\x94\xec\xbd\x94\xeb\x93\x9c.jpg'. There was an error trying to decode the the file '\xeb\xb0\x94\xec\xbd\x94\xeb\x93\x9c.jpg' in directory "{PATH}".
Please check your locale settings.  The filename was decoded as: ANSI_X3.4-1968
On posix platforms, check the LC_CTYPE environment variable.
```

`locale` 명령어를 실행. LC_CTYPE를 찾을 수 없는 것이 문제인 것 같다.
```bash
> locale
locale: Cannot set LC_CTYPE to default locale: No such file or directory
locale: Cannot set LC_ALL to default locale: No such file or directory
LANG=en_US.UTF-8
LC_CTYPE=UTF-8
LC_NUMERIC="en_US.UTF-8"
LC_TIME="en_US.UTF-8"
LC_COLLATE="en_US.UTF-8"
LC_MONETARY="en_US.UTF-8"
LC_MESSAGES="en_US.UTF-8"
LC_PAPER="en_US.UTF-8"
LC_NAME="en_US.UTF-8"
LC_ADDRESS="en_US.UTF-8"
LC_TELEPHONE="en_US.UTF-8"
LC_MEASUREMENT="en_US.UTF-8"
LC_IDENTIFICATION="en_US.UTF-8"
LC_ALL=
```

환경 변수를 설정하는 `/etc/environment` 파일에 아래와 같이 작성했다.
```bash
LANG=en_US.utf-8
LC_ALL=en_US.utf-8
LC_CTYPE=en_US.UTF-8
```

**작성 후 재접속**한다.

* * *

`locale` 명령어를 다시 실행해보면 아래와 같이 정상적으로 세팅이 될 것이다.<br>

```bash
> locale
LANG=en_US.utf-8
LC_CTYPE="en_US.utf-8"
LC_NUMERIC="en_US.utf-8"
LC_TIME="en_US.utf-8"
LC_COLLATE="en_US.utf-8"
LC_MONETARY="en_US.utf-8"
LC_MESSAGES="en_US.utf-8"
LC_PAPER="en_US.utf-8"
LC_NAME="en_US.utf-8"
LC_ADDRESS="en_US.utf-8"
LC_TELEPHONE="en_US.utf-8"
LC_MEASUREMENT="en_US.utf-8"
LC_IDENTIFICATION="en_US.utf-8"
LC_ALL=en_US.utf-8
```

동기화도 정상적으로 완료되었다.