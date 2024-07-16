function doGet(e) {
  const userProperties = PropertiesService.getUserProperties();
  if (!userProperties.getProperty("prjId")) {
    userProperties.setProperty("prjId", '@@Prj_ID@@')
  }
  if (!userProperties.getProperty("duration")) {
    userProperties.setProperty("duration", '5min')
  }
  if (!userProperties.getProperty("periodicSyncEnabled")) {
    userProperties.setProperty("periodicSyncEnabled", false)
  }
  if (!userProperties.getProperty("syncStartTimerEnabled")) {
    userProperties.setProperty("syncStartTimerEnabled", false)
  }
  if (!userProperties.getProperty("syncStartTime")) {
    userProperties.setProperty("syncStartTime", '9-00')
  }
  if (!userProperties.getProperty("syncStopTime")) {
    userProperties.setProperty("syncStopTime", '18-00')
  }

  if (!isPeriodicTriggerExist('periodicProcessing')) {
    userProperties.setProperty("periodicSyncEnabled", false)
  }

  var html = HtmlService.createHtmlOutput();
  html.append(htmlTemplate);

  var service = getOAuthService();
  if (service.hasAccess()) {
    html.append(`
<div class="container custom-min-width">
  <div class="row justify-content-center mt-4">
    <button class="btn btn-primary col-10 col-md-3 mx-3 py-2 py-md-4" data-bs-toggle="modal" data-bs-target="#syncing" onclick="onSyncButton()">
        今日の<br />実績を同期
    </button>
    <button class="btn btn-primary col-10 col-md-3 mx-3 py-2 py-md-4 mt-4 mt-md-0" data-bs-toggle="modal" data-bs-target="#syncing" onclick="onSyncMonthButton()">
      直近30日の<br />実績を同期
    </button>
    <button class="btn btn-primary col-10 col-md-3 mx-3 py-2 py-md-4 mt-4 mt-md-0" data-bs-toggle="modal" data-bs-target="#selectDate">
      日付を指定して<br />実績を同期
    </button>
  </div>
  <div class="row">
    <div class="col-12 col-md-6 d-flex align-items-stretch">
      <div class="container round-rect border-secondary mt-3 mx-1 p-2">
        <h4>基本設定</h4>
        <form onSubmit="onPrjIdFormSubmit()" class="container">
          <div class="row align-items-start">
            <label class="form-label col text-start" for="prjId">デフォルトで設定するプロジェクト</label>
          </div>
          <div class="row align-items-start">
            <div class="offset-2 col hstack">
              <input class="form-control w-25 flex-fill me-2" type="text" id="prjId" placeholder="***" required>
              <button class="btn btn-primary" type="submit">更新</button>
            </div>
          </div>
        </form>
        <hr />
        <div class="container">
          <button class="btn btn-primary col-10 col-xs-8 col-md-10 col-lg-8 mt-2" onclick="onCuttOffFreeeButton()">Freeeへの接続情報を削除</button>
        </div>
      </div>
    </div>


    <div class="col-12 col-md-6 d-flex align-items-stretch">
      <div class="container round-rect border-secondary mt-3 mx-1 p-2">
        <h4>自動同期設定</h4>
        <form class="container">
          <div class="form-check form-switch d-flex align-items-center">
            <input class="form-check-input me-2" type="checkbox" role="switch" id="periodicSyncEnable">
            <label class="form-check-label" for="periodicSyncEnable" id="periodicSyncEnableLabel"></label>自動で定期的に同期する</label>
          </div>
          <div class="row align-items-start d-flex align-items-center">
            <div class="offset-2 col-10 hstack">
              <label class="form-select-label me-2" for="durationSelect" id="durationSelectLabel">間隔</label>
              <select class="form-select flex-grow-1" style="width:auto;" id="durationSelect" onchange="onDurationSelectChange()">
                <option value="1min">1分</option>
                <option value="5min">5分</option>
                <option value="10min">10分</option>
                <option value="15min">15分</option>
                <option value="30min">30分</option>
                <option value="1h">1時間</option>
                <option value="2h">2時間</option>
                <option value="4h">4時間</option>
                <option value="6h">6時間</option>
                <option value="8h">8時間</option>
              </select>
            </div>
          </div>
        </form>
        <hr />
        <div class="container mb-0">
          <div class="form-check form-switch d-flex align-items-center">
            <input class="form-check-input me-2" type="checkbox" role="switch" id="syncStartTimerEnable">
            <label class="form-check-label" for="periodicSyncEnable" id="syncStartTimerEnableLabel"></label>自動同期を行う時間を設定する</label>
          </div>
          <form class="row align-items-start d-flex align-items-center" onSubmit="onSyncStartTimerUpdate()">
            <div class="form-group offset-2 col-10 hstack mb-2">
              <label class="me-2" for="syncStartTimeInput">開始時間</label>
              <input class="form-control w-25 flex-fill" type="time" id="syncStartTimeInput" required>
            </div>
            <div class="form-group offset-2 col-10 hstack mb-2">
              <label class="me-2" for="syncStopTimeInput">終了時間</label>
              <input class="form-control w-25 flex-fill" type="time" id="syncStopTimeInput" required>
            </div>
            <div class="row justify-content-end pe-0">
              <button class="btn btn-primary col-3" type="submit" id="syncStartTimerUpdateButton">更新</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="modal fade" id="selectDate" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5">日付を指定して実績を同期</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form id="syncDateFrom">
          <input class="form-control" type="date" id="syncDateInput" required>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">キャンセル</button>
        <button type="button" class="btn btn-primary" onclick="onSyncSelectDateButton()">選択する</button>
      </div>
    </div>
  </div>
</div>


<div class="modal fade" id="syncing" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-body">
        <p>同期中...</p>
        <div class="spinner-border text-light" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="modal fade" id="syncSuccess" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5">同期が完了しました</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <!-- <div class="modal-body">
      </div> -->
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">閉じる</button>
      </div>
    </div>
  </div>
</div>

<div class="modal fade" id="syncFail" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5">同期に失敗しました</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <p id="syncFailModalMessage"></p>
        <p id="syncFailModalErrorMessage"></p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-danger" data-bs-dismiss="modal">閉じる</button>
      </div>
    </div>
  </div>
</div>

<script>
  function onPrjIdFormSubmit() {
    const prjId = document.getElementById('prjId').value;
    google.script.run.prjIdFormSubmitHandle(prjId);
  }

  function onDurationSelectChange() {
    var selectedValue = document.getElementById("durationSelect").value;
    google.script.run.durationSelectChangeHandle(selectedValue);
  }

  function onSyncButton() {
    console.log('sync');
    google.script.run.withSuccessHandler(function(response) {
      console.log(response);
      $('#syncing').modal('hide');
      if (response.success) {
        $('#syncSuccess').modal('show');
        setTimeout(function() {
          $('#syncSuccess').modal('hide');
        }, 3000);
      } else {
        document.getElementById("syncFailModalMessage").innerText = response.message
        document.getElementById("syncFailModalErrorMessage").innerText = 'error message: ' + response.error_message
        $('#syncFail').modal('show');
      }
    }).syncButtonHandle();
  }
  function onSyncMonthButton() {
    console.log('sync month');
    google.script.run.withSuccessHandler(function(response) {
      console.log(response);
      $('#syncing').modal('hide');
      if (response.success) {
        $('#syncSuccess').modal('show');
        setTimeout(function() {
          $('#syncSuccess').modal('hide');
        }, 3000);
      } else {
        document.getElementById("syncFailModalMessage").innerText = response.message
        document.getElementById("syncFailModalErrorMessage").innerText = 'error message: ' + response.error_message
        $('#syncFail').modal('show');
      }
    }).syncMonthButtonHandle();
  }
  function onSyncSelectDateButton() {
    var syncDate = document.getElementById('syncDateInput').value;
    console.log(syncDate)
    if (syncDate) {
      $('#selectDate').modal('hide');
      $('#syncing').modal('show');

      google.script.run.withSuccessHandler(function(response) {
        console.log(response);
        $('#syncing').modal('hide');
        if (response.success) {
          $('#syncSuccess').modal('show');
          setTimeout(function() {
            $('#syncSuccess').modal('hide');
          }, 3000);
        } else {
          document.getElementById("syncFailModalMessage").innerText = response.message
          document.getElementById("syncFailModalErrorMessage").innerText = 'error message: ' + response.error_message
          $('#syncFail').modal('show');
        }
      }).syncSelectDateButtonHandle(syncDate);

    } else{
      document.getElementById('syncDateFrom').requestSubmit()
    }
  }
  function onCuttOffFreeeButton() {
    google.script.run.withSuccessHandler(function(response) {
      location.reload(true);
      }).deleteFreeeAuthentication();
  }

  function onPeriodicSyncEnable() {
    const isChecked = this.checked;
    const durationSelect = document.getElementById('durationSelect');

    const syncStartTimerEnable = document.getElementById('syncStartTimerEnable')
    const syncStartTimeInput = document.getElementById('syncStartTimeInput');
    const syncStopTimeInput = document.getElementById('syncStopTimeInput');
    const syncStartTimerUpdateButton = document.getElementById('syncStartTimerUpdateButton');

    if (isChecked) {
      durationSelect.removeAttribute('disabled');
      syncStartTimerEnable.removeAttribute('disabled');
      if (syncStartTimerEnable.checked) {
        syncStartTimeInput.removeAttribute('disabled');
        syncStopTimeInput.removeAttribute('disabled');
        syncStartTimerUpdateButton.removeAttribute('disabled');
      }
      google.script.run.periodicSyncEnableHandle(true);
      onDurationSelectChange();
    } else {
      durationSelect.setAttribute('disabled', 'true');
      syncStartTimerEnable.setAttribute('disabled', 'true');
      syncStartTimeInput.setAttribute('disabled', 'true');
      syncStopTimeInput.setAttribute('disabled', 'true');
      syncStartTimerUpdateButton.setAttribute('disabled', 'true');
      google.script.run.periodicSyncEnableHandle(false);
    }
  }

  function onSyncStartTimerEnable() {
    const isChecked = this.checked;
    const syncStartTimeInput = document.getElementById('syncStartTimeInput');
    const syncStopTimeInput = document.getElementById('syncStopTimeInput');
    const syncStartTimerUpdateButton = document.getElementById('syncStartTimerUpdateButton');

    if (isChecked) {
      syncStartTimeInput.removeAttribute('disabled');
      syncStopTimeInput.removeAttribute('disabled');
      syncStartTimerUpdateButton.removeAttribute('disabled');
      google.script.run.syncStartTimerEnableHandle(true);
    } else {
      syncStartTimeInput.setAttribute('disabled', 'true');
      syncStopTimeInput.setAttribute('disabled', 'true');
      syncStartTimerUpdateButton.setAttribute('disabled', 'true');
      google.script.run.syncStartTimerEnableHandle(false);
    }
  }

  function onSyncStartTimerUpdate() {
    const syncStartTimeInput = document.getElementById('syncStartTimeInput');
    const syncStopTimeInput = document.getElementById('syncStopTimeInput');
    const syncStartTime = syncStartTimeInput.value;
    const syncStopTime = syncStopTimeInput.value;
    google.script.run.syncStartTimerUpdateHandle(syncStartTime, syncStopTime);
  }

  window.onload = function (){
    console.log('on load');
    document.getElementById('periodicSyncEnable').addEventListener('change', onPeriodicSyncEnable);
    document.getElementById('syncStartTimerEnable').addEventListener('change', onSyncStartTimerEnable);
    `);

    html.append('document.getElementById("currentUser").innerText = "' + Session.getEffectiveUser().getEmail() + '";');
    html.append('document.getElementById("prjId").placeholder = "現在の設定値: ' + userProperties.getProperty("prjId") + '";');
    html.append('document.getElementById("durationSelect").value = "' + userProperties.getProperty("duration") + '";');
    html.append('document.getElementById("periodicSyncEnable").checked = ' + userProperties.getProperty("periodicSyncEnabled") + ';');
    html.append('document.getElementById("syncStartTimerEnable").checked = ' + userProperties.getProperty("syncStartTimerEnabled") + ';');
    html.append('document.getElementById("syncStartTimeInput").value = "' + userProperties.getProperty("syncStartTime") + '";');
    html.append('document.getElementById("syncStopTimeInput").value = "' + userProperties.getProperty("syncStopTime") + '";');
    html.append(`

    if (!document.getElementById("periodicSyncEnable").checked) {
      document.getElementById('durationSelect').setAttribute('disabled', 'true');
      document.getElementById('syncStartTimerEnable').setAttribute('disabled', 'true');
    }
    if (!document.getElementById("syncStartTimerEnable").checked || !document.getElementById("periodicSyncEnable").checked) {
      document.getElementById('syncStartTimeInput').setAttribute('disabled', 'true');
      document.getElementById('syncStopTimeInput').setAttribute('disabled', 'true');
      document.getElementById('syncStartTimerUpdateButton').setAttribute('disabled', 'true');
    }
  };
</script>
`);
      
    return html;
  } else {
    html.append(getAuthorizetionRequireResponse(service));
    html.append('<script>');
    html.append('window.onload = function (){');
    html.append('console.log("onload");');
    html.append('document.getElementById("currentUser").innerText = "' + Session.getEffectiveUser().getEmail() + '";');
    html.append('};');
    html.append('</script>');
    return html;
  }
}

