// Copyright (C) 2015 Sam Parkinson

// This program is free software; you can redistribute it and/or
// modify it under the terms of the The GNU Affero General Public
// License as published by the Free Software Foundation; either
// version 3 of the License, or (at your option) any later version.
//
// You should have received a copy of the GNU Affero General Public
// License along with this library; if not, write to the Free Software
// Foundation, 51 Franklin Street, Suite 500 Boston, MA 02110-1335 USA
//


window.platform = {
    android: /Android/i.test(navigator.userAgent),
    FF:      /Firefox/i.test(navigator.userAgent),
    mobile:  /Mobi/i   .test(navigator.userAgent),
    tablet:  /Tablet/i .test(navigator.userAgent)
}

platform.androidWebkit = platform.android && !platform.FF;
platform.FFOS = platform.FF
            && (platform.mobile || platform.tablet)
            && !platform.android;
console.log('On platform: ', platform);


window.platformColor = {
    header: platform.FF? '#2584af' : '#2584af',  // 2.5B 5/10
    doHeaderShadow: !platform.FF,
    background: platform.FF? '#92b5c8' : '#92b5c8' // 2.5B 7/4
}

document.querySelector('meta[name=theme-color]')
        .content = platformColor.header;


function showButtonHighlight(x, y, r, event, scale, stage) {
    if (platform.FFOS) return {};
    return showMaterialHighlight(x, y, r, event, scale, stage);
}
