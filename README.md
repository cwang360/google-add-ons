# google-add-ons
Miscellaneous Google Workspace add-ons that make my life easier.

## Calendar add-ons
### Availability Exporter
Automatically exports ranges of ***free*** time you have, either as a simple textual list [Done], table format [In Progress], or .ics calendar file [In Progress]. This was mainly made for whenever a recruiter asks for my availability in day/times format, sometimes in a table format, so that I wouldn't have manually find and type my ranges of availability (and often, have to convert it to a different time zone). However, this could be useful for sharing availability in general.

Options:
- [Done] Specify start and end dates (inclusive)
- [Done] Specify calendars whose scheduled events will be considered as ***busy*** time
- [Done] Specify padding before/after scheduled events
- [Done] Specify min/max time of the day (you wouldn't want to tell a recruiter you're free at 3am for an interview)
- [Done] Specify minimum time slot size (doesn't make sense to share a 15 minute availability if you're trying to schedule a 1-hr meeting)
- [Done] Specify time zone to export as
- [Done] Specify start/end boundaries -- 5, 10, 15, 30, or 1 hour boundaries (in case you want to avoid telling someone you're available at weird start/end times, like 1:03pm - 3:47pm)
- [Done] Specify to exclude all-day events in what is considered busy time
- [Done] Input validation / error checking

Make a copy of the Google Apps Script project [here](https://script.google.com/d/1l7EZDTCWurC67mIMqoH6q2Gs3ff18Gcf-mPdUXdED4VaUlouD5E8dUps/edit?usp=sharing)

## Installation
The add-ons are not currently deployed publicly / available from the Google Workspace Marketplace, but you can easily create a project with the files in this repo and deploy it for your own use.
1. Make a copy of the Google Apps Script project linked in the descriptions above (Navigate to `Overview` from the left sidebar and click the copy icon near the upper right) or create the project from scratch. To create from scratch:
    1. Create a new Google Apps Script [here](https://script.google.com/home/start)
    2. Navigate to `Settings` from the left sidebar, and enable `Show "appsscript.json" manifest file in editor`.
    3. Navigate to `Editor` from the left sidebar, and add the add-on files/code to the `Files` section.
2. Click `Deploy` > `Test deployments` > `Install`. If you get an error, you might have to first click on any of the `.gs` files, click `Run` from the top, and accept/enable any permissions (Don't worry if the run fails). Then try installing the test deployment again.
3. Once you installed the add-on, you should be able to see it on the right add-ons bar in Calendar, Mail, etc.