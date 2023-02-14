---
title: "[AWS] EC2에서 S3로 파일 업로드"
excerpt: "EC2에 있는 이미지를 webp로 컨버팅 후에 S3로 옮겨보자"

categories:
    - Infra

tags:
    - [ec2]
    - [s3]
    - [iam]

permalink: /infra/ec2-to-s3-file-upload/

toc: true
toc_sticky: true

date: 2023-02-10
last_modified_at: 2023-02-10
---

기존 서비스가 EC2와 S3에 이미지가 나눠서 저장되어 있었기 때문에 EC2에 있는 모든 이미지를 S3로 이관하여 관리하기로 했고, 또한 jpg, png 등 기본적인 이미지 형식이 아니라 webp 형식으로 컨버팅 후에 업로드 하기로 했다.
이번 포스팅에서는 **EC2 터미널에서 모든 이미지를 webp로 컨버팅 하고 S3로 이관하는 작업**을 작성했다.

> S3에 버킷을 생성해두었다고 가정하고 진행을 합니다.

* * *

### ✅ EC2 ➡️ S3 파일 업로드 방법

> 📌 **(참고)** 업로드는 여러 방향으로 가능하다.
> * S3 ➡️ S3
> * S3 ➡️ EC2
> * S3 ➡️ Local
> * Local ➡️ S3
> * ...

#### Step 1
##### EC2 서버에서 S3 목록을 확인해본다.
```bash
aws s3 ls
```
![과정1](/assets/images/posts/ec2-to-s3-file-upload/1.png "과정1")
문제가 발생했다. 자격 증명이 구성되어 있지 않아서 S3에 접근할 수가 없다.

* * *

#### Step 2
##### IAM 정책(policy) 생성
굳이 정책을 새로 생성하지 않고 `AmazonS3FullAccess`로 역할을 부여해서 적용해도 되지만 S3에 업로드할 특정 버킷에만 권한을 주고 작업하기 위해 정책을 생성했다. <br>

IAM ➡️ 좌측 정책 ➡️ 우측 정책 생성 ➡️ JSON 탭(아래 참고) ➡️ 다음: 태그 ➡️ 다음: 검토

![policy](/assets/images/posts/ec2-to-s3-file-upload/policy.png "policy")

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "s3:*",
            "Resource": [
                "arn:aws:s3:::{BUCKET NAME}",
                "arn:aws:s3:::{BUCKET NAME}/*"
            ]
        }
    ]
}
```

* * *

#### Step 3
##### IAM 역할(role) 생성
**Step 2**에서 생성한 정책을 역할에 부여한다. <br>
IAM ➡️ 좌측 역할 ➡️ 우측 역할 만들기 ➡️ 위에서 생성한 정책 선택 후 다음 ➡️ AWS 서비스 선택, 사용 사례 EC2 선택 ➡️ 역할 이름 및 설명 작성 후 역할 생성

![role1](/assets/images/posts/ec2-to-s3-file-upload/role1.png "role1")
![role2](/assets/images/posts/ec2-to-s3-file-upload/role2.png "role2")

* * *

#### Step 4
##### EC2 인스턴스에 역할 적용
**Step 3**에서 생성한 역할을 EC2 인스턴스에 부여한다. <br>
EC2 인스턴스 우클릭 ➡️ 보안 ➡️ IAM 역할 수정 ➡️ 생성한 IAM 역할 선택 후 IAM 역할 업데이트

* * *

#### Step 5
##### EC2 ➡️ S3 파일 업로드(테스트)
테스트로 기존에 있던 jpg, png 등의 이미지를 업로드를 해보겠다.
```bash
aws s3 cp {PATH} s3://{BUCKET NAME}
```

![과정2](/assets/images/posts/ec2-to-s3-file-upload/2.png "과정2")
문제가 발생했다. {PATH}에 디렉토리 구조를 넣으면 `--recursive` 옵션을 사용해야 한다.

* * *

#### Step 6
##### EC2 ➡️ S3 파일 업로드(테스트 재시도)
```bash
aws s3 cp {PATH} s3://{BUCKET NAME} --recursive
```

![과정3](/assets/images/posts/ec2-to-s3-file-upload/3.png "과정3")
파일이 정상적으로 업로드된다.👍

> `--recursive` 옵션은 하위 디렉토리까지 모두 업로드된다.

하지만, `cp & --recursive` 보다 더 괜찮은 명령어가 있다. 바로 `sync` 이다.
```bash
aws sync {PATH} s3://{BUCKET NAME}
```
위와 같이 명령어를 실행하면 통째로 동기화가 된다.👍 <br><br>
이외에도 작업하면서 실용적인 명령어도 있었다.
```bash
aws sync {PATH} s3://{BUCKET NAME} --dryrun
```
`--dryrun`을 사용하면 테스트로 커맨드가 실행이 된다.👍

* * *

### ✅ JPG/PNG.. ➡️ WEBP 확장자 컨버팅 방법

> `WEBP`는 2010년 Web을 위해 구글에서 만든 효율적인 이미지 포맷이다.

#### Step 1
##### `imagemagick` 라이브러리에 필요한 모듈 설치
컨버팅 라이브러리 중에 `imagemagick`을 사용했다. <br>
PHP에서 사용 시 필요한 모듈을 설치해본다.
```bash
sudo yum -y install php-pear php-devel gcc
sudo yum -y install ImageMagick ImageMagick-devel ImageMagick-perl
sudo pecl install imagick
sudo chmod 755 /usr/lib64/php/modules/imagick.so
sudo yum -y install libwebp libwebp-tools
```

* * *

#### Step2
##### 모든 파일을 한 번에 컨버팅 시작
여러 시도 끝에 퀄리티는 80%가 가장 적절해보였기 때문에 80%로 적용했고 <br>
혹시 컨버팅 중에 에러가 발생하여 끊기면 끊긴 파일만 다시 컨버팅을 하려고 컨버팅에 성공한 파일과 실패한 파일을 텍스트 파일로 남겨두었다.
쉘 스크립트는 `ChatGPT`에게 도움을 받고 적절하게 섞어서 적용했다.👍<br>
**대략 23G 용량의 이미지들을 컨버팅을 하는데 9시간 40분정도 소요됐고 용량은 3G로 줄었다.**
```bash
#!/bin/bash

IMAGES_DIR="{PATH}"

sudo find "$IMAGES_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" \) -print0 | while read -d $'\0' file
do
    outfile="${file%.*}.webp"

    sudo convert "$file" -quality 80 "$outfile" &> /dev/null

    echo "$outfile" >> success_converted.txt

    if [ $? -ne 0 ]; then
        echo "$file" >> error_converted.txt
    fi
done
```

> jpg, jpeg, png, gif로 작성을 했지만 JPG, JPEG, PNG, GIF 형식도 모두 컨버팅 된다.

위와 같이 명령어를 실행하면 같은 폴더 내에 같은 파일명으로 확장자만 다르게 컨버팅이 된다. <br>
webp로 컨버팅 시에 이미지 용량은 **작게는 1/2로, 많게는 1/10**로 줄어든다.

* * *

컨버팅이 정상적으로 되었으면 EC2 ➡️ S3로 업로드를 하면 된다.👍 <br>