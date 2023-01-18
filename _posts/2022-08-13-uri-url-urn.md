---
title: "URI, URL, URN"
excerpt: "URI, URL, URN에 대해서 알아보자"

categories:
  - Web

tags:
  - [uri]
  - [url]
  - [urn]

permalink: /web/uri-url-urn/

toc: true
toc_sticky: true

date: 2022-08-13
last_modified_at: 2022-08-13
---

### [URI (Uniform Resource Identifier)](https://ko.wikipedia.org/wiki/%ED%86%B5%ED%95%A9_%EC%9E%90%EC%9B%90_%EC%8B%9D%EB%B3%84%EC%9E%90)
* 네트워크 상에 존재하는 <span class="bl">자원을 구분하는 식별자</span>이다.
* 인터넷에서 요구되는 기본 조건으로서 인터넷 프로토콜에 항상 붙어 다닌다.
* URI의 하위개념으로 URL과 URN이 있다.

### [URL (Uniform Resource Locator)](https://ko.wikipedia.org/wiki/URL)
* 네트워크 상에서 존재하는 <span class="bl">자원의 위치를 나타내는 식별자</span>이다.
* URL은 자원의 위치 정보를 가지고 있으므로, 어떤 이유로든 자원의 위치가 변경되면 URL은 자원을 찾을 수 없으며, 변경된 위치는 추적할 수 없다.
* http 프로토콜뿐만 아니라 ftp, smtp, mailto 등 다른 프로토콜에서도 사용할 수 있다.
* URL의 식별자는 많은 요소로 구분되지만, 일반적으로 프로토콜, 도메인, 경로, 매개변수로 구분된다.

> **URL 구조**
> ![Alt text](/assets/images/posts/uri-url-urn/url.png "url 구조")
> * 프로토콜(Protocol): 네트워크 통신을 위한 통신규칙을 의미한다.
> * 도메인(domain): 네트워크에 부여되는 고유한 이름이다.
> * 경로(directory & file): 해당 파일(또는 자원)이 서버의 어디에 있는지를 나타내는 경로이다.
> * 매개변수(parameter \| query string): 사용자가 데이터를 전달하는 방법 중 하나로 URL 뒤에 덧붙여서 추가적인 정보를 서버 측에 전달한다.

<br>

### [URN (Uniform Resource Name)](https://ko.wikipedia.org/wiki/URN)
* 네트워크 상에 존재하는 <span class="bl">자원의 이름을 나타내는 식별자</span>이다.
* URI의 표준 포맷 중 하나로, 이름으로 리소스를 특정하는 URI이다.
* http와 같은 프로토콜을 제외하고 리소스의 name을 가리키는데 사용된다.
* URN에는 리소스 접근 방법과, 웹상의 위치가 표기되지 않는다.
* 실제 자원을 찾기 위해서는 URN을 URL로 변환하여 이용한다.

> **URN 구조**
> ![Alt text](/assets/images/posts/uri-url-urn/urn.png "urn 구조")
> * 네임스페이스 지시자(NID, Namespace Identifier): 자원이 저장된 저장소를 표시한다. (* isbn: 각 출판사가 출판한 각각의 도서에 국제적으로 표준화하여 붙이는 그 고유의 도서번호이다. 즉, 도서 일련번호에 대한 정보를 저장하는 저장소이다.)
> * 네임스페이스 특정문자(NSS, Namespace Specific String): 자원을 식별할 수 있는 고유값이다.