---
title: "[JAVA] Gradle에서 npm install"
excerpt: ""

categories:
  - JAVA

tags:
  - [Gradle]
  - [npm]

permalink: /java/gradle-npm-install/

toc: true
toc_sticky: true

date: 2023-11-02
last_modified_at: 2023-11-02
---

최근에 스프링을 학습하며 뷰 페이지에서 bootstrap과 aixos를 CDN 링크로 연결해서 작업하고 있었다. <br>
CDN으로 연결하는 건 불안정하고 의존성 관리도 힘들기 때문에, 안정적이고 의존성 관리를 위해 Gradle에 npm을 설치하는 방법을 알아봤다.

* * *

### 환경
* JAVA 17
* Spring Boot 3.14
* Node 20.9.0

* * *

#### Step 1
`/resources/static` 경로에서 `npm init` 실행 (`package.json` 파일 생성된다.)

* * *

#### Step 2
`/resources/static` 경로에서 사용할 패키지를 설치한다. (ex. `npm install axios bootstrap`) <br><br>

아래는 `package.json` 파일의 일부이다.
```json
{
    ...

    "dependencies": {
        "axios": "^1.6.0",
        "bootstrap": "^5.3.2"
    }
}
```

* * *

#### Step 3
**build.gradle**
```java
...

plugins {
    id 'java'
    id 'org.springframework.boot' version '3.1.4'
    id 'io.spring.dependency-management' version '1.1.3'
    id 'com.github.node-gradle.node' version '5.0.0' // 추가
}

java {
    sourceCompatibility = '17'
}

// 추가
node {
    version = "20.9.0"
    download = true
    nodeProjectDir = file("${project.projectDir}/src/main/resources/static")
}

...

// 추가
processResources.dependsOn('npmInstall')
```

* * *

#### Step 4
Gradle을 빌드하게 되면 `resources/static` 경로에 node_modules 폴더가 생성되고 그 안에서 패키지들이 관리될 것이다.