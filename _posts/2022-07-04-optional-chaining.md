---
title: "[JS] Optional Chaining"
excerpt: "[JS] Optional Chaining에 대해서 알아보자"

categories:
  - JavaScript

tags:
  - [javascript]

permalink: /js/optional-chaining/

toc: true
toc_sticky: true

date: 2022-07-04
last_modified_at: 2022-07-04
---

Optional Chaining은 `?.` 연산자이다. 아래 예시를 살펴보자.

```javascript
const user = {
    /*
    name: {
        first: "Minsoo",
        last: "Kim"
    },
    */
    age: 15
}
```

```javascript
> user.age
15
```
오류없이 정상이다.

```javascript
> user.name
undefined
```
1개의 객체에 대하여 접근할 때는 undefined를 반환한다.

```javascript
> user.name.first
Uncaught TypeError: Cannot read properties of undefined
```
위와 같이 2개 이상의 객체에 대하여 접근할 때는 TypeError를 반환한다.
에러가 발생하면 스크립트는 더 이상 진행하지 않기 때문에 ?. 연산자를 사용하여 에러 없이 안전하게 접근할 수 있다.

```javascript
> user.name?.first
undefined
```