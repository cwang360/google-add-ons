function formatTime(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+ minutes : minutes;
  return hours + ':' + minutes + ampm;
}

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
}

function getAvailability(config, timezone) {
  events = Array();
  var startDate = new Date(config.start_date[0].msSinceEpoch - timezone.offSet); // beginning of day (local)
  var endDate = new Date(config.end_date[0].msSinceEpoch - timezone.offSet + 86399999); // end of day (local)
  config.calendar_selection.forEach(calendarId => {
    calendar = CalendarApp.getCalendarById(calendarId); 
    console.log(calendar.getTitle());
    events.push(...calendar.getEvents(startDate, endDate));
  });

  events.sort((a, b) => { 
    return a.getStartTime() - b.getStartTime();
  });

  var padding = parseInt(config.padding[0]);
  var prevEndTime = startDate;
  var availabilitySlots = [];
  events.forEach(event => {
    // console.log(event.getTitle());
    // console.log(event.getStartTime());
    // console.log(event.getEndTime());

    if (!config.ignore_all_day_events || !event.isAllDayEvent()) {
      var start = addMinutes(event.getStartTime(), -1 * padding);
      var end = addMinutes(event.getEndTime(), padding)
      if (start > prevEndTime) {
        availabilitySlots.push(...getAvailabilitySlots(prevEndTime, start, config));
      }
      if (end > prevEndTime) {
        prevEndTime = end;
      }
    }
  });
  if (prevEndTime < endDate) {
    availabilitySlots.push(...getAvailabilitySlots(prevEndTime, endDate, config));
  }
  console.log(availabilitySlots);
  return availabilitySlots;
}

function getAvailabilitySlots(start, end, config) {
  arr = [];
  // split at day boundaries
  while (start.getDate() != end.getDate()) {
    var endDay = new Date(start.valueOf());
    endDay.setHours(23, 59, 59, 999);
    var range = trimSlot(
      new Date(start.valueOf()), 
      endDay, config.min_time[0], 
      config.max_time[0], 
      config.min_time_slot[0],
      config.boundary[0]);
    if (range) arr.push(range);
    start.setDate(start.getDate() + 1);
    start.setHours(0, 0, 0, 0);
  }
  if (end - start > 0) {
    var range = trimSlot(
      start, 
      end, 
      config.min_time[0], 
      config.max_time[0], 
      config.min_time_slot[0],
      config.boundary[0]);
    if (range) arr.push(range);
  }
  return arr;
}

function trimSlot(start, end, minTime, maxTime, minTimeSlot, boundary) {
  if (boundary > 0) {
    const ms = 1000 * 60 * boundary;
    if (start.getMinutes() % boundary != 0) {
      // round up
      start = new Date(Math.ceil(start.getTime() / ms) * ms)
    }
    if (end.getMinutes() % boundary != 0) {
      // round down
      end = new Date(Math.floor(end.getTime() / ms) * ms)
    }
  }

  if (start.getHours() < minTime.hours || 
    (start.getHours() ==  minTime.hours && start.getMinutes() < minTime.minutes)) {
    start.setHours(
      minTime.hours, 
      minTime.minutes, 
      0,
      0);
  }
  if (end.getHours() > maxTime.hours || 
    (end.getHours() == maxTime.hours && end.getMinutes() > maxTime.minutes)) {
    end.setHours(
      maxTime.hours, 
      maxTime.minutes, 
      0,
      0);
  }

  if ((end - start) / 1000 / 60 >= minTimeSlot) {
    return [start, end];
  }
  return null;
}
