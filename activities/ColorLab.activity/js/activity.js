define(["sugar-web/activity/activity", "sugar-web/env", "sugar-web/graphics/palette", "sugar-web/graphics/presencepalette", "l10n", "humane"], function (activity, env, palette, presencepalette, l10n, humane) {

    requirejs(['domReady!'], function (doc) {
        // --- Global State ---
        var state = {
            currentMode: 'free',
            isFullscreen: false,
            mainHue: 0,
            mainSaturation: 1.0,
            mainLightness: 0.5,
            currentHarmony: null,
            isDraggingWheel: false,
            isDraggingRing: false,
            isInitialState: true,
            redSliderFree: 255,
            greenSliderFree: 255,
            blueSliderFree: 255,
            challengeUserRgb: { r: 255, g: 255, b: 255 },
            challengeTargetRgb: { r: 100, g: 150, b: 200 },
            challengeSimilarity: 0,
            showWinOverlay: false,
            hasWon: false,
            ringSegments: [],
            challengeDifficulty: 'hard'
        };

        var xoLogo = '<?xml version="1.0" ?><!DOCTYPE svg  PUBLIC \'-//W3C//DTD SVG 1.1//EN\'  \'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\' [<!ENTITY stroke_color "#010101"><!ENTITY fill_color "#FFFFFF">]><svg enable-background="new 0 0 55 55" height="55px" version="1.1" viewBox="0 0 55 55" width="55px" x="0px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" y="0px"><g display="block" id="stock-xo_1_"><path d="M33.233,35.1l10.102,10.1c0.752,0.75,1.217,1.783,1.217,2.932   c0,2.287-1.855,4.143-4.146,4.143c-1.145,0-2.178-0.463-2.932-1.211L27.372,40.961l-10.1,10.1c-0.75,0.75-1.787,1.211-2.934,1.211   c-2.284,0-4.143-1.854-4.143-4.141c0-1.146,0.465-2.184,1.212-2.934l10.104-10.102L11.409,24.995   c-0.747-0.748-1.212-1.785-1.212-2.93c0-2.289,1.854-4.146,4.146-4.146c1.143,0,2.18,0.465,2.93,1.214l10.099,10.102l10.102-10.103   c0.754-0.749,1.787-1.214,2.934-1.214c2.289,0,4.146,1.856,4.146,4.145c0,1.146-0.467,2.18-1.217,2.932L33.233,35.1z" fill="&fill_color;" stroke="&stroke_color;" stroke-width="3.5"/><circle cx="27.371" cy="10.849" fill="&fill_color;" r="8.122" stroke="&stroke_color;" stroke-width="3.5"/></g></svg>';

        var generateXOLogoWithColor = function (color) {
            var coloredLogo = xoLogo;
            coloredLogo = coloredLogo.replace("#010101", color.stroke);
            coloredLogo = coloredLogo.replace("#FFFFFF", color.fill);
            return "data:image/svg+xml;base64," + btoa(coloredLogo);
        };

        var harmonyTypes = {
            'complementary': [0, 180],
            'split-complementary': [0, 150, 210],
            'analogous': [-30, 0, 30],
            'triadic': [0, 120, 240],
            'tetradic': [0, 60, 180, 240],
            'square': [0, 90, 180, 270]
        };

        var harmonyNames = {
            'complementary': 'Compl',
            'split-complementary': 'Split',
            'analogous': 'Analog',
            'triadic': 'Triadic',
            'tetradic': 'Tetrad',
            'square': 'Square'
        };

        // --- DOM Elements ---
        var elements = {};
        var modePalette; // Expose modePalette so we can close it on click
        var difficultyPalette;
        var elementIds = [
            'activity-button', 'network-button', 'mode-button', 'reset-toolbar-button',
            'stop-button', 'fullscreen-button', 'unfullscreen-button', 'help-button',
            'mode-dropdown', 'mode-options', 'harmony-dropdown-button', 'free-mode', 'challenge-mode', 'harmony-mode',
            'challenge-difficulty-button', 'difficulty-dropdown', 'difficulty-options',
            'harmony-wheel-inner', 'lightnessInterstitial', 'lightnessTrack',
            'harmony-swatches', 'color-name', 'mixing-bowl', 'ring-svg',
            'red-slider', 'green-slider', 'blue-slider',
            'red-minus', 'red-plus', 'green-minus', 'green-plus', 'blue-minus', 'blue-plus',
            'user-bowl', 'target-bowl', 'challenge-progress-circle', 'win-overlay',
            'challenge-red-slider', 'challenge-green-slider', 'challenge-blue-slider',
            'challenge-red-minus', 'challenge-red-plus', 'challenge-green-minus', 'challenge-green-plus', 'challenge-blue-minus', 'challenge-blue-plus',
            'left-panel', 'right-spacer', 'label-my-color', 'label-target', 'label-you-won',
            'red-val', 'green-val', 'blue-val', 'challenge-red-val', 'challenge-green-val', 'challenge-blue-val'
        ];

        function initElements() {
            elementIds.forEach(function (id) {
                elements[id] = document.getElementById(id);
            });
        }

        // --- Utility Functions ---
        function hslToRgb(h, s, l) {
            h = Number(h); s = Number(s); l = Number(l);
            h = ((h % 360) + 360) % 360 / 360;
            var r, g, b;
            if (s === 0) {
                r = g = b = l;
            } else {
                var hue2rgb = function (p, q, t) {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1 / 6) return p + (q - p) * 6 * t;
                    if (t < 1 / 2) return q;
                    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                };
                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }
            return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
        }

        function rgbToHex(rgb) {
            var r = Math.max(0, Math.min(255, Math.round(rgb.r)));
            var g = Math.max(0, Math.min(255, Math.round(rgb.g)));
            var b = Math.max(0, Math.min(255, Math.round(rgb.b)));
            return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
        }

        function rgbToHsl(r, g, b) {
            r /= 255; g /= 255; b /= 255;
            var max = Math.max(r, g, b), min = Math.min(r, g, b);
            var h = 0, s = 0, l = (max + min) / 2;
            if (max !== min) {
                var d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
            return { h: h, s: s, l: l };
        }

        function getColorName(angle, s, l) {
            angle = ((angle % 360) + 360) % 360;
            var colorNames = [
                { min: 0, max: 15, name: 'Red' }, { min: 15, max: 45, name: 'Orange' },
                { min: 45, max: 75, name: 'Yellow' }, { min: 75, max: 105, name: 'Lime' },
                { min: 105, max: 135, name: 'Green' }, { min: 135, max: 165, name: 'Teal' },
                { min: 165, max: 195, name: 'Cyan' }, { min: 195, max: 225, name: 'Sky' },
                { min: 225, max: 255, name: 'Blue' }, { min: 255, max: 285, name: 'Purple' },
                { min: 285, max: 315, name: 'Magenta' }, { min: 315, max: 345, name: 'Pink' },
                { min: 345, max: 360, name: 'Red' }
            ];
            var baseName = 'Red';
            for (var i = 0; i < colorNames.length; i++) {
                if (angle >= colorNames[i].min && angle < colorNames[i].max) { baseName = colorNames[i].name; break; }
            }

            var finalName = '';
            if (l < 0.1) {
                finalName = l10n.get('Black');
            } else if (l > 0.95) {
                finalName = l10n.get('White');
            } else if (s < 0.1) {
                if (l < 0.3) finalName = l10n.get('DarkGrey');
                else if (l > 0.7) finalName = l10n.get('LightGrey');
                else finalName = l10n.get('Grey');
            } else {
                var qualifier = '';
                if (l < 0.35) qualifier = 'dark';
                else if (l > 0.65) qualifier = 'light';

                var translatedBase = l10n.get(baseName);
                if (qualifier) {
                    finalName = qualifier + translatedBase.charAt(0).toUpperCase() + translatedBase.slice(1);
                } else {
                    finalName = translatedBase.charAt(0).toLowerCase() + translatedBase.slice(1);
                }
            }

            // Convert to strict camelCase
            return finalName.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
                return index === 0 ? word.toLowerCase() : word.toUpperCase();
            }).replace(/\s+/g, '');
        }

        // --- UI Update Logic ---
        function updateUI() {
            // Mode Visibility
            elements['free-mode'].style.display = state.currentMode === 'free' ? 'flex' : 'none';
            elements['challenge-mode'].style.display = state.currentMode === 'challenge' ? 'flex' : 'none';
            elements['harmony-mode'].style.display = state.currentMode === 'harmony' ? 'flex' : 'none';

            // Update Mode Button Icon
            elements['mode-button'].classList.remove('free-paint-icon', 'challenge-icon', 'harmony-icon');
            var currentIconUrl = 'url(icons/free-paint.svg)';

            if (state.currentMode === 'free') {
                elements['mode-button'].classList.add('free-paint-icon');
                elements['mode-button'].title = l10n.get('FreePaint') || 'Free Paint';
            } else if (state.currentMode === 'challenge') {
                elements['mode-button'].classList.add('challenge-icon');
                elements['mode-button'].title = l10n.get('ChallengeMode') || 'Challenge Mode';
                currentIconUrl = 'url(icons/challenge.svg)';
            } else if (state.currentMode === 'harmony') {
                elements['mode-button'].classList.add('harmony-icon');
                elements['mode-button'].title = l10n.get('Harmony') || 'Color Harmony';
                currentIconUrl = 'url(icons/harmony.svg)';
            }

            // Sugarizer's palette.js creates a cloned icon (.palette-invoker) to cover the button
            // when the dropdown opens. We must manually update its stored inline background image.
            if (typeof modePalette !== 'undefined' && modePalette.getPalette) {
                var invokerIcon = modePalette.getPalette().querySelector('.palette-invoker');
                if (invokerIcon) {
                    invokerIcon.style.backgroundImage = currentIconUrl;
                }
            }

            // Harmony Dropdown Button
            if (state.currentMode === 'harmony') {
                elements['harmony-dropdown-button'].style.display = 'inline-block';
            } else {
                elements['harmony-dropdown-button'].style.display = 'none';
            }

            // Challenge Difficulty Button
            if (state.currentMode === 'challenge') {
                elements['challenge-difficulty-button'].style.display = 'inline-block';
            } else {
                elements['challenge-difficulty-button'].style.display = 'none';
            }

            if (state.currentMode === 'free') {
                updateFreePaintUI();
            } else if (state.currentMode === 'challenge') {
                updateChallengeUI();
            } else if (state.currentMode === 'harmony') {
                updateHarmonyUI();
            }

            // Fullscreen
            elements['unfullscreen-button'].style.display = state.isFullscreen ? 'block' : 'none';
            document.body.classList.toggle('fullscreen-mode', state.isFullscreen);
            document.getElementById('main-toolbar').style.display = state.isFullscreen ? 'none' : 'flex';
        }

        function updateFreePaintUI() {
            var markerAngles = getMarkerAngles();

            // Mixing Bowl
            var bowlColor = '#ffffff';
            var bowlName = 'White';
            if (!state.isInitialState) {
                var r = 0, g = 0, b = 0, count = 0;
                markerAngles.forEach(function (angle) {
                    var rgb = hslToRgb(angle, state.mainSaturation, state.mainLightness);
                    r += rgb.r; g += rgb.g; b += rgb.b; count++;
                });
                if (count > 0) {
                    var avgR = Math.round(r / count);
                    var avgG = Math.round(g / count);
                    var avgB = Math.round(b / count);
                    bowlColor = rgbToHex({ r: avgR, g: avgG, b: avgB });
                    var hsl = rgbToHsl(avgR, avgG, avgB);
                    bowlName = getColorName(hsl.h * 360, hsl.s, hsl.l);
                }
            }
            elements['color-name'].textContent = bowlName;
            elements['mixing-bowl'].style.backgroundColor = bowlColor;

            // Sliders
            elements['red-slider'].value = state.redSliderFree;
            elements['green-slider'].value = state.greenSliderFree;
            elements['blue-slider'].value = state.blueSliderFree;
            elements['red-val'].textContent = state.redSliderFree;
            elements['green-val'].textContent = state.greenSliderFree;
            elements['blue-val'].textContent = state.blueSliderFree;
        }

        function updateHarmonyUI() {
            var markerAngles = getMarkerAngles();

            // Wheel Markers
            elements['harmony-wheel-inner'].innerHTML = '';
            var maxRadiusPercent = 45.789;
            var currentRadiusPercent = state.mainSaturation * maxRadiusPercent;

            markerAngles.forEach(function (angle, index) {
                var marker = document.createElement('div');
                marker.className = 'harmony-marker ' + (index === 0 ? 'main-marker' : 'split-marker-' + index);

                // Color the marker itself
                var rgb = hslToRgb(angle, state.mainSaturation, state.mainLightness);
                var hex = rgbToHex(rgb);
                marker.style.backgroundColor = hex;
                marker.style.borderColor = '#ffffff'; // White stroke

                var rad = (angle - 90) * Math.PI / 180;
                var top = 50 + currentRadiusPercent * Math.sin(rad);
                var left = 50 + currentRadiusPercent * Math.cos(rad);
                marker.style.top = top + '%';
                marker.style.left = left + '%';
                marker.style.transform = 'translate(-50%, -50%)';

                elements['harmony-wheel-inner'].appendChild(marker);
            });

            // Lightness Track
            elements['lightnessInterstitial'].style.transform = 'rotate(' + (state.mainLightness * 360) + 'deg)';

            // Swatches
            elements['harmony-swatches'].innerHTML = '';
            markerAngles.forEach(function (angle, index) {
                var swatch = document.createElement('div');
                swatch.className = 'harmony-swatch';
                var rgb = hslToRgb(angle, state.mainSaturation, state.mainLightness);
                var hex = rgbToHex(rgb);
                swatch.style.backgroundColor = hex;
                var yiq = ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000;
                swatch.style.color = yiq >= 128 ? '#000000' : '#ffffff';
                swatch.textContent = getColorName(angle, state.mainSaturation, state.mainLightness);
                elements['harmony-swatches'].appendChild(swatch);
            });

            // Highlight active harmony option
            var options = elements['harmony-options'].querySelectorAll('.harmony-option');
            options.forEach(function (opt) {
                if (opt.dataset.harmony === state.currentHarmony) {
                    opt.classList.add('active');
                } else {
                    opt.classList.remove('active');
                }
            });
        }

        function updateChallengeDifficultyUI() {
            if (!elements['difficulty-options']) return;
            var options = elements['difficulty-options'].querySelectorAll('.difficulty-option');
            options.forEach(function (opt) {
                if (opt.dataset.difficulty === state.challengeDifficulty) {
                    opt.classList.add('active');
                    // Add checkmark visual indicator
                    opt.innerHTML = '<span>' + (l10n.get(opt.dataset.difficulty.charAt(0).toUpperCase() + opt.dataset.difficulty.slice(1)) || opt.dataset.difficulty) + ' ✔</span>';
                } else {
                    opt.classList.remove('active');
                    opt.innerHTML = '<span>' + (l10n.get(opt.dataset.difficulty.charAt(0).toUpperCase() + opt.dataset.difficulty.slice(1)) || opt.dataset.difficulty) + '</span>';
                }
            });
        }

        function updateChallengeUI() {
            updateChallengeDifficultyUI();
            elements['user-bowl'].style.backgroundColor = rgbToHex(state.challengeUserRgb);
            elements['target-bowl'].style.backgroundColor = rgbToHex(state.challengeTargetRgb);

            var radius = 190;
            var circumference = 2 * Math.PI * radius;
            var offset = circumference - (state.challengeSimilarity * circumference);
            elements['challenge-progress-circle'].style.strokeDasharray = circumference + ' ' + circumference;
            elements['challenge-progress-circle'].style.strokeDashoffset = offset;

            var step = getChallengeStep(state.challengeDifficulty);
            elements['challenge-red-slider'].step = step;
            elements['challenge-green-slider'].step = step;
            elements['challenge-blue-slider'].step = step;

            elements['challenge-red-slider'].value = state.challengeUserRgb.r;
            elements['challenge-green-slider'].value = state.challengeUserRgb.g;
            elements['challenge-blue-slider'].value = state.challengeUserRgb.b;
            elements['challenge-red-val'].textContent = state.challengeUserRgb.r;
            elements['challenge-green-val'].textContent = state.challengeUserRgb.g;
            elements['challenge-blue-val'].textContent = state.challengeUserRgb.b;

            elements['win-overlay'].classList.toggle('hidden', !state.showWinOverlay);
            elements['win-overlay'].classList.toggle('show', state.showWinOverlay);
        }

        function getMarkerAngles() {
            if (state.currentHarmony && harmonyTypes[state.currentHarmony]) {
                return harmonyTypes[state.currentHarmony].map(function (offset) {
                    return (state.mainHue + offset + 360) % 360;
                });
            }
            return [state.mainHue];
        }

        // --- Core Methods ---
        function switchMode(mode) {
            state.currentMode = mode;
            state.isHarmonyDropdownVisible = false;
            if (mode === 'challenge') initChallenge();
            updateUI();
            broadcastStateUpdate();
        }

        function toggleFullscreen() {
            state.isFullscreen = true;
            updateUI();
        }

        function exitFullscreen() {
            state.isFullscreen = false;
            updateUI();
        }

        function resetApp() {
            if (state.currentMode === 'free') {
                state.isInitialState = true;
                state.mainHue = 0;
                state.mainSaturation = 1.0;
                state.mainLightness = 0.5;
                state.currentHarmony = null;
                state.redSliderFree = 255;
                state.greenSliderFree = 255;
                state.blueSliderFree = 255;
            } else if (state.currentMode === 'harmony') {
                state.isInitialState = true;
                state.mainHue = 0;
                state.mainSaturation = 1.0;
                state.mainLightness = 0.5;
            } else {
                state.challengeDifficulty = 'hard';
                initChallenge();
            }
            updateUI();
            broadcastStateUpdate();
        }

        function applyHarmony(harmony) {
            state.currentHarmony = harmony;
            state.isInitialState = false;
            updateUI();
            broadcastStateUpdate();
        }

        function updateSlidersFromHue() {
            if (state.isInitialState) return;
            var rgb = hslToRgb(state.mainHue, state.mainSaturation, state.mainLightness);
            state.redSliderFree = rgb.r;
            state.greenSliderFree = rgb.g;
            state.blueSliderFree = rgb.b;
        }

        function handleFreeSliderInput() {
            state.isInitialState = false;
            state.redSliderFree = parseInt(elements['red-slider'].value);
            state.greenSliderFree = parseInt(elements['green-slider'].value);
            state.blueSliderFree = parseInt(elements['blue-slider'].value);
            var hsl = rgbToHsl(state.redSliderFree, state.greenSliderFree, state.blueSliderFree);
            state.mainHue = hsl.h * 360;
            state.mainSaturation = hsl.s;
            state.mainLightness = hsl.l;
            updateUI();
            broadcastStateUpdate();
        }

        function handleChallengeSliderInput() {
            state.challengeUserRgb.r = parseInt(elements['challenge-red-slider'].value);
            state.challengeUserRgb.g = parseInt(elements['challenge-green-slider'].value);
            state.challengeUserRgb.b = parseInt(elements['challenge-blue-slider'].value);
            checkChallengeMatch();
            updateUI();
            broadcastStateUpdate();
        }

        function getChallengeStep(difficulty) {
            if (difficulty === 'easy') return 51;
            if (difficulty === 'medium') return 15;
            return 1;
        }

        function initChallenge() {
            var step = getChallengeStep(state.challengeDifficulty);
            var maxSteps = 255 / step;
            var targetR, targetG, targetB;
            do {
                targetR = Math.floor(Math.random() * (maxSteps + 1)) * step;
                targetG = Math.floor(Math.random() * (maxSteps + 1)) * step;
                targetB = Math.floor(Math.random() * (maxSteps + 1)) * step;
            } while (targetR === 255 && targetG === 255 && targetB === 255); // Prevent instant win

            state.challengeTargetRgb = {
                r: targetR,
                g: targetG,
                b: targetB
            };
            state.challengeUserRgb = { r: 255, g: 255, b: 255 };
            checkChallengeMatch();
        }

        function checkChallengeMatch() {
            var diffR = state.challengeUserRgb.r - state.challengeTargetRgb.r;
            var diffG = state.challengeUserRgb.g - state.challengeTargetRgb.g;
            var diffB = state.challengeUserRgb.b - state.challengeTargetRgb.b;
            var distance = Math.sqrt(diffR * diffR + diffG * diffG + diffB * diffB);
            var maxDistance = Math.sqrt(255 * 255 * 3);
            state.challengeSimilarity = 1 - (distance / maxDistance);

            // Strict matching is required regardless of difficulty (0.995)
            if (state.challengeSimilarity >= 0.995) {
                triggerWin();
            }
        }

        function triggerWin() {
            if (state.hasWon) return;
            state.hasWon = true;

            state.showWinOverlay = true;
            elements['label-you-won'].textContent = l10n.get('YouWon');
            updateUI();

            if (presence) {
                presence.sendMessage(presence.getSharedInfo().id, {
                    user: presence.getUserInfo(),
                    content: {
                        action: 'user_won',
                        data: {
                            name: presence.getUserInfo().name,
                            colorvalue: presence.getUserInfo().colorvalue
                        }
                    }
                });
            }

            setTimeout(function () {
                state.showWinOverlay = false;
                state.hasWon = false;
                initChallenge();
                updateUI();
                broadcastStateUpdate();
            }, 3000);
        }

        function setupColorRing() {
            var size = 380, center = size / 2, outerRadius = 190, innerRadius = 140;
            var colors = ['#F44336', '#FF9800', '#FFEB3B', '#CDDC39', '#4CAF50', '#009688', '#00BCD4', '#2196F3', '#3F51B5', '#673AB7', '#9C27B0', '#E91E63'];

            elements['ring-svg'].innerHTML = '';
            colors.forEach(function (color, i) {
                var startAngle = i * 30, endAngle = (i + 1) * 30;
                var startRad = (startAngle * Math.PI) / 180, endRad = (endAngle * Math.PI) / 180;
                var x1 = center + outerRadius * Math.cos(startRad), y1 = center + outerRadius * Math.sin(startRad);
                var x2 = center + outerRadius * Math.cos(endRad), y2 = center + outerRadius * Math.sin(endRad);
                var x3 = center + innerRadius * Math.cos(endRad), y3 = center + innerRadius * Math.sin(endRad);
                var x4 = center + innerRadius * Math.cos(startRad), y4 = center + innerRadius * Math.sin(startRad);
                var d = 'M ' + x1 + ' ' + y1 + ' A ' + outerRadius + ' ' + outerRadius + ' 0 0 1 ' + x2 + ' ' + y2 + ' L ' + x3 + ' ' + y3 + ' A ' + innerRadius + ' ' + innerRadius + ' 0 0 0 ' + x4 + ' ' + y4 + ' Z';

                var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', d);
                path.setAttribute('fill', color);
                path.setAttribute('stroke', '#ffffff');
                path.setAttribute('stroke-width', '2');
                path.style.cursor = 'pointer';
                path.style.transition = 'opacity 0.2s';

                path.addEventListener('mouseenter', function () { path.style.opacity = '0.8'; });
                path.addEventListener('mouseleave', function () { path.style.opacity = '1'; });
                path.addEventListener('click', function (e) {
                    e.stopPropagation();
                    state.mainHue = startAngle + 15;
                    state.isInitialState = false;
                    if (state.mainSaturation < 0.2) state.mainSaturation = 1.0;
                    if (state.mainLightness < 0.2 || state.mainLightness > 0.8) state.mainLightness = 0.5;
                    updateSlidersFromHue();
                    updateUI();
                });
                elements['ring-svg'].appendChild(path);
            });
        }

        var harmonyPalette;
        function setupHarmonyOptions() {
            harmonyPalette = new palette.Palette(elements['harmony-dropdown-button']);
            var container = document.createElement('div');
            container.id = 'harmony-options';
            elements['harmony-options'] = container;

            Object.keys(harmonyTypes).forEach(function (key) {
                var option = document.createElement('button');
                option.className = 'harmony-option';
                option.dataset.harmony = key;

                var icon = document.createElement('div');
                icon.className = 'harmony-icon';
                icon.style.position = 'relative';

                var inner = document.createElement('div');
                inner.className = 'harmony-icon-inner ' + key;
                icon.appendChild(inner);
                var d3 = document.createElement('div'); d3.className = 'dot3'; icon.appendChild(d3);
                var d4 = document.createElement('div'); d4.className = 'dot4'; icon.appendChild(d4);

                var span = document.createElement('span');
                span.textContent = l10n.get(harmonyNames[key]) || harmonyNames[key];

                option.appendChild(icon);
                option.appendChild(span);

                option.addEventListener('click', function () {
                    harmonyPalette.popDown();
                    applyHarmony(key);
                });

                container.appendChild(option);
            });

            harmonyPalette.setContent([container]);
            harmonyPalette.getPalette().id = 'harmony-palette';
        }

        var isModeDropdownVisible = false;
        function setupModeOptions() {
            modePalette = new palette.Palette(elements['mode-button']);

            var html = '';
            html += '<div style="margin: 10px;">';

            // Free Paint
            html += '<button id="mode-free" style="width: 100%; border: none; background: transparent; padding: 5px; cursor: pointer; display: flex; align-items: center; border-radius: 5px;">';
            html += '<div style="background-image: url(icons/free-paint.svg); width: 30px; height: 30px; background-size: contain; background-repeat: no-repeat; margin-right: 15px; border: 2px solid transparent;"></div>';
            html += '<span style="color: white; font-size: 14px; font-weight: bold;">' + (l10n.get('FreePaint') || 'Free Paint') + '</span>';
            html += '</button>';

            html += '<hr style="border: 0; border-top: 1px solid #555; margin: 5px 0;">';

            // Challenge Mode
            html += '<button id="mode-challenge" style="width: 100%; border: none; background: transparent; padding: 5px; cursor: pointer; display: flex; align-items: center; border-radius: 5px;">';
            html += '<div style="background-image: url(icons/challenge.svg); width: 30px; height: 30px; background-size: contain; background-repeat: no-repeat; margin-right: 15px; border: 2px solid transparent;"></div>';
            html += '<span style="color: white; font-size: 14px; font-weight: bold;">' + (l10n.get('ChallengeMode') || 'Challenge Mode') + '</span>';
            html += '</button>';

            html += '<hr style="border: 0; border-top: 1px solid #555; margin: 5px 0;">';

            // Harmony Mode
            html += '<button id="mode-harmony" style="width: 100%; border: none; background: transparent; padding: 5px; cursor: pointer; display: flex; align-items: center; border-radius: 5px;">';
            html += '<div style="background-image: url(icons/harmony.svg); width: 30px; height: 30px; background-size: contain; background-repeat: no-repeat; margin-right: 15px; border: 2px solid transparent;"></div>';
            html += '<span style="color: white; font-size: 14px; font-weight: bold;">' + (l10n.get('Harmony') || 'Color Harmony') + '</span>';
            html += '</button>';

            html += '</div>';

            var div = document.createElement('div');
            div.innerHTML = html;
            modePalette.setContent([div]);

            div.querySelector('#mode-free').addEventListener('click', function () { modePalette.popDown(); switchMode('free'); });
            div.querySelector('#mode-challenge').addEventListener('click', function () { modePalette.popDown(); switchMode('challenge'); });
            div.querySelector('#mode-harmony').addEventListener('click', function () { modePalette.popDown(); switchMode('harmony'); });

            // Make it match standard styling
            var style = document.createElement('style');
            style.innerHTML = `
                #mode-free:hover, #mode-challenge:hover, #mode-harmony:hover {
                    background-color: #555 !important;
                }
            `;
            document.head.appendChild(style);
        }

        function setupDifficultyOptions() {
            difficultyPalette = new palette.Palette(elements['challenge-difficulty-button']);
            var container = document.createElement('div');
            container.id = 'difficulty-options';
            elements['difficulty-options'] = container;

            var difficulties = ['easy', 'medium', 'hard'];

            difficulties.forEach(function (level) {
                var option = document.createElement('button');
                option.className = 'difficulty-option';
                option.dataset.difficulty = level;

                var span = document.createElement('span');
                var labelName = level.charAt(0).toUpperCase() + level.slice(1);
                span.textContent = l10n.get(labelName) || labelName;

                option.appendChild(span);

                option.addEventListener('click', function () {
                    difficultyPalette.popDown();
                    state.challengeDifficulty = level;
                    initChallenge();
                    updateUI();
                    broadcastStateUpdate();
                });

                container.appendChild(option);
            });

            difficultyPalette.setContent([container]);
            difficultyPalette.getPalette().id = 'difficulty-palette';
        }

        // --- Interaction Handlers ---
        function handleWheelMove(e) {
            if (!state.isDraggingWheel) return;
            var rect = elements['harmony-wheel-inner'].getBoundingClientRect();
            var cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
            var clientX = e.touches ? e.touches[0].clientX : e.clientX;
            var clientY = e.touches ? e.touches[0].clientY : e.clientY;
            var dx = clientX - cx, dy = clientY - cy;
            var angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
            if (angle < 0) angle += 360;
            state.mainHue = Math.round(angle);
            var maxDragRadius = (rect.width / 2) * 0.9157;
            if (maxDragRadius <= 0) maxDragRadius = 174;
            state.mainSaturation = Math.min(Math.sqrt(dx * dx + dy * dy) / maxDragRadius, 1.0);
            state.isInitialState = false;
            updateSlidersFromHue();
            updateUI();
            broadcastStateUpdate();
        }

        function handleRingMove(e) {
            if (!state.isDraggingRing) return;
            var rect = elements['harmony-wheel-inner'].getBoundingClientRect();
            var cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
            var clientX = e.touches ? e.touches[0].clientX : e.clientX;
            var clientY = e.touches ? e.touches[0].clientY : e.clientY;
            var angle = Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI) + 90;
            if (angle < 0) angle += 360;
            state.mainLightness = angle / 360;
            state.isInitialState = false;
            updateSlidersFromHue();
            updateUI();
            broadcastStateUpdate();
        }

        function adjustSlider(type, mode, amount) {
            if (mode === 'free') {
                if (type === 'r') state.redSliderFree = Math.max(0, Math.min(255, state.redSliderFree + amount));
                if (type === 'g') state.greenSliderFree = Math.max(0, Math.min(255, state.greenSliderFree + amount));
                if (type === 'b') state.blueSliderFree = Math.max(0, Math.min(255, state.blueSliderFree + amount));
                var hsl = rgbToHsl(state.redSliderFree, state.greenSliderFree, state.blueSliderFree);
                state.mainHue = hsl.h * 360; state.mainSaturation = hsl.s; state.mainLightness = hsl.l;
                state.isInitialState = false;
            } else {
                var step = getChallengeStep(state.challengeDifficulty);
                var adjustAmount = amount > 0 ? step : -step;
                if (type === 'r') state.challengeUserRgb.r = Math.max(0, Math.min(255, state.challengeUserRgb.r + adjustAmount));
                if (type === 'g') state.challengeUserRgb.g = Math.max(0, Math.min(255, state.challengeUserRgb.g + adjustAmount));
                if (type === 'b') state.challengeUserRgb.b = Math.max(0, Math.min(255, state.challengeUserRgb.b + adjustAmount));

                // Snap to valid step just in case
                state.challengeUserRgb.r = Math.round(state.challengeUserRgb.r / step) * step;
                state.challengeUserRgb.g = Math.round(state.challengeUserRgb.g / step) * step;
                state.challengeUserRgb.b = Math.round(state.challengeUserRgb.b / step) * step;

                checkChallengeMatch();
            }
            updateUI();
            broadcastStateUpdate();
        }

        // --- Network / Presence Logic ---
        var presence = null;
        var isHost = false;

        function onNetworkDataReceived(msg) {
            if (presence.getUserInfo().networkId === msg.user.networkId) {
                return; // Ignore own messages
            }

            switch (msg.content.action) {
                case 'init':
                case 'state_update':
                    var isChallengeLocal = state.currentMode === 'challenge';
                    var isChallengeRemote = msg.content.data.currentMode === 'challenge';

                    if (isChallengeLocal && isChallengeRemote) {
                        // In Challenge Mode, players only sync the target bowl. Ignore their local slider values!
                        msg.content.data.challengeUserRgb = state.challengeUserRgb;
                        msg.content.data.challengeSimilarity = state.challengeSimilarity;
                        msg.content.data.showWinOverlay = state.showWinOverlay;
                        // Always accept the host's difficulty setting
                        if (!isHost && msg.content.data.challengeDifficulty) {
                            state.challengeDifficulty = msg.content.data.challengeDifficulty;
                        } else if (isHost) {
                            msg.content.data.challengeDifficulty = state.challengeDifficulty;
                        }
                    }

                    // Update local state with network state safely filtered
                    Object.assign(state, msg.content.data);
                    updateUI();
                    break;
                case 'user_won':
                    var winnerObj = msg.content.data;
                    var winnerName = winnerObj.name;
                    var winnerColor = winnerObj.colorvalue;
                    var html = "";
                    if (winnerName && winnerColor) {
                        winnerName = winnerName.replace('<', '&lt;').replace('>', '&gt;');
                        html = "<img style='height:30px; vertical-align:middle; margin-right:10px;' src='" + generateXOLogoWithColor(winnerColor) + "'>";
                    } else {
                        // Fallback for older clients that just send a string
                        winnerName = typeof winnerObj === 'string' ? winnerObj : "Someone";
                    }
                    humane.log(html + winnerName + " " + (l10n.get('JustCompleted') || "just completed!"));
                    break;
            }
        }

        function onNetworkUserChanged(msg) {
            // A new user joined
            if (isHost && msg.move === 1) {
                // Send the new user the current state
                presence.sendMessage(presence.getSharedInfo().id, {
                    user: presence.getUserInfo(),
                    content: {
                        action: 'init',
                        data: state
                    }
                });
            }
        }

        function broadcastStateUpdate() {
            if (presence) {
                presence.sendMessage(presence.getSharedInfo().id, {
                    user: presence.getUserInfo(),
                    content: {
                        action: 'state_update',
                        data: state
                    }
                });
            }
        }

        // --- Entry Point ---
        activity.setup();

        // Setup Network Palette
        var currentPresencePalette = new presencepalette.PresencePalette(document.getElementById("network-button"), undefined);
        initElements();
        setupColorRing();

        currentPresencePalette.addEventListener('shared', function () {
            currentPresencePalette.popDown();
            presence = activity.getPresenceObject(function (error, network) {
                if (error) {
                    console.error("Presence sharing error:", error);
                    return;
                }
                network.createSharedActivity('org.sugarlabs.ColorLab', function (groupId) {
                    console.log("Activity shared successfully!");
                    isHost = true;
                });
                network.onDataReceived(onNetworkDataReceived);
                network.onSharedActivityUserChanged(onNetworkUserChanged);
            });
        });

        env.getEnvironment(function (err, environment) {
            l10n.init(environment.user.language || "en");

            // Shared instances detection (if opened from the neighborhood)
            if (environment.sharedId) {
                presence = activity.getPresenceObject(function (error, network) {
                    network.onDataReceived(onNetworkDataReceived);
                    network.onSharedActivityUserChanged(onNetworkUserChanged);
                });
            }
        });

        window.addEventListener('localized', function () {
            setupHarmonyOptions();
            setupModeOptions();
            setupDifficultyOptions();
            elements['mode-button'].title = l10n.get('FreePaint');
            elements['challenge-difficulty-button'].title = l10n.get('Difficulty') || 'Difficulty';
            elements['reset-toolbar-button'].title = l10n.get('Reset');
            elements['stop-button'].title = l10n.get('Stop');
            elements['fullscreen-button'].title = l10n.get('Fullscreen');
            elements['help-button'].title = l10n.get('Help');
            elements['label-my-color'].textContent = l10n.get('MyColor');
            elements['label-target'].textContent = l10n.get('Target');
            elements['label-you-won'].textContent = l10n.get('YouWon');
            updateUI();

            env.getEnvironment(function (err, environment) {
                if (environment.objectId) {
                    activity.getDatastoreObject().loadAsText(function (error, metadata, data) {
                        if (error === null && data !== null) {
                            try {
                                var savedState = JSON.parse(data);
                                Object.assign(state, savedState);
                                updateUI();
                            } catch (e) {
                                console.error('Error parsing saved state', e);
                            }
                        }
                    });
                }
            });
        });

        // Event Listeners
        elements['reset-toolbar-button'].addEventListener('click', resetApp);
        window.addEventListener('activityStop', function (event) {
            event.preventDefault();

            var jsonData = JSON.stringify(state);
            activity.getDatastoreObject().setDataAsText(jsonData);
            activity.getDatastoreObject().save(function (error) {
                if (error === null) {
                    console.log("write done.");
                } else {
                    console.error("write failed.", error);
                }
                activity.close();
            });
        });
        elements['fullscreen-button'].addEventListener('click', toggleFullscreen);
        elements['unfullscreen-button'].addEventListener('click', exitFullscreen);

        document.addEventListener('click', function (e) {
            if (!e.target.closest('.palette') && !e.target.closest('.toolbutton')) {
                if (currentPresencePalette) currentPresencePalette.popDown();
                if (modePalette) modePalette.popDown();
                if (harmonyPalette) harmonyPalette.popDown();
                if (difficultyPalette) difficultyPalette.popDown();
            }
        });

        elements['harmony-wheel-inner'].addEventListener('mousedown', function (e) { state.isDraggingWheel = true; handleWheelMove(e); });
        elements['lightnessTrack'].addEventListener('mousedown', function (e) { e.stopPropagation(); state.isDraggingRing = true; handleRingMove(e); });

        document.addEventListener('mousemove', function (e) {
            if (state.isDraggingWheel) handleWheelMove(e);
            if (state.isDraggingRing) handleRingMove(e);
        });
        document.addEventListener('mouseup', function () { state.isDraggingWheel = state.isDraggingRing = false; });

        // Touch support
        elements['harmony-wheel-inner'].addEventListener('touchstart', function (e) { state.isDraggingWheel = true; handleWheelMove(e); }, { passive: false });
        elements['lightnessTrack'].addEventListener('touchstart', function (e) { e.stopPropagation(); state.isDraggingRing = true; handleRingMove(e); }, { passive: false });
        document.addEventListener('touchmove', function (e) {
            if (state.isDraggingWheel) handleWheelMove(e);
            if (state.isDraggingRing) handleRingMove(e);
        }, { passive: false });
        document.addEventListener('touchend', function () { state.isDraggingWheel = state.isDraggingRing = false; });

        // Slider inputs
        elements['red-slider'].addEventListener('input', handleFreeSliderInput);
        elements['green-slider'].addEventListener('input', handleFreeSliderInput);
        elements['blue-slider'].addEventListener('input', handleFreeSliderInput);
        elements['challenge-red-slider'].addEventListener('input', handleChallengeSliderInput);
        elements['challenge-green-slider'].addEventListener('input', handleChallengeSliderInput);
        elements['challenge-blue-slider'].addEventListener('input', handleChallengeSliderInput);

        // Plus/Minus buttons
        function bindAdjust(id, type, mode, amt) {
            var timer, delay;
            function start() {
                // Clear any existing timers just in case
                clearTimeout(delay);
                clearInterval(timer);

                adjustSlider(type, mode, amt);
                delay = setTimeout(function () { timer = setInterval(function () { adjustSlider(type, mode, amt); }, 50); }, 500);
            }
            function stop() { clearTimeout(delay); clearInterval(timer); }
            elements[id].addEventListener('mousedown', start);
            elements[id].addEventListener('mouseup', stop);
            elements[id].addEventListener('mouseleave', stop);
            elements[id].addEventListener('touchstart', function (e) { e.preventDefault(); start(); }, { passive: false });
            elements[id].addEventListener('touchend', stop);
            elements[id].addEventListener('touchcancel', stop);
        }
        bindAdjust('red-minus', 'r', 'free', -1); bindAdjust('red-plus', 'r', 'free', 1);
        bindAdjust('green-minus', 'g', 'free', -1); bindAdjust('green-plus', 'g', 'free', 1);
        bindAdjust('blue-minus', 'b', 'free', -1); bindAdjust('blue-plus', 'b', 'free', 1);
        bindAdjust('challenge-red-minus', 'r', 'challenge', -1); bindAdjust('challenge-red-plus', 'r', 'challenge', 1);
        bindAdjust('challenge-green-minus', 'g', 'challenge', -1); bindAdjust('challenge-green-plus', 'g', 'challenge', 1);
        bindAdjust('challenge-blue-minus', 'b', 'challenge', -1); bindAdjust('challenge-blue-plus', 'b', 'challenge', 1);

        updateUI();
    });
});
