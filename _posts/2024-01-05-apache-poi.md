---
title: "[JAVA] Apache POI 라이브러리를 사용해서 엑셀 다운로드하기(SXSSFWorkbook)"
excerpt: ""

categories:
  - JAVA

tags:
  - [Spring Boot]
  - [Apache POI]
  - [SXSSFWorkbook]

permalink: /java/apache-poi/

toc: true
toc_sticky: true

date: 2024-01-05
last_modified_at: 2024-01-05
---

### 환경
* JAVA 17
* Spring Boot 3.14
* Apache poi 5.2.5

> **Gradle** <br>
> implementation 'org.apache.poi:poi:5.2.5' <br>
> implementation 'org.apache.poi:poi-ooxml:5.2.5'

* * *

### Apache POI 라이브러리
Excel, Word, PowerPoint와 같은 Microsoft Office 파일 형식을 Java에서 처리할 수 있도록 하는 오픈소스 JAVA 라이브러리이다.<br><br>
Apache 소프트웨어 재단에 의해 개발되었다.

<br>

### Workbook 인터페이스
Workbook 인터페이스에는 크게 3가지가 있다.
* **HSSFWorkbook**
    * excel 97 ~ 2003 버전
* **XSSFWorkbook**
    * excel 2007버전 이상
    * 메모리에 모든 데이터를 로드하여 처리한다.
    * 읽기, 쓰기가 가능하다.
* **SXSSFWorkbook**
    * poi 3.8 beta3 버전부터 지원하는 성능 개선된 버전이다.
    * 대용량 데이터를 다룰 때 유용하다.
    * 데이터를 일정량씩 읽고 쓰기 때문에 메모리 부하가 적다.
    * Out Of Memory 오류를 방지할 수 있다.
    * 쓰기만 가능하다.

<br>

그래서 나는 SXSSFWorkbook을 사용했다. <br><br>
처음에는 잘 모르고 XSSFWorkbook을 사용했다가 변경했었다. <br><br>
어차피 쓰기만 할 것이고, 성능이 개선된 버전이니 안 쓸 이유가 없다.

* * *

### 엑셀 다운로드 예시 코드

**CreateCell**
```java
@Data
public class CreateCell<T> {
    private T value;
    private Short bgColor;
    private Short fontColor;
    private HorizontalAlignment align;
    private DateTimeFormatter dateFormat;

    public static <T> CreateCell<T> of(T value) {
        return CreateCell.<T>builder()
                .value(value)
                .build();
    }

    public CreateCell<T> withFontColor(Short fontColor) {
        return this.toBuilder()
                .fontColor(fontColor)
                .build();
    }

    public CreateCell<T> withBgColor(Short bgColor) {
        return this.toBuilder()
                .bgColor(bgColor)
                .build();
    }

    public CreateCell<T> withAlign(HorizontalAlignment align) {
        return this.toBuilder()
                .align(align)
                .build();
    }

    public String getValue() {
        if (ObjectUtils.isEmpty(value)) {
            return "";
        }

        if (value instanceof LocalDate date) {
            return date.format(getDateTimeFormat());
        } else if (value instanceof LocalDateTime dateTime) {
            return dateTime.format(getDateTimeFormat());
        } else {
            return String.valueOf(value);
        }
    }

    private DateTimeFormatter getDateTimeFormat() {
        if (value.getClass().equals(LocalDate.class)) {
            return DateTimeFormatter.ofPattern("yyyy-MM-dd");
        } else if (value.getClass().equals(LocalDateTime.class)) {
            return DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        } else {
            return dateFormat;
        }
    }
}
```

<br>

