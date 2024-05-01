---
title: "[ETC] SOLID 원칙"
excerpt: ""

categories:
  - ETC

tags:
  - [SOLID]

permalink: /etc/solid-principle/

toc: true
toc_sticky: true

date: 2023-08-08
last_modified_at: 2023-08-08
---

### SOLID 원칙
로버트 C.마틴이 정의한 `좋은 객체 지향 설계의 5가지 원칙`들의 앞글자를 따서 지어진 이름이다.
* SRP: 단일 책임 원칙(Single Responsibility Principle)
* OCP: 개방-폐쇄 원칙 (Open/Closed Principle)
* LSP: 리스코프 치환 원칙 (Liskov Substitution Principle)
* ISP: 인터페이스 분리 원칙 (Interface Segregation Principle)
* DIP: 의존관계 역전 원칙 (Dependency Inversion Principle)

* * *

#### SRP: 단일 책임 원칙(Single Responsibility Principle)
**"클래스는 단 하나의 책임만 가져야 한다."** <br><br>
클래스가 한 가지 일에 집중함으로써 코드의 가독성과 유지보수성을 높여주는 중요한 원칙이다. <br>
SRP의 목표는 변경의 이유를 최소화하여 클래스의 수정을 간소화하고, 클래스가 제공하는 책임이 명확해짐으로써 코드의 이해도를 높이는 것이다. <br>
클래스가 여러 책임을 가지게 되면 한 책임을 변경할 때 다른 책임에도 영향을 미칠 수 있으며, 이로 인해 코드를 이해하고 유지보수하는 것이 어려워진다.<br>
**응집도가 높아지고 결합도는 낮아지는** 장점이 있다.

<br>

**BAD**
```java
class Order {
    private int orderId;
    private String customerName;
    private List<OrderItem> items;
    private OrderStatus status;

    public void createOrder(OrderData orderData) {
        
    }
    
    public void cancelOrder() {
        
    }
    
    public void exchangeOrder() {
        
    }
    
    public void returnOrder() {
        
    }
    
    public void sendOrderNotificationEmail() {
        
    }
}
```
<br>

**GOOD**
```java
class Order {
    private int orderId;
    private String customerName;
    private List<OrderItem> items;
    private OrderStatus status;
    
    ...
}

class OrderServiceImpl implements OrderService {
    public void createOrder(Order order, OrderData orderData) {
        
    }
    
    public void cancelOrder(Order order) {
        
    }
    
    public void exchangeOrder(Order order) {
        
    }
    
    public void returnOrder(Order order) {
        
    }
}

class EmailSenderServiceImpl implements EmailSenderService {
    public void sendOrderNotificationEmail(Order order) {

    }
}
```

* * *

#### OCP: 개방-폐쇄 원칙 (Open/Closed Principle)
**"소프트웨어 엔티티(클래스, 모듈, 함수 등)는 확장에 대해서는 열려 있어야 하지만, 변경에 대해서는 닫혀 있어야 한다."** <br><br>

새로운 기능을 추가할 때는 기존의 코드를 수정하지 않고 확장 가능해야 한다. <br>
OCP의 목표는 코드의 변경을 최소화하여 유지보수성을 향상시키고, 기존 코드를 안정적으로 유지하는 것이다. <br>
이를 위해서는 추상화와 다형성을 사용하여 확장 가능한 구조를 만들고, 새로운 기능을 추가할 때는 기존 코드를 수정하지 않고 확장 모듈을 추가하는 방식을 적용한다.

<br>

**BAD**
```java
class Product {
    public String name;
    public double price;
}

class PriceCalculator {
    public double calculatePrice(Product product, String discountType) {
        double price = product.price;

        if (discountType.equals("percent")) {
            price = price - (price * 0.3);
        } else if (discountType.equals("fixed")) {
            price = price - 1000;
        }

        return price;
    }
}

// 실행
public class MainApp {
    public static void main(String[] args) {
        Product product = new Product("Test Product", 10000);

        PriceCalculator priceCalculator = new PriceCalculator();

        double discountedPrice = priceCalculator.calculatePrice(product, "percent");

        System.out.println("Discounted Price: " + discountedPrice);
    }
}
```

<br>

**GOOD**
```java
interface Discount {
    double applyDiscount(double price);
}

class PercentDiscount implements Discount {
    public double applyDiscount(double price) {
        return price - (price * 0.3);
    }
}

class FixedDiscount implements Discount {
    public double applyDiscount(double price) {
        return price - 1000;
    }
}

class PriceCalculator {
    public double calculatePrice(Product product, Discount discount) {
        double price = product.price;
        return discount.applyDiscount(price);
    }
}

class Product {
    public String name;
    public double price;
    
    public Product(String name, double price) {
        this.name = name;
        this.price = price;
    }
}

// 실행
public class MainApp {
    public static void main(String[] args) {
        Product product = new Product("Test Product", 10000);

        Discount percentDiscount = new PercentDiscount();
        PriceCalculator priceCalculator = new PriceCalculator();

        double discountedPrice = priceCalculator.calculatePrice(product, percentDiscount);

        System.out.println("Discounted Price: " + discountedPrice);
    }
}
```

* * *

#### LSP: 리스코프 치환 원칙 (Liskov Substitution Principle)
**"하위 클래스는 상위 클래스의 기능을 무시하지 않고 확장하여 사용할 수 있어야 한다."** <br><br>

