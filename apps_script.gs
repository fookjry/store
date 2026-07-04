function doGet() {
  const sheet = SpreadsheetApp.getActive().getSheetByName("Sheet1");
  if (!sheet) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: "Sheet1 not found" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const values = sheet.getDataRange().getValues();
  if (values.length === 0) {
    return ContentService
      .createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const headers = values[0];
  const rows = values.slice(1).map((row) => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[String(header).trim()] = row[i];
    });
    return obj;
  });

  return ContentService
    .createTextOutput(JSON.stringify(rows))
    .setMimeType(ContentService.MimeType.JSON);
}
