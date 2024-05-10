---
title: "[DB] PostgreSQL에서 유용한 함수"
description: PostgreSQL에서 유용한 날짜(date), 문자열(string), 숫자(math), 윈도우(window) 함수를 사용해보자
excerpt: ""

categories:
  - DataBase

tags:
  - [database]
  - [PostgreSQL]
  - [function]
  - [string function]
  - [math function]
  - [date function]
  - [window function]
  - [json function]

permalink: /db/postegres-function/

toc: true
toc_sticky: true

date: 2024-05-10
last_modified_at: 2024-05-10
---

PostgreSQL에서 유용했거나 유용할 것 같은 함수를 작성해 보았다. <br><br>
쿼리를 잘 사용한다면 다중의 쿼리를 단일로 변경해서 데이터를 추출할 수 있기 때문에 함수를 유용하게 잘 사용하면 좋을 것 같다.

> **PostgreSQL 16.0** 기준

### 예제 DDL
```sql
CREATE TABLE football_player (
    team VARCHAR(50) COLLATE "en_US.utf8" DEFAULT NULL,
    name VARCHAR(50) COLLATE "en_US.utf8" DEFAULT NULL,
    uniform_number SMALLINT DEFAULT NULL,
    salary NUMERIC(10,0) DEFAULT NULL,
    birth_day DATE DEFAULT NULL,
    nationality VARCHAR(50) COLLATE "en_US.utf8" DEFAULT NULL
);
COMMENT ON COLUMN football_player.team IS '소속팀';
COMMENT ON COLUMN football_player.name IS '선수명';
COMMENT ON COLUMN football_player.uniform_number IS '등번호';
COMMENT ON COLUMN football_player.salary IS '연봉(억단위)';
COMMENT ON COLUMN football_player.birth_day IS '생년월일';
COMMENT ON COLUMN football_player.nationality IS '국적';
```

* * *

### 예제 INSERT
```sql
INSERT INTO football_player (team, name, uniform_number, salary, birth_day, nationality)
VALUES
    ('Paris Saint-Germain', 'Lee Kang-in', 19, 55, '2001-02-19', 'korea'),
    ('Paris Saint-Germain', 'Kylian Mbappe', 7, 1220, '1998-12-20', 'france'),
    ('Paris Saint-Germain', 'Neymar Junior', 10, 650, NULL, 'brazil'),
    ('Manchester City', 'Erling Haaland', 9, 338, '2000-06-20', 'norway'),
    ('Manchester City', 'Kevin De Bruyne', 17, 323, '1991-06-28', 'belgium'),
    ('Bayern Munich', 'Kim Min-jae', 3, 239, '1996-11-15', 'korea'),
    ('Bayern Munich', 'Jamal Musiala', 14, 73, NULL, 'germany'),
    ('Real Madrid', 'Vinicius Junior', 7, 296, '2000-07-20', 'brazil'),
    ('Real Madrid', 'Jude Bellingham', 5, 296, '2003-06-29', 'england'),
    ('Miami', 'Lionel Messi', 10, 541, '1987-06-24', 'argentina');
```

![데이터베이스 테이블](/assets/images/posts/postgres-function/table.png "데이터베이스 테이블")

* * *

### 집계 함수

* #### count()
    지정된 열의 행 수를 반환한다. <br><br>

    ```sql
    SELECT count(*) FROM football_player WHERE team = 'Bayern Munich';
    > 2
    ```
<br>

* #### sum()
    지정된 열의 값의 합을 반환한다. <br><br>

    ```sql
    SELECT sum(salary) FROM football_player WHERE team = 'Paris Saint-Germain';
    > 1925
    ```

<br>

* #### avg()
    지정된 열의 값의 평균을 반환한다. <br><br>

    ```sql
    SELECT avg(salary) FROM football_player WHERE team = 'Paris Saint-Germain';
    > 641.6666666666666667

    SELECT avg(salary)::numeric(10, 1) FROM football_player WHERE team = 'Paris Saint-Germain';
    > 641.7
    ```

<br>

* #### max()
    지정된 열의 최대값을 반환한다. <br><br>

    ```sql
    SELECT max(salary) FROM football_player;
    > 1220
    ```

<br>

* #### min()
    지정된 열의 최소값을 반환한다. <br><br>

    ```sql
    SELECT min(salary) FROM football_player;
    > 55
    ```

<br>

* #### array_agg()
    그룹 내의 모든 값을 배열로 집계한다. <br><br>

    ```sql
    SELECT
        array_agg(team),
        array_to_string(array_agg(team), ',')
    FROM
        football_player
    GROUP BY
        team;
    ```
    ![array_agg](/assets/images/posts/postgres-function/array_agg.png "array_agg")