function prjIdFormSubmitHandle(prjId) {
  PropertiesService.getUserProperties().setProperty('prjId', prjId);
}

function durationSelectChangeHandle(selectedValue) {
  PropertiesService.getUserProperties().setProperty('duration', selectedValue);
  setDuration();
}

function setDuration() {
  const duration = PropertiesService.getUserProperties().getProperty('duration');
  deleteSchduledTriggers();
  var trigger = ScriptApp.newTrigger("periodicProcessing").timeBased()
      
  switch (duration) {
    case '1min':
      trigger.everyMinutes(1);
      break;
    case '5min':
      trigger.everyMinutes(5);
      break;
    case '10min':
      trigger.everyMinutes(10);
      break;
    case '15min':
      trigger.everyMinutes(15);
      break;
    case '30min':
      trigger.everyMinutes(30);
      break;
    case '1h':
      trigger.everyHours(1);
      break;
    case '2h':
      trigger.everyHours(2);
      break;
    case '4h':
      trigger.everyHours(4);
      break;
    case '6h':
      trigger.everyHours(6);
      break;
    case '8h':
      trigger.everyHours(8);
      break;
    default:
      return;
  }
  trigger.create();
}

function isPeriodicTriggerExist(functionName) {
  var triggers = ScriptApp.getProjectTriggers();

  // 各トリガーをチェック
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === functionName) {
      Logger.log("Function " + functionName + " is set as a trigger.");
      return true;
    }
  }
}

