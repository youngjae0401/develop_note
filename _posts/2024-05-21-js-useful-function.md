---
title: "[JS] JavaScript에서 유용한 배열 메서드"
description: JavaScript에서 유용한 배열 메서드를 알아보자
excerpt: ""

categories:
  - JavaScript

tags:
  - [JavaScript]
  - [자바스크립트]
  - [Array Function]
  - [Array]

permalink: /js/js-useful-function/

toc: true
toc_sticky: true

date: 2024-05-21
last_modified_at: 2024-05-21
---

JavaScript에서 배열을 잘 다루면 코드를 간결하게 작성할 수 있다. <br><br>
JavaScript를 사용하면서 유용했거나 유용할 것 같은 배열 메서드를 작성해 보았다.

* * *

* #### map()
    배열의 각 요소에 대해 제공된 함수를 호출한 결과를 모아서 새로운 배열을 반환한다. <br><br>

    ```js
    const arr = [1, 2, 3];
    const mappedArr = arr.map(x => x * 2);

    console.log(mappedArr); // [2, 4, 6]
    ```

<br>

* #### filter()
    주어진 함수의 조건을 충족하는 모든 요소로 구성된 새로운 배열을 반환한다. 주어진 함수는 각 요소에 대해 참 또는 거짓 값을 반환해야 한다. <br><br>

    ```js
    const array = [1, 2, 3, 4, 5];
    const newArray = array.filter(num => num % 2 === 0);
    
    console.log(newArray); // [2, 4]
    ```

<br>

* #### some()
    배열의 요소 중에서 주어진 판별 함수를 통과하는 요소가 하나 이상 있는지 검사하고, 조건에 맞는 요소가 있으면 true를 반환한다. <br><br>

    ```js
    const arr = [1, 2, 3, 4, 5];
    const hasEven = arr.some(num => num % 2 === 0);

    console.log(hasEven); // true
    ```

<br>

* #### every()
    배열의 모든 요소가 주어진 조건을 만족하는지를 확인한다. 배열의 모든 요소가 주어진 콜백 함수에 대해 true를 반환하면 true를 반환한다. <br><br>

    ```js
    const array = [1, 2, 3, 4, 5];
    const isAllEven = array.every(num => num % 2 === 0);

    console.log(isAllEven); // false
    ```

<br>

* #### from()
    유사 배열 객체나 반복 가능한 객체를 배열로 변환한다. <br><br>

    ```js
    // 유사 배열 객체를 배열로 변환하는 예제
    const arrayLike = { 0: 'a', 1: 'b', 2: 'c', length: 3 };
    const newArray = Array.from(arrayLike);
    console.log(newArray); // ['a', 'b', 'c']

    // 문자열을 배열로 변환하는 예제
    const str = 'hello';
    const charArray = Array.from(str);
    console.log(charArray); // ['h', 'e', 'l', 'l', 'o']
    ```

<br>

* #### sort()
    배열의 요소를 적절한 위치에 정렬하고 배열을 반환한다. 기본적으로는 문자열로 변환하여 사전식으로 정렬한다. <br><br>

    ```js
    const arr = [3, 1, 2, 5, 4];
    arr.sort();

    console.log(arr); // [1, 2, 3, 4, 5]
    ```

<br>

* #### pop()
    배열에서 마지막 요소를 제거하고 그 요소를 반환한다. <br><br>

    ```js
    const arr = [1, 2, 3];
    const poppedItem = arr.pop();

    console.log(poppedItem); // 3
    console.log(arr); // [1, 2]
    ```

<br>

* #### shift()
    배열에서 첫 번째 요소를 제거하고 해당 요소를 반환한다. <br><br>

    ```js
    const arr = [1, 2, 3];
    const shiftedItem = arr.shift();

    console.log(shiftedItem); // 1
    console.log(arr); // [2, 3]
    ```

<br>

* #### unshift()
    배열의 맨 앞에 하나 이상의 요소를 추가하고 새로운 길이를 반환한다. <br><br>

    ```js
    const arr = [2, 3];
    const newLength = arr.unshift(1);

    console.log(newLength); // 3
    console.log(arr); // [1, 2, 3]
    ```

<br>

