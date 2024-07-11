---
title: "[DB] MySQL에서 자주 사용되는 configuration(my.conf)"
description: MySQL 쿼리를 실행하면서 필요했던 configuration에 대해서 알아보자
excerpt: ""

categories:
  - DataBase

tags:
  - [database]
  - [MySQL]
  - [configuration]
  - [my.conf]

permalink: /db/useful-mysql-configuration/

toc: true
toc_sticky: true

date: 2024-07-1
last_modified_at: 2024-07-11
---

MySQL을 사용하면서 자주 사용했던 2가지 configuration 옵션을 작성했다.

* * *

### sql_mode
MySQL에서 `sql_mode`의 기본값은 아래와 같다. <br>

```ini
ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
```
<br>

여기에서 `ONLY_FULL_GROUP_BY` 값이 있으면 `GROUP BY`절을 사용할 때 `GROUP BY`절에 명시한 컬럼 값을 `SELECT`절에 추가해 주어야 한다. <br><br>
그렇지 않으면 `SQL Error [1055] [42000]: Expression #1 of SELECT list is not in GROUP BY clause and contains nonaggregated column '...' which is not functionally dependent on columns in GROUP BY clause; this is incompatible with sql_mode=only_full_group_by`라는 오류가 발생한다. <br><br>
그래서 보통 `ONLY_FULL_GROUP_BY` 값을 빼고 사용한다. <br><br>

**my.conf**
```ini
[mysqld]
sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'
```

<br>
**또는** <br><br>

**SQL**
```sql
SET GLOBAL sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
```

* * *

### group_concat_max_len
MySQL에서 `group_concat_max_len`의 기본값 `1024`이다. <br>

`group_concat_max_len`은 `GROUP_CONCAT`를 사용할 때 결괏값에 대한 최대 길이 옵션이다. <br>

`group_concat_max_len=1024`라면 `GROUP_CONCAT`으로 연결된 결괏값이 최대 1024바이트를 초과할 수 없다. (UTF-8 인코딩 기준으로 문자열 약 1024자에 해당한다.) <br><br>

이건 내가 경험했던 얘기이다. <br>

이미지 경로를 img 태그의 src 속성에 넣고 `GROUP_CONCAT`으로 연결해서 데이터를 추출했다. <br>

데이터의 값이 `group_concat_max_len`의 최대 길이를 초과하여 뒷부분 img 태그들의 값이 잘렸고, 이는 엑박으로 이어졌다. <br>

이 때 `group_concat_max_len` 라는 옵션을 알게 되었고, 설정값을 수정하니 정상적으로 작동했다. <br><br>

그래서 `group_concat_max_len`의 값은 기본값보다는 조금 늘려두는 게 좋을 것 같다. <br><br>

**my.conf**
```ini
[mysqld]
group_concat_max_len = 300000
```

<br>
**또는** <br><br>

**SQL**
```sql
SET GLOBAL group_concat_max_len = 300000;
```