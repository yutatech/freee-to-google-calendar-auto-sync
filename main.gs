const logger_sheet_id = 'hoge'

function getMyCompanies() {
  const accessToken = getService().getAccessToken();
  const requestUrl = 'https://api.freee.co.jp/api/1/companies';
  
  const params = {
    method : 'get',
    headers : {'Authorization':'Bearer ' + accessToken}
  };
  
  const response = UrlFetchApp.fetch(requestUrl,params);
  
  log(response.getContentText());
}



//連携アプリ情報
const Client_ID = '1234';
const Client_Secret = 'hoge';
 
//認証のエンドポイント
function alertAuth() {
  var service = getService();
  var authorizationUrl = service.getAuthorizationUrl();
  log(authorizationUrl);//認証用URLがログ出力される
}
 
//freeeAPIのサービスを取得
function getService() {
  return OAuth2.createService('freee')
  .setAuthorizationBaseUrl('https://accounts.secure.freee.co.jp/public_api/authorize')
  .setTokenUrl('https://accounts.secure.freee.co.jp/public_api/token')
  .setClientId(Client_ID)
  .setClientSecret(Client_Secret)
  .setCallbackFunction('authCallback')
  .setPropertyStore(PropertiesService.getUserProperties())
}
 
//認証コールバック関数
function authCallback(request) {
  var service = getService();
  var isAuthorized = service.handleCallback(request);
  if (isAuthorized) {
    return HtmlService.createHtmlOutput('認証に成功しました。タブを閉じてください。');
  } else {
    return HtmlService.createHtmlOutput('認証に失敗しました。');
  }
}

function log(message) {
  console.log(message)
  if (logger_sheet_id === undefined) {
    return;
  }

  var sheet = SpreadsheetApp.openById(logger_sheet_id).getSheets()[0];
  // 最初の空欄セルを見つける
  var empty_row = 1;
  while (true) {
    if (sheet.getRange(empty_row, 1).isBlank()) {
      break;
    }
    empty_row += 1;
  }

  // 現在の時刻を取得
  var now = new Date();
  sheet.getRange(empty_row, 1).setValue(now);
  sheet.getRange(empty_row, 2).setValue(message);
}