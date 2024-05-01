---
title: "[JAVA] 도커 컨테이너에서 셀레니움으로 웹 스크래핑하기"
excerpt: ""

categories:
  - JAVA

tags:
  - [Spring Boot]
  - [Selenium]
  - [Chrome]
  - [Chromedriver]
  - [firefox]

permalink: /java/selenium-in-docker/

toc: true
toc_sticky: true

date: 2023-11-21
last_modified_at: 2023-11-21
---

심심해서 간단하게 셀레니움으로 웹 스크래핑을 해보았다.<br><br>

### 환경
* macOS M1
* JAVA 17
* Spring Boot 3.14
* selenium-java:4.8.3
* docker desktop 4.25.1

<br>

### Gradle 추가
```java
implementation 'org.seleniumhq.selenium:selenium-java'
```

* * *

간단하게 할 수 있을 것만 같았지만, 생각대로 되진 않았다.

처음에는 크롬드라이버를 사용해서 스크래핑을 시도했다.

운영체제, 크롬/크로미움, 크롬드라이버을 여러가지 조합으로 시도했었다.

* * *

### 시도했던 조합
1. ubuntu + chrome + chromedriver (114.0.5735.90 / 119.0.6045.105)
2. ubuntu + chromium + chromedriver (114.0.5735.90 / 119.0.6045.105)
3. debian + chrome + chromedriver (114.0.5735.90 / 119.0.6045.105)
4. debian + chromium + chromedriver (114.0.5735.90 / 119.0.6045.105)
5. alpine linux + chrome +chromedriver (114.0.5735.90 / 119.0.6045.105)
<br>
...

<br>

### 직면했던 오류 메세지들
* Caused by: org.openqa.selenium.SessionNotCreatedException: Could not start a new session. Response code 500. Message: unknown error: unable to discover open pages
* jakarta.servlet.ServletException: Request processing failed: org.openqa.selenium.SessionNotCreatedException: Could not start a new session. Possible causes are invalid address of the remote server or browser start-up failure.
* Caused by: org.openqa.selenium.SessionNotCreatedException: Could not start a new session. Response code 500. Message: unknown error: Chrome failed to start: crashed. (chrome not reachable) (The process started from chrome location /usr/bin/google-chrome is no longer running, so ChromeDriver is assuming that Chrome has crashed.)
* Caused by: org.openqa.selenium.SessionNotCreatedException: Could not start a new session. Response code 500. Message: chrome not reachable
* Caused by: org.openqa.selenium.SessionNotCreatedException: Could not start a new session. Response code 500. Message: unknown error: DevToolsActivePort file doesn't exist

<br>

### 해결하기 위해 시도했던 것들
* 어플리케이션 코드에서 ChromeOption으로 Chrome 브라우저에 대해서 설정을 할 수 있는데 ChromeOption 값을 변경(옵션 값이 많고 하나씩 추가해서 테스트..)
* selenium-java 버전을 다운그레이드(4.1.1)해서 실행
* 도커 컨테이너 platform을 linux/amd64 로 실행
* chromedriver 설정 코드를 변경
  <br><br>
  ```java
  // 수정 전
  System.setProperty( "webdriver.chrome.driver" , "/path/to/chromedriver" );

  // 수정 후
  ChromeDriverService.Builder chromeDriverService = new ChromeDriverService.Builder().usingDriverExecutable(new File("/path/to/chromedriver"));
  ```

* 도커 컨테이너 터미널에서 /opt/google/chrome/google-chrome 파일에서 맨 마지막 줄을 수정
  <br><br>
  ```bash
  // 수정 전
  exec -a "$0" "$HERE/chrome" "$@"

  // 수정 후
  exec -a "$0" "/usr/bin/google-chrome" "$@"
  ```

* * *

더 많은 환경에서 더 많은 시도들을 했지만 **<u>크롬 브라우저와 크롬드라이버가 버전의 영향이나 arm, amd 아키텍처 영향</u>**이 있는 것 같았다. (정확한 원인은 밝히지 못함..)

그래서!!! 방법을 우회했다.

크롬이 아닌 **<u>파이어폭스</u>**로!!!

* * *

> 파이어폭스 버전은 124.0.2로 진행했다.

<br>

**docker-compose.yml**
```yaml
version: '3.9'
services:
  selenium:
    container_name: selenium
    build:
      context: .
      dockerfile: ./Dockerfile
    ports:
      - "8080:8080"
```

<br>

**Dockerfile**
```dockerfile
FROM ubuntu:20.04
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    firefox \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*
ARG GECKODRIVER_VERSION=0.33.0
RUN wget -O /tmp/geckodriver.tar.gz https://github.com/mozilla/geckodriver/releases/download/v${GECKODRIVER_VERSION}/geckodriver-v${GECKODRIVER_VERSION}-linux64.tar.gz \
    && tar -xzf /tmp/geckodriver.tar.gz -C /usr/bin \
    && chmod +x /usr/bin/geckodriver \
    && rm /tmp/geckodriver.tar.gz
ARG JAR_FILE=/build/libs/*.jar
COPY ${JAR_FILE} app.jar
ENTRYPOINT ["java", "-jar", "./app.jar"]
```

<br>

**JAVA**
```java
public class Test {
    private WebDriver driver;

    void init() {
        System.setProperty("webdriver.gecko.driver", "/path/to/geckodriver");
        
        FirefoxOptions firefoxOptions = new FirefoxOptions();
        firefoxOptions.addArguments("--headless");
        firefoxOptions.addArguments("--disable-gpu");
        firefoxOptions.addArguments("--no-sandbox");
        firefoxOptions.addArguments("--disable-dev-shm-usage");

        driver = new FirefoxDriver(firefoxOptions);
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
    }
}
```