function syncButtonHandle() {
  const targetDate = new Date();
  return doSyncHavingTokenChecked(targetDate, targetDate);
}

function syncMonthButtonHandle() {
  const toDate = new Date();
  const fromDate = new Date();
  return doSyncHavingTokenChecked(toDate, fromDate);
}

function syncSelectDateButtonHandle(syncDate) {
  const targetDate = new Date(syncDate);
  return doSyncHavingTokenChecked(targetDate, targetDate);
}

function periodicSyncEnableHandle(isEnabled) {
  PropertiesService.getUserProperties().setProperty('periodicSyncEnabled', isEnabled);
  if (isEnabled) {
  } else {
    deleteSchduledTriggers();
  }
}

function syncStartTimerEnableHandle(isEnabled) {
  PropertiesService.getUserProperties().setProperty('syncStartTimerEnabled', isEnabled);
}

function syncStartTimerUpdateHandle(syncStartTime, syncStopTime) {
  PropertiesService.getUserProperties().setProperty('syncStartTime', syncStartTime);
  PropertiesService.getUserProperties().setProperty('syncStopTime', syncStopTime);
}

function deleteSchduledTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  for (trigger of triggers) {
    if (trigger.getEventType() === ScriptApp.EventType.CLOCK) {
      ScriptApp.deleteTrigger(trigger);
    }
  }
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
    var htmlStr = '<h1 class="mt-4">認証が必要です</h1>' +
      '<p>freeeとの連携の認証が必要です。「認証する」ボタンをクリックして認証を行ってください。新しいタブが開いてfreeeのログイン画面が表示されます。</p>' +
      '<a class="btn btn-primary" href="' + authorizationUrl + '" target="_blank">認証する</a>';
    return htmlStr;
}

