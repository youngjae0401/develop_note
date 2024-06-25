---
title: "[GitHub] Author 일괄 변경하기"
description: "GitHub에서 Author을 일괄로 변경해보자."
excerpt: ""

categories:
  - GitHub

tags:
  - [github]
  - [author]

permalink: /github/github-update-author/

toc: true
toc_sticky: true

date: 2024-06-25
last_modified_at: 2024-06-25
---

개인 GitHub 계정에 회사 GitHub 계정으로 커밋된 내용이 있어서 지금까지 푸시되었던 내용을 개인 GitHub 계정으로 변경이 필요했다.

그래서 ChatGPT에게 GitHub에 Author을 일괄로 변경이 가능한지 물어보고 처리했다.

간단한 명령어로 처리가 가능했지만 나중에 또 이런 일이 발생할 수 있다고 생각되어 포스팅하게 되었다.

* * *

### Step 1
`OLD_EMAIL`, `CORRECT_NAME`, `CORRECT_EMAIL`을 입력하고 커맨드를 실행한다.
```bash
git filter-branch -f --env-filter '
OLD_EMAIL="old@example.com"
CORRECT_NAME="New Author Name"
CORRECT_EMAIL="new@example.com"

if [ "$GIT_COMMITTER_EMAIL" = "$OLD_EMAIL" ]
then
    export GIT_COMMITTER_NAME="$CORRECT_NAME"
    export GIT_COMMITTER_EMAIL="$CORRECT_EMAIL"
fi
if [ "$GIT_AUTHOR_EMAIL" = "$OLD_EMAIL" ]
then
    export GIT_AUTHOR_NAME="$CORRECT_NAME"
    export GIT_AUTHOR_EMAIL="$CORRECT_EMAIL"
fi
' --tag-name-filter cat -- --branches --tags
```
![과정1](/assets/images/posts/github-update-author/1.png "1")

* * *

### Step 2
push 커맨드를 실행하면 적용이 된다.
```bash
git push --force --tags origin 'your-branch-name'
```