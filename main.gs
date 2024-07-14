function doGet(e) {
  var html = HtmlService.createHtmlOutput();
  html.append(htmlTemplate);
  var userProperties = PropertiesService.getUserProperties().getProperties();
  html.append(`
  <div></div>
  `);
  html.append(Session.getEffectiveUser().getEmail());

  var trigers = getSchduledTriggers();
  if (trigers.length == 0) {
    html.append('<p>現在定期実行のトリガーが設定されていません。</p>');
  }
  else {
    html.append('<p>現在定期実行間隔が設定されています。</p>');
  }
  var service = getOAuthService();
  if (service.hasAccess()) {
    html.append(`
    <div class="container">
      <div class="button-container">
        <button class="custom-button" onclick="onSetPeriodButton()">定期実行</button>
        <button class="custom-button" onclick="onSyncButton()">同期する</button>
        <button class="custom-button" onclick="onCuttOffFreeeButton()">Freeとの接続を切る</button>
      </div>
    </div>

    <script>
      function onSetPeriodButton() {
        google.script.run.setPeriodButtonHandle(1);
      }
      function onSyncButton() {
        google.script.run.syncButtonHandle();
      }
      function onCuttOffFreeeButton() {
        google.script.run.deleteFreeeAuthentication();
      }
    </script>
    `);

    return html;
  } else {
    html.append(getAuthorizetionRequireResponse(service));
    return html;
  }
}

function syncButtonHandle() {
  var accessToken = getOAuthService().getAccessToken();
  try {
    doSync(accessToken);
  } catch (e) {
    if (e.message.indexOf('expired_access_token') !== -1) {
      // TODO: ボタン押された実行で失敗した場合の処理
      // html.append(getAuthorizetionRequireResponse(service));
      // return html;
    }
    else {
      console.log(e);
      // html.append('<h1>同期に失敗しました</h1>');
      // html.append('予期しないエラーが発生しました<br/>error message: ' + e.message + '</p>');

      // TODO: ボタン押された実行で失敗した場合の処理
      // return html;
    }
  }
}

function getSchduledTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  var scheduledTriggers = [];

  for (var i = 0; i < triggers.length; i++) {
    var trigger = triggers[i];
    if (trigger.getEventType() === ScriptApp.EventType.CLOCK) {
      scheduledTriggers.push(trigger);
    }
  }
  return scheduledTriggers;
}

function setPeriodButtonHandle(periodMinutes) {
  ScriptApp.newTrigger("periodicProcessing")
      .timeBased()
      .everyMinutes(periodMinutes)
      .create();
}

function periodicProcessing() {
  var service = getOAuthService();
  if (service.hasAccess()) {
    var accessToken = service.getAccessToken();
    try {
      doSync(accessToken);
    } catch (e) {
      // TODO: 定期実行で失敗した場合の処理
    }
  }
  else {
      // TODO: 定期実行で失敗した場合の処理
  }
}

function deleteFreeeAuthentication() {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty('oauth2.freee');
}

function getAuthorizetionRequireResponse(service) {
    const authorizationUrl = service.getAuthorizationUrl();
    var htmlStr = '<h1>認証が必要です</h1>' +
      '<p>freeeとの連携の認証が必要です。「認証する」ボタンをクリックして認証を行ってください。新しいタブが開いてfreeeのログイン画面が表示されます。</p>' +
      '<a class="button" href="' + authorizationUrl + '", target="_blank">認証する</a>';
    return htmlStr;
}

function doSync(accessToken) {
  const userInfo = getUserNameAndId(accessToken);
  const userId = userInfo.id;
  const userName = userInfo.name;
  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setDate(toDate.getDate() - 13);
  var targetEvents = getStampsForDateRange(fromDate, toDate, userId, accessToken);

  // startTimeとEndTimeの時分が一致しているeventは削除
  targetEvents = targetEvents.filter(e => getDateMinutes(e.startTime) !== getDateMinutes(e.endTime));
  if (targetEvents.length == 0) {
    return;
  }

  // startTimeの日付ごとに分類
  var targetEventsGroupedByStartDate = [[targetEvents[0]]];
  for (var i = 1; i < targetEvents.length; i++) {
    if (getDateOnly(targetEvents[i].startTime) === getDateOnly(targetEventsGroupedByStartDate.at(-1).at(-1).startTime)) {
      targetEventsGroupedByStartDate.at(-1).push(targetEvents[i]);
    }
    else {
      targetEventsGroupedByStartDate.push([targetEvents[i]]);
    }
  }

  for (targetEvents of targetEventsGroupedByStartDate) {
    const currentProcessingDate = targetEvents[0].startTime;
    var currentEvents = getSuffixedEventsForDate(currentProcessingDate, userName + '　' + eventTitleSuffixString);
    currentEvents = currentEvents.filter(e => getDateOnly(e.startTime) === getDateOnly(currentProcessingDate));
    console.log('------');
    console.log('--target--');
    console.log(targetEvents);
    console.log('--current--');
    console.log(currentEvents);
    var i = 0;
    for (; i < currentEvents.length && i < targetEvents.length; i++) {
      checkAndUpdateEvent(currentEvents[i], targetEvents[i]);
      console.log('update from:', targetEvents[i].startTime, ' to: ', targetEvents[i].endTime);
    }
    for (; i < targetEvents.length; i++) {
      addCalendarEvent(targetEvents[i].startTime, targetEvents[i].endTime, userName + '　' + eventTitleSuffixString, '\n' + pjtId);
      console.log('add from:', targetEvents[i].startTime, ' to: ', targetEvents[i].endTime);
    }
    for (; i < currentEvents.length; i++) {
      deleteEvent(currentEvents[i].id);
      console.log('delete from:', currentEvents[i].startTime, ' to: ', currentEvents[i].endTime);
    }
    console.log('------');
  }
}

function getDateOnly(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1; // 月は0から始まるため、1を足す
  var day = date.getDate();
  
  // 月と日を2桁にフォーマットする
  var monthStr = ('0' + month).slice(-2);
  var dayStr = ('0' + day).slice(-2);

  var dateString = year + '-' + monthStr + '-' + dayStr;
  return dateString;
}

function getDateMinutes(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1; // 月は0から始まるため、1を足す
  var day = date.getDate();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  
  // 月と日を2桁にフォーマットする
  var monthStr = ('0' + month).slice(-2);
  var dayStr = ('0' + day).slice(-2);
  var hoursStr = ('0' + hours).slice(-2);
  var minutesStr = ('0' + minutes).slice(-2);

  var dateString = year + '-' + monthStr + '-' + dayStr + 'T' + hoursStr + ':' + minutesStr;
  return dateString;
}


