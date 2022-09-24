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
  var minTimeInput = CardService.newTimePicker()
    .setTitle("Minimum time of day (your local time)")
    .setFieldName("min_time")
    .setHours(9)
    .setMinutes(0);
  var maxTimeInput = CardService.newTimePicker()
    .setTitle("Maximum time of day (your local time)")
    .setFieldName("max_time")
    .setHours(18)
    .setMinutes(0);

  var minTimeSlotInput = CardService.newTextInput()
      .setFieldName('min_time_slot')
      .setValue('0')
      .setTitle('Minimum time slot size (in minutes)');
  var boundarySelection = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setTitle("Select the boundary for start/end:")
    .setFieldName("boundary")
    .addItem("Any", 0, true)
    .addItem("5 minute mark", 5, false)
    .addItem("10 minute mark", 10, false)
    .addItem("15 minute mark", 15, false)
    .addItem("30 minute mark", 30, false)
    .addItem("1 hour mark", 60, false);
  var timezoneSelection = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setTitle("Select timezone to export availability in:")
    .setFieldName("timezone");
    timezones.forEach(timezone => {
      timezoneSelection.addItem(timezone, timezone, false);
    });
  var paddingInput = CardService.newTextInput()
      .setFieldName('padding')
      .setValue('0')
      .setTitle('Padding before/after scheduled events (in minutes)');
  var action = CardService.newAction()
      .setFunctionName('exportAvailability');
      // .setParameters({text: text, isHomepage: isHomepage.toString()});
  var button = CardService.newTextButton()
      .setText('Export Availability')
      .setOnClickAction(action)
      .setTextButtonStyle(CardService.TextButtonStyle.FILLED);
  var buttonSet = CardService.newButtonSet()
      .addButton(button);

  var allDayEventSelection = CardService.newSelectionInput()
      .setType(CardService.SelectionInputType.CHECK_BOX)
      .setFieldName("ignore_all_day_events")
      .addItem("Ignore all-day events", true, false);

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
      .addWidget(maxTimeInput)
      .addWidget(minTimeSlotInput)
      .addWidget(paddingInput)
      .addWidget(boundarySelection)
      .addWidget(timezoneSelection)
      .addWidget(allDayEventSelection)
      .addWidget(buttonSet);
  var card = CardService.newCardBuilder()
      .addSection(section)
      .setFixedFooter(footer);

  return card.build();
}

function exportAvailability(e) {
  console.log(e);
  var errorText = verifyInputs(e.formInputs);
  if (errorText) {
    var errorParagraph = CardService.newTextParagraph()
      .setText(errorText);
    var results = CardService.newCardSection()
      .addWidget(errorParagraph);
  } else {
    var availability = getAvailability(e.formInputs, e.userTimezone);
    // download/show
    // var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var availabilityText = `Availability in ${e.formInput.timezone}\n`;
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
  }

  var card = CardService.newCardBuilder()
      .addSection(results)
      .build();
  var nav = CardService.newNavigation().pushCard(card);
  return CardService.newActionResponseBuilder()
    .setNavigation(nav)
    .build();
}

function verifyInputs(form) {
  if (!form.calendar_selection || form.calendar_selection.length == 0) 
    return "Please select at least one calendar";
  if (!form.start_date) 
    return "Please enter a start date";
  if (!form.end_date) 
    return "Please enter an end date";
  if (form.end_date[0].msSinceEpoch < form.start_date[0].msSinceEpoch) 
    return "Please choose a valid start/end date range (start date cannot be later than end date)";
  if (!form.min_time)
    return "Please enter a minimum time of day";
  if (!form.max_time)
    return "Please enter a maximum time of day";
  if (form.max_time[0].hours < form.min_time[0].hours || 
    (form.max_time[0].hours == form.min_time[0].hours && form.max_time[0].minutes < form.min_time[0].minutes))
    return "Please enter a valid min/max time range (minimum time cannot be greater than maximum time)";
  if (!form.min_time_slot)
    return "Please enter a minimum time slot size";
  if (!form.padding)
    return "Please enter a padding amount before/after scheduled events";
  return null;
}