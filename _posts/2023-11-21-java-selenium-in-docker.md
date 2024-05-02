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

* * *

### 간단한 예시(w. 11번가)

**ScraperService**
```java
@Service
@Slf4j
public class ScraperService {
    protected WebDriver driver;
    protected WebDriverWait wait;

    public void init() {
        firefoxInit();
    }

    public void cleanup() {
        driver.quit();
    }

    /**
     * 파이어폭스 환경
     */
    private void firefoxInit() {
        System.setProperty("webdriver.gecko.driver", System.getenv("FIREFOX_DRIVER_PATH"));

        FirefoxOptions firefoxOptions = new FirefoxOptions();
        firefoxOptions.addArguments("--headless"); // 스크래핑 과정을 확인할 때는 제거하면 된다.
        firefoxOptions.addArguments("--disable-gpu");
        firefoxOptions.addArguments("--no-sandbox");
        firefoxOptions.addArguments("--disable-dev-shm-usage");

        driver = new FirefoxDriver(firefoxOptions);
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    /**
     * 크롬 환경
     */
    private void chromeInit() {
        System.setProperty("webdriver.chrome.driver", System.getenv("CHROME_DRIVER_PATH"));

        ChromeOptions chromeOptions = new ChromeOptions();
        chromeOptions.addArguments("--headless");
        chromeOptions.addArguments("--disable-gpu");
        chromeOptions.addArguments("--no-sandbox");
        chromeOptions.addArguments("--disable-dev-shm-usage");

        driver = new ChromeDriver(chromeOptions);
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    /**
     * 상품 가격 값 중에 숫자만 남긴다.
     */
    protected String parsePrice(String price) {
        return price.replaceAll("[^0-9]", "");
    }
}
```

<br>