<br>

* #### string_agg()
    문자열 집합에서 문자열을 결합하여 하나의 문자열로 집계한다. <br><br>

    ```sql
    SELECT
        string_agg(team, ',')
    FROM
        football_player
    GROUP BY
        team;
    ```
    ![string_agg](/assets/images/posts/postgres-function/string_agg.png "string_agg")


* * *

### 숫자 함수

* #### abs()
    숫자의 절대값을 반환한다. <br><br>

    ```sql
    SELECT abs(-1000);
    > 1000
    ```

<br>

* #### round()
    숫자를 반올림한다. <br><br>

    ```sql
    SELECT round(6.5);
    > 7

    SELECT round(6.4);
    > 6
    ```

<br>

* #### ceil()
    숫자를 올림한다. <br><br>

    ```sql
    SELECT ceil(-5.2);
    > -5

    SELECT ceil(-5.8);
    > -5

    SELECT ceil(5.2);
    > 6

    SELECT ceil(5.8);
    > 6
    ```

<br>

* #### floor()
    숫자를 내림한다. <br><br>

    ```sql
    SELECT floor(-5.2);
    > -6

    SELECT floor(-5.8);
    > -6

    SELECT floor(5.2);
    > 5

    SELECT floor(5.8);
    > 5
    ```

<br>

* #### trunc()
    숫자를 자른다. <br><br>

    ```sql
    SELECT trunc(-1.3);
    > 1
    ```

<br>

* #### mod()
    나머지를 계산한다. <br><br>

    ```sql
    SELECT mod(200,3);
    > 2
    ```

* * *

### 문자열 함수

* #### concat()
    문자열을 연결한다. <br><br>

    ```sql
    SELECT concat('Hello', ' ', 'World');
    > Hello World
    ```

<br>

* #### upper()
    문자열을 대문자로 변환한다. <br><br>

    ```sql
    SELECT upper('Hello World');
    > HELLO WORLD
    ```

<br>

* #### lower()
    문자열을 소문자로 변환한다. <br><br>

    ```sql
    SELECT lower('Hello World');
    > hello world
    ```

<br>

* #### initcap()
    문자열의 첫 글자를 대문자로 변환한다. <br><br>

    ```sql
    SELECT initcap('real madrid');
    > Real Madrid
    ```

<br>

* #### substring()
    문자열의 일부분을 추출한다. <br><br>

    ```sql
    SELECT substring('Hello World' FROM 1 FOR 5);
    > Hello
    ```

<br>

* #### length()
    문자열의 길이를 반환한다. <br><br>

    ```sql
    SELECT length('real madrid');
    > 11
    ```

<br>

* #### position()
    문자열 내에서 지정된 부분 문자열의 시작 위치를 찾는다. <br><br>

    ```sql
    SELECT position('madrid' In 'real madrid');
    > 6
    ```
<br>

* #### replace()
    문자열에서 지정된 패턴을 다른 문자열로 대체한다. <br><br>

    ```sql
    SELECT replace('Manchester City', 'City', 'United');
    > Manchester United
    ```

<br>

* #### regexp_match()
    정규 표현식 패턴과 일치하는 부분 문자열을 반환한다. <br><br>

    ```sql
    SELECT regexp_match('real madrid', 'm....d');
    > {madrid}
    ```

<br>

* #### regexp_replace()
    정규 표현식 패턴에 일치하는 부분 문자열을 다른 문자열로 대체한다. <br><br>

    ```sql
    SELECT regexp_replace('Manchester City', 'C..y', 'United');
    > Manchester United
    ```

<br>

* #### left()
    문자열의 왼쪽에서 지정된 수만큼의 문자를 반환한다. <br><br>

    ```sql
    SELECT left('Bayern Munich', 6);
    > Bayern
    ```

<br>

* #### right()
    문자열의 오른쪽에서 지정된 수만큼의 문자를 반환한다. <br><br>

    ```sql
    SELECT right('Bayern Munich', 6);
    > Munich
    ```

<br>

* #### lpad()
    문자열의 왼쪽에 지정된 길이만큼의 패딩 문자를 추가한다. <br><br>

    ```sql
    SELECT lpad('8', '3', '0');
    > 008
    ```

<br>

* #### trim()
    문자열의 양쪽 끝에 있는 공백을 제거한다. <br><br>

    ```sql
    SELECT trim('    youngjae ');
    > youngjae
    ```

<br>

* #### md5()
    문자열의 MD5 해시 값을 반환한다. <br><br>

    ```sql
    SELECT md5('Paris Saint-Germain');
    > 43f00e42932203af45b0a05c9f6bcc3d
    ```