function doSyncHavingTokenChecked(fromDate, toDate) {
  var accessToken = getOAuthService().getAccessToken();
  try {
    doSync(accessToken, fromDate, toDate);
    return {success: true};
  } catch (e) {
    if (e.message.indexOf('expired_access_token') !== -1) {
      // TODO: ボタン押された実行で失敗した場合の処理
      deleteFreeeAuthentication();
      return {success: false, message: 'アクセストークンの期限が切れています。ページをリロードして再度freeeとの接続を認証してください。', error_message: e.message};
    }
    else {
      console.log(e);
      // TODO: ボタン押された実行で失敗した場合の処理
      return {success: false, message: '予期しないエラーが発生しました。管理者に問い合わせてください。', error_message: e.message};
    }
  }
}

function doSync(accessToken, fromDate, toDate) {
  const userInfo = getUserNameAndId(accessToken);
  const userId = userInfo.id;
  const userName = userInfo.name;
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
      addCalendarEvent(targetEvents[i].startTime, targetEvents[i].endTime, userName + '　' + eventTitleSuffixString, 
        '<a href="' + PropertiesService.getScriptProperties().getProperty("deployUrl") + '"> Freee to Google Calendar Auto Sync</a>\n' +
        PropertiesService.getUserProperties().getProperty("prjId"));
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


