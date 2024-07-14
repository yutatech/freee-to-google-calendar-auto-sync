const cssStyle = '\
<style>\
body {\
  font-family: Arial, sans-serif;\
  text-align: center;\
  padding: 50px;\
}\
a.button {\
  background-color: #4CAF50;\
  color: white;\
  padding: 15px 32px;\
  text-align: center;\
  display: inline-block;\
  font-size: 16px;\
  margin: 4px 2px;\
  cursor: pointer;\
  text-decoration: none;\
  border-radius: 4px;\
}\
</style>\
';

function doGet(e) {
  var html = HtmlService.createHtmlOutput();
  html.append(cssStyle);
  var userProperties = PropertiesService.getUserProperties().getProperties();
  html.append('<h1>現在のユーザー</h1>');
  html.append(Session.getEffectiveUser().getEmail());
  if (Object.keys(userProperties).length > 0) {
    html.append('<h1>User Properties</h1>');
    html.append('<ul>');

    for (var key in userProperties) {
      html.append('<li>' + key + '<button onclick="deleteProperty(\'' + key + '\')">Delete</button></li>');
    }

    html.append('</ul>');

    // JavaScript function to delete property via AJAX
    html.append('<script>function deleteProperty(key) { google.script.run.deleteUserProperty(key); }</script>');
  } else {
    html.append('<p>No user properties found.</p>');
  }

  var service = getOAuthService();
  if (service.hasAccess()) {
    var accessToken = service.getAccessToken();
    try {
      doSync(accessToken);
    } catch (e) {
      if (e.message.indexOf('expired_access_token') !== -1) {
        html.append(getAuthorizetionRequireResponse(service));
        return html;
      }
      else {
        console.log(e);
        html.append('<h1>同期に失敗しました</h1>');
        html.append('予期しないエラーが発生しました<br/>error message: ' + e.message + '</p>');

        return html;
      }
    }
    html.append('<h1>同期が完了しました</h1>');
    html.append('<p>freeeの勤怠情報をgoogleカレンダーに同期しました。このタブは閉じても構いません。</p>');

    return html;
  } else {
    html.append(getAuthorizetionRequireResponse(service));
    return html;
  }
}

function deleteUserProperty(key) {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty(key);
}

function getAuthorizetionRequireResponse(service) {
    const authorizationUrl = service.getAuthorizationUrl();
    var htmlOutput = '<h1>認証が必要です</h1>' +
      '<p>freeeとの連携の認証が必要です。「認証する」ボタンをクリックして認証を行ってください。新しいタブが開いてfreeeのログイン画面が表示されます。</p>' +
      '<a class="button" href="' + authorizationUrl + '", target="_blank">認証する</a>';
    return htmlOutput;
}

function debug() {
  var service = getOAuthService();
  var accessToken = service.getAccessToken();
  doSync(accessToken);
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


////// googleカレンダー操作用メソッド

function addCalendarEvent(startTime, endTime, title, description) {
  // カレンダーのインスタンスを取得（デフォルトカレンダーを使用）
  var calendar = CalendarApp.getDefaultCalendar();
  
  // イベントを作成
  var event = calendar.createEvent(title, startTime, endTime, {
    description: description
  });
}

function getSuffixedEventsForDate(date, serchTitle) {
  // カレンダーのインスタンスを取得（デフォルトカレンダーを使用）
  var calendar = CalendarApp.getDefaultCalendar();
  
  // 指定された日付の開始時刻と終了時刻を取得
  var startTime = new Date(date);
  startTime.setHours(0, 0, 0, 0);
  
  var endTime = new Date(date);
  endTime.setHours(23, 59, 59, 999);
  
  // 指定された日付のイベントを取得
  var events = calendar.getEvents(startTime, endTime);
  
  // フィルタリングされたイベントを格納する配列
  var filteredEvents = [];

  // イベントをフィルタリングして配列に格納
  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    if (event.getTitle() === serchTitle) {
      filteredEvents.push({
        id: event.getId(),
        startTime: event.getStartTime(),
        endTime: event.getEndTime()
      });
    }
  }

  return filteredEvents;
}

function checkAndUpdateEvent(currentEvent, targetEvent) {
  if (currentEvent.startTime.getTime() !== targetEvent.startTime.getTime() ||
      currentEvent.endTime.getTime() !== targetEvent.endTime.getTime()) {
    CalendarApp.getDefaultCalendar().getEventById(currentEvent.id).setTime(targetEvent.startTime, targetEvent.endTime);
  }
}

function deleteEvent(eventId) {
  CalendarApp.getDefaultCalendar().getEventById(eventId).deleteEvent();
}



