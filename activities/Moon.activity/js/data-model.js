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

    new_moon_array = ["2018-01-17T02:17Z_", "2018-02-15T21:05ZP", "2018-03-17T13:12Z_", "2018-04-16T01:57Z_", "2018-05-15T11:48Z_", "2018-06-13T19:43Z_", "2018-07-13T02:48ZP", "2018-08-11T09:58ZP", "2018-09-09T18:01Z_", "2018-10-09T03:47Z_", "2018-11-07T16:02Z_", "2018-12-07T07:20Z_", "2019-01-06T01:28ZP", "2019-02-04T21:04Z_", "2019-03-06T16:04Z_", "2019-04-05T08:50Z_", "2019-05-04T22:45Z_", "2019-06-03T10:02Z_", "2019-07-02T19:16ZT", "2019-08-01T03:12Z_", "2019-08-30T10:37Z_", "2019-09-28T18:26Z_", "2019-10-28T03:38Z_", "2019-11-26T15:06Z_", "2019-12-26T05:13ZA", "2020-01-24T21:42Z_", "2020-02-23T15:32Z_", "2020-03-24T09:28Z_", "2020-04-23T02:26Z_", "2020-05-22T17:39Z_", "2020-06-21T06:41ZA", "2020-07-20T17:33Z_", "2020-08-19T02:41Z_", "2020-09-17T11:00Z_", "2020-10-16T19:31Z_", "2020-11-15T05:07Z_", "2020-12-14T16:17ZT", "2021-01-13T05:00Z_", "2021-02-11T19:06Z_", "2021-03-13T10:21Z_", "2021-04-12T02:31Z_", "2021-05-11T19:00Z_", "2021-06-10T10:53ZA", "2021-07-10T01:17Z_", "2021-08-08T13:50Z_", "2021-09-07T00:52Z_", "2021-10-06T11:05Z_", "2021-11-04T21:15Z_", "2021-12-04T07:43ZT", "2022-01-02T18:33Z_", "2022-02-01T05:46Z_", "2022-03-02T17:35Z_", "2022-04-01T06:24Z_", "2022-04-30T20:28ZP", "2022-05-30T11:30Z_", "2022-06-29T02:52Z_", "2022-07-28T17:55Z_", "2022-08-27T08:17Z_", "2022-09-25T21:54Z_", "2022-10-25T10:49ZP", "2022-11-23T22:57Z_", "2022-12-23T10:17Z_", "2023-01-21T20:53Z_", "2023-02-20T07:06Z_", "2023-03-21T17:23Z_", "2023-04-20T04:12ZH", "2023-05-19T15:53Z_", "2023-06-18T04:37Z_", "2023-07-17T18:32Z_", "2023-08-16T09:38Z_", "2023-09-15T01:40Z_", "2023-10-14T17:55ZA", "2023-11-13T09:27Z_", "2023-12-12T23:32Z_", "2024-01-11T11:57Z_", "2024-02-09T22:59Z_", "2024-03-10T09:00Z_", "2024-04-08T18:21ZT", "2024-05-08T03:22Z_", "2024-06-06T12:38Z_", "2024-07-05T22:57Z_", "2024-08-04T11:13Z_", "2024-09-03T01:55Z_", "2024-10-02T18:49ZA", "2024-11-01T12:47Z_", "2024-12-01T06:21Z_", "2024-12-30T22:27Z_"];
    full_moon_array = ["2018-01-02T02:24Z_", "2018-01-31T13:27Zt", "2018-03-02T00:51Z_", "2018-03-31T12:37Z_", "2018-04-30T00:58Z_", "2018-05-29T14:20Z_", "2018-06-28T04:53Z_", "2018-07-27T20:20Zt", "2018-08-26T11:56Z_", "2018-09-25T02:53Z_", "2018-10-24T16:45Z_", "2018-11-23T05:39Z_", "2018-12-22T17:49Z_", "2019-01-21T05:16Zt", "2019-02-19T15:53Z_", "2019-03-21T01:43Z_", "2019-04-19T11:12Z_", "2019-05-18T21:11Z_", "2019-06-17T08:31Z_", "2019-07-16T21:38Zp", "2019-08-15T12:29Z_", "2019-09-14T04:33Z_", "2019-10-13T21:08Z_", "2019-11-12T13:34Z_", "2019-12-12T05:12Z_", "2020-01-10T19:21Zn", "2020-02-09T07:33Z_", "2020-03-09T17:48Z_", "2020-04-08T02:35Z_", "2020-05-07T10:45Z_", "2020-06-05T19:12Zn", "2020-07-05T04:44Zn", "2020-08-03T15:59Z_", "2020-09-02T05:22Z_", "2020-10-01T21:05Z_", "2020-10-31T14:49Z_", "2020-11-30T09:30Zn", "2020-12-30T03:28Z_", "2021-01-28T19:16Z_", "2021-02-27T08:17Z_", "2021-03-28T18:48Z_", "2021-04-27T03:31Z_", "2021-05-26T11:14Zt", "2021-06-24T18:40Z_", "2021-07-24T02:37Z_", "2021-08-22T12:02Z_", "2021-09-20T23:55Z_", "2021-10-20T14:57Z_", "2021-11-19T08:58Zp", "2021-12-19T04:36Z_", "2022-01-17T23:49Z_", "2022-02-16T16:57Z_", "2022-03-18T07:17Z_", "2022-04-16T18:55Z_", "2022-05-16T04:14Zt", "2022-06-14T11:52Z_", "2022-07-13T18:37Z_", "2022-08-12T01:36Z_", "2022-09-10T09:59Z_", "2022-10-09T20:55Z_", "2022-11-08T11:02Zt", "2022-12-08T04:08Z_", "2023-01-06T23:08Z_", "2023-02-05T18:29Z_", "2023-03-07T12:40Z_", "2023-04-06T04:35Z_", "2023-05-05T17:34Zn", "2023-06-04T03:42Z_", "2023-07-03T11:39Z_", "2023-08-01T18:31Z_", "2023-08-31T01:35Z_", "2023-09-29T09:57Z_", "2023-10-28T20:24Zp", "2023-11-27T09:16Z_", "2023-12-27T00:33Z_", "2024-01-25T17:54Z_", "2024-02-24T12:30Z_", "2024-03-25T07:00Zn", "2024-04-23T23:49Z_", "2024-05-23T13:53Z_", "2024-06-22T01:08Z_", "2024-07-21T10:17Z_", "2024-08-19T18:26Z_", "2024-09-18T02:34Zp", "2024-10-17T11:26Z_", "2024-11-15T21:29Z_", "2024-12-15T09:02Z_"];
    first_quarter_array = ["2018-01-24T22:20Z", "2018-02-23T08:09Z", "2018-03-24T15:35Z", "2018-04-22T21:46Z", "2018-05-22T03:49Z", "2018-06-20T10:51Z", "2018-07-19T19:52Z", "2018-08-18T07:49Z", "2018-09-16T23:15Z", "2018-10-16T18:02Z", "2018-11-15T14:54Z", "2018-12-15T11:49Z", "2019-01-14T06:45Z", "2019-02-12T22:26Z", "2019-03-14T10:27Z", "2019-04-12T19:06Z", "2019-05-12T01:12Z", "2019-06-10T05:59Z", "2019-07-09T10:55Z", "2019-08-07T17:31Z", "2019-09-06T03:10Z", "2019-10-05T16:47Z", "2019-11-04T10:23Z", "2019-12-04T06:58Z", "2020-01-03T04:45Z", "2020-02-02T01:42Z", "2020-03-02T19:57Z", "2020-04-01T10:21Z", "2020-04-30T20:38Z", "2020-05-30T03:30Z", "2020-06-28T08:16Z", "2020-07-27T12:32Z", "2020-08-25T17:58Z", "2020-09-24T01:55Z", "2020-10-23T13:23Z", "2020-11-22T04:45Z", "2020-12-21T23:41Z", "2021-01-20T21:02Z", "2021-02-19T18:47Z", "2021-03-21T14:40Z", "2021-04-20T06:59Z", "2021-05-19T19:13Z", "2021-06-18T03:54Z", "2021-07-17T10:11Z", "2021-08-15T15:20Z", "2021-09-13T20:39Z", "2021-10-13T03:25Z", "2021-11-11T12:46Z", "2021-12-11T01:36Z", "2022-01-09T18:11Z", "2022-02-08T13:50Z", "2022-03-10T10:45Z", "2022-04-09T06:47Z", "2022-05-09T00:21Z", "2022-06-07T14:48Z", "2022-07-07T02:14Z", "2022-08-05T11:06Z", "2022-09-03T18:08Z", "2022-10-03T00:14Z", "2022-11-01T06:37Z", "2022-11-30T14:36Z", "2022-12-30T01:21Z", "2023-01-28T15:19Z", "2023-02-27T08:06Z", "2023-03-29T02:32Z", "2023-04-27T21:20Z", "2023-05-27T15:22Z", "2023-06-26T07:50Z", "2023-07-25T22:07Z", "2023-08-24T09:57Z", "2023-09-22T19:32Z", "2023-10-22T03:29Z", "2023-11-20T10:50Z", "2023-12-19T18:39Z", "2024-01-18T03:53Z", "2024-02-16T15:01Z", "2024-03-17T04:11Z", "2024-04-15T19:13Z", "2024-05-15T11:48Z", "2024-06-14T05:18Z", "2024-07-13T22:49Z", "2024-08-12T15:19Z", "2024-09-11T06:06Z", "2024-10-10T18:55Z", "2024-11-09T05:56Z", "2024-12-08T15:27Z"];
    last_quarter_array = ["2018-01-08T22:25Z", "2018-02-07T15:54Z", "2018-03-09T11:20Z", "2018-04-08T07:18Z", "2018-05-08T02:09Z", "2018-06-06T18:32Z", "2018-07-06T07:51Z", "2018-08-04T18:18Z", "2018-09-03T02:37Z", "2018-10-02T09:45Z", "2018-10-31T16:40Z", "2018-11-30T00:19Z", "2018-12-29T09:34Z", "2019-01-27T21:10Z", "2019-02-26T11:28Z", "2019-03-28T04:10Z", "2019-04-26T22:18Z", "2019-05-26T16:33Z", "2019-06-25T09:46Z", "2019-07-25T01:18Z", "2019-08-23T14:56Z", "2019-09-22T02:41Z", "2019-10-21T12:39Z", "2019-11-19T21:11Z", "2019-12-19T04:57Z", "2020-01-17T12:58Z", "2020-02-15T22:17Z", "2020-03-16T09:34Z", "2020-04-14T22:56Z", "2020-05-14T14:03Z", "2020-06-13T06:24Z", "2020-07-12T23:29Z", "2020-08-11T16:45Z", "2020-09-10T09:26Z", "2020-10-10T00:39Z", "2020-11-08T13:46Z", "2020-12-08T00:37Z", "2021-01-06T09:37Z", "2021-02-04T17:37Z", "2021-03-06T01:30Z", "2021-04-04T10:02Z", "2021-05-03T19:50Z", "2021-06-02T07:24Z", "2021-07-01T21:11Z", "2021-07-31T13:16Z", "2021-08-30T07:13Z", "2021-09-29T01:57Z", "2021-10-28T20:05Z", "2021-11-27T12:28Z", "2021-12-27T02:24Z", "2022-01-25T13:41Z", "2022-02-23T22:32Z", "2022-03-25T05:37Z", "2022-04-23T11:56Z", "2022-05-22T18:43Z", "2022-06-21T03:11Z", "2022-07-20T14:18Z", "2022-08-19T04:36Z", "2022-09-17T21:52Z", "2022-10-17T17:15Z", "2022-11-16T13:27Z", "2022-12-16T08:56Z", "2023-01-15T02:10Z", "2023-02-13T16:01Z", "2023-03-15T02:08Z", "2023-04-13T09:11Z", "2023-05-12T14:28Z", "2023-06-10T19:31Z", "2023-07-10T01:48Z", "2023-08-08T10:28Z", "2023-09-06T22:21Z", "2023-10-06T13:48Z", "2023-11-05T08:37Z", "2023-12-05T05:49Z", "2024-01-04T03:30Z", "2024-02-02T23:18Z", "2024-03-03T15:24Z", "2024-04-02T03:15Z", "2024-05-01T11:27Z", "2024-05-30T17:13Z", "2024-06-28T21:53Z", "2024-07-28T02:51Z", "2024-08-26T09:26Z", "2024-09-24T18:50Z", "2024-10-24T08:03Z", "2024-11-23T01:28Z", "2024-12-22T22:18Z"];



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
