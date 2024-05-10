---
title: "[JAVA] CK 에디터에서 이미지를 S3에 저장하기"
description: JAVA - CK 에디터에서 이미지를 S3에 저장해보자
excerpt: ""

categories:
  - JAVA

tags:
  - [CK editor]
  - [base64]
  - [s3]
  - [aws]
  - [Spring Boot]

permalink: /java/ck-editor-save-file/

toc: true
toc_sticky: true

date: 2023-12-12
last_modified_at: 2023-12-12
---

내년에 매거진 형식의 프로젝트가 진행될 예정이다. <br><br>
그래서 CK 에디터에서 업로드된 이미지를 어떻게 처리할지 생각해보았다. <br><br>
우선 CK 에디터에서 이미지를 첨부하게 되면 base64 코드로 반환해준다. <br><br>
이 상태로 PostgreSQL 데이터베이스에 저장을 해보았고, 어떤 점이 문제가 되는지 알아보았다.

* * *

### 테스트 파일 용량
* 1.9M JPG
* 6.3M JPG
* 10.3M JPG

위와 같이 3개의 파일을 업로드해서 저장해보았다.

* * *

### 데이터베이스 용량 변화
![용량](/assets/images/posts/ck-editor-save-file/size.jpeg "용량")

전과 비교했을 때 대략 **33배** 차이가 난다.

* * *

### 데이터베이스 속도 변화
![속도](/assets/images/posts/ck-editor-save-file/speed.jpeg "속도")
물론, 조회 속도도 대략 **120배** 차이가 났다.

* * *

### 에디터 이미지를 S3에 저장하게 된 이유

데이터베이스 성능만 봤을 때에도 업로드 된 채로 이미지를 저장하는 건 옳지 않다고 생각된다. <br><br>
이 뿐만이 아니라 대용량 이미지를 base64 코드로 저장하고 페이지를 로딩하게 되면 깜빡이는 현상도 나타난다. <br><br>
또한, 이미지 용량이 커지면 커질수록 base64 길이도 길어지는데 이렇게 되면 서버 설정에 따라 max size 에러가 발생할 수도 있다. <br><br>
결론은 에디터에서 이미지를 업로드 된 채로 저장하면 안된다. <br><br>
그래서 나는 S3에 저장하기로 했다. <br><br>
이제 아래부터는 CK 에디터에서 이미지 업로드할 때 S3로 저장되는 프로세스를 남기려고 한다.

* * *

> **Gradle** <br>
> implementation platform('software.amazon.awssdk:bom:2.21.1') <br>
> implementation 'software.amazon.awssdk:s3'

### JavaScript
```javascript
class UploadAdapter {
    constructor(loader) {
        this.loader = loader;
    }

    upload() {
        return this.loader.file
            .then(file => new Promise((resolve, reject) => {
                const type = window.editor.sourceElement.getAttribute("data-type") ?? null;
                const path = window.editor.sourceElement.getAttribute("data-id") ?? null;

                if (!type) {
                    reject('업로드 타입이 없습니다.');
                }

                const formData = new FormData();
                formData.append(_csrf_header, _csrf);
                formData.append('file', file);

                if (type !== null) {
                    formData.append('type', type);
                }

                if (path !== null) {
                    formData.append('path', path);
                }

                axios({
                    url: '/uploads/editors',
                    method: 'post',
                    data: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }).then(response => {
                    resolve({ default: response.data });
                }).catch(error => {
                    reject('업로드에 실패하였습니다.');
                });
            }));
    }
}

function customUploadAdapterPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
        return new UploadAdapter(loader);
    };
}

// CK EDITOR 옵션
const editorOptions = {
    removePlugins: ['MediaEmbedToolbar', 'Title'],
    extraPlugins: [customUploadAdapterPlugin],
    toolbar: {
        items: [
            'undo', 'redo',
            '|', 'heading',
            '|', 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor',
            '|', 'bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', 'code',
            '|', 'alignment',
            '|', 'link', 'insertImage', 'resizeImage', 'mediaEmbed',
            '|', 'blockQuote', 'insertTable', 'sourceEditing', 'codeBlock', 'htmlEmbed', 'horizontalLine',
            '|', 'bulletedList', 'numberedList', 'todoList', 'outdent', 'indent'
        ]
    },
    heading: {
        options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
            { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
            { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' }
        ]
    },
    fontFamily: {
        options: [
            'Arial', 'sans-serif', 'serif', 'Helvetica', 'Courier New', 'Courier', 'monospace', 'Georgia', 'Lucida Sans Unicode', 'Lucida Grande', 'Tahoma', 'Geneva', 'Times New Roman', 'Times', 'Verdana, Geneva'
        ]
    },
    fontSize: {
        options: [
            10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36
        ]
    },
    shouldNotGroupWhenFull: true,
    placeholder: '',
    mediaEmbed: {
        previewsInData: true
    },
    link: {
        decorators: {
            addTargetToExternalLinks: {
                mode: 'automatic',
                callback: url => /^(https?:)?\/\//.test( url ),
                attributes: {
                    target: '_blank',
                }
            }
        }
    }
};

const editorIdName = "#content";
window.addEventListener('load', function() {
    let editorElement = document.querySelector(editorIdName);
    if (editorElement) {
        ClassicEditor
            .create(editorElement, editorOptions)
            .then(editor => {
                window.editor = editor;
            })
            .catch(error => {
                console.log(error);
            });
    }
});
```

