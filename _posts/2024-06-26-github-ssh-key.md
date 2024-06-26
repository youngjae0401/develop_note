---
title: "[GitHub] SSH Key 사용하기"
description: "GitHub에서 SSH Key를 연결해서 사용해보자."
excerpt: ""

categories:
  - GitHub

tags:
  - [github]
  - [ssh]
  - [ed25519]
  - [rsa]

permalink: /github/github-ssh-key/

toc: true
toc_sticky: true

date: 2024-06-26
last_modified_at: 2024-06-26
---

로컬에 불필요한 Repository를 정리하는 김에 개인과 회사의 GitHub SSH Key도 각각 다시 연결했다. <br>
그래서 SSH Key를 분리하고 연결하는 방법을 포스팅하게 되었다.

> SSH Key 방식에는 대표적으로 `ed25519`와 `rsa` 방식이 있는데, 각각 장단점이 있으므로 암호화 알고리즘에 대해서 검색해 볼 필요가 있다.

* * *

### Step 1
SSH Key를 각각 생성한다. (`ed25519` 또는 `rsa` 개인에 맞게 선택하면 된다.) <br>
포스팅을 위해 개인은 `ed25519`를, 회사는 `rsa`로 생성했다.

* **개인**
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
> ssh-keygen -t ed25519 -C "joyoungjae0401@gmail.com"
```
![ssh1](/assets/images/posts/github-ssh-key/ssh1.png "ssh1")

* **회사**
```bash
ssh-keygen -t rsa -C "your_email@example.com"
> ssh-keygen -t rsa -C "yjjo@deleo.co.kr"
```
![ssh2](/assets/images/posts/github-ssh-key/ssh2.png "ssh2")

* * *

### Step 2
~/.ssh/config 파일을 작성한다. (파일이 없다면 생성해서 작성하면 된다.)
```bash
Host github.com-youngjae0401
    HostName github.com
    User youngjae0401
    IdentityFile ~/.ssh/ssh_youngjae0401
Host github.com-yjjo
    HostName github.com
    User yjjo
    IdentityFile ~/.ssh/ssh_yjjo
```

* * *

### Step 3
아래 명령어로 SSH 설정이 제대로 되었는지 확인한다.

* **개인**
```bash
ssh -T git@github.com-youngjae0401
```
![check1](/assets/images/posts/github-ssh-key/check1.png "check1")

* **회사**
```bash
ssh -T git@github.com-yjjo
```
![check2](/assets/images/posts/github-ssh-key/check2.png "check2")

* * *

### Step 4
아래 명령어로 SSH Key 복사를 한다.
```bash
pbcopy < ~/.ssh/ssh_youngjae0401.pub
```

* * *

### Step 5
Github Settings ➡️ SSH and GPG keys ➡️ New SSH Key 이동 후 복사한 키를 추가해준다.

![connect](/assets/images/posts/github-ssh-key/connect.png "connect")

* * *

### Step 6
Repository Clone을 SSH URL로 시도하면 된다.
```bash
git clone git@<Host>:<username>/<repository>.git
> git clone git@github.com-youngjae0401:youngjae0401/develop_note.git
```
![clone](/assets/images/posts/github-ssh-key/clone.png "clone")
