define(function() {
    /*
        Moon phase data model and various utility methods.

        Accessible properties:
        -> functions
        update_moon_calculations()
        moon_phase_name()

        -> Julian Date
        julian_date

        -> Age
        days_old
        hours_old
        minutes_old

        -> Lunation
        phase_of_moon
        lunation

        -> Visibility
        percent_of_full_moon

        -> Selenography
        selenographic_deg
        west_or_east
        rise_or_set

        -> Next new-moon
        days_until_new_moon
        next_new_moon_date

        -> Next full-moon
        days_until_full_moon
        next_full_moon_date

        -> Next lunar-eclipse
        days_until_lunar_eclipse
        next_lunar_eclipse_date

        -> Next solar-eclipse
        days_until_solar_eclipse
        next_solar_eclipse_date
    */

    'use strict';

    var self = {};
    var new_moon_array, full_moon_array, first_quarter_array, last_quarter_array;
    var currOffset = (new Date()).getTimezoneOffset() * 60;

    /*
        Init hard coded, arrays for New, First Quarter, Full Last Quarter Moon UTC data.

        2008 to 2018 data from http://sunearth.gsfc.nasa.gov/eclipse/phase/phasecat.html
        algorithms used in predicting the phases of the Moon and eclipses are based
        on Jean Meeus' Astronomical Algorithms (Willmann-Bell, Inc., 1998). All
        calculations are by Fred Espenak, and he assumes full responsibility for
        their accuracy. Permission is freely granted to reproduce this data when
        accompanied by an acknowledgment.

        Data is all UTC and in YYYY-MM-DD HH:MM format, with New and Full Moon
        arrays with an extra end character for eclipse types T=Total (Solar),
        A=Annular (Solar), H=Hybrid (Solar Annular/Total), P=Partial (Solar),
        t=Total (Lunar Umbral), p=Partial (Lunar Umbral), n=Penumbral (Lunar),
        _=none.
    */

    new_moon_array = ["2008-01-08T11:37Z_", "2008-02-07T03:44ZA", "2008-03-07T17:14Z_", "2008-04-06T03:55Z_", "2008-05-05T12:18Z_", "2008-06-03T19:23Z_", "2008-07-03T02:19Z_", "2008-08-01T10:13ZT", "2008-08-30T19:58Z_", "2008-09-29T08:12Z_", "2008-10-28T23:14Z_", "2008-11-27T16:55Z_", "2008-12-27T12:23Z_", "2009-01-26T07:55ZA", "2009-02-25T01:35Z_", "2009-03-26T16:06Z_", "2009-04-25T03:23Z_", "2009-05-24T12:11Z_", "2009-06-22T19:35Z_", "2009-07-22T02:35ZT", "2009-08-20T10:01Z_", "2009-09-18T18:44Z_", "2009-10-18T05:33Z_", "2009-11-16T19:14Z_", "2009-12-16T12:02Z_", "2010-01-15T07:11ZA", "2010-02-14T02:51Z_", "2010-03-15T21:01Z_", "2010-04-14T12:29Z_", "2010-05-14T01:04Z_", "2010-06-12T11:15Z_", "2010-07-11T19:40ZT", "2010-08-10T03:08Z_", "2010-09-08T10:30Z_", "2010-10-07T18:44Z_", "2010-11-06T04:52Z_", "2010-12-05T17:36Z_", "2011-01-04T09:03ZP", "2011-02-03T02:31Z_", "2011-03-04T20:46Z_", "2011-04-03T14:32Z_", "2011-05-03T06:51Z_", "2011-06-01T21:03ZP", "2011-07-01T08:54ZP", "2011-07-30T18:40Z_", "2011-08-29T03:04Z_", "2011-09-27T11:09Z_", "2011-10-26T19:56Z_", "2011-11-25T06:10ZP", "2011-12-24T18:06Z_", "2012-01-23T07:39Z_", "2012-02-21T22:35Z_", "2012-03-22T14:37Z_", "2012-04-21T07:18Z_", "2012-05-20T23:47ZA", "2012-06-19T15:02Z_", "2012-07-19T04:24Z_", "2012-08-17T15:54Z_", "2012-09-16T02:11Z_", "2012-10-15T12:02Z_", "2012-11-13T22:08ZT", "2012-12-13T08:42Z_", "2013-01-11T19:44Z_", "2013-02-10T07:20Z_", "2013-03-11T19:51Z_", "2013-04-10T09:35Z_", "2013-05-10T00:29ZA", "2013-06-08T15:56Z_", "2013-07-08T07:14Z_", "2013-08-06T21:51Z_", "2013-09-05T11:36Z_", "2013-10-05T00:35Z_", "2013-11-03T12:50ZH", "2013-12-03T00:22Z_", "2014-01-01T11:14Z_", "2014-01-30T21:39Z_", "2014-03-01T08:00Z_", "2014-03-30T18:45Z_", "2014-04-29T06:14ZA", "2014-05-28T18:40Z_", "2014-06-27T08:09Z_", "2014-07-26T22:42Z_", "2014-08-25T14:13Z_", "2014-09-24T06:14Z_", "2014-10-23T21:57ZP", "2014-11-22T12:32Z_", "2014-12-22T01:36Z_", "2015-01-20T13:14Z_", "2015-02-18T23:47Z_", "2015-03-20T09:36ZT", "2015-04-18T18:57Z_", "2015-05-18T04:13Z_", "2015-06-16T14:05Z_", "2015-07-16T01:24Z_", "2015-08-14T14:54Z_", "2015-09-13T06:41ZP", "2015-10-13T00:06Z_", "2015-11-11T17:47Z_", "2015-12-11T10:29Z_", "2016-01-10T01:30Z_", "2016-02-08T14:39Z_", "2016-03-09T01:54ZT", "2016-04-07T11:24Z_", "2016-05-06T19:30Z_", "2016-06-05T03:00Z_", "2016-07-04T11:01Z_", "2016-08-02T20:45Z_", "2016-09-01T09:03ZA", "2016-10-01T00:12Z_", "2016-10-30T17:38Z_", "2016-11-29T12:18Z_", "2016-12-29T06:53Z_", "2017-01-28T00:07Z_", "2017-02-26T14:58ZA", "2017-03-28T02:57Z_", "2017-04-26T12:16Z_", "2017-05-25T19:44Z_", "2017-06-24T02:31Z_", "2017-07-23T09:46Z_", "2017-08-21T18:30ZT", "2017-09-20T05:30Z_", "2017-10-19T19:12Z_", "2017-11-18T11:42Z_", "2017-12-18T06:31Z_", "2018-01-17T02:17Z_", "2018-02-15T21:05ZP", "2018-03-17T13:12Z_", "2018-04-16T01:57Z_", "2018-05-15T11:48Z_", "2018-06-13T19:43Z_", "2018-07-13T02:48ZP", "2018-08-11T09:58ZP", "2018-09-09T18:01Z_", "2018-10-09T03:47Z_", "2018-11-07T16:02Z_", "2018-12-07T07:20Z_"];
    full_moon_array = ["2008-01-22T13:35Z_", "2008-02-21T03:31Zt", "2008-03-21T18:40Z_", "2008-04-20T10:25Z_", "2008-05-20T02:11Z_", "2008-06-18T17:30Z_", "2008-07-18T07:59Z_", "2008-08-16T21:16Zp", "2008-09-15T09:13Z_", "2008-10-14T20:03Z_", "2008-11-13T06:17Z_", "2008-12-12T16:37Z_", "2009-01-11T03:27Z_", "2009-02-09T14:49Zn", "2009-03-11T02:38Z_", "2009-04-09T14:56Z_", "2009-05-09T04:01Z_", "2009-06-07T18:12Z_", "2009-07-07T09:21Zn", "2009-08-06T00:55Zn", "2009-09-04T16:03Z_", "2009-10-04T06:10Z_", "2009-11-02T19:14Z_", "2009-12-02T07:30Z_", "2009-12-31T19:13Zp", "2010-01-30T06:18Z_", "2010-02-28T16:38Z_", "2010-03-30T02:25Z_", "2010-04-28T12:18Z_", "2010-05-27T23:07Z_", "2010-06-26T11:30Zp", "2010-07-26T01:37Z_", "2010-08-24T17:05Z_", "2010-09-23T09:17Z_", "2010-10-23T01:36Z_", "2010-11-21T17:27Z_", "2010-12-21T08:13Zt", "2011-01-19T21:21Z_", "2011-02-18T08:36Z_", "2011-03-19T18:10Z_", "2011-04-18T02:44Z_", "2011-05-17T11:09Z_", "2011-06-15T20:13Zt", "2011-07-15T06:40Z_", "2011-08-13T18:58Z_", "2011-09-12T09:27Z_", "2011-10-12T02:06Z_", "2011-11-10T20:16Z_", "2011-12-10T14:36Zt", "2012-01-09T07:30Z_", "2012-02-07T21:54Z_", "2012-03-08T09:40Z_", "2012-04-06T19:19Z_", "2012-05-06T03:35Z_", "2012-06-04T11:12Zp", "2012-07-03T18:52Z_", "2012-08-02T03:27Z_", "2012-08-31T13:58Z_", "2012-09-30T03:19Z_", "2012-10-29T19:50Z_", "2012-11-28T14:46Zn", "2012-12-28T10:21Z_", "2013-01-27T04:38Z_", "2013-02-25T20:26Z_", "2013-03-27T09:27Z_", "2013-04-25T19:57Zp", "2013-05-25T04:25Zn", "2013-06-23T11:32Z_", "2013-07-22T18:15Z_", "2013-08-21T01:45Z_", "2013-09-19T11:13Z_", "2013-10-18T23:38Zn", "2013-11-17T15:16Z_", "2013-12-17T09:28Z_", "2014-01-16T04:52Z_", "2014-02-14T23:53Z_", "2014-03-16T17:09Z_", "2014-04-15T07:42Zt", "2014-05-14T19:16Z_", "2014-06-13T04:11Z_", "2014-07-12T11:25Z_", "2014-08-10T18:09Z_", "2014-09-09T01:38Z_", "2014-10-08T10:51Zt", "2014-11-06T22:23Z_", "2014-12-06T12:27Z_", "2015-01-05T04:53Z_", "2015-02-03T23:09Z_", "2015-03-05T18:06Z_", "2015-04-04T12:06Zp", "2015-05-04T03:42Z_", "2015-06-02T16:19Z_", "2015-07-02T02:20Z_", "2015-07-31T10:43Z_", "2015-08-29T18:35Z_", "2015-09-28T02:50Zt", "2015-10-27T12:05Z_", "2015-11-25T22:44Z_", "2015-12-25T11:11Z_", "2016-01-24T01:46Z_", "2016-02-22T18:20Z_", "2016-03-23T12:01Zn", "2016-04-22T05:24Z_", "2016-05-21T21:15Z_", "2016-06-20T11:02Z_", "2016-07-19T22:57Z_", "2016-08-18T09:27Z_", "2016-09-16T19:05Zn", "2016-10-16T04:23Z_", "2016-11-14T13:52Z_", "2016-12-14T00:06Z_", "2017-01-12T11:34Z_", "2017-02-11T00:33Zn", "2017-03-12T14:54Z_", "2017-04-11T06:08Z_", "2017-05-10T21:43Z_", "2017-06-09T13:10Z_", "2017-07-09T04:07Z_", "2017-08-07T18:11Zp", "2017-09-06T07:03Z_", "2017-10-05T18:40Z_", "2017-11-04T05:23Z_", "2017-12-03T15:47Z_", "2018-01-02T02:24Z_", "2018-01-31T13:27Zt", "2018-03-02T00:51Z_", "2018-03-31T12:37Z_", "2018-04-30T00:58Z_", "2018-05-29T14:20Z_", "2018-06-28T04:53Z_", "2018-07-27T20:20Zt", "2018-08-26T11:56Z_", "2018-09-25T02:53Z_", "2018-10-24T16:45Z_", "2018-11-23T05:39Z_", "2018-12-22T17:49Z_"];
    first_quarter_array = ["2008-01-15T19:46Z", "2008-02-14T03:34Z", "2008-03-14T10:46Z", "2008-04-12T18:32Z", "2008-05-12T03:47Z", "2008-06-10T15:04Z", "2008-07-10T04:35Z", "2008-08-08T20:20Z", "2008-09-07T14:04Z", "2008-10-07T09:04Z", "2008-11-06T04:04Z", "2008-12-05T21:26Z", "2009-01-04T11:56Z", "2009-02-02T23:13Z", "2009-03-04T07:46Z", "2009-04-02T14:34Z", "2009-05-01T20:44Z", "2009-05-31T03:22Z", "2009-06-29T11:28Z", "2009-07-28T22:00Z", "2009-08-27T11:42Z", "2009-09-26T04:50Z", "2009-10-26T00:42Z", "2009-11-24T21:39Z", "2009-12-24T17:36Z", "2010-01-23T10:53Z", "2010-02-22T00:42Z", "2010-03-23T11:00Z", "2010-04-21T18:20Z", "2010-05-20T23:43Z", "2010-06-19T04:30Z", "2010-07-18T10:11Z", "2010-08-16T18:14Z", "2010-09-15T05:50Z", "2010-10-14T21:27Z", "2010-11-13T16:39Z", "2010-12-13T13:59Z", "2011-01-12T11:31Z", "2011-02-11T07:18Z", "2011-03-12T23:45Z", "2011-04-11T12:05Z", "2011-05-10T20:33Z", "2011-06-09T02:11Z", "2011-07-08T06:29Z", "2011-08-06T11:08Z", "2011-09-04T17:39Z", "2011-10-04T03:15Z", "2011-11-02T16:38Z", "2011-12-02T09:52Z", "2012-01-01T06:15Z", "2012-01-31T04:10Z", "2012-03-01T01:22Z", "2012-03-30T19:41Z", "2012-04-29T09:58Z", "2012-05-28T20:16Z", "2012-06-27T03:30Z", "2012-07-26T08:56Z", "2012-08-24T13:54Z", "2012-09-22T19:41Z", "2012-10-22T03:32Z", "2012-11-20T14:31Z", "2012-12-20T05:19Z", "2013-01-18T23:45Z", "2013-02-17T20:31Z", "2013-03-19T17:27Z", "2013-04-18T12:31Z", "2013-05-18T04:35Z", "2013-06-16T17:24Z", "2013-07-16T03:18Z", "2013-08-14T10:56Z", "2013-09-12T17:08Z", "2013-10-11T23:02Z", "2013-11-10T05:57Z", "2013-12-09T15:12Z", "2014-01-08T03:39Z", "2014-02-06T19:22Z", "2014-03-08T13:27Z", "2014-04-07T08:31Z", "2014-05-07T03:15Z", "2014-06-05T20:39Z", "2014-07-05T11:59Z", "2014-08-04T00:50Z", "2014-09-02T11:11Z", "2014-10-01T19:33Z", "2014-10-31T02:48Z", "2014-11-29T10:06Z", "2014-12-28T18:31Z", "2015-01-27T04:48Z", "2015-02-25T17:14Z", "2015-03-27T07:43Z", "2015-04-25T23:55Z", "2015-05-25T17:19Z", "2015-06-24T11:03Z", "2015-07-24T04:04Z", "2015-08-22T19:31Z", "2015-09-21T08:59Z", "2015-10-20T20:31Z", "2015-11-19T06:27Z", "2015-12-18T15:14Z", "2016-01-16T23:26Z", "2016-02-15T07:46Z", "2016-03-15T17:03Z", "2016-04-14T03:59Z", "2016-05-13T17:02Z", "2016-06-12T08:10Z", "2016-07-12T00:52Z", "2016-08-10T18:21Z", "2016-09-09T11:49Z", "2016-10-09T04:33Z", "2016-11-07T19:51Z", "2016-12-07T09:03Z", "2017-01-05T19:47Z", "2017-02-04T04:19Z", "2017-03-05T11:32Z", "2017-04-03T18:39Z", "2017-05-03T02:47Z", "2017-06-01T12:42Z", "2017-07-01T00:51Z", "2017-07-30T15:23Z", "2017-08-29T08:13Z", "2017-09-28T02:54Z", "2017-10-27T22:22Z", "2017-11-26T17:03Z", "2017-12-26T09:20Z", "2018-01-24T22:20Z", "2018-02-23T08:09Z", "2018-03-24T15:35Z", "2018-04-22T21:46Z", "2018-05-22T03:49Z", "2018-06-20T10:51Z", "2018-07-19T19:52Z", "2018-08-18T07:49Z", "2018-09-16T23:15Z", "2018-10-16T18:02Z", "2018-11-15T14:54Z", "2018-12-15T11:49Z"];
    last_quarter_array = ["2008-01-30T05:03Z", "2008-02-29T02:18Z", "2008-03-29T21:47Z", "2008-04-28T14:12Z", "2008-05-28T02:57Z", "2008-06-26T12:10Z", "2008-07-25T18:42Z", "2008-08-23T23:50Z", "2008-09-22T05:04Z", "2008-10-21T11:55Z", "2008-11-19T21:31Z", "2008-12-19T10:29Z", "2009-01-18T02:46Z", "2009-02-16T21:37Z", "2009-03-18T17:47Z", "2009-04-17T13:36Z", "2009-05-17T07:26Z", "2009-06-15T22:15Z", "2009-07-15T09:53Z", "2009-08-13T18:55Z", "2009-09-12T02:16Z", "2009-10-11T08:56Z", "2009-11-09T15:56Z", "2009-12-09T00:13Z", "2010-01-07T10:40Z", "2010-02-05T23:49Z", "2010-03-07T15:42Z", "2010-04-06T09:37Z", "2010-05-06T04:15Z", "2010-06-04T22:13Z", "2010-07-04T14:35Z", "2010-08-03T04:59Z", "2010-09-01T17:22Z", "2010-10-01T03:52Z", "2010-10-30T12:46Z", "2010-11-28T20:36Z", "2010-12-28T04:18Z", "2011-01-26T12:57Z", "2011-02-24T23:26Z", "2011-03-26T12:07Z", "2011-04-25T02:47Z", "2011-05-24T18:52Z", "2011-06-23T11:48Z", "2011-07-23T05:02Z", "2011-08-21T21:55Z", "2011-09-20T13:39Z", "2011-10-20T03:30Z", "2011-11-18T15:09Z", "2011-12-18T00:48Z", "2012-01-16T09:08Z", "2012-02-14T17:04Z", "2012-03-15T01:25Z", "2012-04-13T10:50Z", "2012-05-12T21:47Z", "2012-06-11T10:41Z", "2012-07-11T01:48Z", "2012-08-09T18:55Z", "2012-09-08T13:15Z", "2012-10-08T07:33Z", "2012-11-07T00:36Z", "2012-12-06T15:32Z", "2013-01-05T03:58Z", "2013-02-03T13:56Z", "2013-03-04T21:53Z", "2013-04-03T04:37Z", "2013-05-02T11:14Z", "2013-05-31T18:58Z", "2013-06-30T04:54Z", "2013-07-29T17:43Z", "2013-08-28T09:35Z", "2013-09-27T03:56Z", "2013-10-26T23:41Z", "2013-11-25T19:28Z", "2013-12-25T13:48Z", "2014-01-24T05:19Z", "2014-02-22T17:15Z", "2014-03-24T01:46Z", "2014-04-22T07:52Z", "2014-05-21T12:59Z", "2014-06-19T18:39Z", "2014-07-19T02:08Z", "2014-08-17T12:26Z", "2014-09-16T02:05Z", "2014-10-15T19:12Z", "2014-11-14T15:16Z", "2014-12-14T12:51Z", "2015-01-13T09:47Z", "2015-02-12T03:50Z", "2015-03-13T17:48Z", "2015-04-12T03:44Z", "2015-05-11T10:36Z", "2015-06-09T15:42Z", "2015-07-08T20:24Z", "2015-08-07T02:03Z", "2015-09-05T09:54Z", "2015-10-04T21:06Z", "2015-11-03T12:24Z", "2015-12-03T07:40Z", "2016-01-02T05:30Z", "2016-02-01T03:28Z", "2016-03-01T23:11Z", "2016-03-31T15:17Z", "2016-04-30T03:29Z", "2016-05-29T12:12Z", "2016-06-27T18:19Z", "2016-07-26T23:00Z", "2016-08-25T03:41Z", "2016-09-23T09:56Z", "2016-10-22T19:14Z", "2016-11-21T08:33Z", "2016-12-21T01:56Z", "2017-01-19T22:14Z", "2017-02-18T19:33Z", "2017-03-20T15:58Z", "2017-04-19T09:57Z", "2017-05-19T00:33Z", "2017-06-17T11:33Z", "2017-07-16T19:26Z", "2017-08-15T01:15Z", "2017-09-13T06:25Z", "2017-10-12T12:25Z", "2017-11-10T20:37Z", "2017-12-10T07:51Z", "2018-01-08T22:25Z", "2018-02-07T15:54Z", "2018-03-09T11:20Z", "2018-04-08T07:18Z", "2018-05-08T02:09Z", "2018-06-06T18:32Z", "2018-07-06T07:51Z", "2018-08-04T18:18Z", "2018-09-03T02:37Z", "2018-10-02T09:45Z", "2018-10-31T16:40Z", "2018-11-30T00:19Z", "2018-12-29T09:34Z"];



    self.update_moon_calculations = function() {
        /*
            Generate all Moon data ready for display.
        */

        var currDate = (new Date().getTime()) / 1000;

        var SECONDS_PER_DAY = 86400;
        var last_new_moon_sec = last_new_moon_sec_at_time(currDate);
        var next_new_moon_sec = next_new_moon_sec_at_time(currDate);
        var last_full_moon_sec = last_full_moon_sec_at_time(currDate);
        var next_full_moon_sec = next_full_moon_sec_at_time(currDate);
        var last_quarter_moon_sec = last_quarter_moon_sec_at_time(currDate);
        var next_quarter_moon_sec = next_quarter_moon_sec_at_time(currDate);

        /* Calculate phase percent of Moon based on nearest two data values */
        if (next_full_moon_sec <= next_new_moon_sec) {
            if (next_quarter_moon_sec <= next_full_moon_sec) {
                self.phase_of_moon = (last_new_moon_sec / (last_new_moon_sec + next_quarter_moon_sec)) * 0.25;
            } else {
                self.phase_of_moon = (last_quarter_moon_sec / (last_quarter_moon_sec + next_full_moon_sec)) * 0.25 + 0.25;
            }
        } else {
            if (next_quarter_moon_sec <= next_new_moon_sec) {
                self.phase_of_moon = (last_full_moon_sec / (last_full_moon_sec + next_quarter_moon_sec)) * 0.25 + 0.5;
            } else {
                self.phase_of_moon = (last_quarter_moon_sec / (last_quarter_moon_sec + next_new_moon_sec)) * 0.25 + 0.75;
            }
        }

        /* Generate interesting human readable values */
        self.percent_of_full_moon = (Math.cos(((self.phase_of_moon + 0.5) / 0.5 * Math.PI)) + 1) * 0.5;
        self.julian_date = 2452135 + ((currDate - 997700400) / SECONDS_PER_DAY);
        self.lunation = lunation_at_time(currDate);
        var day_with_fraction = last_new_moon_sec / SECONDS_PER_DAY;
        self.days_old = Math.floor(day_with_fraction);
        self.hours_old = Math.floor((day_with_fraction - self.days_old) * 24);
        self.minutes_old = Math.floor((((day_with_fraction - self.days_old) * 24) - self.hours_old) * 60);
        self.days_until_new_moon = next_new_moon_sec / SECONDS_PER_DAY;
        self.next_new_moon_date = currDate + next_new_moon_sec - correct_for_tz_and_dst(currDate + next_new_moon_sec);
        self.days_until_full_moon = next_full_moon_sec / SECONDS_PER_DAY;
        self.next_full_moon_date = currDate + next_full_moon_sec - correct_for_tz_and_dst(currDate + next_full_moon_sec);

        /* Eclipse information */
        self.next_lunar_eclipse_sec = next_lunar_eclipse_sec_at_time(currDate);
        var next_solar_eclipse_sec = next_solar_eclipse_sec_at_time(currDate);
        self.last_lunar_eclipse_sec = last_lunar_eclipse_sec_at_time(currDate);
        self.days_until_lunar_eclipse = self.next_lunar_eclipse_sec / SECONDS_PER_DAY;
        self.next_lunar_eclipse_date = currDate + self.next_lunar_eclipse_sec - correct_for_tz_and_dst(currDate + self.next_lunar_eclipse_sec);
        self.days_until_solar_eclipse = next_solar_eclipse_sec / SECONDS_PER_DAY;
        self.next_solar_eclipse_date = currDate + next_solar_eclipse_sec - correct_for_tz_and_dst(currDate + next_solar_eclipse_sec);

        /* Selenographic terminator longitude */
        var selenographic_tmp = 270 + (self.phase_of_moon * 360);
        if (selenographic_tmp >= 360) {
            selenographic_tmp -= 360;
        }
        if (selenographic_tmp >= 270) {
            selenographic_tmp -= 360;
        } else if (selenographic_tmp >= 180) {
            selenographic_tmp -= 180;
        } else if (selenographic_tmp >= 90) {
            selenographic_tmp -= 180;
        }
        selenographic_tmp = -selenographic_tmp;
        if (selenographic_tmp < 0) {
            self.west_or_east = "west";
        } else {
            self.west_or_east = "east";
        }
        self.selenographic_deg = Math.abs(selenographic_tmp);
        if (self.phase_of_moon >= 0.5) {
            self.rise_or_set = "Sunset";
        } else {
            self.rise_or_set = "Sunrise";
        }
    };


    function correct_for_tz_and_dst(date_sec_of_event) {
        /*
            Time-zone and/or daylight-saving correction (internal data is UTC).
        */

        return currOffset;
        // if (time.daylight === 0 || time.localtime(date_sec_of_event)[8] === 0) {
        //     /* Time-zone correction */
        //     return time.timezone;
        // } else {
        //     /* Time-zone & daylight saving correction */
        //     return time.altzone;
        // }
    }


    self.moon_phase_name = function() {
        /*
            Return the moon image name for a given phase value.
        */

        if (self.phase_of_moon >= 0 && self.phase_of_moon < 0.025) {
            return "phase-0";
            // return "New Moon";
        } else if (self.phase_of_moon >= 0.025 && self.phase_of_moon < 0.225) {
            return "phase-1";
            // return "Waxing Crescent";
        } else if (self.phase_of_moon >= 0.225 && self.phase_of_moon < 0.275) {
            return "phase-2";
            // return "First Quarter";
        } else if (self.phase_of_moon >= 0.275 && self.phase_of_moon < 0.475) {
            return "phase-3";
            // return "Waxing Gibbous";
        } else if (self.phase_of_moon >= 0.475 && self.phase_of_moon < 0.525) {
            return "phase-4";
            // return "Full Moon";
        } else if (self.phase_of_moon >= 0.525 && self.phase_of_moon < 0.735) {
            return "phase-5";
            // return "Waning Gibbous";
        } else if (self.phase_of_moon >= 0.735 && self.phase_of_moon < 0.775) {
            return "phase-6";
            // return "Last Quarter";
        } else if (self.phase_of_moon >= 0.775 && self.phase_of_moon < 0.975) {
            return "phase-7";
            // return "Waning Crescent";
        } else {
            return "phase-0";
            // return "New Moon";
        }
    };


    function next_full_moon_sec_at_time(now) {
        /*
            Return seconds to the next Full Moon.
        */

        var next;
        for (var i = 0; i < full_moon_array.length; i++) {
            var date_string = full_moon_array[i];
            next = Date.parse(date_string.slice(0, -1)) / 1000 + currOffset;
            if (next >= now) {
                break;
            }
        }
        return next - now;
    }


    function next_new_moon_sec_at_time(now) {
        /*
            Return seconds to the next New Moon.
        */

        var next;
        for (var i = 0; i < new_moon_array.length; i++) {
            var date_string = new_moon_array[i];
            next = Date.parse(date_string.slice(0, -1)) / 1000 + currOffset;
            if (next >= now) {
                break;
            }
        }
        return next - now;
    }


    function next_quarter_moon_sec_at_time(now) {
        /*
            Return seconds to the next Quater Moon phase (could be First or Last).
        */

        var next1, next2;
        for (var i = 0; i < first_quarter_array.length; i++) {
            var date_string = first_quarter_array[i];
            next1 = Date.parse(date_string) / 1000 + currOffset;
            if (next1 >= now) {
                break;
            }
        }
        for (var i = 0; i < last_quarter_array.length; i++) {
            var date_string = last_quarter_array[i];
            next2 = Date.parse(date_string) / 1000 + currOffset;
            if (next2 >= now) {
                break;
            }
        }
        var next = Math.min(next1, next2);
        return next - now;
    }


    function last_full_moon_sec_at_time(now) {
        /*
            Return (positive) seconds since the last Full Moon.
        */

        var last;
        for (var i = 0; i < full_moon_array.length; i++) {
            var date_string = full_moon_array[i];
            var then = Date.parse(date_string.slice(0, -1)) / 1000 + currOffset;
            if (then >= now) {
                break;
            }
            last = then;
        }
        return now - last;
    }


    function last_new_moon_sec_at_time(now) {
        /*
            Return (positive) seconds since the last New Moon.
        */

        var last;
        for (var i = 0; i < new_moon_array.length; i++) {
            var date_string = new_moon_array[i];
            var then = Date.parse(date_string.slice(0, -1)) / 1000 + currOffset;
            if (then >= now) {
                break;
            }
            last = then;
        }
        return now - last;
    }


    function last_quarter_moon_sec_at_time(now) {
        /*
            Return (positive) seconds to the last Quater Moon phase (could be First or Last).
        */

        var last1, last2;
        for (var i = 0; i < first_quarter_array.length; i++) {
            var date_string = first_quarter_array[i];
            var then = Date.parse(date_string) / 1000 + currOffset;
            if (then >= now) {
                break;
            }
            last1 = then;
        }
        for (var i = 0; i < last_quarter_array.length; i++) {
            var date_string = last_quarter_array[i];
            var then = Date.parse(date_string) / 1000 + currOffset;
            if (then >= now) {
                break;
            }
            last2 = then;
        }
        var last = Math.max(last1, last2);
        return now - last;
    }


    function lunation_at_time(now) {
        /*
            Return lunation number, 0 started on Dec 18, 1922, current data set starts as 2008
        */

        self.lunation = 1051;
        for (var i = 0; i < new_moon_array.length; i++) {
            var date_string = new_moon_array[i];
            var next = Date.parse(date_string.slice(0, -1)) / 1000 + currOffset;
            if (next >= now) {
                break;
            }
            self.lunation += 1;
        }
        return self.lunation;
    }


    function next_lunar_eclipse_sec_at_time(now) {
        /*
            Return (positive) seconds to the next Lunar eclipe or -1.
        */

        for (var i = 0; i < full_moon_array.length; i++) {
            var date_string = full_moon_array[i];
            if (date_string.slice(-1) !== "_") {
                var next = Date.parse(date_string.slice(0, -1)) / 1000 + currOffset;
                if (next >= now) {
                    console.log(new Date(1000*next))
                    return next - now;
                }
            }
        }
        return -1;
    }


    function last_lunar_eclipse_sec_at_time(now) {
        /*
            Return (positive) seconds to the last Lunar eclipe or -1.
        */

        var last = -1;
        for (var i = 0; i < full_moon_array.length; i++) {
            var date_string = full_moon_array[i];
            if (date_string.slice(-1) !== "_") {
                var then = Date.parse(date_string.slice(0, -1)) / 1000 + currOffset;
                if (then >= now) {
                    break;
                }
                last = then;
            }
        }
        if (last === -1) {
            return -1;
        } else {
            return now - last;
        }
    }


    function next_solar_eclipse_sec_at_time(now) {
        /*
            Return (positive) seconds to the next Solar eclipe or -1.
        */

        for (var i = 0; i < new_moon_array.length; i++) {
            var date_string = new_moon_array[i];
            if (date_string.slice(-1) !== "_") {
                var next = Date.parse(date_string.slice(0, -1)) / 1000 + currOffset;
                if (next >= now) {
                    return next - now;
                }
            }
        }
        return -1;
    }

    return self;
});