* * *

### 날짜 함수

* #### extract()
    지정된 필드(년, 월, 일 등)의 값을 추출한다. <br><br>

    ```sql
    SELECT extract(year from to_date('2024-05-10', 'YYYY-MM-DD'));
    > 2024

    SELECT extract(month from to_date('2024-05-10', 'YYYY-MM-DD'));
    > 5

    SELECT extract(day from to_date('2024-05-10', 'YYYY-MM-DD'));
    > 10
    ```

<br>

* #### date_part()
    지정된 필드(년, 월, 일 등)의 값을 추출한다. <br><br>

    ```sql
    SELECT date_part('year', to_date('2024-05-10', 'YYYY-MM-DD'));
    > 2024

    SELECT date_part('month', to_date('2024-05-10', 'YYYY-MM-DD'));
    > 5

    SELECT date_part('day', to_date('2024-05-10', 'YYYY-MM-DD'));
    > 10
    ```

<br>

* #### to_char()
    날짜를 문자열로 변환한다. <br><br>

    ```sql
    SELECT to_char(birth_day, 'YYYY.MM.DD') FROM football_player;
    ```
    
    ![to_char](/assets/images/posts/postgres-function/to_char.png "to_char")

<br>

* #### to_date()
    문자열을 날짜로 변환한다. <br><br>

    ```sql
    SELECT to_date('10052024', 'MMDDYYYY'), to_date('2024-05-10', 'YYYY-MM-DD');
    ```
    
    ![to_date](/assets/images/posts/postgres-function/to_date.png "to_date")

<br>

* #### to_timestamp()
    문자열을 타임스탬프 데이터 유형으로 변환한다. <br><br>

    ```sql
    SELECT to_timestamp('2024-05-10 12:05:30', 'YYYY-MM-DD HH:MI:SS');
    > 2024-05-10 00:05:30.000000 +09:00
    ```

<br>

* #### interval
    시간 간격을 나타내는데 사용되며, 일, 시, 분, 초 등의 단위로 지정될 수 있다. 주로 날짜와 시간 간격을 더하거나 빼는 데 사용한다. <br><br>

    ```sql
    SELECT
        '2024-05-10'::date + interval '1 week 2 days' AS 예시1;
    > 2024-05-19 00:00:00.000000

    SELECT
        '2024-05-10'::date - interval '2 weeks 4 days' AS 예시2;
    > 2024-04-22 00:00:00.000000

    SELECT
        '2024-05-10 12:35:20'::timestamp + interval '3 days 24 hours 14 minutes 20 seconds' AS 예시3;
    > 2024-05-14 12:49:40.000000
    ```

<br>

* #### split_part()
    문자열을 지정된 구분자를 기준으로 나눈 후, 해당 위치의 부분 문자열을 반환한다. <br><br>

    ```sql
    SELECT
        split_part(to_char(birth_day, 'YYYY-MM-DD'), '-', 1),
        split_part(to_char(birth_day, 'YYYY-MM-DD'), '-', 2),
        split_part(to_char(birth_day, 'YYYY-MM-DD'), '-', 3)
    FROM
        football_player;
    ```
    ![split_part](/assets/images/posts/postgres-function/split_part.png "split_part")

<br>

* * *

### WINDOW 함수

> **WINDOW 함수**는 `PARTITION BY`, `ORDER BY` 절을 적절히 사용해야 한다.

* #### row_number()
    각 행에 순차적인 숫자를 할당한다. <br><br>

    ```sql
    SELECT
        team,
        name,
        salary,
        row_number() over (order by salary desc)
    FROM
        football_player;
    ```
    ![row_number](/assets/images/posts/postgres-function/row_number.png "row_number")

<br>

* #### rank()
    순위를 지정한다. 동일한 값이 있는 경우 동일한 순위를 부여한다. <br><br>

    ```sql
    SELECT
        team,
        name,
        salary,
        rank() over (order by salary desc)
    FROM
        football_player;
    ```
    ![rank](/assets/images/posts/postgres-function/rank.png "rank")

<br>

* #### dense_rank()
    순위를 지정한다. 동일한 값이 있는 경우 동일한 순위를 부여하지만 순위가 비어 있지 않는다. <br><br>

    ```sql
    SELECT
        team,
        name,
        salary,
        dense_rank() over (order by salary desc)
    FROM
        football_player;
    ```
    ![dense_rank](/assets/images/posts/postgres-function/dense_rank.png "dense_rank")

<br>

* #### lag()
    현재 행 기준으로 이전 행의 값을 가져옵니다. <br><br>

    ```sql
    SELECT
        team,
        name,
        salary,
        lag(salary) over (order by salary desc)
    FROM
        football_player;
    ```
    ![lag](/assets/images/posts/postgres-function/lag.png "lag")