**CreateExcel**
```java
@Data
@Builder
public class CreateExcel {
    private String sheetName;
    private String fileName;
    private List<CreateCell<?>> headData;
    private List<List<CreateCell<?>>> rowData;
    private static final String DEFAULT_SHEET_NAME = "sheet1";
    private static final int ROW_ACCESS_WINDOW_SIZE = 1000;

    public void downloadExcel(HttpServletResponse response) {
        try (SXSSFWorkbook workbook = new SXSSFWorkbook(ROW_ACCESS_WINDOW_SIZE)) {
            setResponseHeader(response);

            createSheet(workbook);

            workbook.write(response.getOutputStream());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void setResponseHeader(HttpServletResponse response) {
        String excelFileName = StringUtils.isNotBlank(this.fileName) ? this.fileName : defaultFileName();
        response.setContentType("application/vnd.ms-excel");
        response.setHeader("Content-Disposition", "attachment; filename=" + excelFileName + ".xlsx");
    }

    private void createSheet(SXSSFWorkbook workbook) {
        String excelSheetName = StringUtils.isNotBlank(this.sheetName) ? sheetName : DEFAULT_SHEET_NAME;
        SXSSFSheet sheet = workbook.createSheet(excelSheetName);

        int rowNum = 0;

        if (headData != null && !headData.isEmpty()) {
            SXSSFRow headRow = sheet.createRow(rowNum++);
            headRow.setHeight((short) -1);
            for (CreateCell<?> cell : headData) {
                createCell(workbook, headRow, cell);
            }
        }

        if (rowData != null && !rowData.isEmpty()) {
            for (List<CreateCell<?>> rowCells : rowData) {
                SXSSFRow row = sheet.createRow(rowNum++);
                row.setHeight((short) -1);
                for (CreateCell<?> cell : rowCells) {
                    createCell(workbook, row, cell);
                }
            }
        }

        autoSizeColumns(sheet);
    }

    private void createCell(SXSSFWorkbook workbook, SXSSFRow row, CreateCell<?> cell) {
        int colNum = row.getLastCellNum() >= 0 ? row.getLastCellNum() : 0;

        SXSSFCell poiCell = row.createCell(colNum);
        poiCell.setCellValue(cell.getValue());

        CellStyle style = workbook.createCellStyle();

        // 기본 스타일 지정
        defaultCellStyle(style);

        // 배경 색상
        if (cell.getBgColor() != null) {
            style.setFillForegroundColor(cell.getBgColor());
            style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        }

        // 글자 색상
        if (cell.getFontColor() != null) {
            Font font = workbook.createFont();
            font.setColor(cell.getFontColor());
            style.setFont(font);
        }

        // 텍스트 좌우 정렬
        if (Objects.nonNull(cell.getAlign())) {
            style.setAlignment(cell.getAlign());
        }

        poiCell.setCellStyle(style);
    }

    private void defaultCellStyle(CellStyle style) {
        // vertical align
        style.setVerticalAlignment(VerticalAlignment.CENTER);

        // border
        style.setBorderTop(BorderStyle.THIN);
        style.setTopBorderColor(IndexedColors.BLACK.getIndex());
        style.setBorderRight(BorderStyle.THIN);
        style.setRightBorderColor(IndexedColors.BLACK.getIndex());
        style.setBorderBottom(BorderStyle.THIN);
        style.setBottomBorderColor(IndexedColors.BLACK.getIndex());
        style.setBorderLeft(BorderStyle.THIN);
        style.setLeftBorderColor(IndexedColors.BLACK.getIndex());
        style.setWrapText(true);
    }

    private String defaultFileName() {
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        String currentDateTime = now.format(formatter);
        return "data_" + currentDateTime;
    }

    private void autoSizeColumns(SXSSFSheet sheet) {
        sheet.trackAllColumnsForAutoSizing();
        Row firstRow = sheet.getRow(0);
        if (firstRow != null) {
            for (int i = 0; i < firstRow.getLastCellNum(); i++) {
                sheet.autoSizeColumn(i);
                sheet.setColumnWidth(i, Math.min(255 * 256, sheet.getColumnWidth(i) + 1500));
            }
        }
    }
}
```

<br>

**TestResponse**
```java
@Data
@Builder
public class TestResponse {
    private int number;
    private String name;
    private int age;
    private String createdAt;

    public List<CreateCell<?>> getExcelHeadData() {
        HorizontalAlignment center = HorizontalAlignment.CENTER;
        Short bgColor = IndexedColors.ORANGE.getIndex();
        Short fontColor = IndexedColors.WHITE.getIndex();

        return List.of(
                CreateCell.of("번호").withAlign(center).withFontColor(fontColor).withBgColor(bgColor),
                CreateCell.of("이름").withAlign(center).withFontColor(fontColor).withBgColor(bgColor),
                CreateCell.of("나이").withAlign(center).withFontColor(fontColor).withBgColor(bgColor),
                CreateCell.of("등록일").withAlign(center).withFontColor(fontColor).withBgColor(bgColor)
        );
    }

    public List<CreateCell<?>> getExcelRowData() {
        return List.of(
                CreateCell.of(number).withAlign(HorizontalAlignment.CENTER),
                CreateCell.of(name),
                CreateCell.of(age).withAlign(HorizontalAlignment.CENTER),
                CreateCell.of(createdAt).withAlign(HorizontalAlignment.CENTER)
        );
    }
}
```

<br>

**TestService**
```java
@Service
@RequiredArgsConstructor
public class TestService {
	private final TestRepository testRepository;

	@Transactional(readOnly = true)
	public void excelDownload(TestSearchRequest request, HttpServletResponse response) {
		List<TestResponse> testResponses = ...

		CreateExcel.builder()
				.headData(TestResponse.builder().build().getExcelHeadData())
				.rowData(testResponses.stream()
						.map(TestResponse::getExcelRowData)
						.toList())
				.build()
				.downloadExcel(response);
	}
}
```

위에 설명에서 SXSSFWorkbook는 일정량씩 읽고 쓴다고 했다. <br><br>
일정량씩 flush하는건데 flush의 값을 조절하는 게 `ROW_ACCESS_WINDOW_SIZE` 변수이다. (기본 값은 100) <br>

> **flush**란 메모리에 있는 데이터를 디스크(임시 파일)로 옮기고 메모리를 비워내는 것이다.