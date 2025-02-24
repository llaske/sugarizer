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

        new_moon_array = ["2025-01-29T12:37Z","2025-02-28T00:46Z","2025-03-29T11:00Z","2025-04-27T19:33Z","2025-05-27T03:04Z","2025-06-25T10:33Z","2025-07-24T19:12Z","2025-08-23T06:07Z","2025-09-21T19:54Z","2025-10-21T12:25Z","2025-11-20T06:48Z","2025-12-20T01:44Z","2026-01-18T03:30Z","2026-02-16T17:45Z","2026-03-18T06:37Z","2026-04-16T19:09Z","2026-05-16T07:50Z","2026-06-14T20:22Z","2026-07-15T08:14Z","2026-08-13T20:56Z","2026-09-12T09:41Z","2026-10-11T22:23Z","2026-11-10T10:55Z","2026-12-09T23:16Z","2027-01-08T06:30Z","2027-02-06T17:00Z","2027-03-08T04:45Z","2027-04-06T15:30Z","2027-05-06T03:15Z","2027-06-04T12:00Z","2027-07-04T00:00Z","2027-08-02T08:45Z","2027-09-01T17:30Z","2027-09-30T02:15Z","2027-10-29T10:00Z","2027-11-28T17:45Z","2028-01-06T10:00Z","2028-02-04T20:30Z","2028-03-05T07:15Z","2028-04-03T18:00Z","2028-05-03T03:45Z","2028-06-01T15:30Z","2028-06-30T02:15Z","2028-07-29T12:00Z","2028-08-27T23:45Z","2028-09-26T11:30Z","2028-10-26T00:15Z","2028-11-24T10:00Z","2028-12-24T01:45Z","2029-01-22T06:30Z","2029-02-20T16:00Z","2029-03-22T02:45Z","2029-04-20T14:30Z","2029-05-20T00:15Z","2029-06-18T11:00Z","2029-07-18T00:00Z","2029-08-16T09:45Z","2029-09-14T19:30Z","2029-10-14T04:15Z","2029-11-12T14:00Z","2029-12-12T00:45Z","2030-01-21T06:30Z","2030-02-19T16:00Z","2030-03-21T02:45Z","2030-04-19T14:30Z","2030-05-19T00:15Z","2030-06-17T11:00Z","2030-07-17T00:00Z","2030-08-15T09:45Z","2030-09-13T19:30Z","2030-10-13T04:15Z","2030-11-11T14:00Z","2030-12-11T00:45Z","2031-01-20T12:30Z","2031-02-18T22:00Z","2031-03-20T07:45Z","2031-04-18T19:30Z","2031-05-18T05:15Z","2031-06-16T16:00Z","2031-07-16T02:45Z","2031-08-14T12:30Z","2031-09-13T00:15Z","2031-10-12T09:00Z","2031-11-11T17:45Z","2031-12-11T03:30Z","2032-01-19T12:30Z","2032-02-18T00:00Z","2032-03-18T11:45Z","2032-04-17T23:30Z","2032-05-17T10:15Z","2032-06-15T20:00Z","2032-07-15T05:45Z","2032-08-13T15:30Z","2032-09-12T01:15Z","2032-10-11T09:00Z","2032-11-10T16:45Z","2032-12-10T02:30Z"];
        full_moon_array = ["2025-01-13T22:27Z","2025-02-12T13:54Z","2025-03-14T06:55Z","2025-04-13T00:23Z","2025-05-12T16:58Z","2025-06-11T07:46Z","2025-07-10T20:38Z","2025-08-09T07:57Z","2025-09-07T18:10Z","2025-10-07T03:48Z","2025-11-05T13:20Z","2025-12-04T23:15Z","2026-01-03T03:04Z","2026-02-01T03:10Z","2026-03-03T03:39Z","2026-04-01T07:13Z","2026-05-01T10:24Z","2026-06-11T12:46Z","2026-07-29T07:37Z","2026-08-27T09:19Z","2026-09-26T09:50Z","2026-10-25T09:13Z","2026-11-24T07:55Z","2026-12-23T06:29Z","2027-01-22T12:00Z","2027-02-20T03:00Z","2027-03-22T15:00Z","2027-04-21T05:30Z","2027-05-20T18:00Z","2027-06-19T10:00Z","2027-07-19T00:30Z","2027-08-17T12:00Z","2027-09-16T04:30Z","2027-10-15T18:00Z","2027-11-14T09:30Z","2027-12-14T00:00Z","2028-01-21T22:30Z","2028-02-20T12:00Z","2028-03-21T03:45Z","2028-04-19T18:15Z","2028-05-19T09:00Z","2028-06-18T00:30Z","2028-07-17T15:00Z","2028-08-16T07:45Z","2028-09-14T22:15Z","2028-10-14T13:00Z","2028-11-13T03:45Z","2028-12-12T18:30Z","2029-01-11T10:30Z","2029-02-09T02:15Z","2029-03-10T16:00Z","2029-04-09T07:45Z","2029-05-09T21:30Z","2029-06-08T13:15Z","2029-07-08T04:00Z","2029-08-06T18:45Z","2029-09-05T10:30Z","2029-10-05T02:15Z","2029-11-03T18:00Z","2029-12-03T09:45Z","2030-01-05T10:30Z","2030-02-04T02:15Z","2030-03-06T16:00Z","2030-04-05T07:45Z","2030-05-05T21:30Z","2030-06-04T13:15Z","2030-07-04T04:00Z","2030-08-02T18:45Z","2030-09-01T10:30Z","2030-09-30T02:15Z","2030-10-30T18:00Z","2030-11-29T09:45Z","2031-01-05T04:30Z","2031-02-03T18:15Z","2031-03-05T08:00Z","2031-04-03T21:45Z","2031-05-03T11:30Z","2031-06-02T01:15Z","2031-07-02T15:00Z","2031-07-31T04:45Z","2031-08-30T18:30Z","2031-09-29T08:15Z","2031-10-29T22:00Z","2031-11-28T11:45Z","2032-01-04T05:30Z","2032-02-03T19:15Z","2032-03-04T09:00Z","2032-04-02T22:45Z","2032-05-02T12:30Z","2032-06-01T02:15Z","2032-06-30T16:00Z","2032-07-30T05:45Z","2032-08-28T19:30Z","2032-09-27T09:15Z","2032-10-27T23:00Z","2032-11-26T12:45Z"];
        first_quarter_array = ["2025-01-06T23:57Z","2025-02-05T08:03Z","2025-03-06T16:33Z","2025-04-05T02:16Z","2025-05-04T13:53Z","2025-06-03T03:41Z","2025-07-02T19:30Z","2025-08-01T12:41Z","2025-08-31T06:25Z","2025-09-29T23:54Z","2025-10-29T16:22Z","2025-11-28T06:59Z","2025-12-27T19:10Z","2026-01-25T12:00Z","2026-02-24T03:00Z","2026-03-25T15:43Z","2026-04-24T04:15Z","2026-05-23T17:02Z","2026-06-23T05:28Z","2026-07-22T17:20Z","2026-08-22T06:03Z","2026-09-19T18:47Z","2026-10-20T07:35Z","2026-11-17T20:01Z","2026-12-18T08:28Z","2027-01-15T18:00Z","2027-02-14T06:00Z","2027-03-16T14:30Z","2027-04-14T02:00Z","2027-05-14T10:30Z","2027-06-12T19:00Z","2027-07-12T04:30Z","2027-08-10T13:00Z","2027-09-09T21:30Z","2027-10-09T06:00Z","2027-11-07T14:30Z","2027-12-07T23:00Z","2028-01-14T04:30Z","2028-02-12T18:00Z","2028-03-13T07:30Z","2028-04-11T21:00Z","2028-05-11T10:30Z","2028-06-10T00:00Z","2028-07-09T14:30Z","2028-08-08T04:00Z","2028-09-06T18:30Z","2028-10-06T09:00Z","2028-11-04T23:30Z","2028-12-04T14:00Z","2029-01-02T03:00Z","2029-01-31T14:45Z","2029-03-02T02:30Z","2029-03-31T13:15Z","2029-05-01T01:00Z","2029-05-30T11:45Z","2029-06-29T00:30Z","2029-07-28T11:15Z","2029-08-27T00:00Z","2029-09-26T10:45Z","2029-10-26T21:30Z","2029-11-24T08:15Z","2030-01-02T03:00Z","2030-01-31T14:45Z","2030-03-03T02:30Z","2030-04-02T13:15Z","2030-05-02T01:00Z","2030-05-31T11:45Z","2030-06-30T00:30Z","2030-07-29T11:15Z","2030-08-28T00:00Z","2030-09-26T12:45Z","2030-10-26T21:30Z","2030-11-25T08:15Z","2031-01-01T18:00Z","2031-01-31T05:45Z","2031-03-02T19:30Z","2031-04-01T08:15Z","2031-04-30T21:00Z","2031-05-30T09:45Z","2031-06-29T22:30Z","2031-07-29T11:15Z","2031-08-28T00:00Z","2031-09-26T12:45Z","2031-10-26T01:30Z","2031-11-25T14:15Z","2032-01-03T18:00Z","2032-01-31T05:45Z","2032-03-02T19:30Z","2032-04-01T08:15Z","2032-04-30T21:00Z","2032-05-30T09:45Z","2032-06-29T22:30Z","2032-07-29T11:15Z","2032-08-28T00:00Z","2032-09-26T12:45Z","2032-10-26T01:30Z","2032-11-24T14:15Z"];
        last_quarter_array = ["2025-01-21T20:32Z","2025-02-20T17:34Z","2025-03-22T11:29Z","2025-04-21T01:35Z","2025-05-20T11:58Z","2025-06-18T19:20Z","2025-07-18T00:37Z","2025-08-16T05:14Z","2025-09-14T10:35Z","2025-10-13T11:14Z","2025-11-12T05:29Z","2025-12-11T20:52Z","2026-01-11T05:20Z","2026-02-09T12:00Z","2026-03-10T21:21Z","2026-04-09T10:17Z","2026-05-08T22:45Z","2026-06-07T11:26Z","2026-07-08T23:22Z","2026-08-06T11:10Z","2026-09-05T00:32Z","2026-10-04T13:17Z","2026-11-04T01:19Z","2026-12-02T14:19Z","2027-01-29T00:30Z","2027-02-27T12:00Z","2027-03-29T03:00Z","2027-04-28T18:00Z","2027-05-28T07:30Z","2027-06-26T20:00Z","2027-07-26T10:30Z","2027-08-25T00:00Z","2027-09-23T13:00Z","2027-10-23T03:00Z","2027-11-21T16:30Z","2027-12-21T06:00Z","2028-01-28T19:00Z","2028-02-27T09:30Z","2028-03-28T00:00Z","2028-04-26T14:30Z","2028-05-26T05:00Z","2028-06-24T19:30Z","2028-07-24T10:00Z","2028-08-22T23:30Z","2028-09-21T15:00Z","2028-10-21T05:30Z","2028-11-19T20:00Z","2028-12-19T10:30Z","2029-01-16T15:00Z","2029-02-15T02:45Z","2029-03-17T20:30Z","2029-04-16T12:15Z","2029-05-16T04:00Z","2029-06-14T19:45Z","2029-07-14T11:30Z","2029-08-13T03:15Z","2029-09-12T18:00Z","2029-10-12T09:45Z","2029-11-10T01:30Z","2029-12-10T16:15Z","2030-01-16T15:00Z","2030-02-15T02:45Z","2030-03-17T20:30Z","2030-04-17T12:15Z","2030-05-17T04:00Z","2030-06-15T19:45Z","2030-07-15T11:30Z","2030-08-14T03:15Z","2030-09-12T18:00Z","2030-10-12T09:45Z","2030-11-10T01:30Z","2030-12-10T16:15Z","2031-01-15T12:00Z","2031-02-14T00:45Z","2031-03-16T13:30Z","2031-04-15T03:15Z","2031-05-15T16:00Z","2031-06-14T05:45Z","2031-07-14T19:30Z","2031-08-13T09:15Z","2031-09-11T22:00Z","2031-10-11T10:45Z","2031-11-10T23:30Z","2031-12-10T12:15Z","2032-01-15T12:00Z","2032-02-14T00:45Z","2032-03-15T13:30Z","2032-04-14T03:15Z","2032-05-14T16:00Z","2032-06-13T05:45Z","2032-07-13T19:30Z","2032-08-12T09:15Z","2032-09-10T22:00Z","2032-10-10T10:45Z","2032-11-09T23:30Z","2032-12-09T12:15Z"];
     


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
