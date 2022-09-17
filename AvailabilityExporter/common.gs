/**
 * Callback for rendering the homepage card.
 * @return {CardService.Card} The card to show to the user.
 */
function onHomepage(e) {
  console.log(e);
  console.log(e.userTimezone.id);
  return buildCalendarHomepage();
}

function buildCalendarHomepage() {
  var startDateInput = CardService.newDatePicker()
    .setTitle("Start date")
    .setFieldName("start_date")
  var endDateInput = CardService.newDatePicker()
    .setTitle("End date")
    .setFieldName("end_date")
  // choose calendars
  var calendarSelection = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.CHECK_BOX)
    .setTitle("Select calenders whose events will be considered as unavailable times")
    .setFieldName("calendar_selection");
  calendars = CalendarApp.getAllCalendars(); 
  calendars.forEach(calendar => {
    calendarSelection.addItem(calendar.getTitle(), calendar.getId(), false);
  });
  var minTimeInput = CardService.newTextInput()
      .setFieldName('min_time')
      .setTitle('Minimum time slot size (in minutes)');
  var boundarySelection = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setTitle("Select the boundary for start/end")
    .setFieldName("boundary_selection")
    .addItem("Any", 0, true)
    .addItem("15 minute mark", 15, false)
    .addItem("30 minute mark", 30, false)
    .addItem("1 hour mark", 60, false);
  var paddingInput = CardService.newTextInput()
      .setFieldName('padding')
      .setTitle('Padding before/after scheduled events');
  var action = CardService.newAction()
      .setFunctionName('exportAvailability');
      // .setParameters({text: text, isHomepage: isHomepage.toString()});
  var button = CardService.newTextButton()
      .setText('Export Availability')
      .setOnClickAction(action)
      .setTextButtonStyle(CardService.TextButtonStyle.FILLED);
  var buttonSet = CardService.newButtonSet()
      .addButton(button);

  // Create a footer to be shown at the bottom.
  var footer = CardService.newFixedFooter()
      .setPrimaryButton(CardService.newTextButton()
          .setText('Check out on Github')
          .setOpenLink(CardService.newOpenLink()
              .setUrl('https://github.com/cwang360/google-add-ons')));

  // Assemble the widgets and return the card.
  var section = CardService.newCardSection()
      .addWidget(startDateInput)
      .addWidget(endDateInput)
      .addWidget(calendarSelection)
      .addWidget(minTimeInput)
      .addWidget(paddingInput)
      .addWidget(boundarySelection)
      .addWidget(buttonSet);
  var card = CardService.newCardBuilder()
      .addSection(section)
      .setFixedFooter(footer);

  return card.build();
}

function exportAvailability(e) {
  console.log(e);
  var availability = getAvailability(e.formInputs, e.userTimezone);
  // download/show
  // var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  var availabilityText = "";
  var prevDate = null;
  availability.forEach(range => {
    if (prevDate != range[0].getDate()) {
      availabilityText += `\n${range[0].toLocaleDateString("en-US")}: ${formatTime(range[0])} - ${formatTime(range[1])}`;
      prevDate = range[0].getDate();
    } else {
      availabilityText += `, ${formatTime(range[0])} - ${formatTime(range[1])}`
    }
    // availabilityText += `${range[0].toLocaleDateString("en-US")}: ${formatTime(range[0])} - ${formatTime(range[1])} ${range[0].toTimeString().match(/\((.+)\)/)[1]}\n`;
  });
  var availabilityParagraph = CardService.newTextParagraph()
    .setText(availabilityText);
  var results = CardService.newCardSection()
    .addWidget(availabilityParagraph);
  var card = CardService.newCardBuilder()
    .addSection(results)
    .build();

  let nav = CardService.newNavigation().pushCard(card);
  return CardService.newActionResponseBuilder()
    .setNavigation(nav)
    .build();
}

function formatTime(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+ minutes : minutes;
  return hours + ':' + minutes + ampm;
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

  var prevEndTime = startDate;
  var availabilitySlots = [];
  events.forEach(event => {
    console.log(event.getTitle());
    console.log(event.getStartTime());
    console.log(event.getEndTime());
    if (event.getStartTime() > prevEndTime) {
      availabilitySlots.push(...getAvailabilitySlots(prevEndTime, event.getStartTime()));
    }
    if (event.getEndTime() > prevEndTime) {
      prevEndTime = event.getEndTime();
    }
  });
  if (prevEndTime < endDate) {
    availabilitySlots.push(...getAvailabilitySlots(prevEndTime, endDate));
  }
  console.log(availabilitySlots);
  return availabilitySlots;
}

function getAvailabilitySlots(start, end) {
  arr = [];
  while (start.getDate() != end.getDate()) {
    var endDay = new Date(start.valueOf());
    endDay.setHours(23, 59, 59, 999);
    console.log(start, endDay);
    arr.push([new Date(start.valueOf()), endDay]);
    start.setDate(start.getDate() + 1);
    start.setHours(0, 0, 0, 0);
  }
  if (end - start > 0) {
    arr.push([start, end]);
  }
  return arr;
}
