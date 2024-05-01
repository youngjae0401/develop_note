---
title: "Laravel9에서 AWS SES 451 Timeout 에러"
excerpt: ""

categories:
    - PHP

tags:
    - [php]
    - [laravel]
    - [aws]
    - [ses]

permalink: /php/laravel9-and-aws-ses-timeout-error/

toc: true
toc_sticky: true

date: 2023-04-25
last_modified_at: 2023-04-25
---

![에러](/assets/images/posts/laravel9-and-aws-ses-timeout-error/error.png "에러")
기존 운영 중인 라라벨 6버전을 9버전으로 마이그레이션하고 여러가지 문제가 있었지만, 그 중에서 메일 발송 시 간헐적으로 451 Timeout 에러가 발생한 문제를 얘기해보겠다.
<br>

![AWS SES 에러코드](/assets/images/posts/laravel9-and-aws-ses-timeout-error/aws_ses_response_code.png "AWS SES 에러코드")
먼저 AWS SES에서 stmp서버를 사용해서 메일을 발송 중인 상태였고, AWS에서 반환하는 에러메세지라는 것을 확인했다.
에러에 대한 내용은 "**요청 간에 많은 시간이 경과하여 smtp 서버가 연결을 차단했다.**"라는 것이다.
AWS에서 안내하는 SES SMTP 연결 테스트를 해보았다.
```bash
openssl s_client -crlf -quiet -connect email-smtp.us-west-2.amazonaws.com:465
```

![AWS SES SMTP 연결 테스트](/assets/images/posts/laravel9-and-aws-ses-timeout-error/smtp_test.png "AWS SES SMTP 연결 테스트")

10초 뒤에 `451 4.4.2 Timeout waiting for data from client.`라는 문구가 출력된다.

![AWS SES SMTP 연결 안내 문구](/assets/images/posts/laravel9-and-aws-ses-timeout-error/aws_ses_info.png "AWS SES 연결 안내 문구")

AWS에서 비활성화 시간이 10초 이상 지속되면 연결이 자동으로 닫힌다고 한다.

* * *
대략 연결 시간에 대한 문제일 것 같다는 생각을 갖고 `Chat GPT`에게 질문을 했다.

대답은 `/config/mail.php` 파일에 `timeout` 설정을 하라고 해서 일단 `timeout`에 제한을 풀어보았다.
```php
'mailers' => [
        'smtp' => [
            'transport' => 'smtp',
            'host' => env('MAIL_HOST'),
            'port' => env('MAIL_PORT'),
            'encryption' => env('MAIL_ENCRYPTION'),
            'username' => env('MAIL_USERNAME'),
            'password' => env('MAIL_PASSWORD'),
            'timeout' => null,
        ],
]
```

해결은 되지 않았다.
* * *

`php.ini`에서 `max_execution_time`의 설정 값을 늘려보라고 해서 늘려보기도 했다.
<br>

그래도 해결은 되지 않았다.

* * *

근데 기존에 되던 메일 발송이 왜 안될까? 버전 마이그레이션을 하면서 메일에 대한 변경점을 찾아보았다.

라라벨 6버전은 `Swift Mailer` 패키지가 사용되고, 라라벨 9버전에서는 `Symfony Mailer` 패키지로 동작했다.
<br>

그래서 [Symfony Mailer](https://symfony.com/doc/current/mailer.html) 문서를 찾아보았다.
<br>

마침, 중간 지점에 아래와 같은 문구가 있었다.

![심포니 안내 문구](/assets/images/posts/laravel9-and-aws-ses-timeout-error/symfony.png "심포니 안내 문구")

AWS SES + SMTP로 메일을 발송할 때 `ping_threshold`라는 매개변수를 `9`로 설정하라고 했다.
<br>

AWS에서 말하는 비활성화 시간이 10초 이상되기 전에 ping을 9초에 체크하는 것 같다. (추측)
<br>

일단 설정을 해보았다.

```php
'mailers' => [
        'smtp' => [
            'transport' => 'smtp',
            'host' => env('MAIL_HOST'),
            'port' => env('MAIL_PORT'),
            'encryption' => env('MAIL_ENCRYPTION'),
            'username' => env('MAIL_USERNAME'),
            'password' => env('MAIL_PASSWORD'),
            'timeout' => null,
            'ping_threshold' => 9,
        ],
]
```

**더 이상 문제가 발생하지 않았다. 🎉**
<br>

**정상적인 기능이 안되는건 무엇인가 바뀌었다는 것이고, 변경점을 찾아서 문제를 해결해야 한다는 것을 다시 한 번 깨달았다.**