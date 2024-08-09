define(["sugar-web/activity/activity", "sugar-web/env", "activity/palettes/colorpalettefill"], function (activity, env, colorpaletteFill) {
    requirejs(["domReady!"], function (doc) {
        activity.setup();
        let fillColor = null;
        let doctorMode = false;
        let currentBodyPartIndex = 0;
        let bodyParts = [];
        let modal = null;

        var paletteColorFill = new colorpaletteFill.ColorPalette(
            document.getElementById("color-button-fill"),
            undefined
        );
        document.getElementById("color-button-fill").style.backgroundColor = fillColor;

        // Disable doctor button until body parts are loaded
        const doctorButton = document.querySelector("#doctor-button");
        doctorButton.disabled = true;

        // JSON file containing the body parts and their mesh names
        fetch("./js/bodyParts.json")
            .then(response => response.json())
            .then(data => {
                bodyParts = data;
                console.log('Body parts loaded:', bodyParts);
                doctorButton.disabled = false; // Enable button once data is loaded
            })
            .catch(error => {
                console.error("Error fetching bodyParts.json:", error);
            });

        doctorButton.addEventListener("click", () => {
            if (!bodyParts.length) {
                console.error("Body parts not loaded yet.");
                return;
            }
            var doctorButton = document.getElementById("doctor-button");
                if (!doctorMode) {
                    doctorButton.classList.add("active");
                } else {
                    doctorButton.classList.remove("active");
                }

            doctorMode = !doctorMode;
            if (doctorMode) {
                startDoctorMode();
            } else {
                stopDoctorMode();
            }
        });

        function startDoctorMode() {
            currentBodyPartIndex = 0;
            if (bodyParts[currentBodyPartIndex]) {
                showModal("Find the " + bodyParts[currentBodyPartIndex].name);
            }
        }

        function stopDoctorMode() {
            if (modal) {
                document.body.removeChild(modal);
                modal = null;
            }
        }

        function showModal(text) {
            if (!modal) {
                modal = document.createElement("div");
                modal.style.position = "absolute";
                modal.style.top = "50%";
                modal.style.left = "50%";
                modal.style.transform = "translate(-50%, -50%)";
                modal.style.backgroundColor = "#fff";
                modal.style.padding = "20px";
                modal.style.border = "2px solid #000";
                modal.style.zIndex = "1000";
                document.body.appendChild(modal);
            }
            modal.innerHTML = text;
        }

        const redSliderFill = document.getElementById("red-slider-fill");
        const greenSliderFill = document.getElementById("green-slider-fill");
        const blueSliderFill = document.getElementById("blue-slider-fill");

        let sliderColorFill = { r: 0, g: 0, b: 0 };

        function rgbToHex(r, g, b) {
            return (
                "#" +
                ((1 << 24) + (r << 16) + (g << 8) + b)
                    .toString(16)
                    .slice(1)
                    .toUpperCase()
            );
        }

        function hexToRgb(hex) {
            let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result
                ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16),
                }
                : null;
        }

        function updateColorDisplayFill() {
            const hexColor = rgbToHex(
                sliderColorFill.r,
                sliderColorFill.g,
                sliderColorFill.b
            );
            fillColor = hexColor;
            document.getElementById("color-button-fill").style.backgroundColor = fillColor;
        }

        function updateSlidersFill(color) {
            const rgb = hexToRgb(color);
            redSliderFill.value = rgb.r;
            greenSliderFill.value = rgb.g;
            blueSliderFill.value = rgb.b;
        }

        function handleSliderChangeFill() {
            sliderColorFill = {
                r: parseInt(redSliderFill.value),
                g: parseInt(greenSliderFill.value),
                b: parseInt(blueSliderFill.value),
            };
            updateColorDisplayFill();
        }

        redSliderFill.addEventListener("input", handleSliderChangeFill);
        greenSliderFill.addEventListener("input", handleSliderChangeFill);
        blueSliderFill.addEventListener("input", handleSliderChangeFill);

        document.addEventListener("color-selected-fill", function (event) {
            const selectedColorFill = event.detail.color;
            fillColor = selectedColorFill;
            document.getElementById("color-button-fill").style.backgroundColor = fillColor;
            updateSlidersFill(selectedColorFill);
        });

        env.getEnvironment(function (err, environment) {
            fillColor =
                environment.user.colorvalue.fill || fillColor;

            document.getElementById("color-button-fill").style.backgroundColor =
                fillColor;

            if (environment.sharedId) {
                const presence = activity.getPresenceObject(function (error, network) {
                    network.onDataReceived(onNetworkDataReceived);
                });
            }
        });

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
        });
        renderer.shadowMap.enabled = true;
        renderer.setSize(window.innerWidth, window.innerHeight);
        const canvas = document.getElementById("canvas");
        canvas.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#000000");

        // Restore all lights
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.castShadow = true;
        const leftLight = new THREE.DirectionalLight(0xffffff, 1);
        leftLight.castShadow = true;
        const rightLight = new THREE.DirectionalLight(0xffffff, 1);
        rightLight.castShadow = true;
        const backLight = new THREE.DirectionalLight(0xffffff, 1);
        const bottomLight = new THREE.DirectionalLight(0xffffff, 1);
        const topLight = new THREE.DirectionalLight(0xffffff, 1);
        topLight.castShadow = true;
        leftLight.position.set(-30, 20, -30);
        rightLight.position.set(30, 20, -30);
        backLight.position.set(0, 20, 30);
        light.position.set(0, 20, -30);
        bottomLight.position.set(0, -20, -30);
        topLight.position.set(0, 10, 0);
        scene.add(backLight);
        scene.add(rightLight);
        scene.add(leftLight);
        scene.add(light);
        scene.add(bottomLight);
        scene.add(topLight);

        const ambientLight = new THREE.AmbientLight(0x222222); // Soft ambient lighting
        scene.add(ambientLight);

        const camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(0, 10, 20);
        camera.lookAt(0, 0, 0);

        const orbit = new OrbitControls.OrbitControls(
            camera,
            renderer.domElement
        );
        orbit.update();
        orbit.listenToKeyEvents(document.querySelector("body"));

        const loader = new THREE.GLTFLoader();
        let skeleton;

        loader.load(
            'models/skeleton/skeleton.gltf',
            function (gltf) {
                skeleton = gltf.scene;
                skeleton.traverse((node) => {
                    if (node.isMesh) {
                        node.userData.originalMaterial = node.material.clone(); // Save the original material
                    }
                });
                skeleton.scale.set(4, 4, 4);
                skeleton.position.y += -5;
                scene.add(skeleton);

                console.log('Skeleton loaded', skeleton);
            },
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                console.log('An error happened');
                console.log(error);
            }
        );

        function setModelColor(model, color) {
            model.traverse((node) => {
                if (node.isMesh) {
                    if (node.material) {
                        node.material.color.set(color);
                    }
                }
            });
        }

        loader.load(
            'models/heart/heart.gltf',
            function (gltf) {
                gltf.scene.position.y += 4;
                setModelColor(gltf.scene, new THREE.Color(0xff0000));
                scene.add(gltf.scene);

                console.log('Heart loaded', gltf.scene);
            },
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                console.log('An error happened');
                console.log(error);
            }
        );

        loader.load(
            'models/digestive/digestive.gltf',
            function (gltf) {
                gltf.scene.position.y += 3;
                gltf.scene.scale.set(4, 4, 4);
                setModelColor(gltf.scene, new THREE.Color(0x00ff00));
                scene.add(gltf.scene);

                console.log('Digestive system loaded', gltf.scene);
            },
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                console.log('An error happened');
                console.log(error);
            }
        );

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        function onMouseClick(event) {
            // if (!doctorMode) return;

            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(scene.children, true);

            if (intersects.length > 0) {
                const object = intersects[0].object;
                if (!doctorMode) {

                    if (object.userData.originalMaterial) {
                        const isColor = object.material.color.equals(new THREE.Color(fillColor));
    
                        if (isColor) {
                            object.material = object.userData.originalMaterial.clone();
                        } else {
                            object.material = new THREE.MeshStandardMaterial({
                                color: fillColor,
                                side: THREE.DoubleSide,
                            });
                        }
                    }
    
                } else {
                    const targetMeshName = bodyParts[currentBodyPartIndex].mesh;
                    if (object.name === targetMeshName) {
                        showModal("Correct! Next: " + bodyParts[++currentBodyPartIndex]?.name);
                    } else {
                        showModal("Wrong! Try again.");
                    }
    
                    if (currentBodyPartIndex >= bodyParts.length) {
                        showModal("Game over! You found all parts.");
                        stopDoctorMode();
                    }
                }
            }
        }

        window.addEventListener('click', onMouseClick, false);

        function animate() {
            renderer.render(scene, camera);
        }

        renderer.setAnimationLoop(animate);
    });
});
