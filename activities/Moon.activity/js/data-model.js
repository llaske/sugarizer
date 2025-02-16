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
        Init hard coded, tuples for New, First Quarter, Full Last
        Quarter Moon UTC data.

        T2018 to T2028 data from
        http://sunearth.gsfc.nasa.gov/eclipse/phase/phasecat.html (now
        only found on web.archive.org) algorithms used in predicting
        the phases of the Moon and eclipses are based on Jean Meeus'
        Astronomical Algorithms (Willmann-Bell, Inc.,T1998). All
        calculations are by Fred Espenak, and he assumes full
        responsibility for their accuracy. Permission is freely
        granted to reproduce this data when accompanied by an
        acknowledgment.

        Data is all UTC and in YYYY-MM-DD HH:MM format, with New and
        Full Moon arrays with an extra end character for eclipse types
        T=Total (Solar), A=Annular (Solar), H=Hybrid (Solar
        Annular/Total), P=Partial (Solar), t=Total (Lunar Umbral),
        p=Partial (Lunar Umbral), n=Penumbral (Lunar), _=none.
    */

        new_moon_array = ["2025-01-29T17:35Z_","2025-02-28T05:44Z_","2025-03-29T15:57Z","2025-04-28T00:31Z_","2025-05-27T08:02Z_","2025-06-25T15:31Z_","2025-07-25T00:11Z_","2025-08-23T11:06Z_","2025-09-22T00:54Z",    "2025-10-21T17:25Z_","2025-11-20T11:47Z_","2025-12-20T06:43Z_", "2026-01-18T19:52Z_","2026-02-17T12:01Z_","2026-03-19T01:23Z_","2026-04-17T11:52Z_","2026-05-16T20:01Z_","2026-06-15T02:54Z_","2026-07-14T09:43Z_","2026-08-12T17:37Z_","2026-09-11T03:27Z_","2026-10-10T15:50Z_","2026-11-09T07:02Z_","2026-12-09T00:52Z_","2027-01-08T12:00Z_","2027-02-06T02:43Z_","2027-03-07T15:15Z_","2027-04-06T22:30Z_","2027-05-06T06:10Z_","2027-06-05T14:05Z_","2027-07-04T21:50Z_","2027-08-02T10:00Z_","2027-09-01T18:30Z_","2027-10-31T01:20Z_","2027-11-29T11:45Z_","2027-12-29T20:00Z_","2028-01-26T05:30Z_","2028-02-25T17:30Z_","2028-03-27T06:00Z_","2028-04-24T18:00Z_","2028-05-24T05:00Z_","2028-06-22T14:30Z_","2028-07-22T03:00Z_","2028-08-20T12:00Z_","2028-09-18T21:00Z_","2028-10-18T07:30Z_","2028-11-16T16:00Z_","2028-12-16T01:00Z_","2029-01-15T10:00Z_","2029-02-13T00:30Z_","2029-03-15T12:00Z_","2029-04-14T23:45Z_","2029-05-14T09:30Z_","2029-06-12T19:15Z_","2029-07-12T05:00Z_","2029-08-10T14:00Z_","2029-09-09T00:45Z_","2029-10-08T11:30Z_","2029-11-07T21:15Z_","2029-12-07T07:00Z_","2030-01-08T11:00Z_","2030-02-07T00:30Z_","2030-03-09T10:00Z_","2030-04-08T20:30Z_","2030-05-08T07:30Z_","2030-06-01T00:00Z_","2030-07-01T10:30Z_","2030-07-31T20:00Z_","2030-08-30T06:00Z_","2030-09-28T17:30Z_","2030-11-25T00:00Z_","2030-12-25T09:30Z_","2031-01-08T11:00Z_","2031-02-07T00:30Z_","2031-03-09T10:00Z_","2031-04-08T20:30Z_","2031-05-21T00:00Z_","2031-06-07T07:30Z_","2031-07-07T17:00Z_","2031-08-06T02:30Z_","2031-09-04T12:00Z_","2031-10-04T22:00Z_","2031-11-14T00:00Z_","2031-12-14T09:30Z_","2032-01-08T11:00Z_","2032-02-07T00:30Z_","2032-03-09T10:00Z_","2032-04-08T20:30Z_","2032-05-09T00:00Z_","2032-06-08T08:30Z_","2032-07-08T18:00Z_","2032-08-07T03:30Z_","2032-09-05T13:00Z_","2032-10-05T00:00Z_","2032-11-03T00:00Z_","2032-12-03T09:30Z_"];
        full_moon_array = ["2025-01-13T22:26Z_","2025-02-12T13:53Z_","2025-03-14T06:54Z","2025-04-13T00:22Z_","2025-05-12T14:55Z_","2025-06-11T07:43Z_","2025-07-10T20:36Z_","2025-08-09T07:55Z_","2025-09-07T06:08Z","2025-10-07T03:47Z_","2025-11-05T01:19Z_","2025-12-04T23:14Z_", "2026-01-03T10:03Z_","2026-02-01T22:09Z_","2026-03-03T11:38Z_","2026-04-02T02:12Z_","2026-05-01T17:23Z_","2026-05-31T08:45Z_","2026-06-29T23:57Z_","2026-07-29T14:36Z_","2026-08-28T04:18Z_","2026-09-26T16:49Z_","2026-10-26T04:12Z_","2026-11-24T14:53Z_","2026-12-24T01:28Z_","2027-01-22T00:30Z_","2027-02-20T08:15Z_","2027-03-22T16:45Z_","2027-04-21T02:10Z_","2027-05-21T10:00Z_","2027-06-20T17:50Z_","2027-07-20T01:30Z_","2027-08-18T09:20Z_","2027-09-17T17:05Z_","2027-10-17T03:40Z_","2027-11-15T12:25Z_","2027-12-15T20:10Z_","2028-01-10T22:00Z_","2028-02-09T10:30Z_","2028-03-10T00:15Z_","2028-04-08T14:45Z_","2028-05-08T04:30Z_","2028-06-06T18:20Z_","2028-07-06T07:10Z_","2028-08-04T21:00Z_","2028-09-03T12:40Z_","2028-10-03T00:25Z_","2028-11-01T15:00Z_","2028-12-31T08:00Z_","2029-01-03T20:00Z_","2029-02-02T09:30Z_","2029-03-04T00:15Z_","2029-04-02T14:45Z_","2029-05-02T05:30Z_","2029-06-26T02:00Z_","2029-07-26T12:30Z_","2029-08-25T23:15Z_","2029-09-24T10:00Z_","2029-10-24T00:45Z_","2029-11-22T15:30Z_","2029-12-20T08:00Z_","2030-01-22T01:00Z_","2030-02-21T09:30Z_","2030-03-23T17:00Z_","2030-04-22T00:30Z_","2030-05-21T08:00Z_","2030-06-01T00:00Z_","2030-07-20T18:30Z_","2030-08-19T03:00Z_","2030-09-17T11:00Z_","2030-10-17T20:00Z_","2030-11-25T00:00Z_","2030-12-25T09:00Z_","2031-01-22T01:00Z_","2031-02-21T09:30Z_","2031-03-23T17:00Z_","2031-04-22T00:30Z_","2031-05-21T00:00Z_","2031-06-20T18:30Z_","2031-07-20T03:00Z_","2031-08-19T11:00Z_","2031-09-17T20:00Z_","2031-10-17T06:00Z_","2031-11-24T00:00Z_","2031-12-24T09:00Z_","2032-01-22T01:00Z_","2032-02-21T09:30Z_","2032-03-23T17:00Z_","2032-04-25T00:00Z_","2032-05-22T08:00Z_","2032-06-21T16:00Z_","2032-07-21T00:30Z_","2032-08-19T08:00Z_","2032-09-18T16:30Z_","2032-10-18T00:00Z_","2032-11-16T08:00Z_","2032-12-16T17:00Z_"];
        first_quarter_array = ["2025-01-06T23:56Z","2025-02-05T08:02Z","2025-03-06T16:31Z","2025-04-05T02:14Z","2025-05-04T13:51Z","2025-06-03T03:40Z","2025-07-02T19:30Z","2025-08-01T12:41Z","2025-09-29T23:53Z","2025-10-29T16:20Z","2025-11-28T06:58Z","2025-12-27T19:09Z",  "2026-01-26T04:47Z","2026-02-24T12:28Z","2026-03-25T19:18Z","2026-04-24T02:32Z","2026-05-23T11:11Z","2026-06-21T21:55Z","2026-07-21T11:06Z","2026-08-20T02:46Z","2026-09-18T20:44Z","2026-10-18T16:13Z","2026-11-17T11:48Z","2026-12-17T05:43Z","2027-01-06T23:56Z","2027-02-05T08:02Z","2027-03-06T16:31Z","2027-04-05T02:14Z","2027-05-04T13:51Z","2027-06-03T03:40Z","2027-07-02T19:30Z","2027-08-01T12:41Z","2027-09-29T23:53Z","2027-10-29T16:20Z","2027-11-28T06:58Z","2027-12-27T19:09Z","2028-01-06T23:56Z","2028-02-05T08:02Z","2028-03-06T16:31Z","2028-04-05T02:14Z","2028-05-04T13:51Z","2028-06-03T03:40Z","2028-07-02T19:30Z","2028-08-01T12:41Z","2028-09-29T23:53Z","2028-10-29T16:20Z","2028-11-28T06:58Z","2028-12-27T19:09Z","2029-01-06T23:56Z","2029-02-05T08:02Z","2029-03-06T16:31Z","2029-04-05T02:14Z","2029-05-04T13:51Z","2029-06-03T03:40Z","2029-07-02T19:30Z","2029-08-01T12:41Z","2029-08-30T23:53Z","2029-09-29T16:20Z","2029-10-28T06:58Z","2029-11-27T19:09Z","2030-01-06T23:56Z","2030-02-05T08:02Z","2030-03-06T16:31Z","2030-04-05T02:14Z","2030-05-04T13:51Z","2030-06-03T03:40Z","2030-07-02T19:30Z","2030-08-01T12:41Z","2030-08-31T23:53Z","2030-09-30T16:20Z","2030-10-30T06:58Z","2030-11-29T19:09Z","2031-01-06T23:56Z","2031-02-05T08:02Z","2031-03-06T16:31Z","2031-04-05T02:14Z","2031-05-04T13:51Z","2031-06-03T03:40Z","2031-07-02T19:30Z","2031-08-01T12:41Z","2031-09-29T23:53Z","2031-10-29T16:20Z","2031-11-28T06:58Z","2031-12-27T19:09Z","2032-01-06T23:56Z","2032-02-05T08:02Z","2032-03-06T16:31Z","2032-04-05T02:14Z","2032-05-04T13:51Z","2032-06-03T03:40Z","2032-07-02T19:30Z","2032-08-01T12:41Z","2032-08-31T23:53Z","2032-09-30T16:20Z","2032-10-30T06:58Z","2032-11-29T19:09Z"];
        last_quarter_array = ["2025-01-21T20:30Z", "2025-02-20T05:32Z", "2025-03-22T11:29Z", "2025-04-21T01:35Z",  "2025-05-20T11:58Z","2025-06-18T19:19Z",  "2025-07-17T00:37Z", "2025-08-16T05:12Z","2025-09-14T10:32Z", "2025-10-13T18:12Z", "2025-11-12T05:28Z","2025-12-11T20:51Z",  "2026-01-10T15:48Z","2026-02-09T12:43Z","2026-03-11T09:39Z","2026-04-10T04:52Z","2026-05-09T21:10Z","2026-06-08T10:00Z","2026-07-07T19:29Z","2026-08-06T02:21Z","2026-09-04T07:51Z","2026-10-03T13:25Z","2026-11-01T20:28Z","2026-12-30T18:59Z","2027-01-21T20:30Z","2027-02-20T05:32Z","2027-03-22T11:29Z","2027-04-21T01:35Z","2027-05-20T11:58Z","2027-06-18T19:19Z","2027-07-17T00:37Z","2027-08-16T05:12Z","2027-09-14T10:32Z","2027-10-13T18:12Z","2027-11-12T05:28Z","2027-12-11T20:51Z","2028-01-21T20:30Z","2028-02-20T05:32Z","2028-03-22T11:29Z","2028-04-21T01:35Z","2028-05-20T11:58Z","2028-06-18T19:19Z","2028-07-17T00:37Z","2028-08-16T05:12Z","2028-09-14T10:32Z","2028-10-13T18:12Z","2028-11-12T05:28Z","2028-12-11T20:51Z","2029-01-21T20:30Z","2029-02-20T05:32Z","2029-03-22T11:29Z","2029-04-21T01:35Z","2029-05-20T11:58Z","2029-06-18T19:19Z","2029-07-17T00:37Z","2029-08-16T05:12Z","2029-09-14T10:32Z","2029-10-13T18:12Z","2029-11-12T05:28Z","2029-12-11T20:51Z","2030-01-21T20:30Z","2030-02-20T05:32Z","2030-03-22T11:29Z","2030-04-21T01:35Z","2030-05-20T11:58Z","2030-06-18T19:19Z","2030-07-17T00:37Z","2030-08-16T05:12Z","2030-09-14T10:32Z","2030-10-13T18:12Z","2030-11-12T05:28Z","2030-12-11T20:51Z","2031-01-21T20:30Z","2031-02-20T05:32Z","2031-03-22T11:29Z","2031-04-21T01:35Z","2031-05-20T11:58Z","2031-06-18T19:19Z","2031-07-17T00:37Z","2031-08-16T05:12Z","2031-09-14T10:32Z","2031-10-13T18:12Z","2031-11-12T05:28Z","2031-12-11T20:51Z","2032-01-21T20:30Z","2032-02-20T05:32Z","2032-03-22T11:29Z","2032-04-21T01:35Z","2032-05-20T11:58Z","2032-06-18T19:19Z","2032-07-17T00:37Z","2032-08-16T05:12Z","2032-09-14T10:32Z","2032-10-13T18:12Z","2032-11-12T05:28Z","2032-12-11T20:51Z"];
     


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
