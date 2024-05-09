---
title: "[JPA] QueryDSL 동적 쿼리로 검색하기"
excerpt: ""

categories:
  - JPA

tags:
  - [Spring Boot]
  - [JPA]
  - [QueryDSL]

permalink: /jpa/querydsl-dynamic-query/

toc: true
toc_sticky: true

date: 2024-05-02
last_modified_at: 2024-05-02
---

QueryDSL에서 동적 쿼리로 조회하는 방법을 남겨보겠다.

* * *

### 환경
* JAVA 17
* Spring Boot 3.14
* QueryDSL 5.0.0

* * *

### 기본 테스트 코드
```java
@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(QueryDslConfig.class)
class MemberRepositoryTest {
    @Autowired
    JPAQueryFactory queryFactory;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private static QMember member = QMember.member;

    @BeforeEach
    public void setUp() {
        Member member1 = Member.builder()
                .userNm("Youngjae")
                .userPw("12345")
                .userRoles(AuthorityName.USER)
                .email("joyoungjae0401@gmail.com")
                .countryCode("KR")
                .emailVerifiedAt(LocalDateTime.now())
                .build();
        memberRepository.save(member1);

        Member admin1 = Member.builder()
                .userNm("Administrator")
                .userPw("abcde")
                .userRoles(AuthorityName.ADMIN)
                .email("admin@gmail.com")
                .countryCode("US")
                .emailVerifiedAt(LocalDateTime.now())
                .build();
        memberRepository.save(admin1);

        Member member2 = Member.builder()
                .userNm("test user")
                .userPw("가나다라마")
                .userRoles(AuthorityName.USER)
                .email("testUser@gmail.com")
                .countryCode("KR")
                .emailVerifiedAt(LocalDateTime.now())
                .build();
        memberRepository.save(member2);
    }
}
```

* * *

#### 단일 expression 사용
```java
@Test
void getMembers() {
    // given
    ...

    // when
    BooleanExpression expression = member.emailVerifiedAt.isNotNull()
            .and(member.deletedAt.isNull())
            .and(member.userRoles.eq(AuthorityName.ADMIN));

    List<Member> members = queryFactory
            .selectFrom(member)
            .where(expression)
            .fetch();

    // then
    ...
}
```

* * *

#### 다중 expression 사용
```java
@Test
void getMembers() {
    // given
    ...

    // when
    BooleanExpression expression1 = member.emailVerifiedAt.isNotNull();
    BooleanExpression expression2 = member.deletedAt.isNull();
    BooleanExpression expression3 = member.userRoles.eq(AuthorityName.ADMIN);

    List<Member> members = queryFactory
            .selectFrom(member)
            .where(expression1, expression2, expression3)
            .fetch();

    // then
    ...
}
```

* * *

#### BooleanBuilder 사용
```java
@Test
void getMembers() {
    // given
    ...

    // when
    BooleanBuilder booleanBuilder = new BooleanBuilder();
    booleanBuilder.and(member.emailVerifiedAt.isNotNull());
    booleanBuilder.and(member.deletedAt.isNull());
    booleanBuilder.and(member.userRoles.eq(AuthorityName.ADMIN));

    List<Member> members = queryFactory
            .selectFrom(member)
            .where(booleanBuilder)
            .fetch();

    // then
    ...
}
```

* * *

조건마다 분리해도 되고 체이닝해서 사용이 가능하기 때문에, 회사의 규칙이나 환경에 따라 사용하고 싶은 방법으로 사용하면 된다. <br><br>
다만, 조건들을 조회할 때는 메서드를 만들어서 조회하는 게 좋은 것 같다.

> **BooleanBuilder**, **BooleanExpression**에서는 `null`일 경우 해당 조건은 무시된다. <br>
> **NPE** 오류가 발생할 수 있기 때문에 `null`에 대한 처리는 유의해야 한다.

<br>

#### 최종 예시

```java
@Test
void getMembers() {
    // given
    ...

    // when
    List<Member> members = queryFactory
            .selectFrom(member)
            .where(isActiveMember(),
                    eqUserRoles(AuthorityName.USER),
                    containsEmail("youngjae"))
            .fetch();

    // then
    ...
}

private BooleanExpression containsEmail(String email) {
    return StringUtils.hasText(email) ? member.email.contains(email) : null;
}

private BooleanExpression eqUserRoles(AuthorityName authorityName) {
    return member.userRoles.eq(authorityName);
}

private BooleanExpression isNullDeletedAt() {
    return member.deletedAt.isNull();
}

private BooleanExpression isNotNullEmailVerifiedAt() {
    return member.emailVerifiedAt.isNotNull();
}

private BooleanExpression isActiveMember() {
    return isNotNullEmailVerifiedAt().and(isNullDeletedAt());
}
```
