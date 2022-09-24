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
    .setTitle("Minimum time of day (local)")
    .setFieldName("min_time")
    .setHours(9)
    .setMinutes(0);
  var maxTimeInput = CardService.newTimePicker()
    .setTitle("Maximum time of day (local)")
    .setFieldName("max_time")
    .setHours(18)
    .setMinutes(0);

  var minTimeSlotInput = CardService.newTextInput()
      .setFieldName('min_time_slot')
      .setTitle('Minimum time slot size (in minutes)');
  var boundarySelection = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setTitle("Select the boundary for start/end")
    .setFieldName("boundary")
    .addItem("Any", 0, true)
    .addItem("5 minute mark", 5, false)
    .addItem("10 minute mark", 10, false)
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
      .addWidget(allDayEventSelection)
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