* #### push()
    배열의 끝에 하나 이상의 요소를 추가하고 배열의 새로운 길이를 반환한다. <br><br>

    ```js
    const arr = [1, 2, 3];
    arr.push(4, 5);

    console.log(arr); // [1, 2, 3, 4, 5]
    ```

<br>

* #### slice()
    배열의 일부분을 추출하여 새로운 배열을 반환한다. 기존 배열은 변경되지 않는다. <br><br>

    ```js
    const arr = [1, 2, 3, 4, 5];
    const slicedArr = arr.slice(1, 4);

    console.log(slicedArr); // [2, 3, 4]
    ```

<br>

* #### splice()
    배열의 요소를 제거하고 그 위치에 새로운 요소를 추가할 수 있다. 이 메서드는 기존 배열을 수정한다. <br><br>

    ```js
    const arr = [1, 2, 3, 4, 5];
    const removedItems = arr.splice(1, 2, 'a', 'b', 'c');

    console.log(arr); // [1, 'a', 'b', 'c', 4, 5]
    console.log(removedItems); // [2, 3]
    ```

<br>

* #### reverse()
    배열의 요소를 반전시킨다. 첫 번째 요소는 마지막 요소로, 마지막 요소는 첫 번째 요소로 바뀐다. <br><br>

    ```js
    const arr = [1, 2, 3, 4, 5];
    arr.reverse();

    console.log(arr); // [5, 4, 3, 2, 1]
    ```

<br>

* #### reduce()
    배열의 각 요소에 대해 제공된 함수를 실행하고 하나의 결과값을 반환한다. <br><br>

    ```js
    const arr = [1, 2, 3, 4, 5];
    const sum = arr.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    console.log(sum); // 15
    ```

<br>

* #### reduceRight()
    배열의 각 요소에 대해 제공된 함수를 오른쪽에서 왼쪽으로 실행하고 하나의 결과값을 반환한다. <br><br>

    ```js
    const arr = ['a', 'b', 'c', 'd'];
    const reversedString = arr.reduceRight((accumulator, currentValue) => accumulator + currentValue);

    console.log(reversedString); // 'dcba'
    ```

<br>

* #### join()
    배열의 모든 요소를 문자열로 결합하여 하나의 문자열로 반환한다. <br><br>

    ```js
    const arr = ['apple', 'banana', 'orange'];
    const str = arr.join(', ');

    console.log(str); // 'apple, banana, orange'
    ```

<br>

* #### flat()
    모든 하위 배열 요소를 지정된 깊이까지 재귀적으로 이어붙인 새로운 배열을 생성한다. <br><br>

    ```js
    const arr = [1, 2, [3, 4]];
    const flatArr = arr.flat();

    console.log(flatArr); // [1, 2, 3, 4]
    ```

<br>

* #### flatMap()
    각 요소에 대해 매핑 함수를 호출한 다음, 결과를 평탄하게 한 후 새로운 배열을 반환한다. <br><br>

    ```js
    const arr = [1, 2, 3];
    const mappedArr = arr.flatMap(x => [x, x * 2]);

    console.log(mappedArr); // [1, 2, 2, 4, 3, 6]
    ```

<br>

* #### includes()
    배열에 특정 요소가 포함되어 있는지 여부를 확인한다. <br><br>

    ```js
    const arr = [1, 2, 3];

    console.log(arr.includes(2)); // true
    console.log(arr.includes(4)); // false
    ```

<br>

* #### indexOf()
    배열에서 지정된 요소를 찾아 그 첫 번째 인덱스를 반환한다. 요소를 찾지 못하면 -1을 반환한다. <br><br>

    ```js
    const arr = [1, 2, 3];

    console.log(arr.indexOf(2)); // 1
    console.log(arr.indexOf(4)); // -1
    ```

<br>

* #### lastIndexOf()
    배열에서 지정된 요소를 뒤에서부터 찾아 그 인덱스를 반환한다. <br><br>

    ```js
    const arr = [1, 2, 3, 1, 2, 3];

    console.log(arr.lastIndexOf(2)); // 4
    ```

<br>

