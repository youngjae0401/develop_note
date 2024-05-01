---
title: "[JAVA] @NotNull, @NotEmpty, @NotBlank 차이점"
excerpt: ""

categories:
  - JAVA

tags:
  - [NotNull]
  - [NotEmpty]
  - [NotBlank]
  - [Annotation]

permalink: /java/not-null-empty-blank/

toc: true
toc_sticky: true

date: 2023-10-16
last_modified_at: 2023-10-16
---

### 사용 방법
```java
// build.gradle
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-validation'
}
```
`spring-boot-starter-validation` 의존성을 추가해야 사용이 가능하다.

* * *

### @NotNull
`null`만 허용하지 않는다. (`""`, `" "`는 허용한다.)

* * *

### @NotEmpty
`null`과 `""`를 허용하지 않는다. (`" "`는 허용한다.)

* * *

### @NotBlank
`null`, `""`, `" "` 모두 허용하지 않는다.
