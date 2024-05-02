---
title: "[JAVA] No converter for [class org.springframework.core.io.ByteArrayResource] with preset Content-Type 'application/octet-stream' 오류"
excerpt: ""

categories:
  - JAVA

tags:
  - [Spring Boot]
  - [download]
  - [ResourceHttpMessageConverter]

permalink: /java/file-download-type-error/

toc: true
toc_sticky: true

date: 2023-12-29
last_modified_at: 2023-12-29
---

### 환경
* JAVA 17
* Spring Boot 3.14

* * *

### 문제 발생
파일 다운로드를 할 때 `No converter for [class org.springframework.core.io.ByteArrayResource] with preset Content-Type 'application/octet-stream'` 에러가 발생했다. <br><br>
구글 번역기에서 번역을 해보았다. <br><br>
`Content-Type 'application/octet-stream'이 미리 설정된 [class org.springframework.core.io.ByteArrayResource]에 대한 변환기가 없습니다.` <br><br>
음.. 우선 파일 다운로드하는 코드를 보자.

> **Gradle** <br>
> implementation platform('software.amazon.awssdk:bom:2.21.1') <br>
> implementation 'software.amazon.awssdk:s3'

```java
@Service
@RequiredArgsConstructor
public class UploadService {
	private final S3Client s3Client;
	private final FileUploadRepository fileUploadRepository;

	...

	/**
	* S3 다운로드
	*/
	private byte[] download(String key) throws IOException {
		GetObjectRequest getObjectRequest = GetObjectRequest.builder()
				.bucket(bucketName)
				.key(key)
				.build();

		ResponseInputStream<GetObjectResponse> s3ClientObject = s3Client.getObject(getObjectRequest);

		byte[] content = null;
		try {
			content = IOUtils.toByteArray(s3ClientObject);
			s3ClientObject.close();
		} catch (IOException e) {
			throw new IOException("IO Error Message= " + e.getMessage());
		}

		return content;
	}

	@Transactional
	public ResponseEntity<ByteArrayResource> downloadFile(Long fileUploadId) throws IOException {
		FileUpload fileUpload = fileUploadRepository.findById(fileUploadId).orElseThrow(NotExistDataException::new);

		String key = FILE_UPLOAD_PATH + "/" + fileUpload.getTarget() + "/" + fileUpload.getTargetId() + "/" + fileUpload.getGeneratedFilename();

		byte[] data = download(key);
		ByteArrayResource resource = new ByteArrayResource(data);
		return ResponseEntity
				.ok()
				.contentLength(data.length)
				.header("Content-type", "application/octet-stream")
				.header("Content-disposition", "attachment; filename=\"" + URLEncoder.encode(fileUpload.getGeneratedFilename(), "utf-8") + "\"")
				.body(resource);
	}
}
```

* * *

### 해결 방법

컨버터를 제공해 주어야 한다는 것 같다. <br><br>
그래서 파일 다운로드에서 필요한 컨버터가 있는지 찾아보았고, 아래와 같이 해결이 가능했다. <br><br>

```java
@Configuration
@EnableWebMvc
public class WebMvcConfig implements WebMvcConfigurer {
	...

	@Override
	public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
		...

		converters.add(new ResourceHttpMessageConverter()); // 추가

		...
	}

	...
}
```

스프링 웹 MVC 프레임워크에서 제공하는 `WebMvcConfigurer` 인터페이스에서 `configureMessageConverters` 메서드가 있다. <br><br>
`configureMessageConverters`는 `@ResponseBody`, `@RequestBody` 어노테이션이 적용된 대상을 특정 포맷으로 변경하는 `HttpMessageConverter` 를 설정하는 메서드이다. <br><br>
`ResourceHttpMessageConverter` 는 스프링 프레임워크에서 제공하는 메세지 컨버터 중 하나인데, 리소스를 HTTP 응답의 본문으로 변환하는 데 사용된다. 주로 파일 다운로드 기능에서 활용된다. <br><br>
`ResourceHttpMessageConverter` 컨버터를 추가하면 오류가 해결된다.