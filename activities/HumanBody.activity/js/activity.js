define([
    'sugar-web/activity/activity',
    'sugar-web/env',
    'activity/palettes/colorpalettefill',
    'activity/palettes/zoompalette',
    'activity/palettes/settingspalette',
    'sugar-web/graphics/presencepalette',
], function (
    activity,
    env,
    colorpaletteFill,
    zoompalette,
    settingspalette,
    presencepalette
) {
    requirejs(['domReady!'], function (doc) {
        activity.setup()
        let fillColor = null
        let doctorMode = false
        let currentBodyPartIndex = 0
        let bodyParts = []
        let modal = null
        let partsColored = []
        let username = null
        let players = []
        let isHost = false
        let presenceCorrectIndex = 0
        let presenceIndex = 0
        let ifDoctorHost = false
        let firstAnswer = true

        var paletteColorFill = new colorpaletteFill.ColorPalette(
            document.getElementById('color-button-fill'),
            undefined
        )

        var paletteSettings = new settingspalette.SettingsPalette(
            document.getElementById('settings-button'),
            undefined
        )

        document
            .getElementById('stop-button')
            .addEventListener('click', function (event) {
                console.log('writing...')
                var jsonData = JSON.stringify(partsColored)
                activity.getDatastoreObject().setDataAsText(jsonData)
                activity.getDatastoreObject().save(function (error) {
                    if (error === null) {
                        console.log('write done.')
                    } else {
                        console.log('write failed.')
                    }
                })
            })

        env.getEnvironment(function (err, environment) {
            currentenv = environment
            username = environment.user.name

            // Load from datastore
            // Load from datastore
            if (!environment.objectId) {
                console.log('New instance')
            } else {
                activity
                    .getDatastoreObject()
                    .loadAsText(function (error, metadata, data) {
                        if (error == null && data != null) {
                            partsColored = JSON.parse(data)
                            loader.load(
                                'models/skeleton/skeleton.gltf',
                                function (gltf) {
                                    skeleton = gltf.scene
                                    skeleton.name = 'skeleton'

                                    skeleton.traverse((node) => {
                                        if (node.isMesh) {
                                            node.userData.originalMaterial =
                                                node.material.clone() // Save the original material

                                            // Check if the node's name exists in partsColored array
                                            const part = partsColored.find(
                                                ([name, color]) =>
                                                    name === node.name
                                            )

                                            if (part) {
                                                const [name, color] = part

                                                // Apply the color from the array
                                                node.material =
                                                    new THREE.MeshStandardMaterial(
                                                        {
                                                            color: new THREE.Color(
                                                                color
                                                            ),
                                                            side: THREE.DoubleSide,
                                                        }
                                                    )
                                            }

                                            console.log(node.name)
                                        }
                                    })

                                    skeleton.scale.set(4, 4, 4)
                                    skeleton.position.y += -5
                                    scene.add(skeleton)

                                    console.log('Skeleton loaded', skeleton)
                                },
                                function (xhr) {
                                    console.log(
                                        (xhr.loaded / xhr.total) * 100 +
                                            '% loaded'
                                    )
                                },
                                function (error) {
                                    console.log('An error happened')
                                    console.log(error)
                                }
                            )
                        }
                    })
            }
        })

        // Link presence palette
        var presence = null
        var palette = new presencepalette.PresencePalette(
            document.getElementById('network-button'),
            undefined
        )
        palette.addEventListener('shared', function () {
            palette.popDown()
            console.log('Want to share')
            presence = activity.getPresenceObject(function (error, network) {
                if (error) {
                    console.log('Sharing error')
                    return
                }
                network.createSharedActivity(
                    'org.sugarlabs.HumanBody',
                    function (groupId) {
                        console.log('Activity shared')
                        isHost = true
                    }
                )
                network.onDataReceived(onNetworkDataReceived)
                network.onSharedActivityUserChanged(onNetworkUserChanged)
            })
        })

        var onNetworkDataReceived = function (msg) {
            if (presence.getUserInfo().networkId === msg.user.networkId) {
                return
            }
            if (msg.action == 'init') {
                partsColored = msg.content[0]
                players = msg.content[1]

                // Load the skeleton model
                loader.load(
                    'models/skeleton/skeleton.gltf',
                    function (gltf) {
                        skeleton = gltf.scene
                        skeleton.name = 'skeleton'

                        skeleton.traverse((node) => {
                            if (node.isMesh) {
                                node.userData.originalMaterial =
                                    node.material.clone() // Save the original material

                                // Check if the node's name exists in partsColored array
                                const part = partsColored.find(
                                    ([name, color]) => name === node.name
                                )

                                if (part) {
                                    const [name, color] = part

                                    // Apply the color from the array
                                    node.material =
                                        new THREE.MeshStandardMaterial({
                                            color: new THREE.Color(color),
                                            side: THREE.DoubleSide,
                                        })
                                }

                                console.log(node.name)
                            }
                        })

                        skeleton.scale.set(4, 4, 4)
                        skeleton.position.y += -5
                        scene.add(skeleton)

                        console.log('Skeleton loaded', skeleton)
                    },
                    function (xhr) {
                        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
                    },
                    function (error) {
                        console.log('An error happened')
                        console.log(error)
                    }
                )
            }

            if (msg.action == 'nextQuestion') {
                if (bodyParts[msg.content]) {
                    presenceCorrectIndex = msg.content
                    showModal('Find the ' + bodyParts[msg.content].name)
                }
            }

            if (msg.action == 'update') {
                players = msg.content
                showLeaderboard()
            }

            if (msg.action == 'answer') {
                if (!ifDoctorHost || !firstAnswer) {
                    return
                }
                let target = players.findIndex(
                    (innerArray) => innerArray[0] === msg.user.name
                )
                players[target][1]++
                presence.sendMessage(presence.getSharedInfo().id, {
                    user: presence.getUserInfo(),
                    action: 'update',
                    content: players,
                })
                console.log(msg.user.name + ' was the fastest')
                console.log(players)
                showLeaderboard()
                presenceIndex++
                startDoctorModePresence()
            }

            if (msg.action == 'startDoctor') {
                showLeaderboard()
                isPaintActive = false
                isLearnActive = false
                isTourActive = false
                isDoctorActive = true
            }
        }

        env.getEnvironment(function (err, environment) {
            fillColor = environment.user.colorvalue.fill || fillColor

            document.getElementById('color-button-fill').style.backgroundColor =
                fillColor

            if (environment.sharedId) {
                console.log('Shared instance')
                presence = activity.getPresenceObject(function (
                    error,
                    network
                ) {
                    network.onDataReceived(onNetworkDataReceived)
                })
            }
        })

        var onNetworkUserChanged = function (msg) {
            players.push([msg.user.name, 0])
            if (isDoctorActive) {
                showLeaderboard()
            }
            if (isHost) {
                presence.sendMessage(presence.getSharedInfo().id, {
                    user: presence.getUserInfo(),
                    action: 'init',
                    content: [partsColored, players],
                })
            }

            if (isDoctorActive) {
                presence.sendMessage(presence.getSharedInfo().id, {
                    user: presence.getUserInfo(),
                    action: 'startDoctor',
                    content: players,
                })
            }
        }

        // Mode variables to track which mode is active
        let isPaintActive = true
        let isLearnActive = false
        let isTourActive = false
        let isDoctorActive = false

        // Array of modes
        const modes = ['Paint', 'Learn', 'Tour', 'Doctor']
        let currentModeIndex = 0

        // DOM elements
        const modeTextElem = document.getElementById('mode-text')
        const leftArrow = document.getElementById('left-arrow')
        const rightArrow = document.getElementById('right-arrow')

        // Function to handle entering Tour mode
        function startTourMode() {
            let tourIndex = 0 // Start with the first body part in the list

            function tourNextPart() {
                if (tourIndex >= bodyParts.length || !isTourActive) {
                    stopTourMode() // Stop the tour if all parts have been shown
                    return
                }

                const part = bodyParts[tourIndex]
                const position = part.position // Retrieve the position of the body part

                // Zoom to the body part's position
                camera.position.set(position[0], position[1], position[2] + 5) // Adjust the zoom offset as necessary
                camera.lookAt(position[0], position[1], position[2])
                camera.updateProjectionMatrix()

                // Display the name of the part using the modal
                showModal(`This is the ${part.name}`)

                tourIndex++

                // Set a timeout to move to the next part after a delay (e.g., 3 seconds)
                setTimeout(tourNextPart, 3000)
            }

            tourNextPart() // Start the tour
        }

        // Function to handle exiting Tour mode
        function stopTourMode() {
            camera.position.set(0, 10, 20)
            camera.lookAt(0, 0, 0)
        }

        // Update the mode text based on the current mode index
        function updateModeText() {
            // If switching from Tour mode, stop it
            if (isTourActive && currentModeIndex !== 2) {
                stopTourMode()
            }

            // If switching from Doctor mode, stop it
            if (isDoctorActive && currentModeIndex !== 3) {
                stopDoctorMode()
            }

            modeTextElem.textContent = modes[currentModeIndex]

            // Update mode tracking variables
            isPaintActive = currentModeIndex === 0
            isLearnActive = currentModeIndex === 1
            isTourActive = currentModeIndex === 2
            isDoctorActive = currentModeIndex === 3

            // If switching to Tour mode, start it
            if (isTourActive) {
                startTourMode()
            }

            // If switching to Doctor mode, start it
            if (isDoctorActive) {
                if (presence) {
                    showLeaderboard()

                    presence.sendMessage(presence.getSharedInfo().id, {
                        user: presence.getUserInfo(),
                        action: 'startDoctor',
                        content: players,
                    })
                    ifDoctorHost = true
                    startDoctorModePresence()
                } else {
                    console.log('starting doctor mode')
                    startDoctorMode()
                }
            }
        }

        function showLeaderboard() {
            console.log('running show leaderboard')
            var leaderboard = document.getElementById('leaderboard')
            leaderboard.style.display = 'block'
            let playerScores = players
            var tableBody = document.querySelector('.leaderboard tbody')

            tableBody.innerHTML = ''
            for (var i = 0; i < playerScores.length; i++) {
                var playerName = playerScores[i][0] // Get player name
                var playerScore = playerScores[i][1] // Get player score

                // Create a new row
                var tableBody = document.querySelector('.leaderboard tbody')
                var newRow = tableBody.insertRow()

                // Create new cells for player name and score
                var nameCell = newRow.insertCell(0)
                var scoreCell = newRow.insertCell(1)

                // Set the text content for the cells
                nameCell.textContent = playerName
                scoreCell.textContent = playerScore
            }
        }

        // Event listener to switch to the previous mode
        leftArrow.addEventListener('click', () => {
            currentModeIndex =
                (currentModeIndex - 1 + modes.length) % modes.length
            updateModeText()
        })

        // Event listener to switch to the next mode
        rightArrow.addEventListener('click', () => {
            currentModeIndex = (currentModeIndex + 1) % modes.length
            updateModeText()
        })

        // Initialize the mode text
        updateModeText()

        document.getElementById('color-button-fill').style.backgroundColor =
            fillColor

        var paletteZoom = new zoompalette.ZoomPalette(
            document.getElementById('zoom-button'),
            undefined
        )

        const camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        )

        const goRightButton = document.querySelector('#right-button')
        const goLeftButton = document.querySelector('#left-button')
        const goUpButton = document.querySelector('#up-button')
        const goDownButton = document.querySelector('#down-button')

        // Handles the rotation of the board through the arrow buttons
        goRightButton.addEventListener('click', function (event) {
            orbit.rotateRight()
            event.stopPropagation()
        })

        goLeftButton.addEventListener('click', function (event) {
            orbit.rotateLeft()
            event.stopPropagation()
        })
        goUpButton.addEventListener('click', function (event) {
            orbit.rotateUp()
            event.stopPropagation()
        })
        goDownButton.addEventListener('click', function (event) {
            orbit.rotateDown()
            event.stopPropagation()
        })

        const evt = new Event('wheel', { bubbles: true, cancelable: true })

        const zoomInButton = document.getElementById('zoom-in-button')
        const zoomOutButton = document.getElementById('zoom-out-button')
        const zoomEqualButton = document.getElementById('zoom-equal-button')
        const zoomToButton = document.getElementById('zoom-to-button')

        // Zoom code is self explanatory
        const zoomInFunction = (e) => {
            const fov = getFov()
            camera.fov = clickZoom(fov, 'zoomIn')
            camera.updateProjectionMatrix()
            e.stopPropagation()
        }

        const zoomOutFunction = (e) => {
            const fov = getFov()
            camera.fov = clickZoom(fov, 'zoomOut')
            camera.updateProjectionMatrix()
            e.stopPropagation()
        }

        const zoomEqualFunction = (e) => {
            const fov = getFov()
            camera.fov = 29
            camera.updateProjectionMatrix()
            e.stopPropagation()
        }

        const zoomToFunction = (e) => {
            const fov = getFov()
            camera.fov = 35
            camera.updateProjectionMatrix()
            e.stopPropagation()
        }

        const clickZoom = (value, zoomType) => {
            if (value >= 20 && zoomType === 'zoomIn') {
                return value - 5
            } else if (value <= 75 && zoomType === 'zoomOut') {
                return value + 5
            } else {
                return value
            }
        }

        const getFov = () => {
            return Math.floor(
                (2 *
                    Math.atan(
                        camera.getFilmHeight() / 2 / camera.getFocalLength()
                    ) *
                    180) /
                    Math.PI
            )
        }

        const fov = getFov()
        camera.updateProjectionMatrix()

        zoomInButton.addEventListener('click', zoomInFunction)
        zoomOutButton.addEventListener('click', zoomOutFunction)
        zoomEqualButton.addEventListener('click', zoomEqualFunction)
        zoomToButton.addEventListener('click', zoomToFunction)

        // JSON file containing the body parts and their mesh names
        fetch('./js/bodyParts.json')
            .then((response) => response.json())
            .then((data) => {
                bodyParts = data
                for (let i = 0; i < bodyParts.length; i++) {
                    partsColored.push(bodyParts[i].name, '#000000')
                }
            })
            .catch((error) => {
                console.error('Error fetching bodyParts.json:', error)
            })

        function startDoctorMode() {
            currentBodyPartIndex = 0
            if (bodyParts[currentBodyPartIndex]) {
                showModal('Find the ' + bodyParts[currentBodyPartIndex].name)
            }
        }

        function startDoctorModePresence() {
            presence.sendMessage(presence.getSharedInfo().id, {
                user: presence.getUserInfo(),
                action: 'nextQuestion',
                content: presenceIndex,
            })
            presenceCorrectIndex = presenceIndex
            if (bodyParts[presenceIndex]) {
                showModal('Find the ' + bodyParts[presenceIndex].name)
            } else {
                showModal('Game Over')
            }
        }

        function stopDoctorMode() {
            if (modal) {
                document.body.removeChild(modal)
                modal = null
            }
        }

        function showModal(text) {
            const modal = document.createElement('div')

            // Style the modal
            modal.style.position = 'absolute'
            modal.style.top = '50%'
            modal.style.left = '50%'
            modal.style.transform = 'translate(-50%, -50%)'
            modal.style.backgroundColor = '#f9f9f9' // Light grey background for a softer look
            modal.style.padding = '30px' // Increase padding for a larger modal
            modal.style.border = '3px solid #007bff' // Blue border for a pop of color
            modal.style.borderRadius = '8px' // Rounded corners for a smoother appearance
            modal.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)' // Add a shadow for depth
            modal.style.zIndex = '1000'
            modal.style.textAlign = 'center' // Center the text inside the modal

            // Style the text inside the modal
            modal.style.fontSize = '18px' // Larger text size
            modal.style.fontWeight = 'bold' // Bold text
            modal.style.color = '#333' // Darker text color for better contrast

            modal.innerHTML = text
            document.body.appendChild(modal)

            // Make the modal disappear after 1.5 seconds
            setTimeout(() => {
                document.body.removeChild(modal)
            }, 1500)
        }

        const redSliderFill = document.getElementById('red-slider-fill')
        const greenSliderFill = document.getElementById('green-slider-fill')
        const blueSliderFill = document.getElementById('blue-slider-fill')

        let sliderColorFill = { r: 0, g: 0, b: 0 }

        function rgbToHex(r, g, b) {
            return (
                '#' +
                ((1 << 24) + (r << 16) + (g << 8) + b)
                    .toString(16)
                    .slice(1)
                    .toUpperCase()
            )
        }

        function hexToRgb(hex) {
            let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
            return result
                ? {
                      r: parseInt(result[1], 16),
                      g: parseInt(result[2], 16),
                      b: parseInt(result[3], 16),
                  }
                : null
        }

        function updateColorDisplayFill() {
            const hexColor = rgbToHex(
                sliderColorFill.r,
                sliderColorFill.g,
                sliderColorFill.b
            )
            fillColor = hexColor
            document.getElementById('color-button-fill').style.backgroundColor =
                fillColor
        }

        function updateSlidersFill(color) {
            const rgb = hexToRgb(color)
            redSliderFill.value = rgb.r
            greenSliderFill.value = rgb.g
            blueSliderFill.value = rgb.b
        }

        function handleSliderChangeFill() {
            sliderColorFill = {
                r: parseInt(redSliderFill.value),
                g: parseInt(greenSliderFill.value),
                b: parseInt(blueSliderFill.value),
            }
            updateColorDisplayFill()
        }

        redSliderFill.addEventListener('input', handleSliderChangeFill)
        greenSliderFill.addEventListener('input', handleSliderChangeFill)
        blueSliderFill.addEventListener('input', handleSliderChangeFill)

        document.addEventListener('color-selected-fill', function (event) {
            const selectedColorFill = event.detail.color
            fillColor = selectedColorFill
            document.getElementById('color-button-fill').style.backgroundColor =
                fillColor
            updateSlidersFill(selectedColorFill)
        })
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
        })
        renderer.shadowMap.enabled = true
        renderer.setSize(window.innerWidth, window.innerHeight)
        const canvas = document.getElementById('canvas')
        canvas.appendChild(renderer.domElement)
        const scene = new THREE.Scene()
        scene.background = new THREE.Color('#000000')

        // Restore all lights
        const light = new THREE.DirectionalLight(0xffffff, 1)
        light.castShadow = true
        const leftLight = new THREE.DirectionalLight(0xffffff, 1)
        leftLight.castShadow = true
        const rightLight = new THREE.DirectionalLight(0xffffff, 1)
        rightLight.castShadow = true
        const backLight = new THREE.DirectionalLight(0xffffff, 1)
        const bottomLight = new THREE.DirectionalLight(0xffffff, 1)
        const topLight = new THREE.DirectionalLight(0xffffff, 1)
        topLight.castShadow = true
        leftLight.position.set(-30, 20, -30)
        rightLight.position.set(30, 20, -30)
        backLight.position.set(0, 20, 30)
        light.position.set(0, 20, -30)
        bottomLight.position.set(0, -20, -30)
        topLight.position.set(0, 10, 0)
        scene.add(backLight)
        scene.add(rightLight)
        scene.add(leftLight)
        scene.add(light)
        scene.add(bottomLight)
        scene.add(topLight)

        const ambientLight = new THREE.AmbientLight(0x222222) // Soft ambient lighting
        scene.add(ambientLight)

        camera.position.set(0, 10, 20)
        camera.lookAt(0, 0, 0)

        const orbit = new OrbitControls.OrbitControls(
            camera,
            renderer.domElement
        )
        orbit.update()
        orbit.listenToKeyEvents(document.querySelector('body'))

        const loader = new THREE.GLTFLoader()
        let skeleton

        if (presence == null) {
            loader.load(
                'models/skeleton/skeleton.gltf',
                function (gltf) {
                    skeleton = gltf.scene
                    skeleton.name = 'skeleton'
                    skeleton.traverse((node) => {
                        if (node.isMesh) {
                            node.userData.originalMaterial =
                                node.material.clone() // Save the original material
                        }
                    })
                    skeleton.scale.set(4, 4, 4)
                    skeleton.position.y += -5
                    scene.add(skeleton)

                    console.log('Skeleton loaded', skeleton)
                },
                function (xhr) {
                    console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
                },
                function (error) {
                    console.log('An error happened')
                    console.log(error)
                }
            )
        }

        function setModelColor(model, color) {
            model.traverse((node) => {
                if (node.isMesh) {
                    if (node.material) {
                        node.material.color.set(color)
                    }
                }
            })
        }

        loader.load(
            'models/heart/heart.gltf',
            function (gltf) {
                gltf.scene.position.y += 4
                setModelColor(gltf.scene, new THREE.Color(0xff0000))
                scene.add(gltf.scene)

                console.log('Heart loaded', gltf.scene)
            },
            function (xhr) {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
            },
            function (error) {
                console.log('An error happened')
                console.log(error)
            }
        )

        // loader.load(
        //     'models/digestive/digestive.gltf',
        //     function (gltf) {
        //         gltf.scene.position.y += 3;
        //         gltf.scene.scale.set(4, 4, 4);
        //         setModelColor(gltf.scene, new THREE.Color(0x00ff00));
        //         scene.add(gltf.scene);

        //         console.log('Digestive system loaded', gltf.scene);
        //     },
        //     function (xhr) {
        //         console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        //     },
        //     function (error) {
        //         console.log('An error happened');
        //         console.log(error);
        //     }
        // );

        const raycaster = new THREE.Raycaster()
        const mouse = new THREE.Vector2()

        function getClicked3DPoint() {
            mouse.x =
                ((evt.clientX - canvasPosition.left) / canvas.width) * 2 - 1
            mouse.y =
                -((evt.clientY - canvasPosition.top) / canvas.height) * 2 + 1

            rayCaster.setFromCamera(mousePosition, camera)
            var intersects = rayCaster.intersectObjects(
                scene.getObjectByName('skeleton').children,
                true
            )

            if (intersects.length > 0) console.log(intersects[0].point)
        }

        function onMouseClick(event) {
            const rect = renderer.domElement.getBoundingClientRect()
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

            raycaster.setFromCamera(mouse, camera)
            const intersects = raycaster.intersectObjects(scene.children, true)

            if (intersects.length > 0) {
                const intersect = intersects[0]
                const point = intersect.point

                // Format the point as (x, y, z) and log it
                const pointString = `(${point.x.toFixed(2)}, ${point.y.toFixed(
                    2
                )}, ${point.z.toFixed(2)})`
                console.log(`Clicked Point: ${pointString}`)

                const object = intersects[0].object

                if (isPaintActive) {
                    if (object.userData.originalMaterial) {
                        const isColor = !object.material.color.equals(
                            new THREE.Color('#ffffff')
                        )
                        // Traverse partsColored array to check if the object with the same name already exists
                        const index = partsColored.findIndex(
                            ([name, color]) => name === object.name
                        )

                        // If it exists, remove it from the array
                        if (index !== -1) {
                            partsColored.splice(index, 1)
                        }

                        // Push the new entry with the updated color
                        partsColored.push([
                            object.name,
                            isColor ? '#ffffff' : fillColor,
                        ])

                        if (presence) {
                            console.log(partsColored)
                            console.log('sending colors')
                            presence.sendMessage(presence.getSharedInfo().id, {
                                user: presence.getUserInfo(),
                                action: 'init',
                                content: partsColored,
                            })
                        }

                        if (isColor) {
                            object.material =
                                object.userData.originalMaterial.clone()
                        } else {
                            object.material = new THREE.MeshStandardMaterial({
                                color: fillColor,
                                side: THREE.DoubleSide,
                            })
                        }
                    }
                } else if (isDoctorActive) {
                    if (presence) {
                        const targetMeshName =
                            bodyParts[presenceCorrectIndex].mesh
                        if (object.name === targetMeshName) {
                            if (ifDoctorHost) {
                                firstAnswer = true
                                let target = players.findIndex(
                                    (innerArray) => innerArray[0] === username
                                )
                                players[target][1]++
                                presence.sendMessage(
                                    presence.getSharedInfo().id,
                                    {
                                        user: presence.getUserInfo(),
                                        action: 'update',
                                        content: players,
                                    }
                                )
                                startDoctorModePresence()
                                presenceIndex++
                                showLeaderboard()
                            }
                            if (!ifDoctorHost) {
                                presence.sendMessage(
                                    presence.getSharedInfo().id,
                                    {
                                        user: presence.getUserInfo(),
                                        action: 'answer',
                                    }
                                )
                            }
                            showModal('Correct! But were you the fastest?')
                        } else {
                            showModal('Wrong!')
                        }
                    } else {
                        const targetMeshName =
                            bodyParts[currentBodyPartIndex].mesh
                        if (object.name === targetMeshName) {
                            showModal(
                                'Correct! Next: ' +
                                    bodyParts[++currentBodyPartIndex]?.name
                            )
                        } else {
                            showModal(
                                'Wrong! Try to find ' +
                                    bodyParts[++currentBodyPartIndex]?.name
                            )
                        }

                        if (currentBodyPartIndex >= bodyParts.length) {
                            showModal('Game over! You found all parts.')
                            stopDoctorMode()
                        }
                    }
                } else if (isLearnActive) {
                    let clickedBodyPart = bodyParts.find(
                        (part) => part.mesh === object.name
                    )
                    if (isLearnActive && clickedBodyPart) {
                        showModal(`You clicked on: ${clickedBodyPart.name}`)
                    }
                }
            }
        }

        window.addEventListener('click', onMouseClick, false)

        function animate() {
            renderer.render(scene, camera)
        }

        renderer.setAnimationLoop(animate)
    })
})
