const { createApp, ref, computed, onMounted, onUnmounted, watch } = Vue;


createApp({
    setup() {
        // --- Global State ---
        const currentMode = ref('free'); // 'free' or 'challenge'
        const isFullscreen = ref(false);
        const isNetworkPopupVisible = ref(false);
        const isHarmonyDropdownVisible = ref(false);

        // --- Free Paint State ---
        const mainHue = ref(0);
        const mainSaturation = ref(1.0);
        const mainLightness = ref(0.5);
        const currentHarmony = ref(null);
        const isDraggingWheel = ref(false);
        const isDraggingRing = ref(false);
        const isInitialState = ref(true);

        const redSliderFree = ref(255);
        const greenSliderFree = ref(255);
        const blueSliderFree = ref(255);

        // --- Challenge Mode State ---
        const challengeUserRgb = ref({ r: 255, g: 255, b: 255 });
        const challengeTargetRgb = ref({ r: 100, g: 150, b: 200 }); // Initial random
        const challengeSimilarity = ref(0);
        const showWinOverlay = ref(false);

        // --- Refs for DOM Elements ---
        const wheelInnerRef = ref(null);


        // --- Harmony Definitions ---
        const harmonyTypes = {
            'complementary': [0, 180],
            'split-complementary': [0, 150, 210],
            'analogous': [-30, 0, 30],
            'triadic': [0, 120, 240],
            'tetradic': [0, 60, 180, 240],
            'square': [0, 90, 180, 270]
        };

        const harmonyNames = {
            'complementary': 'Compl.',
            'split-complementary': 'Split',
            'analogous': 'Analog',
            'triadic': 'Triadic',
            'tetradic': 'Tetrad',
            'square': 'Square'
        };

        // --- Utility Functions ---
        function hslToRgb(h, s, l) {
            h = ((h % 360) + 360) % 360 / 360;
            let r, g, b;
            if (s === 0) {
                r = g = b = l;
            } else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1 / 6) return p + (q - p) * 6 * t;
                    if (t < 1 / 2) return q;
                    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                };
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }
            return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
        }

        function rgbToHex({ r, g, b }) {
            return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
        }

        function rgbToHsl(r, g, b) {
            r /= 255; g /= 255; b /= 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;
            if (max === min) {
                h = s = 0;
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
            return { h, s, l };
        }

        function getColorName(angle, s, l) {
            angle = ((angle % 360) + 360) % 360;
            const colorNames = [
                { min: 0, max: 15, name: 'Red' }, { min: 15, max: 45, name: 'Orange' },
                { min: 45, max: 75, name: 'Yellow' }, { min: 75, max: 105, name: 'Lime' },
                { min: 105, max: 135, name: 'Green' }, { min: 135, max: 165, name: 'Teal' },
                { min: 165, max: 195, name: 'Cyan' }, { min: 195, max: 225, name: 'Sky' },
                { min: 225, max: 255, name: 'Blue' }, { min: 255, max: 285, name: 'Purple' },
                { min: 285, max: 315, name: 'Magenta' }, { min: 315, max: 345, name: 'Pink' },
                { min: 345, max: 360, name: 'Red' }
            ];
            let baseName = 'Red';
            for (const color of colorNames) {
                if (angle >= color.min && angle < color.max) { baseName = color.name; break; }
            }
            if (l < 0.1) return 'Black';
            if (l > 0.95) return 'White';
            if (s < 0.1) {
                if (l < 0.3) return 'Dark Grey';
                if (l > 0.7) return 'Light Grey';
                return 'Grey';
            }
            let qualifier = '';
            if (l < 0.35) qualifier = 'Dark ';
            else if (l > 0.65) qualifier = 'Light ';
            return qualifier + baseName;
        }

        // --- Computed Properties ---
        const markerAngles = computed(() => {
            if (currentHarmony.value && harmonyTypes[currentHarmony.value]) {
                return harmonyTypes[currentHarmony.value].map(offset => (mainHue.value + offset + 360) % 360);
            }
            return [mainHue.value];
        });

        const harmonySwatches = computed(() => {
            if (!currentHarmony.value) return [];
            return markerAngles.value.map((angle, index) => {
                const rgb = hslToRgb(angle, mainSaturation.value, mainLightness.value);
                const hex = rgbToHex(rgb);
                const yiq = ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000;
                return {
                    id: `swatch-${index + 1}`,
                    backgroundColor: hex,
                    color: yiq >= 128 ? '#000000' : '#ffffff',
                    name: getColorName(angle, mainSaturation.value, mainLightness.value)
                };
            });
        });

        const markers = computed(() => {
            const maxRadius = 100;
            const lightnessScale = 1 - Math.abs(2 * mainLightness.value - 1);
            const visibleScale = Math.max(0.1, lightnessScale);
            const currentRadius = mainSaturation.value * maxRadius * visibleScale;

            return markerAngles.value.map((angle, index) => {
                const rgb = hslToRgb(angle, mainSaturation.value, mainLightness.value);
                return {
                    class: index === 0 ? 'main-marker' : `split-marker-${index}`,
                    style: {
                        transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${currentRadius}px) rotate(-${angle}deg)`,
                        backgroundColor: rgbToHex(rgb)
                    }
                };
            });
        });

        const lightnessTrackTransform = computed(() => {
            const angle = mainLightness.value * 360;
            return `rotate(${angle}deg)`;
        });

        const mixingBowlColor = computed(() => {
            if (isInitialState.value && currentMode.value === 'free') {
                return '#ffffff';
            }
            if (currentMode.value === 'free') {
                let r = 0, g = 0, b = 0, count = 0;
                markerAngles.value.forEach(angle => {
                    const rgb = hslToRgb(angle, mainSaturation.value, mainLightness.value);
                    r += rgb.r; g += rgb.g; b += rgb.b; count++;
                });
                if (count > 0) {
                    return rgbToHex({ r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) });
                }
            } else {
                return rgbToHex(challengeUserRgb.value);
            }
            return '#ffffff';
        });

        const mixingBowlName = computed(() => {
            if (isInitialState.value && currentMode.value === 'free') return 'White';
            if (currentMode.value === 'free') {
                let tr = 0, tg = 0, tb = 0, count = 0;
                markerAngles.value.forEach(angle => {
                    const rgb = hslToRgb(angle, mainSaturation.value, mainLightness.value);
                    tr += rgb.r; tg += rgb.g; tb += rgb.b; count++;
                });
                if (count > 0) {
                    const r = (tr / count) / 255;
                    const g = (tg / count) / 255;
                    const b = (tb / count) / 255;
                    const max = Math.max(r, g, b), min = Math.min(r, g, b);
                    let h, s, l = (max + min) / 2;
                    if (max === min) h = s = 0;
                    else {
                        const d = max - min;
                        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                        switch (max) {
                            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                            case g: h = (b - r) / d + 2; break;
                            case b: h = (r - g) / d + 4; break;
                        }
                        h /= 6;
                    }
                    return getColorName(h * 360, s, l);
                }
            }
            return '';
        });

        // --- Challenge Computed ---
        const challengeTargetColorHex = computed(() => {
            return rgbToHex(challengeTargetRgb.value);
        });

        const challengeProgressOffset = computed(() => {
            const radius = 190;
            const circumference = 2 * Math.PI * radius;
            return circumference - (challengeSimilarity.value * circumference);
        });


        // --- Methods ---
        const switchMode = (mode) => {
            currentMode.value = mode;
            isHarmonyDropdownVisible.value = false;
            // Resize logic runs automatically via vue reactibity if layout shifts
        };

        const toggleFullscreen = () => { isFullscreen.value = true; };
        const exitFullscreen = () => { isFullscreen.value = false; };
        const toggleNetworkPopup = () => { isNetworkPopupVisible.value = !isNetworkPopupVisible.value; };
        const toggleHarmonyDropdown = () => { isHarmonyDropdownVisible.value = !isHarmonyDropdownVisible.value; };

        const handleHelp = () => {
            console.log('Help clicked');
            // Add help logic or modal here
        };

        const handleStop = () => {
            console.log('Stop clicked');
            // Add stop logic here
        };


        const resetApp = () => {
            if (currentMode.value === 'free') {
                isInitialState.value = true;
                mainHue.value = 0;
                mainSaturation.value = 1.0;
                mainLightness.value = 0.5;
                currentHarmony.value = null;
                redSliderFree.value = 255;
                greenSliderFree.value = 255;
                blueSliderFree.value = 255;
            } else {
                challengeUserRgb.value = { r: 255, g: 255, b: 255 };
                checkChallengeMatch();
            }
        };

        const applyHarmony = (harmony) => {
            currentHarmony.value = harmony;
            isInitialState.value = false;
            isHarmonyDropdownVisible.value = false;
        };

        const updateSlidersFromHue = () => {
            if (isInitialState.value) {
                redSliderFree.value = 255; greenSliderFree.value = 255; blueSliderFree.value = 255;
                return;
            }
            const rgb = hslToRgb(mainHue.value, mainSaturation.value, mainLightness.value);
            redSliderFree.value = rgb.r;
            greenSliderFree.value = rgb.g;
            blueSliderFree.value = rgb.b;
        };

        const handleFreeSliderInput = () => {
            isInitialState.value = false;
            const hsl = rgbToHsl(redSliderFree.value, greenSliderFree.value, blueSliderFree.value);
            mainHue.value = hsl.h * 360;
            mainSaturation.value = hsl.s;
            mainLightness.value = hsl.l;
        };

        const handleWheelDown = (e) => {
            isDraggingWheel.value = true;
            handleWheelMove(e);
        };

        const handleRingDown = (e) => {
            isDraggingRing.value = true;
            e.stopPropagation();
            handleRingMove(e);
        };

        const handleDocMove = (e) => {
            if (isDraggingWheel.value) handleWheelMove(e);
            if (isDraggingRing.value) handleRingMove(e);
        };

        const handleDocUp = () => {
            isDraggingWheel.value = false;
            isDraggingRing.value = false;
        };

        const getWheelCenter = () => {
            if (!wheelInnerRef.value) return { cx: 0, cy: 0 };
            const rect = wheelInnerRef.value.getBoundingClientRect();
            return { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 };
        };


        const handleWheelMove = (e) => {
            if (!isDraggingWheel.value) return;
            e.preventDefault();
            const { cx, cy } = getWheelCenter();

            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const deltaX = clientX - cx;
            const deltaY = clientY - cy;

            let angleDeg = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
            if (angleDeg < 0) angleDeg += 360;

            mainHue.value = Math.round(angleDeg);
            const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            mainSaturation.value = Math.min(dist / 100, 1.0);
            isInitialState.value = false;
            updateSlidersFromHue();
        };

        const handleRingMove = (e) => {
            if (!isDraggingRing.value) return;
            e.preventDefault();
            const { cx, cy } = getWheelCenter();

            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const deltaX = clientX - cx;
            const deltaY = clientY - cy;

            let angleDeg = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
            if (angleDeg < 0) angleDeg += 360;

            mainLightness.value = angleDeg / 360;
            isInitialState.value = false;
            updateSlidersFromHue();
        };

        const initChallenge = () => {
            challengeTargetRgb.value = {
                r: Math.floor(Math.random() * 256),
                g: Math.floor(Math.random() * 256),
                b: Math.floor(Math.random() * 256)
            };
            challengeUserRgb.value = { r: 255, g: 255, b: 255 };
            checkChallengeMatch();
        };

        const checkChallengeMatch = () => {
            const diffR = challengeUserRgb.value.r - challengeTargetRgb.value.r;
            const diffG = challengeUserRgb.value.g - challengeTargetRgb.value.g;
            const diffB = challengeUserRgb.value.b - challengeTargetRgb.value.b;

            const distance = Math.sqrt(diffR * diffR + diffG * diffG + diffB * diffB);
            const maxDistance = Math.sqrt(255 * 255 * 3);

            challengeSimilarity.value = 1 - (distance / maxDistance);

            if (challengeSimilarity.value >= 0.995) {
                triggerWin();
            }
        };

        const triggerWin = () => {
            showWinOverlay.value = true;
            setTimeout(() => {
                showWinOverlay.value = false;
                initChallenge();
            }, 3000);
        };

        // --- Ring SVG Setup for Free Paint ---
        const ringSegments = ref([]);
        const setupColorRing = () => {
            const size = 380;
            const center = size / 2;
            const outerRadius = 190;
            const innerRadius = 140;
            const colors = ['#F44336', '#FF9800', '#FFEB3B', '#CDDC39', '#4CAF50', '#009688', '#00BCD4', '#2196F3', '#3F51B5', '#673AB7', '#9C27B0', '#E91E63'];
            const segments = [];

            colors.forEach((color, i) => {
                const startAngle = i * 30;
                const endAngle = (i + 1) * 30;

                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;

                const x1 = center + outerRadius * Math.cos(startRad);
                const y1 = center + outerRadius * Math.sin(startRad);
                const x2 = center + outerRadius * Math.cos(endRad);
                const y2 = center + outerRadius * Math.sin(endRad);

                const x3 = center + innerRadius * Math.cos(endRad);
                const y3 = center + innerRadius * Math.sin(endRad);
                const x4 = center + innerRadius * Math.cos(startRad);
                const y4 = center + innerRadius * Math.sin(startRad);

                const d = `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4} Z`;

                segments.push({
                    d, color, hover: false, angle: startAngle + 15
                });
            });
            ringSegments.value = segments;
        };

        const setRingColor = (segment) => {
            mainHue.value = segment.angle;
            isInitialState.value = false;
            if (mainSaturation.value < 0.2) mainSaturation.value = 1.0;
            if (mainLightness.value < 0.2 || mainLightness.value > 0.8) mainLightness.value = 0.5;
            updateSlidersFromHue();
        };

        // Long Press Slider Adjustments
        let sliderTimer = null;
        let sliderDelayTimer = null;
        const adjustSlider = (type, mode, amount) => {
            const doAdjust = () => {
                if (mode === 'free') {
                    if (type === 'r') redSliderFree.value = Math.max(0, Math.min(255, parseInt(redSliderFree.value) + amount));
                    if (type === 'g') greenSliderFree.value = Math.max(0, Math.min(255, parseInt(greenSliderFree.value) + amount));
                    if (type === 'b') blueSliderFree.value = Math.max(0, Math.min(255, parseInt(blueSliderFree.value) + amount));
                    handleFreeSliderInput();
                } else {
                    if (type === 'r') challengeUserRgb.value.r = Math.max(0, Math.min(255, parseInt(challengeUserRgb.value.r) + amount));
                    if (type === 'g') challengeUserRgb.value.g = Math.max(0, Math.min(255, parseInt(challengeUserRgb.value.g) + amount));
                    if (type === 'b') challengeUserRgb.value.b = Math.max(0, Math.min(255, parseInt(challengeUserRgb.value.b) + amount));
                    checkChallengeMatch();
                }
            };
            const stopAdjust = () => {
                clearTimeout(sliderDelayTimer); clearInterval(sliderTimer);
                document.removeEventListener('mouseup', stopAdjust);
                document.removeEventListener('touchend', stopAdjust);
            };

            doAdjust();
            sliderDelayTimer = setTimeout(() => {
                sliderTimer = setInterval(doAdjust, 50);
            }, 500);

            document.addEventListener('mouseup', stopAdjust);
            document.addEventListener('touchend', stopAdjust);
        };


        // Observers & Lifecycles
        onMounted(() => {
            document.addEventListener('mousemove', handleDocMove);
            document.addEventListener('touchmove', handleDocMove, { passive: false });
            document.addEventListener('mouseup', handleDocUp);
            document.addEventListener('touchend', handleDocUp);

            setupColorRing();
            initChallenge();
        });

        onUnmounted(() => {
            document.removeEventListener('mousemove', handleDocMove);
            document.removeEventListener('touchmove', handleDocMove);
            document.removeEventListener('mouseup', handleDocUp);
            document.removeEventListener('touchend', handleDocUp);
        });

        return {
            // State
            currentMode, isFullscreen, isNetworkPopupVisible, isHarmonyDropdownVisible,
            mainHue, mainSaturation, mainLightness, currentHarmony, isInitialState,
            redSliderFree, greenSliderFree, blueSliderFree,
            challengeUserRgb, challengeTargetRgb, challengeSimilarity, showWinOverlay,
            harmonyTypes, harmonyNames, ringSegments,
            wheelInnerRef,


            // Computed
            markerAngles, harmonySwatches, markers, lightnessTrackTransform,
            mixingBowlColor, mixingBowlName, challengeTargetColorHex, challengeProgressOffset,

            // Methods
            switchMode, toggleFullscreen, exitFullscreen, toggleNetworkPopup, toggleHarmonyDropdown,
            resetApp, applyHarmony, handleFreeSliderInput, handleWheelDown, handleRingDown,
            initChallenge, checkChallengeMatch, setRingColor, adjustSlider,
            handleHelp, handleStop

        };
    }
}).mount('#app');