**ElevenStreetScraperService**
```java
@Service
@Slf4j
public class ElevenStreetScraperService extends ScraperService {
	private final ElevenStreetResponse data = new ElevenStreetResponse();

	public ElevenStreetResponse scraper(String url) {
		driver.get(url);
		getTitle();
		getPrice();
		getOptions();
		getMainImage();
		getDetailImages();
		return data;
	}

	public ElevenStreetResponse priceScraper(String url) {
		driver.get(url);
		getPrice();
		return data;
	}

	private void getTitle() {
		try {
			String titleSelector = "//div[contains(@class, 'c_product_info_title')]//h1[contains(@class, 'title')]";
			if (!driver.findElements(xpath(titleSelector)).isEmpty()) {
				data.setTitle(driver.findElement(xpath(titleSelector)).getText());
			}
		} catch (NoSuchElementException | TimeoutException e) {
			log.info("상품명 오류 = " + e.getMessage());
		}
	}

	private void getPrice() {
		try {
			String priceSelector = "//dd[contains(@class, 'price')]//span[contains(@class, 'value')]";
			if (!driver.findElements(xpath(priceSelector)).isEmpty()) {
				data.setPrice(parsePrice(driver.findElement(xpath(priceSelector)).getText()));
			}
		} catch (NoSuchElementException | TimeoutException e) {
			log.info("상품 가격 오류 = " + e.getMessage());
		}
	}

	private void getOptions() {
		JavascriptExecutor executor = (JavascriptExecutor) driver;

		// 상품 옵션
		try {
			String optionParentSelector = "//ul[contains(@id, 'buyList')]";
			WebElement optionParentElement = driver.findElement(xpath(optionParentSelector));
			// 전체 옵션 박스
			List<WebElement> optionList = optionParentElement.findElements(xpath("./li"));

			// 첫번째 옵션 드랍다운 헤드
			WebElement optionDropBox1 = optionParentElement.findElement(xpath("./li[1]/div[contains(@class, 'c_product_dropdown_style1')]"));

			// 첫번째 옵션 드랍다운 리스트
			List<WebElement> firstOptions = optionDropBox1.findElements(xpath(".//ul[contains(@class, 'option_item_list') and contains(@class, 'bot_typ_01')]/li"));

			// 옵션명 선택자
			String optionNameElement = ".//div[contains(@class, 'option_item_info')]/strong";

			// 옵션 가격 선택자
			String optionPriceElement = ".//div[contains(@class, 'option_item_info')]/dl[contains(@class, 'c_prd_price')]/div[contains(@class, 'option_price')]//span[contains(@class, 'num') and contains(@class, 'value')]";

			// 추가 옵션이 있는지
			String addOptionSelector = optionParentSelector + "/li/div[contains(@class, 'option_choice_wrap')]";
			WebElement addOption = null;
			if (!driver.findElements(xpath(addOptionSelector)).isEmpty()) {
				addOption = driver.findElement(xpath(addOptionSelector));
			}

			// 옵션 1개 or 옵션 1개 + 추가옵션1
			if (optionList.size() == 1 || (optionList.size() == 2 && addOption != null)) {
				// 첫번째 옵션 드랍다운 헤드 활성화
				if (!optionDropBox1.getAttribute("class").contains("active")) {
					executor.executeScript("arguments[0].classList.add('active');", optionDropBox1);
					executor.executeScript("arguments[0].classList.remove('disabled');", optionDropBox1);
				}

				List<Map<String, Object>> firstOptionGroup = firstOptions.stream()
						.filter(firstOption -> !firstOption.getAttribute("class").contains("disabled"))
						.map(firstOption -> {
							String firstOptionName = firstOption.findElement(xpath(optionNameElement)).getText();
							String firstOptionPrice = firstOption.findElement(xpath(optionPriceElement)).getText();

							Map<String, Object> option = new HashMap<>();
							option.put("name", firstOptionName);
							option.put("price", parsePrice(firstOptionPrice));

							return option;
						})
						.toList();

				data.setOptionType1(firstOptionGroup);
			}

			// 옵션 2개 or 옵션 2개 + 추가옵션1
			if (optionList.size() == 2 || (optionList.size() == 3 && addOption != null)) {
				try {
					// 두번째 옵션 드랍다운 헤드
					WebElement optionDropBox2 = optionParentElement.findElement(xpath("./li[2]/div[contains(@class, 'accordion_section')]"));

					// 옵션이 2개인 경우에는 옵션1이 클릭되고 옵션2가 노출되는 방식
					List<Map<String, Object>> optionType2 = new ArrayList<>();
					for (WebElement firstOption : firstOptions) {
						// 첫번째 옵션 드랍다운 헤드 활성화(옵션1이 클릭되면 첫번째 옵션 드랍다운 헤드가 비활성화 되기 때문에 다시 활성화 진행)
						executor.executeScript("arguments[0].click();", optionDropBox1.findElement(xpath("./div[contains(@class, 'dropdown_selected')]")));
						executor.executeScript("arguments[0].classList.add('active');", optionDropBox1);
						executor.executeScript("arguments[0].classList.remove('disabled');", optionDropBox1);
						Thread.sleep(100); // Non-Required

						// 품절 아닌 옵션1만 추출
						if (!firstOption.getAttribute("class").contains("disabled")) {
							String firstOptionName = firstOption.findElement(xpath(optionNameElement)).getText();
							String firstOptionPrice = firstOption.findElement(xpath(optionPriceElement)).getText();

							executor.executeScript("arguments[0].click();", firstOption);
							Thread.sleep(100); // Required

							// 두번째 옵션 드랍다운 헤드 활성화
							if (!optionDropBox2.getAttribute("class").contains("active")) {
								executor.executeScript("arguments[0].click();", optionDropBox2.findElement(xpath("./div[contains(@class, 'dropdown_selected')]")));
								executor.executeScript("arguments[0].classList.add('active');", optionDropBox2);
								executor.executeScript("arguments[0].classList.remove('disabled');", optionDropBox2);
								Thread.sleep(100); // Non-Required
							}

							// 두번째 옵션 드랍다운 리스트
							List<WebElement> secondOptions = optionDropBox2.findElements(xpath(".//div[contains(@class, 'accordion_body')]/ul[contains(@class, 'option_item_list')]/li"));
							List<Map<String, Object>> secondOptionGroup = secondOptions.stream()
									.filter(secondOption -> !secondOption.getAttribute("class").contains("disabled")) // 품절 아닌 옵션2만 추출
									.map(secondOption -> {
										String secondOptionName = secondOption.findElement(xpath(optionNameElement)).getText();
										String secondOptionPrice = secondOption.findElement(xpath(optionPriceElement)).getText();

										Map<String, Object> option = new HashMap<>();
										option.put("name", secondOptionName);
										option.put("price", parsePrice(secondOptionPrice));

										return option;
									})
									.toList();

							Map<String, Object> optionMap = new HashMap<>();
							optionMap.put("option1", firstOptionName + " / " + parsePrice(firstOptionPrice));
							optionMap.put("option2", secondOptionGroup);
							optionType2.add(optionMap);
						}
					}

					data.setOptionType2(optionType2);
				} catch (NoSuchElementException | TimeoutException | InterruptedException e) {
					log.info("상품 옵션 타입2 오류 = " + e.getMessage());
				}
			}

			// 옵션 3개 or 옵션 3개 + 추가옵션1
			if (optionList.size() == 3 || (optionList.size() == 4 && addOption != null)) {
				try {
					// 두번째 옵션 드랍다운 헤드
					WebElement optionDropBox2 = optionParentElement.findElement(xpath("./li[2]/div[contains(@class, 'accordion_section')]"));

					// 세번째 옵션 드랍다운 헤드
					WebElement optionDropBox3 = optionParentElement.findElement(xpath("./li[3]/div[contains(@class, 'accordion_section')]"));

					// 옵션이 3개인 경우에는 옵션1이 클릭되고 옵션2가 클릭되고 옵션3이 노출되는 방식
					List<Map<String, Object>> optionType3 = new ArrayList<>();
					for (WebElement firstOption : firstOptions) {
						// 첫번째 옵션 드랍다운 헤드 활성화(옵션1이 클릭되면 첫번째 옵션 드랍다운 헤드가 비활성화 되기 때문에 다시 활성화 진행)
						executor.executeScript("arguments[0].click();", optionDropBox1.findElement(xpath("./div[contains(@class, 'dropdown_selected')]")));
						executor.executeScript("arguments[0].classList.add('active');", optionDropBox1);
						executor.executeScript("arguments[0].classList.remove('disabled');", optionDropBox1);
						Thread.sleep(100); // Non-Required

						// 품절 아닌 옵션1만 추출
						if (!firstOption.getAttribute("class").contains("disabled")) {
							String firstOptionName = firstOption.findElement(xpath(optionNameElement)).getText();

							executor.executeScript("arguments[0].click();", firstOption);
							Thread.sleep(100); // Required

							// 두번째 옵션 드랍다운 리스트
							List<WebElement> secondOptions = optionDropBox2.findElements(xpath(".//div[contains(@class, 'accordion_body')]/ul[contains(@class, 'option_item_list')]/li"));
							for (WebElement secondOption : secondOptions) {
								// 두번째 옵션 드랍다운 헤드 활성화
								executor.executeScript("arguments[0].click();", optionDropBox2.findElement(xpath("./div[contains(@class, 'dropdown_selected')]")));
								executor.executeScript("arguments[0].classList.add('active');", optionDropBox2);
								executor.executeScript("arguments[0].classList.remove('disabled');", optionDropBox2);
								Thread.sleep(100); // Non-Required

								// 품절 아닌 옵션2만 추출
								if (!secondOption.getAttribute("class").contains("disabled")) {
									String secondOptionName = secondOption.findElement(xpath(optionNameElement)).getText();

									executor.executeScript("arguments[0].click();", secondOption);
									Thread.sleep(100); // Required

									// 세번째 옵션 드랍다운 헤드 활성화
									if (!optionDropBox3.getAttribute("class").contains("active")) {
										executor.executeScript("arguments[0].click();", optionDropBox3.findElement(xpath("./div[contains(@class, 'dropdown_selected')]")));
										executor.executeScript("arguments[0].classList.add('active');", optionDropBox3);
										executor.executeScript("arguments[0].classList.remove('disabled');", optionDropBox3);
										Thread.sleep(100); // Non-Required
									}

									List<WebElement> thirdOptions = optionDropBox3.findElements(xpath(".//div[contains(@class, 'accordion_body')]/ul[contains(@class, 'option_item_list')]/li"));
									List<Map<String, Object>> thirdOptionGroup = thirdOptions.stream()
											.filter(thirdOption -> !thirdOption.getAttribute("class").contains("disabled"))
											.map(thirdOption -> {
												String thirdOptionName = thirdOption.findElement(xpath(optionNameElement)).getText();
												String thirdOptionPrice = thirdOption.findElement(xpath(optionPriceElement)).getText();

												Map<String, Object> option = new HashMap<>();
												option.put("name", thirdOptionName);
												option.put("price", parsePrice(thirdOptionPrice));

												return option;
											})
											.toList();

									Map<String, Object> optionMap = new HashMap<>();
									optionMap.put("option1", firstOptionName);
									optionMap.put("option2", secondOptionName);
									optionMap.put("option3", thirdOptionGroup);
									optionType3.add(optionMap);
								}
							}
						}
					}

					data.setOptionType3(optionType3);
				} catch (NoSuchElementException | TimeoutException | InterruptedException e) {
					log.info("상품 옵션 타입3 오류 = " + e.getMessage());
				}
			}
		} catch (NoSuchElementException | TimeoutException e) {
			log.info("상품 옵션 오류 = " + e.getMessage());
		}
	}

	private void getMainImage() {
		try {
			String mainImageSelector = "//meta[@property='og:image']";
			if (!driver.findElements(xpath(mainImageSelector)).isEmpty()) {
				data.setMainImageUrl(driver.findElement(xpath(mainImageSelector)).getAttribute("content"));
			}
		} catch (NoSuchElementException | TimeoutException e) {
			log.info("메인 이미지 오류 = " + e.getMessage());
		}
	}

	private void getDetailImages() {
		try {
			String detailImageIframeSelector = "//iframe[contains(@id, 'prdDescIfrm')]";
			if (!driver.findElements(xpath(detailImageIframeSelector)).isEmpty()) {
				WebElement detailImageIframe = driver.findElement(xpath(detailImageIframeSelector));
				driver.switchTo().frame(detailImageIframe); // iframe 시작

				List<WebElement> detailImageContents = driver.findElements(xpath("//img"));
				List<String> detailImages = new ArrayList<>();
				for (WebElement detailImage : detailImageContents) {
					String src = detailImage.getAttribute("src");
					detailImages.add(src);
				}

				data.setDetailImages(detailImages);
				driver.switchTo().defaultContent(); // iframe 종료
			}
		} catch (NoSuchElementException | TimeoutException e) {
			log.info("상세 이미지 오류 = " + e.getMessage());
		}
	}
}
```