이 원칙은 계층 구조에서 하위 클래스가 상위 클래스의 인스턴스로써 대체될 수 있어야 한다. <br>
리스코프 치환 원칙을 지키지 않으면 상속 계층 구조가 부적절하게 설계될 수 있다. <br>
부모 클래스의 객체를 사용하는 곳에 그 자식 클래스의 객체를 사용해도 기능적으로 문제가 없어야 한다.

<br>

**BAD**
```java
class SoccerPlayer {
    public void play() {
        // 축구 선수가 경기를 하는 로직
    }
}

class Goalkeeper extends SoccerPlayer {
    @Override
    public void play() {
        // 골키퍼가 골을 막는 로직
    }
    
    public void catchBall() {
        // 골키퍼가 공을 잡는 로직
    }
}
```

<br>

**GOOD**
```java
interface SoccerPlayer {
    void play();
}

class FieldPlayer implements SoccerPlayer {
    @Override
    public void play() {
        // 필드 선수가 경기를 하는 로직
    }
}

class Goalkeeper implements SoccerPlayer {
    @Override
    public void play() {
        // 골키퍼가 골을 막는 로직
    }
    
    public void catchBall() {
        // 골키퍼가 공을 잡는 로직
    }
}
```

* * *

#### ISP: 인터페이스 분리 원칙 (Interface Segregation Principle)
**"클라이언트가 자신이 사용하지 않는 인터페이스에 의존하지 않아야 한다."** <br><br>

불필요한 의존성을 최소화하여 인터페이스를 작고 응집도 높은 조각으로 분리하는 것을 목표로 한다.

* 인터페이스의 단일 책임: 하나의 인터페이스는 클라이언트가 실제로 필요로 하는 메서드만 포함해야 한다.
* 클라이언트의 의존성 최소화: 클라이언트는 자신이 사용하는 메서드만 가지고 있는 인터페이스에 의존해야 한다. <br>
이를 통해 변경이 발생할 때 불필요한 수정을 방지하고, 인터페이스의 변경이 클라이언트에 미치는 영향을 최소화한다.

인터페이스 분리 원칙을 지키면 인터페이스의 변경이 더욱 유연하고 안정적인 코드를 만들 수 있다. <br>
ISP는 특히 다중 상속을 지원하지 않는 언어에서 중요한 개념이다.

<br>

**BAD**
```java
interface SoccerPlayer {
    void play();
    void shoot();
    void block();
}

class Forward implements SoccerPlayer {
    @Override
    public void play() {
        // 공격수의 경기 참여 로직
    }
    
    @Override
    public void shoot() {
        // 공격수가 슈팅하는 로직
    }
    
    @Override
    public void block() {
        // 공격수가 골을 막는 로직?
    }
}
```

<br>

**GOOD**
```java
interface Player {
    void play();
}

interface Attacker extends Player {
    void shoot();
}

interface Defender extends Player {
    void block();
}

class Forward implements Attacker {
    @Override
    public void play() {
        // 공격수의 경기 참여 로직
    }
    
    @Override
    public void shoot() {
        // 공격수가 슈팅하는 로직
    }
}

class Goalkeeper implements Defender {
    @Override
    public void play() {
        // 골키퍼의 경기 참여 로직
    }
    
    @Override
    public void block() {
        // 골키퍼의 골을 막는 로직
    }
}
```

* * *

#### DIP: 의존관계 역전 원칙 (Dependency Inversion Principle)

**"상위 수준의 모듈은 하위 수준의 모듈에 의존하면 안되며, 양쪽 모두 추상화에 의존해야 한다."** <br><br>

구체적인 구현에 의존하는 대신 인터페이스와 추상화에 의존하여 더 유연하고 견고한 코드를 작성하도록 도와준다.

* 고수준 모듈의 안정성 강화: 고수준 모듈은 하위 수준 모듈에 의존하면 안되므로, 구체적인 구현이 아닌 추상화에 의존함으로써 모듈의 안정성과 변경 용이성을 향상 시킨다.
* 유연한 설계: 추상화에 의존하도록 함으로써 변경이 발생해도 최소한의 영향으로 시스템을 조정할 수 있게 된다.

> **고수준 모듈**: 기능을 제공하는 모듈 (interface, 추상클래스) <br>
> **저수준 모듈**: 고수준 모듈의 기능을 구현하기 위해 필요한 모듈 (매인클래스, 객체)

<br>

**BAD**
```java
class Ball {
    public void kick() {
        System.out.println("공이 차이는 로직 실행");
    }
}

class Player {
    private Ball ball;

    public Player() {
        ball = new Ball();
    }

    public void play() {
        System.out.println("선수가 경기에 참여하고 있습니다.");
        ball.kick();
    }
}

// 실행
public class MainApp {
    public static void main(String[] args) {
        Player player = new Player();
        player.play(); // 선수가 경기에 참여하고 있습니다. / 공이 차이는 로직 실행
    }
}
```

<br>

**GOOD**
```java
interface Ball {
    void kick();
}

class Football implements Ball {
    @Override
    public void kick() {
        System.out.println("공이 차이는 로직 실행");
    }
}

class Player {
    private Ball ball;

    public Player(Ball ball) {
        this.ball = ball;
    }

    public void play() {
        System.out.println("선수가 경기에 참여하고 있습니다.");
        ball.kick();
    }
}

// 실행
public class MainApp {
    public static void main(String[] args) {
        Ball football = new Football();
        Player player = new Player(football);
        player.play(); // 선수가 경기에 참여하고 있습니다. / 공이 차이는 로직 실행
    }
}
```