여기서 확인할 부분은 `UploadAdapter` 클래스이다. <br><br>
서버에 `type`과 `path`를 전송하는 이유는 CK 에디터를 여러 페이지에서 사용할 수 있고, S3에서 경로를 분리하여 처리하기 위해서이다.

* * *

**UploadService**
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class UploadService {
    private final S3Client s3Client;
    private final FileUploadRepository fileUploadRepository;

    private static final String EDITOR_UPLOAD_PATH = FileUtil.EDITOR_UPLOAD_PATH;

    private static final String FILE_UPLOAD_PATH = FileUtil.FILE_UPLOAD_PATH;

    private static final String TEMP_PATH = FileUtil.TEMP_PATH;

    @Value("${spring.cloud.aws.cdn.url}")
    private String cdnUrl;

    @Value("${spring.cloud.aws.s3.bucket}")
    private String bucketName;

    /**
     * S3 업로드
     */
    private UploadResponse upload(MultipartFile file, String path) {
        String filename = null;
        String key = null;

        try {
            filename = getGenerateFileName(file.getOriginalFilename());
            key = path + filename;

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));

            return UploadResponse.builder()
                    .originalFilename(file.getOriginalFilename())
                    .generatedFilename(filename)
                    .key(key)
                    .build();
        } catch (S3Exception | IOException e) {
            log.error("[S3 UPLOAD ERROR] KEY: {}, ORIGIN_FILE_NAME: {}", key, file.getOriginalFilename(), e);
            throw new Exception("파일 업로드에 실패하였습니다.");
        }
    }

    /**
     * S3 복사
     */
    public void copy(String originKey, String newKey) {
        try {
            CopyObjectRequest copyObjectRequest = CopyObjectRequest.builder()
                    .sourceBucket(bucketName)
                    .sourceKey(originKey)
                    .destinationBucket(bucketName)
                    .destinationKey(newKey)
                    .build();

            s3Client.copyObject(copyObjectRequest);
        } catch (S3Exception e) {
            log.error("[S3 COPY ERROR] ORIGIN_KEY: {}, NEW_KEY: {}", originKey, newKey, e);
            throw new Exception("파일 복사에 실패하였습니다.");
        }
    }

    /**
     * S3 삭제
     */
    public void delete(String key) {
        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
        } catch (S3Exception e) {
            log.error("[S3 DELETE ERROR] KEY: {}", key, e);
            throw new Exception("파일 삭제에 실패하였습니다.");
        }
    }

    /**
     * 에디터 업로드
     */
    public String editorUpload(EditorUploadRequest request) {
        if (request.getPath() == null) {
            request.setPath(TEMP_PATH);
        }

        String path = EDITOR_UPLOAD_PATH + "/" + request.getType() + "/" + request.getPath() + "/";
        UploadResponse uploadResponse = upload(request.getFile(), path);
        return cdnUrl + "/" + uploadResponse.getKey();
    }

    /**
     * 에디터 내용에서 tmp 폴더에 있는 이미지를 찾아서 새로운 경로로 이동
     */
    public String getEditorMoveImageFromTmp(String content, Long key) {
        String decodeContent = StringEscapeUtils.unescapeHtml4(content);
        String pattern = cdnUrl + "/" + EDITOR_UPLOAD_PATH + "([^\"']*" + TEMP_PATH + "[^\"']*)";
        Pattern urlPattern = Pattern.compile(pattern);
        Matcher matcher = urlPattern.matcher(decodeContent);

        String newContent = decodeContent;
        while (matcher.find()) {
            String fullUrl = matcher.group(0);
            String originKey = fullUrl.replace(cdnUrl + "/", "");
            String newKey = originKey.replace("/" + TEMP_PATH + "/", "/" + key + "/");

            copy(originKey, newKey);
            delete(originKey);

            newContent = newContent.replace(originKey, newKey);
        }

        return StringEscapeUtils.escapeHtml4(newContent);
    }
}
```

<br>

**PostService**
```java
@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final MemberRepository memberRepository;
    private final UploadService uploadService;

    @Transactional
    public void create(PostCreate postCreate) {
        ...

        Member member = memberRepository.findById(memberId).orElseThrow(NotExistDataException::new);
        Post post = postCreate.toEntity(member);
        postRepository.save(post);

        // 이미지 이동 후 컨텐츠 다시 저장
        String newContent = uploadService.getEditorMoveImageFromTmp(postCreate.getContent(), post.getId());
        post.updateContent(newContent);
        postRepository.save(post);
    }
}
```
<br>
정리가 되지 않은 코드이긴 하지만 저장되는 프로세스만 확인하면 될 것 같다. <br>
1. 글이 처음 작성될 때는 primary key 값이 생성 전이기 때문에 이미지 업로드 될 때 임시 경로에 이미지를 저장해둔다.
2. 글이 실제 저장될 때 에디터 컨텐츠에서 이미지 임시 경로를 찾아서 실제 경로(primary key 값이 있는 경로)로 치환해준다.
3. S3에서는 임시 경로에서 이미지를 실제 경로로 복사한 후에 임시 경로에 있는 이미지는 삭제한다.

> 여기에서 이미지를 Webp 형식으로 컨버팅까지 하면 GOOD 👍