<br>

* #### lead()
    현재 행 기준으로 다음 행의 값을 가져옵니다. <br><br>

    ```sql
    SELECT
        team,
        name,
        salary,
        lead(salary) over (order by salary desc)
    FROM
        football_player;
    ```
    ![lead](/assets/images/posts/postgres-function/lead.png "lead")

<br>

* #### cume_dist()
    현재 행의 순위에 따른 누적 분포 값을 반환한다. <br><br>

    ```sql
    SELECT
        team,
        name,
        salary,
        cume_dist() over (order by salary)
    FROM
        football_player;
    ```
    ![cume_dist](/assets/images/posts/postgres-function/cume_dist.png "cume_dist")

<br>

**WINDOW 함수**에는 위에 예시뿐만 아니라 `percent_rank`, `first_value`, `nth_value`, `ntitle` 등 굉장히 많기 때문에 필요할 때마다 찾아서 사용하는 게 좋을 듯하다. <br><br>
그리고 집계 함수와 `PARTITION BY` 절을 함께 사용하면 유용하게 사용할 수 있을듯하다. 

* * *

### 기타 함수

* #### jsonb_build_object
    JSON 객체를 생성한다. <br><br>

    ```sql
    SELECT
        jsonb_build_object(
            '선수명', name,
            '국적', nationality
        )
    FROM
        football_player;
    ```
    ![jsonb_build_object](/assets/images/posts/postgres-function/jsonb_build_object.png "jsonb_build_object")

<br>

* #### jsonb_agg
    JSONB 형식의 데이터를 배열로 집계한다. <br><br>

    ```sql
    SELECT
        jsonb_agg(
            jsonb_build_object(
                '선수명', name,
                '국적', nationality
            ) ORDER BY team
        ) AS json
    FROM
        football_player;
    
    /** result
    [
        {"국적": "germany", "선수명": "Jamal Musiala"},
        {"국적": "korea", "선수명": "Kim Min-jae"},
        {"국적": "belgium", "선수명": "Kevin De Bruyne"},
        {"국적": "norway", "선수명": "Erling Haaland"},
        {"국적": "argentina", "선수명": "Lionel Messi"},
        {"국적": "brazil", "선수명": "Neymar Junior"},
        {"국적": "france", "선수명": "Kylian Mbappe"},
        {"국적": "korea", "선수명": "Lee Kang-in"}
    ]
     */
    ```

<br>

* #### row_to_json
    각 행을 JSON 객체로 변환한다. <br><br>

    ```sql
    SELECT
        row_to_json(football_player)
    FROM
        football_player;
    ```
    ![row_to_json](/assets/images/posts/postgres-function/row_to_json.png "row_to_json")

<br>

* #### generate_series
    시작 값과 끝 값 사이의 정수 시퀀스를 생성한다. <br><br>
    `generate_series(start, end, step)` <br><br>

    ```sql
    SELECT
        generate_series(1, 100, 12);
    ```
    ![generate_series0](/assets/images/posts/postgres-function/generate_series0.png "generate_series0")

    <br>

    ```sql
    -- 1개월 단위
    SELECT
        to_char(
            generate_series(
                '2024-01-10 00:00'::timestamp,
                '2024-12-15 23:59',
                '1 month'
            ),'YYYY-MM'
        ) AS interval_month;
    ```
    ![generate_series1](/assets/images/posts/postgres-function/generate_series1.png "generate_series1")

    <br>

    ```sql
    -- 1주 단위
    SELECT
        to_char(
            generate_series(
                    '2024-05-10 00:00'::timestamp,
                    '2024-12-31 23:59',
                    '1 week'
                ),'YYYY-MM-DD'
        ) AS interval_week;
    ```
    ![generate_series2](/assets/images/posts/postgres-function/generate_series2.png "generate_series2")

<br>

* #### coalesce
    여러 값 중 첫 번째로 NULL이 아닌 값을 반환한다. NULL 값을 대체하는 데 사용한다. <br><br>

    ```sql
    SELECT coalesce(NULL, NULL, 'youngjae', 'empty');
    > youngjae

    SELECT coalesce(NULL, 'empty');
    > empty
    ```

<br>

* #### case when
    조건에 따라 다른 값을 반환한다. <br><br>

    ```sql
    SELECT
        name,
        salary,
        case
            when salary > 600 then 'High'
            else 'Low'
        end AS tier
    FROM
        football_player
    ORDER BY
        salary DESC;
    ```
    ![case_when](/assets/images/posts/postgres-function/case_when.png "case_when")