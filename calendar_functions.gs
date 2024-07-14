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