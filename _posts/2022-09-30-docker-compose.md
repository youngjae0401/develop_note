---
title: "Docker Compose"
excerpt: "Docker Compose에 대해서 알아보자"

categories:
  - Infra

tags:
  - [infra]
  - [docker]
  - [docker compose]

permalink: /infra/docker-compose/

toc: true
toc_sticky: true

date: 2022-09-30
last_modified_at: 2022-09-30
---

### Docker Compose
도커 실행할 때 설정해야할 옵션이 많아지면 명령어가 길어지고 복잡해지는데, 이러한 여러개의 도커 컨테이너를 한 번에 관리할 수 있도록 도와주는 도구이다.<br>
참고로 docker-compose.yml 파일(YAML 형식)로 작성해야 한다.

<br>

#### Docker Compose 파일 구성 예시(PHP, Nginx, MySQL)
docker-compose.yml
```yaml
version: "3.9" # compose 버전
services:
    webserver: # 서비스 이름(container_name이 없을 경우 기본적으로 webserver_1 형식으로 생성된다.)
        image: nginx:latest # 컨테이너로 실행할 도커 이미지(Docker Hub에 있는 이미지 설정한다. 기본적으로 "{이미지명}:{태그}" 형식이다. 태그 부분은 생략이 가능하며, 생략 시 가장 최신 버전의 이미지를 pull하게 된다.)
        container_name: nginx # 컨테이너 이름
        ports: # 호스트와 컨테이너의 포트 바인딩을 설정
            - "8080:80"
        volumes: # 볼륨 설정(컨테이너가 삭제되면 데이터도 삭제되지만 볼륨을 설정하면 컨테이너 삭제되더라도 데이터를 남길 수 있다.)
            - ./backend:/var/www/html
            - ./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf
        depends_on: # 서비스 간의 종속성 순서대로 서비스를 시작할 수 있다.
            - app
            - db
        networks: # 네트워크 설정(default 네트워크를 제공하기 때문에 별도의 네트워크 설정이 필요한 경우 사용한다.)
            - my_network

    db:
        image: mysql:8.0
        container_name: mysql
        restart: unless-stopped # 컨테이너를 재시작할 때 관련된 설정(no/always/unless-stopped/on-failure)
        tty: true
        ports:
            - "3306:3306"
        environment: # 컨테이너 환경 변수 설정(컨테이너 쉘 내부에서 정의된 환경 변수들보다 낮은 우선순위를 가진다.)
            MYSQL_HOST: localhost
            MYSQL_DATABASE:
            MYSQL_USER:
            MYSQL_PASSWORD:
            MYSQL_ROOT_PASSWORD:
        volumes:
            - ./docker/db/mysql:/var/lib/mysql
            - ./docker/db/conf:/etc/mysql/conf.d
        networks:
            - my_network
    
    app:
        container_name: php
        build: # 빌드 설정(image 옵션에 이미 빌드된 이미지를 가져오는 것이 아니라 Dockerfile이 있는 경로를 지정해 docker-compose 실행 시 이미지를 빌드하여 사용하게 된다.)
            context: ./docker/php # 명렁어 전달할 경로
            dockerfile: Dockerfile # Dockerfile 경로
        volumes:
            - ./backend:/var/www/html
        networks:
            - my_network

    networks:
        my_network:
            driver: bridge

    # driver 종류
    # bridge: 하나의 호스트 컴퓨터 내에서 여러 컨테이너들 간에 통신할 수 있도록 해주는 옵션이다.
    # host: 호스트 컴퓨터와 동일한 네트워크 환경을 사용할 수 있도록 해주는 옵션이다
    # overlay: 여러개의 분산되어 있는 컨테이너들 간에 통신할 수 있도록 해주는 옵션이다.
    # ipvlan: 호스트 인터페이스를 가상화하는 옵션이다. MAC 주소와 IP 주소를 부여하여 실제 네트워크에 컨테이너를 직접 연결시키는 방식이다.
    # macvlan: 호스트의 네트워크 인터페이스를 여러개의 별도 MAC 주소를 가지는 네트워크 인터페이스로 분리하여 사용할 수 있는 옵션이다.
    # none: 아무 네트워크를 쓰지 않고 내부에 lo 인터페이스만 존재하는 옵션이다. 컨테이너의 IP를 구성하지 않으며 다른 컨테이너뿐만 아니라 외부 네트워크에도 액세스할 수 없다.
```

<br>

./docker/nginx/default.conf
```nginx
server {
    listen 80;
    root /var/www/html;
    index index.html index.htm index.php;

    server_name localhost;

    error_log  /var/log/nginx/error.log;
    access_log /var/log/nginx/access.log;

    location ~ \.php$ {
        try_files $uri =404;
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass php:9000; 
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param PATH_INFO $fastcgi_path_info;
    }
}
```

<br>

./docker/php/Dockerfile
```yaml
FROM php:8.1.9-fpm
```

<br>

### Docker Compose 주요 명령어
* `start` 컨테이너 시작
* `pause` 컨테이너 일시정지
* `unpause` 컨테이너 일시정지 해제
* `stop` 컨테이너 중지
* `up` 컨테이너 생성/시작
* `ps` 컨테이너 목록
* `run` 컨테이너 실행
* `restart` 컨테이너 재시작
* `kill` 실행 중인 컨테이너 강제 정지
* `rm` 컨테이너 삭제
* `down` 컨테이너 정지 및 삭제
* `config` 구성 파일 확인
* `logs` 컨테이너 로그 확인