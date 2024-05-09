---
title: "[JPA] 많이 사용하는 QueryDSL 조건 종류"
excerpt: ""

categories:
  - JPA

tags:
  - [Spring Boot]
  - [JPA]
  - [QueryDSL]

permalink: /jpa/querydsl-search-condition/

toc: true
toc_sticky: true

date: 2024-04-24
last_modified_at: 2024-04-24
---

QueryDSL을 사용하면서 많이 사용했던 조건 종류를 작성해본다.

* * *

**eq()**
```java
member.userRoles.eq(AuthorityName.USER) // user_roles = 'USER'
```

* * *

**ne() 또는 eq().not()**
```java
member.userRoles.ne(AuthorityName.ADMIN) // user_roles != 'ADMIN'
member.userRoles.eq(AuthorityName.ADMIN).not() // user_roles != 'ADMIN'
```

* * *

**isNull()**
```java
member.deletedAt.isNull() // deleted_at IS NULL
```

* * *

**isNotNull()**
```java
member.emailVerifiedAt.isNotNull() // email_verified_at IS NOT NULL
```

* * *

**between()**
```java
member.createdAt.between(startDateTime, endDateTime) // created_at between '2024-04-01 00:00:00' and '2024-04-24 23:59:59'
```

* * *

**goe()**
```java
member.createdAt.goe(startDateTime) // created_at >= '2024-04-01 00:00:00'
```

* * *

**loe**
```java
member.createdAt.loe(endDateTime) // created_at <= '2024-04-24 23:59:59'
```

* * *

**gt**
```java
member.createdAt.gt(startDateTime) // created_at > '2024-04-01 00:00:00'
```

* * *

**lt**
```java
member.createdAt.lt(endDateTime) // created_at < '2024-04-24 23:59:59'
```

* * *

**like**
```java
// 임의로 %
member.email.contains("%joyoungjae") // LIKE '%joyoungjae'
```

* * *

**contains**
```java
// 앞뒤에 %
member.email.contains("joyoungjae") // LIKE '%joyoungjae%'
```

* * *

**startsWith**
```java
// 뒤에 %
member.email.contains("joyoungjae") // LIKE 'joyoungjae%'
```

* * *

**in**
```java
member.id.in(1, 3, 5, 7, 9) // id IN (1, 3, 5, 7, 9)
```

* * *

**notIn**
```java
member.id.notIn(2, 4, 6, 8) // id NOT IN (2, 4, 6, 8)
```
