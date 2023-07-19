---
title: "[DB] MySQL에서 사용했던 유용한 함수"
excerpt: "MySQL을 사용하면서 유용했던 함수를 정리해보자"

categories:
  - DataBase

tags:
  - [database]
  - [MySQL]

permalink: /db/mysql-function/

toc: true
toc_sticky: true

date: 2023-07-19
last_modified_at: 2023-07-19
---

MySQL을 사용하면서 종종 사용했던 함수를 나열했으며 자세한 설명은 생략하였습니다.

> **MySQL 5.7** 기준이며, **only_full_group_by** 옵션은 비활성화 상태입니다.

### 예제 DDL
```sql
CREATE TABLE `football_player` (
    `team` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '소속팀',
    `name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '선수명',
    `uniform_number` tinyint(3) unsigned DEFAULT NULL COMMENT '등번호',
    `salary` decimal(10,0) DEFAULT NULL COMMENT '연봉(억단위)',
    `birth_day` date DEFAULT NULL COMMENT '생년월일',
    `nationality` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '국적'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

* * *

### 예제 INSERT
```sql
INSERT INTO football_player (team, name, uniform_number, salary,birth_day, nationality)
VALUES
    ('Paris Saint-Germain', 'Lee Kang-in', 19, 55, '2001-02-19', 'korea'),
    ('Paris Saint-Germain', 'Kylian Mbappe', 7, 1220, '1998-12-20', 'france'),
    ('Paris Saint-Germain', 'Neymar Junior', 10, 650, NULL, 'brazil'),
    ('Manchester City', 'Erling Haaland', 9, 338, '2000-06-20', 'norway'),
    ('Manchester City', 'Kevin De Bruyne', 17, 323, '1991-06-28', 'belgium'),
    ('Bayern Munich', 'Kim Min-jae', 3, 239, '1996-11-15', 'korea'),
    ('Bayern Munich', 'Jamal Musiala', 14, 73, NULL, 'germany'),
    ('Miami', 'Lionel Messi', 10, 541, '1987-06-24', 'argentina');
```

* * *

### CONCAT
`CONCAT(string1, string2, string3, ...)`
```sql
SELECT
    CONCAT('소속팀: ', team, ' / ', '선수명: ', name) AS player_info
FROM
    football_player;
```
![CONCAT](/assets/images/posts/mysql-function/concat.png "CONCAT")

* * *

### CONCAT_WS
`CONCAT_WS(separator, string1, string2, string3, ...)`
```sql
SELECT
    CONCAT_WS(', ', team, name, uniform_number, nationality) AS player_info
FROM
    football_player;
```
![CONCAT_WS](/assets/images/posts/mysql-function/concat_ws.png "CONCAT_WS")

* * *

### GROUP_CONCAT
`GROUP_CONCAT([DISTINCT] expr [ORDER BY {order_expression [ASC | DESC]}] [SEPARATOR separator])`
```sql
SELECT
    team,
    GROUP_CONCAT(DISTINCT name SEPARATOR ' | ') AS players
FROM
    football_player
GROUP BY
    team;
```
![GROUP_CONCAT](/assets/images/posts/mysql-function/group_concat.png "GROUP_CONCAT")

* * *

### DATE_FORMAT
`DATE_FORMAT(date, format)`
```sql
SELECT DATE_FORMAT('2023-07-19 09:30:25', '%Y-%m-%d');
> 2023-07-19

SELECT DATE_FORMAT('2023-07-19 09:30:25', '%Y-%m');
> 2023-07

SELECT DATE_FORMAT('2023-07-19 09:30:25', '%Y');
> 2023
```

* * *

### DATE_ADD
`DATE_ADD(date, INTERVAL value unit)`
```sql
SELECT DATE_ADD('2023-07-19', INTERVAL 1 DAY);
> 2023-07-20

SELECT DATE_ADD('2023-07-19', INTERVAL 2 WEEK);
> 2023-08-02
```

* * *

### DATE_SUB
`DATE_SUB(date, INTERVAL value unit)`
```sql
SELECT DATE_SUB('2023-07-19', INTERVAL 1 DAY);
> 2023-07-18

SELECT DATE_SUB('2023-07-19', INTERVAL 2 WEEK);
> 2023-07-05
```

* * *

### DATEDIFF
`DATEDIFF(date1, date2)`
```sql
SELECT DATEDIFF('2023-07-19', '2023-07-15');
> 4
```

* * *

### SUBSTRING_INDEX
`SUBSTRING_INDEX(string, separator, separator Index)`
```sql
SELECT SUBSTRING_INDEX('ORDER-20230719-123456', '-', 2);
> ORDER-20230719
```

* * *

### SUBSTRING
`SUBSTRING(string, start, length)`
```sql
SELECT SUBSTRING('ORDER-20230719-123456', 16, 6);
> 123456
```

* * *

### IF
`IF(condition, value_if_true, value_if_false)`
```sql
SELECT
    name,
    IF(uniform_number = 10, 'ace', 'not ace') AS is_ace
FROM
    football_player;
```
![IF](/assets/images/posts/mysql-function/if.png "IF")

* * *

### IFNULL
`IFNULL(expression, replacement_value)`
```sql
SELECT
    name,
    IFNULL(birth_day, '생년월일 미등록') AS '생년월일'
FROM
    football_player;
```
![IFNULL](/assets/images/posts/mysql-function/ifnull.png "IFNULL")

* * *

### COUNT
`COUNT(expression)`
```sql
SELECT
    COUNT(*) AS MCI_PLAYER_COUNT
FROM
    football_player
WHERE
    team = 'Manchester City';
```
![COUNT](/assets/images/posts/mysql-function/count.png "COUNT")

* * *

### SUM
`SUM(expression)`
```sql
SELECT
    SUM(salary) AS PSG_SALARIES
FROM
    football_player
WHERE
    team = 'Paris Saint-Germain';
```
![SUM](/assets/images/posts/mysql-function/sum.png "SUM")

* * *

### MAX
`MAX(expression)`
```sql
SELECT
    name,
    salary
FROM
    football_player
WHERE
    salary = (SELECT MAX(salary) FROM football_player);
```
![MAX](/assets/images/posts/mysql-function/max.png "MAX")

* * *

### MIN
`MIN(expression)`
```sql
SELECT
    name,
    salary
FROM
    football_player
WHERE
    salary = (SELECT MIN(salary) FROM football_player);
```
![MIN](/assets/images/posts/mysql-function/min.png "MIN")

* * *

### AVG
`AVG(expression)`
```sql
SELECT
    AVG(salary) AS BAY_AVERAGE_SALARY
FROM
    football_player
WHERE
    team = 'Bayern Munich';
```
![AVG](/assets/images/posts/mysql-function/avg.png "AVG")

* * *

### CASE WHEN THEN
```sql
CASE
    WHEN condition1 THEN result1
    WHEN condition2 THEN result2
    ...
    ELSE default_result
END
```
```sql
SELECT
    name,
    salary,
    CASE
        WHEN salary > 1000 THEN '1'
        WHEN salary > 500 THEN '2'
        WHEN salary > 300 THEN '3'
        ELSE '4'
    END AS tier
FROM
    football_player
ORDER BY
    tier, salary DESC;
```
![CASE_WHEN_THEN](/assets/images/posts/mysql-function/case_when_then.png "CASE_WHEN_THEN")