* #### at()
    배열에서 특정 인덱스의 요소를 반환한다. 음수 인덱스도 지원하며, 배열의 끝에서부터 요소를 가져올 수 있다. <br><br>

    ```js
    const array = ['a', 'b', 'c', 'd'];

    console.log(array.at(2)); // 'c'
    console.log(array.at(-1)); // 'd'
    ```

<br>

* #### concat()
    현재 배열에 다른 배열 또는 값들을 결합하여 새로운 배열을 반환한다. 이는 기존 배열을 변경하지 않고 새로운 배열을 생성한다. <br><br>

    ```js
    const array1 = [1, 2, 3];
    const array2 = [4, 5, 6];
    const newArray = array1.concat(array2);

    console.log(newArray); // [1, 2, 3, 4, 5, 6]
    ```

<br>

* #### values()
    객체의 열거 가능한 속성 값에 대한 값 Iterator 객체를 반환한다. <br><br>

    ```js
    const obj = { a: 1, b: 2, c: 3 };
    const valueIterator = Object.values(obj);

    console.log(valueIterator.next().value); // 1
    console.log(valueIterator.next().value); // 2
    console.log(valueIterator.next().value); // 3
    ```

<br>

* #### keys()
    배열의 각 인덱스를 나타내는 새로운 Array Iterator 객체를 반환한다. <br><br>

    ```js
    const arr = ['a', 'b', 'c'];
    const keys = arr.keys();
    for (const key of keys) {
        console.log(key); // 0, 1, 2
    }
    ```

<br>

* #### entries()
    배열의 각 인덱스에 대한 키-값 쌍을 가지는 새로운 Array Iterator 객체를 반환한다. 이 Iterator를 사용하여 배열의 요소와 해당 인덱스에 접근할 수 있다. <br><br>

    ```js
    const array = ['a', 'b', 'c'];
    const iterator = array.entries();
    
    for (const [index, value] of iterator) {
        console.log(index, value);
    }
    // 0 'a'
    // 1 'b'
    // 2 'c'
    ```

<br>

* #### fill()
    배열의 모든 요소를 정적 값으로 채운다. 시작 인덱스부터 끝 인덱스까지 지정된 값으로 배열을 채운다. 시작 및 끝 인덱스를 지정하지 않으면 배열의 모든 요소가 지정된 값으로 채워진다. <br><br>

    ```js
    const array = [1, 2, 3, 4, 5];
    const newArray = array.fill(0, 1, 3);

    console.log(newArray); // [1, 0, 0, 4, 5]
    ```

<br>

* #### find()
    주어진 조건을 만족하는 배열의 첫 번째 요소를 반환한다. 조건을 만족하는 요소가 없으면 undefined를 반환한다. <br><br>

    ```js
    const array = [1, 2, 3, 4, 5];
    const foundValue = array.find(num => num > 3);

    console.log(foundValue); // 4
    ```

<br>

* #### findIndex()
    주어진 조건을 만족하는 배열의 첫 번째 요소의 인덱스를 반환한다. 조건을 만족하는 요소가 없으면 -1을 반환한다. <br><br>

    ```js
    const array = [1, 2, 3, 4, 5];
    const foundIndex = array.findIndex(num => num > 3);

    console.log(foundIndex); // 3
    ```

<br>

* #### findLast()
    주어진 조건을 만족하는 배열의 마지막 요소를 반환한다. <br><br>

    ```js
    Array.prototype.findLast = function(callback) {
        for (let i = this.length - 1; i >= 0; i--) {
            if (callback(this[i])) {
                return this[i];
            }
        }
        return undefined;
    };

    const array = [1, 2, 3, 4, 5];
    const foundLast = array.findLast(num => num > 2);

    console.log(foundLast); // 5
    ```

<br>

* #### findLastIndex()
    주어진 조건을 만족하는 배열의 마지막 요소의 인덱스를 반환한다. <br><br>

    ```js
    Array.prototype.findLastIndex = function(callback) {
        for (let i = this.length - 1; i >= 0; i--) {
            if (callback(this[i])) {
                return i;
            }
        }
        return -1;
    };

    const array = [1, 2, 3, 4, 5];
    const foundLastIndex = array.findLastIndex(num => num > 2);

    console.log(foundLastIndex); // 4
    ```