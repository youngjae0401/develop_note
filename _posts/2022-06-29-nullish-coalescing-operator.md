---
title: "[JS] Nullish Coalescing Operator이란?"
description: "[JS] Nullish Coalescing Operator에 대해서 자세히 알아보자"
excerpt: ""

categories:
  - JavaScript

tags:
  - [javascript]
  - [nullish coalescing operator]

permalink: /js/nullish-coalescing-operator/

toc: true
toc_sticky: true

date: 2022-06-29
last_modified_at: 2022-06-29
---

Nullish Coalescing Operator는 `??` 논리 연산자이다. 아래 예시를 살펴보자.

```javascript
let a = null;
let b = "알파벳 b";
let c = (a !== null && a !== undefined) ? a : b;

> c
알파벳 b
```

위 문법을 아래와 같이 간단하게 출력할 수 있다.

```javascript
let a = null;
let b = "알파벳 b";
let c = a ?? b;

> z
알파벳 b
```

<br>

또한, `||` 연산자는 0, 빈 값과 같은 falsy한 값이면 오른쪽 피연산자를 return한다.
이것은 아래와 같이 문제가 될 수 있다.
```javascript
let weight = 0;
> weight || '무게 있음'
무게 있음
```

그래서 undefined와 null에 대한 처리가 필요하다면 `??` 연산자를 사용하면 좋다.
```javascript
let weight = 0;
> weight ?? '무게 있음'
0
```