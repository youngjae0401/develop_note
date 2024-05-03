---
title: "[JAVA] IP 주소로 국가코드를 가져오기(w. IP Location API)"
excerpt: ""

categories:
  - JAVA

tags:
  - [Spring Boot]
  - [IP Location API]

permalink: /java/ip-location-api/

toc: true
toc_sticky: true

date: 2024-03-05
last_modified_at: 2024-03-05
---

새로운 프로젝트를 진행하고 있는데, 접속자에 대한 국가코드 정보가 필요했다. <br><br>
그래서 접속자의 IP 주소를 가지고 국가코드를 가져올 수 있는 방법을 알아봤다. <br><br>
우선, IP 주소를 통해서 국가코드를 가져올 수 있는 방법은 크게 2가지인 것 같다.
1. GeoIP 라이브러리
2. 오픈 API

<br>

GeoIP 라이브러리에서도 데이터베이스를 사용하는 방법과 라이센스 키를 사용하는 방법이 있는 것 같다. <br><br>
데이터베이스를 사용해 보려고 했지만 주기적으로 업데이트를 해줘야 하는 부담과 부정확한 데이터가 있는 것 같았다. <br><br>
그리고 프로젝트의 마감 기간도 고려해야 해서 빠르게 처리할 수 있는 오픈 API를 사용하기로 했다. <br><br>
오픈 API를 제공하는 곳도 다양했지만, 나는 [IP Location API](https://api.iplocation.net/)를 사용했다.

* * *

일단, 사용자의 IP 주소를 가져오자. <br><br>

### 사용자 IP 주소 가져오기
```java
public static String getClientIp(HttpServletRequest request) {
    if (request == null) {
        ServletRequestAttributes attr = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
        request = attr.getRequest();
    }

    String[] headerNames = {
            "X-Forwarded-For",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_X_FORWARDED_FOR",
            "HTTP_X_FORWARDED",
            "HTTP_X_CLUSTER_CLIENT_IP",
            "HTTP_CLIENT_IP",
            "HTTP_FORWARDED_FOR",
            "HTTP_FORWARDED"
    };

    for (String headerName : headerNames) {
        String ipAddress = request.getHeader(headerName);
        if (ipAddress != null && !ipAddress.isEmpty() && !"unknown".equalsIgnoreCase(ipAddress)) {
            return ipAddress;
        }
    }

    return request.getRemoteAddr() != null && !request.getRemoteAddr().isEmpty() ? request.getRemoteAddr() : null;
}
```

<br>

### IP 주소로 국가코드를 가져오기
```java
public static String getCountryCodeByIp(String ipAddress) {
    if (isLocalhost(ipAddress)) {
        return null;
    }

    String countryCode;
    try {
        String response = getIpLocationApiResponse(ipAddress);
        countryCode = getCountryCodeFromApi(response);
        
        if (Objects.equals(countryCode, "-")) {
            countryCode = null;
        }
    } catch (Exception e) {
        countryCode = null;
    }

    if (StringUtils.isBlank(countryCode)) {
        countryCode = getCountryCodeFromLocale();
    }

    return StringUtils.isNotBlank(countryCode) ? countryCode : "ETC"; // 국가코드 없으면 ETC로 저장
}

/**
 * IP Location API에서 데이터 결과 가져오기
 */
private static String getIpLocationApiResponse(String ipAddress) {
    RestTemplate restTemplate = new RestTemplate();
    return restTemplate.getForObject("https://api.iplocation.net/?ip=" + ipAddress, String.class);
}

/**
 * IP Location API에서 반환 받은 데이터 중에 국가코드 가져오기
 */
private static String getCountryCodeFromApi(String response) throws JsonProcessingException {
    ObjectMapper objectMapper = new ObjectMapper();
    JsonNode jsonNode = objectMapper.readTree(response);
    return jsonNode.get("country_code2").asText();
}

/**
 * 국가코드를 반환 받지 못할 경우 Locale 값으로 가져오기
 */
private static String getCountryCodeFromLocale() {
    HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
    Locale locale = request.getLocale();
    return locale.getCountry();
}
```

<br>

아래 이미지와 같이 API에서 반환되는 데이터는 몇 개 있긴 한데, 내가 쓰고자 하는 건 `country_code2`만 확인하면 된다. 이게 국가코드를 반환해 준다. <br><br>
국가코드를 반환해 주지 못할 경우를 대비해서 Locale 값으로 가져오도록 했고, 이마저도 가져올 수 없으면 "ETC"로 처리를 했다. <br><br>

> HttpServletRequest의 Locale 값은 Request Header에 `Accept-Language` 값을 기반으로 가져온다.

![API 데이터](/assets/images/posts/ip-location-api/api_data.png "API 데이터")