---
title: "[AWS] S3 Pre-signed URL 사용하기 (with. Laravel)"
excerpt: "Laravel에서 AWS S3 Pre-signed URL을 적용해보자"

categories:
    - Infra

tags:
    - [S3]
    - [Laravel]

permalink: /infra/s3-pre-signed-url/

toc: true
toc_sticky: true

date: 2023-07-18
last_modified_at: 2023-07-18
---

지난 포스팅에서 AWS S3에 저장되어 있는 민감 정보 파일을 CloudFront + WAF를 설정하여 접근을 제한하는 방법을 작성했다.<br><br>
하지만, WAF는 요금이 발생된다는 이유로 다른 방법을 찾아야만 했다.<br><br>
그래서 AWS S3에 `Pre-signed URL`을 적용한 내용을 작성했다.

* * *

#### Pre-signed URL이란?
AWS 공식 문서에 따르면 미리 서명된 URL의 생성자가 해당 객체에 대한 액세스 권한을 보유할 경우, 미리 서명된 URL은 URL에서 식별된 객체에 대한 액세스를 부여합니다.<br><br>
쉽게 말해, **사용자에게 일정 기간동안 접근 권한을 갖는 URL**을 제공해준다.

* * *

#### AWS CLI에서 생성하는 방법
```bash
> aws s3 presign s3://{BUCKET NAME}/{PATH} --expries-in 3600
```
만료 시간을 `3,600초`로 부여한 커맨드이고, 아래와 같은 형태의 반환 값을 제공해준다.
```bash
> https://s3.ap-northeast-2.amazonaws.com/{BUCKET NAME}/{PATH}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=3600&X-Amz-Credential={ACCESS_KEY}&X-Amz-SignedHeaders=host&X-Amz-Date={DATE}&X-Amz-Signature={HASH}
```

* * *

#### Laravel에서 생성하는 방법(PHP 8.1 & Laravel 9 기준)
```php
use Aws\S3\Exception\S3Exception;
use Aws\S3\S3Client;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class FileHandler
{
    private const FILE_DOWNLOAD_SIGNED_URL_EXPIRED_TIME = '3';

    private S3Client $s3Client;
    private string $bucketName;

    public function __construct()
    {
        $this->bucketName = env('AWS_BUCKET');

        try {
            $this->s3Client = new S3Client([
                'version' => 'latest',
                'region' => env('AWS_DEFAULT_REGION'),
                'credentials' => [
                    'key' => env('AWS_ACCESS_KEY_ID'),
                    'secret' => env('AWS_SECRET_ACCESS_KEY'),
                ],
            ]);
        } catch (S3Exception | \Exception $e) {
            Log::error('S3 CONNECTION ERROR: ' . $e->getMessage());
            throw $e;
        }
    }

    private function getFileHeadObject(string $file): array
    {
        try {
            $result =  $this->s3Client->headObject([
                'Bucket' => $this->bucketName,
                'Key' => $file,
            ]);

            return $result->toArray();
        } catch (S3Exception | \Exception $e) {
            Log::error('S3 Get File Head Object ERROR: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * 파일 헤더 정보
     */
    private function getPreSignedUrl(string $file, string $expiredTime): string
    {
        try {
            $command = $this->s3Client->getCommand('GetObject', [
                'Bucket' => $this->bucketName,
                'Key' => $file
            ]);

            $request = $this->s3Client->createPresignedRequest($command, "+{$expiredTime} seconds");
            return (string) $request->getUri();
        } catch (S3Exception | \Exception $e) {
            Log::error('S3 Get Pre Signed URL ERROR: ' . $e->getMessage());
            throw $e;
        }
    }

    public function download(string $file): Response
    {
        try {
            $preSignedUrl = $this->getPreSignedUrl($file, self::FILE_DOWNLOAD_SIGNED_URL_EXPIRED_TIME);
            $content = file_get_contents($preSignedUrl);
            $contentType = $this->getFileHeadObjects($file)['ContentType'];
            $filename = basename($file);

            $headers = [
                'Content-Type' => $contentType,
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ];

            return new Response($content, 200, $headers);
        } catch (S3Exception | \Exception $e) {
            Log::error('S3 File Download ERROR: ' . $e->getMessage());
            throw $e;
        }
    }
}
```

파일에 대한 경로를 전달 받아서 `Pre-signed URL`을 반환 받고 파일을 다운로드 받는 예제 코드이다.<br><br>

민감 정보 파일을 다루는 부분은 파일 다운로드하는 부분만 있기 때문에 만료 시간을 `1초`로만 설정했어도 된다.<br><br>

다만, 네트워크 통신 시간을 감안하여 `3초`로 설정했다.
