---
title: "[JAVA] @AllArgsConstructor, @NoArgsConstructor, @RequiredArgsConstructor 차이점"
excerpt: "@AllArgsConstructor, @NoArgsConstructor, @RequiredArgsConstructor의 차이점을 알아보자"

categories:
  - JAVA

tags:
  - [AllArgsConstructor]
  - [NoArgsConstructor]
  - [RequiredArgsConstructor]
  - [Annotation]

permalink: /java/argsconstructor/

toc: true
toc_sticky: true

date: 2023-10-16
last_modified_at: 2023-10-16
---

### @AllArgsConstructor
클래스 내에 존재하는 모든 필드를 매개변수로 하는 생성자를 만들어준다.

```java
@AllArgsConstructor
public class User {
    private final Long id;
    private String name;
    private int age;
}

User user = new User(2L, "김철수", 23);
```

* * *

### @NoArgsConstructor
매개변수를 갖지 않는 기본 생성자를 만들어준다.

```java
@NoArgsConstructor
public class User {
    private Long id;
    private String name;
    private int age;
}

User user = new User();
```

> 만약, 항상 초기화가 필요한 `final`이 붙은 필드를 사용한다면 컴파일 에러가 발생한다.

* * *

### @RequiredArgsConstructor
클래스 내에 모든 필수 필드를 매개변수로 받는 생성자를 생성한다.

> 필수 필드란, `final`, `@NotNull` 또는 필수적으로 초기화되어야 하는 필드를 말한다.

```java
@RequiredArgsConstructor
public class User {
    private final Long id;
    private String name;
    private int age;
}

User user = new User(3L);
```