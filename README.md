# google-add-ons
Miscellaneous Google Workspace add-ons that make my life easier.

## Calendar add-ons
### Availability Exporter
Automatically exports ranges of ***free*** time you have, either as a simple textual list, table format, or .ics calendar file. This was mainly made for whenever a recruiter asks for my availability in day/times format, sometimes in a table format, so that I wouldn't have manually find and type my ranges of availability (and often, have to convert it to a different time zone). However, this could be useful for sharing availability in general.

Options:
- [Done] Specify start and end dates (inclusive)
- [Done] Specify calendars whose scheduled events will be considered as ***busy*** time
- [Done] Specify padding before/after scheduled events
- [Done] Specify min/max time of the day (you wouldn't want to tell a recruiter you're free at 3am for an interview)
- [Done] Specify minimum time slot size (doesn't make sense to share a 15 minute availability if you're trying to schedule a 1-hr meeting)
- [In Progress] Specify time zone to export as
- [Done] Specify start/end boundaries -- 5, 10, 15, 30, or 1 hour boundaries (in case you want to avoid telling someone you're available at weird start/end times, like 1:03pm - 3:47pm)
- [Done] Specify to exclude all-day events in what is considered busy time
