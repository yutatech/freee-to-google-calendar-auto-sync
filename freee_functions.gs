
//////  freeeから情報の取得用メソッド

function getCompanies() {
  const accessToken = getOAuthService().getAccessToken();
  const requestUrl = 'https://api.freee.co.jp/hr/api/v1/users/me';
  
  const params = {
    method : 'get',
    headers : {'Authorization':'Bearer ' + accessToken},
  };
  
  const response = UrlFetchApp.fetch(requestUrl,params);
  const companies = JSON.parse(response.getContentText()).companies;
  
  console.log(companies);
}

function getUsers() {
  const accessToken = getOAuthService().getAccessToken();
  const requestUrl = 'https://api.freee.co.jp/hr/api/v1/users/me';
  
  const params = {
    method : 'get',
    headers : {'Authorization':'Bearer ' + accessToken},
  };
  
  const response = UrlFetchApp.fetch(requestUrl,params);
  const companies = JSON.parse(response.getContentText()).companies;
  
  console.log(companies);
}

function getUserNameAndId(accessToken) {
  const requestUrl = 'https://api.freee.co.jp/hr/api/v1/users/me';
  
  const params = {
    method : 'get',
    headers : {'Authorization':'Bearer ' + accessToken},
  };
  
  const response = UrlFetchApp.fetch(requestUrl, params);
  const parsedResponse = JSON.parse(response.getContentText());
  const companies = parsedResponse.companies;
  const foundCompany = companies.find(function(company) {
    return company.id == companyId;
  });
  return {id: foundCompany.employee_id, name: foundCompany.display_name.split(' ')[0]};
}

function getStampsForDateRange(from_date, to_date, userId, accessToken) {
  var timeZone = Session.getScriptTimeZone(); // スクリプトのタイムゾーンを取得
  var urlParams = {
    company_id: companyId,
    from_date: Utilities.formatDate(from_date, timeZone, 'yyyy-MM-dd',),
    to_date: Utilities.formatDate(to_date, timeZone, 'yyyy-MM-dd'),
    limit: 100,
    offset: 0
  };
  const requestUrl = generateRequestUrl('https://api.freee.co.jp/hr/api/v1/employees/' + userId + '/time_clocks', urlParams);

  const params = {
    method : 'get',
    headers : {'Authorization':'Bearer ' + accessToken},
  };
  
  const response = UrlFetchApp.fetch(requestUrl, params);
  const parsedResponse = JSON.parse(response.getContentText());
  const minutesToAdd = 3;
  var stamps = [];
  for (e of parsedResponse) {
    switch (e.type) {
      case 'clock_in':
        stamps.push({startTime: new Date(e.datetime), endTime: null});
        if (stamps.length > 1) {
          if (stamps.slice(-2)[0].endTime === null) {
            stamps.slice(-2)[0].endTime = new Date(stamps.slice(-1)[0].startTime.getTime() + (minutesToAdd * 60 * 1000));
          }
        }
        break;
      case 'break_begin':
        if (stamps.length > 0 && stamps.slice(-1)[0].endTime === null) {
          stamps.slice(-1)[0].endTime = new Date(e.datetime);
        }
        break;
      case 'break_end':
        stamps.push({startTime: new Date(e.datetime), endTime: null});
        if (stamps.length > 1) {
          if (stamps.slice(-2)[0].endTime === null) {
            stamps.slice(-2)[0].endTime = new Date(stamps.slice(-1)[0].startTime.getTime() + (minutesToAdd * 60 * 1000));
          }
        }
        break;
      case 'clock_out':
        if (stamps.length > 0 && stamps.slice(-1)[0].endTime === null) {
          stamps.slice(-1)[0].endTime = new Date(e.datetime);
        }
        break;
    }
  }
  if (stamps.slice(-1)[0].endTime === null) {
    stamps.slice(-1)[0].endTime = new Date(stamps.slice(-1)[0].startTime.getTime() + (minutesToAdd * 60 * 1000));
  }
  return stamps;
}

function generateRequestUrl(baseUrl, params) {
  return baseUrl + '?' + Object.keys(params).map(function(key) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
  }).join('&');
}



//////  OAuth認証用メソッド
// 認証機能の参考URL
// https://moripro.net/freee-gas-api/
 
//freeeAPIのサービスを取得
function getOAuthService() {
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
  var service = getOAuthService();
  var isAuthorized = service.handleCallback(request);
  var html = HtmlService.createHtmlOutput();
  html.append(htmlTemplate);
  if (isAuthorized) {
      html.append('<h1>認証が完了しました</h1>');
      html.append('<p>freeeとの連携が完了しました。「同期する」ボタンを押してfreeeの勤怠情報をgoogleカレンダーに同期します。</p>');
      html.append('<a class="button" href="' + ScriptApp.getService().getUrl() + '", target="_blank">同期する</a>');
    return html;
  } else {
    html.append('<h1>認証に失敗しました</h1>');
    html.append('<p>freeeとの連携に失敗しました。管理者に問い合わせてください。</p>');
    return html;
  }
}