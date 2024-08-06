define(["sugar-web/activity/activity"], function (activity) {
    // Manipulate the DOM only when it is ready.
    requirejs(["domReady!"], function (doc) {
        // Initialize the activity.
        activity.setup();

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

        loader.load(
            'models/lungs/lungs.gltf',
            function (gltf) {
                gltf.scene.position.y += 3;
                gltf.scene.scale.set(7, 7, 7);
                scene.add(gltf.scene);
                console.log('Lungs loaded', gltf.scene);
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
            // Calculate mouse position in normalized device coordinates
            var rect = renderer.domElement.getBoundingClientRect();
				mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
				mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            // Update the raycaster with the camera and mouse position
            raycaster.setFromCamera(mouse, camera);

            // Calculate objects intersecting the ray
            const intersects = raycaster.intersectObjects(scene.children);

            if (intersects.length > 0) {
                const object = intersects[0].object;
                console.log('Intersected object:', object);

                if (object.userData.originalMaterial) {
                    const isRed = object.material.color.equals(new THREE.Color(0xff0000));

                    if (isRed) {
                        object.material = object.userData.originalMaterial.clone();
                    } else {
                        object.material = new THREE.MeshStandardMaterial({
                            color: 0xff0000,
                            side: THREE.DoubleSide,
                        });
                    }
                } else {
                    console.log('No original material found for this object.');
                }
            } else {
                console.log('No intersections found.');
            }
        }

        window.addEventListener('click', onMouseClick, false);

        function animate() {
            renderer.render(scene, camera);
        }

        renderer.setAnimationLoop(animate);
    });
});