여기에서 중요한 건 `Thread.sleep(100);` 이다. <br><br>
클릭 이벤트가 있을 때 딜레이를 시켜야만 정상적으로 데이터를 가져올 수 있다.

* * *

### 결과 데이터(w. 11번가)
```json
{
    "title": "딥슬림 유로탑 LED 미니싱글침대 슈퍼싱글침대 멀티수납 매트리스 포함가 월간가구",
    "price": "169150",
    "mainImageUrl": "https://cdn.011st.com/11dims/resize/600x600/quality/75/11src/product/1003366863/B.jpg?243000000",
    "detailImages": [
        "https://inbesco.godohosting.com/Deal/11st/20230919/int_best.jpg",
        "https://inbesco.godohosting.com/INBESCO/Etc/inbesco_event.jpg",
        "https://inbesco.godohosting.com/Deal/11st/20230919/deeps_int.jpg",
        "https://gi.esmplus.com/plamat/RAJA/GMARKET/20170517/deeps_h.jpg",
        "https://gi.esmplus.com/plamat/RAJA/GMARKET/20170517/deeps_led.jpg",
        "https://gi.esmplus.com/plamat/RAJA/GMARKET/20170517/mat_c_900ss_vondoc.jpg",
        "https://gi.esmplus.com/plamat/RAJA/GMARKET/20170517/step2_uro.jpg",
        "https://inbesco.godohosting.com/Deal/storefarm/20180605/b_3.jpg",
        "https://gi.esmplus.com/plamat/RAJA/GMARKET/20170517/uro_soft_main.jpg",
        "https://gi.esmplus.com/plamat/RAJA/GMARKET/20170517/uro_mid_main.jpg",
        "https://gi.esmplus.com/plamat/RAJA/GMARKET/20170517/uro_hard_main.jpg",
        "https://gi.esmplus.com/plamat/RAJA/GMARKET/20170517/uro_cl_main.jpg",
        "https://gi.esmplus.com/plamat/RAJA/GMARKET/20170517/smart/notice_s.jpg",
        "https://gi.esmplus.com/plamat/RAJA/GMARKET/20170517/11st_smart/add_bt.jpg",
        "https://gi.esmplus.com/plamat/RAJA/GMARKET/20170517/11st_smart/add_wf.jpg",
        "https://gi.esmplus.com/plamat/RAJA/GMARKET/20170517/btable.jpg",
        "https://gi.esmplus.com/plamat/RAJA/GMARKET/20170517/waterco.jpg",
        "https://gi.esmplus.com/plamat/RAJA/Del/wdel_bed.jpg"
    ],
    "optionType1": [],
    "optionType2": [],
    "optionType3": [
        {
            "option3": [
                {
                    "price": "254150",
                    "name": "01.소프트 유로탑(50T)"
                },
                {
                    "price": "254150",
                    "name": "02.미디움 유로탑(50T)"
                },
                {
                    "price": "254150",
                    "name": "03.하드 유로탑(50T)"
                },
                {
                    "price": "220150",
                    "name": "04.CL라텍스(20T)"
                },
                {
                    "price": "203150",
                    "name": "05.내장재 없음"
                }
            ],
            "option1": "01.딥슬림H 900_오크",
            "option2": "01.독립매트리스"
        },
        {
            "option3": [
                {
                    "price": "220150",
                    "name": "01.소프트 유로탑(50T)"
                },
                {
                    "price": "220150",
                    "name": "02.미디움 유로탑(50T)"
                },
                {
                    "price": "220150",
                    "name": "03.하드 유로탑(50T)"
                },
                {
                    "price": "194650",
                    "name": "04.CL라텍스(20T)"
                },
                {
                    "price": "169150",
                    "name": "05.내장재 없음"
                }
            ],
            "option1": "01.딥슬림H 900_오크",
            "option2": "02.본넬매트리스"
        },
        {
            "option3": [
                {
                    "price": "279650",
                    "name": "01.소프트 유로탑(50T)"
                },
                {
                    "price": "279650",
                    "name": "02.미디움 유로탑(50T)"
                },
                {
                    "price": "279650",
                    "name": "03.하드 유로탑(50T)"
                },
                {
                    "price": "245650",
                    "name": "04.CL라텍스(20T)"
                },
                {
                    "price": "220150",
                    "name": "05.내장재 없음"
                }
            ],
            "option1": "02.딥슬림H SS_오크",
            "option2": "01.독립매트리스"
        },
        {
            "option3": [
                {
                    "price": "245650",
                    "name": "01.소프트 유로탑(50T)"
                },
                {
                    "price": "245650",
                    "name": "02.미디움 유로탑(50T)"
                },
                {
                    "price": "245650",
                    "name": "03.하드 유로탑(50T)"
                },
                {
                    "price": "220150",
                    "name": "04.CL라텍스(20T)"
                },
                {
                    "price": "194650",
                    "name": "05.내장재 없음"
                }
            ],
            "option1": "02.딥슬림H SS_오크",
            "option2": "02.본넬매트리스"
        },
        {
            "option3": [
                {
                    "price": "296650",
                    "name": "01.소프트 유로탑(50T)"
                },
                {
                    "price": "296650",
                    "name": "02.미디움 유로탑(50T)"
                },
                {
                    "price": "296650",
                    "name": "03.하드 유로탑(50T)"
                },
                {
                    "price": "262650",
                    "name": "04.CL라텍스(20T)"
                },
                {
                    "price": "237150",
                    "name": "05.내장재 없음"
                }
            ],
            "option1": "03.딥슬림LED 900_오크",
            "option2": "01.독립매트리스"
        },
        {
            "option3": [
                {
                    "price": "262650",
                    "name": "01.소프트 유로탑(50T)"
                },
                {
                    "price": "262650",
                    "name": "02.미디움 유로탑(50T)"
                },
                {
                    "price": "262650",
                    "name": "03.하드 유로탑(50T)"
                },
                {
                    "price": "237150",
                    "name": "04.CL라텍스(20T)"
                },
                {
                    "price": "211650",
                    "name": "05.내장재 없음"
                }
            ],
            "option1": "03.딥슬림LED 900_오크",
            "option2": "02.본넬매트리스"
        },
        {
            "option3": [
                {
                    "price": "322150",
                    "name": "01.소프트 유로탑(50T)"
                },
                {
                    "price": "322150",
                    "name": "02.미디움 유로탑(50T)"
                },
                {
                    "price": "322150",
                    "name": "03.하드 유로탑(50T)"
                },
                {
                    "price": "288150",
                    "name": "04.CL라텍스(20T)"
                },
                {
                    "price": "262650",
                    "name": "05.내장재 없음"
                }
            ],
            "option1": "04.딥슬림LED SS_오크",
            "option2": "01.독립매트리스"
        },
        {
            "option3": [
                {
                    "price": "288150",
                    "name": "01.소프트 유로탑(50T)"
                },
                {
                    "price": "288150",
                    "name": "02.미디움 유로탑(50T)"
                },
                {
                    "price": "288150",
                    "name": "03.하드 유로탑(50T)"
                },
                {
                    "price": "262650",
                    "name": "04.CL라텍스(20T)"
                },
                {
                    "price": "237150",
                    "name": "05.내장재 없음"
                }
            ],
            "option1": "04.딥슬림LED SS_오크",
            "option2": "02.본넬매트리스"
        }
    ]
}
```