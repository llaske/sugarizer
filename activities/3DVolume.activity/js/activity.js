define([
  'sugar-web/activity/activity',
  'sugar-web/env',
  './palettes/bgpalette',
  './palettes/volumepalette',
  './palettes/colorpalette',
  './palettes/zoompalette',
  'sugar-web/graphics/presencepalette',
  'tutorial',
  'sugar-web/graphics/journalchooser',
  "sugar-web/datastore",
], function (
  activity,
  env,
  bgpalette,
  volumepalette,
  colorpalette,
  zoompalette,
  presencepalette,
  tutorial,
  journalchooser,
  datastore
) {
  // Function to change the background color based on the provided string
  requirejs(['domReady!'], function (doc) {
    activity.setup()
    // Link presence palette
    var paletteBg = new bgpalette.BgPalette(
      document.getElementById('bg-button'),
      undefined,
    )
    paletteBg.setBackgroundChangeCallback(changeBoardBackgroundHelper)
    function changeBoardBackgroundHelper(selectedBoard) {
      if (presence) {
        presence.sendMessage(presence.getSharedInfo().id, {
          user: presence.getUserInfo(),
          action: 'changeBg',
          content: selectedBoard,
        })
      }
      changeBoardBackground(selectedBoard)
    }
    var paletteVolume = new volumepalette.VolumePalette(
      document.getElementById('volume-button'),
      undefined,
    )
    var paletteZoom = new zoompalette.ZoomPalette(
      document.getElementById('zoom-button'),
      undefined,
    )
    var paletteColor = new colorpalette.ColorPalette(
      document.getElementById('color-button'),
      undefined,
    )
    let presentScore = 0
    let lastRoll = ''
    let diceArray = []
    let showNumbers = false
    let showImage = false
    let imageData;
    let presentColor;
    let textColor = '#ffffff'
    var currentenv
    let removeVolume = false
    env.getEnvironment(function (err, environment) {
      currentenv = environment

      presentColor =
        currentenv.user.colorvalue.fill != null
          ? currentenv.user.colorvalue.fill
          : presentColor
        
      scene.background = new THREE.Color(presentColor)

      
      textColor =
        currentenv.user.colorvalue.stroke != null
          ? currentenv.user.colorvalue.stroke
          : textColor
      document.getElementById('color-button').style.backgroundColor =
        presentColor
      

      if (environment.sharedId) {
        console.log('Shared instance')
        presence = activity.getPresenceObject(function (error, network) {
          network.onDataReceived(onNetworkDataReceived)
        })
      }
    })

    var onNetworkDataReceived = function (msg) {
      if (presence.getUserInfo().networkId === msg.user.networkId) {
        console.log('returbign')
        return
      }
      if (msg.action == 'throw') {
        throwDice()
      }
      if (msg.action == 'changeBg') {
        changeBoardBackground(msg.content)
      }
      if (msg.action == 'resetScore') {
        presentScore = 0
        totalScoreElement.textContent = 0
        lastRoll = ''
        lastRollElement.textContent = ''
      }
      switch (msg.content.shape) {
        case 'cube':
          createCube(
            msg.content.color,
            msg.content.ifNumbers,
            msg.content.ifTransparent,
            msg.content.xCoordinateShared,
            msg.content.zCoordinateShared,
            msg.content.ifImage,
            msg.content.sharedImageData
          )
          break
        case 'octa':
          createOctahedron(
            msg.content.color,
            msg.content.ifNumbers,
            msg.content.ifTransparent,
            msg.content.xCoordinateShared,
            msg.content.zCoordinateShared,
            msg.content.ifImage,
            msg.content.sharedImageData
          )
          break
        case 'tetra':
          console.log(msg.content.ifImage)
          createTetrahedron(
            msg.content.color,
            msg.content.ifNumbers,
            msg.content.ifTransparent,
            msg.content.xCoordinateShared,
            msg.content.zCoordinateShared,
            msg.content.ifImage,
            msg.content.sharedImageData
          )
          break
        case 'dodeca':
            createDodecahedron(
              msg.content.color,
              msg.content.ifNumbers,
              msg.content.ifTransparent,
              msg.content.xCoordinateShared,
              msg.content.zCoordinateShared,
              msg.content.ifImage,
              msg.content.sharedImageData
            )
          break
        case 'icosa':
            createIcosahedron(
              msg.content.color,
              msg.content.ifNumbers,
              msg.content.ifTransparent,
              msg.content.xCoordinateShared,
              msg.content.zCoordinateShared,
              msg.content.ifImage,
              msg.content.sharedImageData
            )
            break
      }
    }

    // Launch tutorial
    document
      .getElementById('help-button')
      .addEventListener('click', function (e) {
        tutorial.start()
      })

    document.addEventListener('color-selected', function (event) {
      const selectedColor = event.detail.color
      // Update the presentColor variable with the selected color
      presentColor = selectedColor
      document.getElementById('color-button').style.backgroundColor =
        presentColor
      console.log('Present color updated:', presentColor)
      // changeColors();
    })

    let transparent = false
    let toggleTransparent = false
    function updateDice(type, value) {
      dices[type] += value
      document.getElementById(type).innerHTML = '<br />' + dices[type]
    }

    document.querySelector('#throw-button').addEventListener('click', () => {
      throwDice()
      if (presence) {
        presence.sendMessage(presence.getSharedInfo().id, {
          user: presence.getUserInfo(),
          action: 'throw',
        })
      }
    })

    // Toggles the dice's transparency
    // document.querySelector('#solid-button').addEventListener('click', () => {
    //   if (!transparent) {
    //     document.querySelector('#solid-button').style.backgroundImage =
    //       'url(icons/cube.svg)'
    //   } else {
    //     document.querySelector('#solid-button').style.backgroundImage =
    //       'url(icons/cube_solid.svg)'
    //   }
    //   transparent = !transparent
    //   toggleTransparency()
    // })

    // Toggles showing numbers on dice

    document.querySelector('#number-button').addEventListener('click', () => {
      var numberButton = document.getElementById('number-button')
      numberButton.classList.toggle('active')
      document.getElementById("volume-button").style.backgroundImage = 'url(icons/number_on.svg)'
      if (toggleTransparent) {
        var transparentButton = document.getElementById('transparent-button')
        transparentButton.classList.toggle('active')
        toggleTransparent = !toggleTransparent
      }
      if (showImage) {
        var imageButton1 = document.getElementById('image-button')
        imageButton1.classList.toggle('active')
        showImage = !showImage
      }
      showNumbers = !showNumbers
      // toggleNumbers();
    })
    document.querySelector('#clear-button').addEventListener('click', () => {
      var clearButton = document.getElementById('clear-button')
      // Toggle the 'active' class on the clear button
      clearButton.classList.toggle('active')
      removeVolume = !removeVolume
      addCube = false
      addTetra = false
      addOcta = false
      addDodeca = false
      addIcosa = false
      cube.classList.remove('active')
      tetra.classList.remove('active')
      octa.classList.remove('active')
      dodeca.classList.remove('active')
      icosa.classList.remove('active')


    })
    const remove_button = document.querySelector('#clear-button')
    document
      .querySelector('#transparent-button')
      .addEventListener('click', () => {
        var transparentButton = document.getElementById('transparent-button')
        // Toggle the 'active' class on the clear button
        transparentButton.classList.toggle('active')
        document.getElementById("volume-button").style.backgroundImage = 'url(icons/tess.png)'

        if (showNumbers) {
          var numberButton = document.getElementById('number-button')
          numberButton.classList.toggle('active')
          showNumbers = !showNumbers
        }
        if (showImage) {
          var imageButton1 = document.getElementById('image-button')
          imageButton1.classList.toggle('active')
          showImage = !showImage
        }
        toggleTransparent = !toggleTransparent
      })

    let addCube = false
    let addTetra = false
    let addOcta = false
    let addDodeca = false
    let addIcosa = false
    var cube = document.getElementById('cube-button')
    var tetra = document.getElementById('tetra-button')
    var octa = document.getElementById('octa-button')
    var dodeca = document.getElementById('dodeca-button')
    var icosa = document.getElementById('icosa-button')



    // const imageButton = document.getElementById('image-button')
    // document
    //   .getElementById('image-button')
    //   .addEventListener('click', function (e) {
    //     if (showImage) {
    //       showImage = !showImage
    //       imageButton.classList.toggle('active')
    //       console.log('doing stuff onw')
    //       return
    //     }
    //     journalchooser.show(
    //       function (entry) {
    //         // No selection
    //         if (!entry) {
    //           return
    //         }
    //         // Get object content
    //         imageButton.classList.add('active')
    //         showImage = !showImage

    //         if (toggleTransparent) {
    //           var transparentButton =
    //             document.getElementById('transparent-button')
    //           transparentButton.classList.toggle('active')
    //           toggleTransparent = !toggleTransparent
    //         }

    //         if (showNumbers) {
    //           var numberButton = document.getElementById('number-button')
    //           numberButton.classList.toggle('active')
    //           showNumbers = !showNumbers
    //         }

    //         var dataentry = new datastore.DatastoreObject(entry.objectId)
    //         dataentry.loadAsText(function (err, metadata, data) {
    //           imageData = data
    //           console.log(data);
    //           // if (addCube) {
    //           //   console.log(data)
    //           //   imageData = data;
    //           //   console.log(imageData)
    //           //   createCube()
    //           // }
    //           // if (addTetra) {
    //           // }
    //           // if (addOcta) {
    //           // }
    //         })
    //       },
    //       { mimetype: 'image/png' },
    //       { mimetype: 'image/jpeg' },
    //     )
    //   })

    // Add click event listeners to each div
    cube.addEventListener('click', function () {
      if (!cube.classList.contains('active')) {
        cube.classList.add('active')
        addCube = true
        addTetra = false
        addOcta = false
        addDodeca = false
        addIcosa = false
        removeVolume = false
        remove_button.classList.remove('active')
        tetra.classList.remove('active')
        octa.classList.remove('active')
        dodeca.classList.remove('active')
        icosa.classList.remove('active')



        if (transparent) {
          transparent = false
          document.querySelector('#solid-button').style.backgroundImage =
            'url(icons/cube_solid.svg)'
          toggleTransparency()
        }
      } else {
        cube.classList.remove('active')
        addCube = !addCube
      }
    })
    
    tetra.addEventListener('click', function () {
      if (!tetra.classList.contains('active')) {
        addCube = false
        addTetra = true
        addOcta = false
        addDodeca = false
        addIcosa = false
        tetra.classList.add('active')
        cube.classList.remove('active')
        octa.classList.remove('active')
        dodeca.classList.remove('active')
        icosa.classList.remove('active')


        removeVolume = false
        remove_button.classList.remove('active')
        if (transparent) {
          transparent = false
          document.querySelector('#solid-button').style.backgroundImage =
            'url(icons/cube_solid.svg)'
          toggleTransparency()
        }
      } else {
        tetra.classList.remove('active')
        addTetra = !addTetra
      }
    })

    octa.addEventListener('click', function () {
      if (!octa.classList.contains('active')) {
        addCube = false
        addTetra = false
        addOcta = true
        addDodeca = false
        addIcosa = false
        octa.classList.add('active')
        cube.classList.remove('active')
        tetra.classList.remove('active')
        icosa.classList.remove('active')
        dodeca.classList.remove('active')

        removeVolume = false
        remove_button.classList.remove('active')
        if (transparent) {
          transparent = false
          document.querySelector('#solid-button').style.backgroundImage =
            'url(icons/cube_solid.svg)'
          toggleTransparency()
        }
      } else {
        octa.classList.remove('active')
        addOcta = !addOcta
      }
    })

    dodeca.addEventListener('click', function () {
      if (!dodeca.classList.contains('active')) {
        addCube = false
        addTetra = false
        addOcta = false
        addIcosa = false
        addDodeca = true
        octa.classList.remove('active')
        cube.classList.remove('active')
        tetra.classList.remove('active')
        icosa.classList.remove('active')
        dodeca.classList.add('active')

        removeVolume = false
        remove_button.classList.remove('active')
        if (transparent) {
          transparent = false
          document.querySelector('#solid-button').style.backgroundImage =
            'url(icons/cube_solid.svg)'
          toggleTransparency()
        }
      } else {
        dodeca.classList.remove('active')
        addDodeca = !addDodeca
      }
    })

    icosa.addEventListener('click', function () {
      if (!icosa.classList.contains('active')) {
        addCube = false
        addTetra = false
        addOcta = false
        addDodeca = false
        addIcosa = true
        octa.classList.remove('active')
        cube.classList.remove('active')
        tetra.classList.remove('active')
        dodeca.classList.remove('active')

        icosa.classList.add('active')

        removeVolume = false
        remove_button.classList.remove('active')
        if (transparent) {
          transparent = false
          document.querySelector('#solid-button').style.backgroundImage =
            'url(icons/cube_solid.svg)'
          toggleTransparency()
        }
      } else {
        icosa.classList.remove('active')
        addIcosa = !addIcosa
      }
    })

    // Event listeners
    // document
    //   .querySelector('.cube .plus-button')
    //   .addEventListener('click', () => {
    //     updateDice('cube', 1)
    //     createCube()
    //     if (presence) {
    //       presence.sendMessage(presence.getSharedInfo().id, {
    //         user: presence.getUserInfo(),
    //         content: {
    //           shape: 'cube',
    //           color: currentenv.user.colorvalue.fill,
    //           ifTransparent: toggleTransparent,
    //           ifNumbers: showNumbers,
    //         },
    //       })
    //     }
    //   })

    // document
    //   .querySelector('.tetra .plus-button')
    //   .addEventListener('click', () => {
    //     updateDice('tetra', 1)
    //     createTetrahedron()
    //     if (presence) {
    //       presence.sendMessage(presence.getSharedInfo().id, {
    //         user: presence.getUserInfo(),
    //         content: {
    //           shape: 'tetra',
    //           color: currentenv.user.colorvalue.fill,
    //           ifTransparent: toggleTransparent,
    //           ifNumbers: showNumbers,
    //         },
    //       })
    //     }
    //   })

    // document
    //   .querySelector('.octa .plus-button')
    //   .addEventListener('click', () => {
    //     updateDice('octa', 1)
    //     createOctahedron()
    //     if (presence) {
    //       presence.sendMessage(presence.getSharedInfo().id, {
    //         user: presence.getUserInfo(),
    //         content: {
    //           shape: 'octa',
    //           color: currentenv.user.colorvalue.fill,
    //           ifTransparent: toggleTransparent,
    //           ifNumbers: showNumbers,
    //         },
    //       })
    //     }
    //   })

    // const totalScoreElement = document.getElementById('score')
    const lastRollElement = document.getElementById('roll')

    // Function to update the elements
    function updateElements() {
      // totalScoreElement.textContent = presentScore
      lastRollElement.textContent = lastRoll + '=' + presentScore;
    }

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    renderer.shadowMap.enabled = true

    let xCoordinate, zCoordinate
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    document.querySelector('body').addEventListener('click', onRemoveClick)
    document.querySelector('body').addEventListener('click', onAddClick)

    function onAddClick(event) {
      if (addCube || addTetra || addOcta || addDodeca || addIcosa) {
        var rect = renderer.domElement.getBoundingClientRect()
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

        // Update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera)

        // Calculate objects intersecting the picking ray
        var intersects = raycaster.intersectObjects(scene.children)

        for (let i = 0; i < intersects.length; i++) {
          var intersectedObject = intersects[i]?.object
          if (intersectedObject.geometry.type == 'PlaneGeometry') {
            console.log(intersects[i].point)
            xCoordinate = intersects[i].point.x
            zCoordinate = intersects[i].point.z

            if (addCube) {
              createCube()
              if (presence) {
                presence.sendMessage(presence.getSharedInfo().id, {
                  user: presence.getUserInfo(),
                  content: {
                    shape: 'cube',
                    color: currentenv.user.colorvalue.fill,
                    ifTransparent: toggleTransparent,
                    ifNumbers: showNumbers,
                    xCoordinateShared: xCoordinate,
                    zCoordinateShared: zCoordinate,
                    ifImage: showImage,
                    sharedImageData: imageData
                  },
                })
              }
            } else if (addTetra) {
              createTetrahedron()
              if (presence) {
                presence.sendMessage(presence.getSharedInfo().id, {
                  user: presence.getUserInfo(),
                  content: {
                    shape: 'tetra',
                    color: currentenv.user.colorvalue.fill,
                    ifTransparent: toggleTransparent,
                    ifNumbers: showNumbers,
                    xCoordinateShared: xCoordinate,
                    zCoordinateShared: zCoordinate,
                    ifImage: showImage,
                    sharedImageData: imageData
                  },
                })
              }
            } else if (addDodeca) {
              createDodecahedron()
              if (presence) {
                presence.sendMessage(presence.getSharedInfo().id, {
                  user: presence.getUserInfo(),
                  content: {
                    shape: 'dodeca',
                    color: currentenv.user.colorvalue.fill,
                    ifTransparent: toggleTransparent,
                    ifNumbers: showNumbers,
                    xCoordinateShared: xCoordinate,
                    zCoordinateShared: zCoordinate,
                    ifImage: showImage,
                    sharedImageData: imageData
                  },
                })
              }
            } else if (addIcosa) {
              createIcosahedron()
              if (presence) {
                presence.sendMessage(presence.getSharedInfo().id, {
                  user: presence.getUserInfo(),
                  content: {
                    shape: 'icosa',
                    color: currentenv.user.colorvalue.fill,
                    ifTransparent: toggleTransparent,
                    ifNumbers: showNumbers,
                    xCoordinateShared: xCoordinate,
                    zCoordinateShared: zCoordinate,
                    ifImage: showImage,
                    sharedImageData: imageData
                  },
                })
              }
            } else {
              createOctahedron()
              if (presence) {
                console.log(showImage);
                presence.sendMessage(presence.getSharedInfo().id, {
                  user: presence.getUserInfo(),
                  content: {
                    shape: 'octa',
                    color: currentenv.user.colorvalue.fill,
                    ifTransparent: toggleTransparent,
                    ifNumbers: showNumbers,
                    xCoordinateShared: xCoordinate,
                    zCoordinateShared: zCoordinate,
                    ifImage: showImage,
                    sharedImageData: imageData
                  },
                })
              }
            }
          }
        }
      }
    }
    function onRemoveClick(event) {
      if (removeVolume) {
        // Calculate mouse position in normalized device coordinates
        var rect = renderer.domElement.getBoundingClientRect()
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

        // Update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera)

        // Calculate objects intersecting the picking ray
        var intersects = raycaster.intersectObjects(scene.children)

        var intersectedObject = intersects[0]?.object
        if (intersectedObject.geometry.type == 'PlaneGeometry') {
          return
        }
        for (let i = 0; i < diceArray.length; i++) {
          if (diceArray[i][0] == intersectedObject) {
            world.removeBody(diceArray[i][1])
            scene.remove(diceArray[i][0])
            diceArray.splice(i, 1)
          }
        }
      }
    }

    var presence = null
    var palette = new presencepalette.PresencePalette(
      document.getElementById('network-button'),
      undefined,
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
          'org.sugarlabs.Volume',
          function (groupId) {
            console.log('Activity shared')
          },
        )
        network.onDataReceived(onNetworkDataReceived)
      })
    })

    // document
    //   .querySelector('#reset-button')
    //   .addEventListener('click', function () {
    //     presentScore = 0
    //     totalScoreElement.textContent = 0
    //     lastRoll = ''
    //     lastRollElement.textContent = ''
    //     if (presence) {
    //       presence.sendMessage(presence.getSharedInfo().id, {
    //         user: presence.getUserInfo(),
    //         action: 'resetScore',
    //       })
    //     }
    //   })
    let sleepCounter = 0;
    renderer.setSize(window.innerWidth, window.innerHeight)
    const canvas = document.getElementById('game-container')
    document.getElementById('game-container').appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(presentColor)
    const light = new THREE.DirectionalLight(0xffffff, 0.7)
    light.castShadow = true
    const leftLight = new THREE.DirectionalLight(0xffffff, 0.25)
    leftLight.castShadow = true
    const rightLight = new THREE.DirectionalLight(0xffffff, 0.2)
    rightLight.castShadow = true
    const backLight = new THREE.DirectionalLight(0xffffff, 0.2)
    const bottomLight = new THREE.DirectionalLight(0xffffff, 0.1)
    const topLight = new THREE.DirectionalLight(0xffffff, 0.7)
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

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    )

    const world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.81, 0),
    })
    world.allowSleep = true

    const groundGeo = new THREE.PlaneGeometry(30, 30)
    const groundMat = new THREE.MeshPhongMaterial({
      side: THREE.DoubleSide,
      wireframe: false,
    })
    groundMat.needsUpdate = true
    const groundMesh = new THREE.Mesh(groundGeo, groundMat)
    groundMesh.receiveShadow = true

    groundMesh.material.color.setHex(0x425eff)
    scene.add(groundMesh)
    const groundPhysMat = new CANNON.Material()
    const groundWidth = 0 // Desired width of the ground
    const groundDepth = 0 // Desired depth of the ground
    const groundThickness = 0
    const boxWidth = groundWidth / 2
    const boxDepth = groundDepth / 2
    const boxHeight = 10 // Adjust this for desired box height

    const boxShape = new CANNON.Box(
      new CANNON.Vec3(boxWidth, boxHeight / 2, boxDepth),
    )

    const groundBody = new CANNON.Body({
      shape: new CANNON.Box(new CANNON.Vec3(15, 15, 0.1)),
      type: CANNON.Body.STATIC,
      material: groundPhysMat,
    })
    groundBody.material.friction = 1
    world.addBody(groundBody)
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)

    const leftWallBody = new CANNON.Body({
      shape: new CANNON.Box(new CANNON.Vec3(15, 100, 0.1)),
      type: CANNON.Body.STATIC,
      material: groundPhysMat,
      friction: -10,
      restitution: 10,
    })
    world.addBody(leftWallBody)
    leftWallBody.position.set(15, 0, 0)
    leftWallBody.quaternion.setFromEuler(0, -Math.PI / 2, 0)

    const rightWallBody = new CANNON.Body({
      shape: new CANNON.Box(new CANNON.Vec3(15, 100, 0.1)),
      type: CANNON.Body.STATIC,
      material: groundPhysMat,
      friction: -10,
      restitution: 10,
    })
    world.addBody(rightWallBody)
    rightWallBody.position.set(-15, 0, 0)
    rightWallBody.quaternion.setFromEuler(0, -Math.PI / 2, 0)

    const backWallBody = new CANNON.Body({
      shape: new CANNON.Box(new CANNON.Vec3(100, 15, 0.1)),
      type: CANNON.Body.STATIC,
      material: groundPhysMat,
      friction: -10,
      restitution: 10,
    })
    world.addBody(backWallBody)
    backWallBody.position.set(0, 0, 15)
    backWallBody.quaternion.setFromEuler(0, 0, -Math.PI / 2)

    const frontWallBody = new CANNON.Body({
      shape: new CANNON.Box(new CANNON.Vec3(100, 15, 0.1)),
      type: CANNON.Body.STATIC,
      material: groundPhysMat,
      friction: -10,
      restitution: 10,
    })
    world.addBody(frontWallBody)
    frontWallBody.position.set(0, 0, -15)
    frontWallBody.quaternion.setFromEuler(0, 0, -Math.PI / 2)

    const rollingForceMagnitude = 2 // Adjust for desired intensity
    const randomDirection = new CANNON.Vec3(
      Math.random() - 0.5, // Random x-axis value between -0.5 and 0.5
      Math.random() * 0.2 - 0.1, // Random y-axis value between -0.1 and 0.1 (slightly tilted)
      Math.random() - 0.5, // Random z-axis value between -0.5 and 0.5
    )
    randomDirection.normalize() // Normalize to unit vector

    const rollingForce = randomDirection.scale(rollingForceMagnitude)

    const offset = new CANNON.Vec3(0, 0.1, 0)

    const orbit = new OrbitControls.OrbitControls(camera, renderer.domElement)
    camera.position.set(0, 25, -30)
    orbit.update()
    orbit.listenToKeyEvents(document.querySelector('body'))

    const goRightButton = document.querySelector('#right-button')
    const goLeftButton = document.querySelector('#left-button')
    const goUpButton = document.querySelector('#up-button')
    const goDownButton = document.querySelector('#down-button')

    // Add click event listener to the button
    goRightButton.addEventListener('click', function () {
      orbit.rotateRight()
    })

    goLeftButton.addEventListener('click', function () {
      orbit.rotateLeft()
    })
    goUpButton.addEventListener('click', function () {
      orbit.rotateUp()
    })
    goDownButton.addEventListener('click', function () {
      orbit.rotateDown()
    })
    // Zoom code
    const evt = new Event('wheel', { bubbles: true, cancelable: true })

    const zoomInButton = document.getElementById('zoom-in-button')
    const zoomOutButton = document.getElementById('zoom-out-button')

    const zoomInFunction = e => {
      const fov = getFov()
      camera.fov = clickZoom(fov, 'zoomIn')
      camera.updateProjectionMatrix()
    }

    const zoomOutFunction = e => {
      const fov = getFov()
      camera.fov = clickZoom(fov, 'zoomOut')
      camera.updateProjectionMatrix()
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
          Math.atan(camera.getFilmHeight() / 2 / camera.getFocalLength()) *
          180) /
          Math.PI,
      )
    }

    zoomInButton.addEventListener('click', zoomInFunction)
    zoomOutButton.addEventListener('click', zoomOutFunction)

    function createTetrahedron(
      sharedColor,
      ifNumbers,
      ifTransparent,
      xCoordinateShared,
      zCoordinateShared,
      ifImage,
      sharedImageData
    ) {
      let tetrahedron
      let tempShowNumbers = ifNumbers == null ? showNumbers : ifNumbers
      let tempTransparent =
        ifTransparent == null ? toggleTransparent : ifTransparent
      let tempImage = ifImage == null ? showImage : ifImage
      if (tempShowNumbers) {
        let tileDimension = new THREE.Vector2(4, 5)
        let tileSize = 512
        let g = new THREE.TetrahedronGeometry(2)

        let c = document.createElement('canvas')
        let div = document.createElement('div')
        c.width = tileSize * tileDimension.x
        c.height = tileSize * tileDimension.y
        let ctx = c.getContext('2d')
        ctx.fillStyle = presentColor
        ctx.fillRect(0, 0, c.width, c.height)

        let uvs = []

        let baseUVs = [
          [0.067, 0.25],
          [0.933, 0.25],
          [0.5, 1],
        ].map(p => {
          return new THREE.Vector2(...p)
        })
        let arrOfNums = [
          [2, 1, 3],
          [1, 2, 4],
          [3, 1, 4],
          [2, 3, 4],
        ]
        for (let i = 0; i < 4; i++) {
          let u = i % tileDimension.x
          let v = Math.floor(i / tileDimension.x)
          uvs.push(
            (baseUVs[0].x + u) / tileDimension.x,
            (baseUVs[0].y + v) / tileDimension.y,
            (baseUVs[1].x + u) / tileDimension.x,
            (baseUVs[1].y + v) / tileDimension.y,
            (baseUVs[2].x + u) / tileDimension.x,
            (baseUVs[2].y + v) / tileDimension.y,
          )

          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.font = `bold 150px Arial`
          ctx.fillStyle = textColor
          // ctx.fillText(
          //   i + 1,
          //   (u + 0.5) * tileSize,
          //   c.height - (v + 0.5) * tileSize
          // );
          let aStep = (Math.PI * 2) / 3
          let yAlign = Math.PI * 0.5
          let tileQuarter = tileSize * 0.25
          for (let j = 0; j < 3; j++) {
            ctx.save()
            ctx.translate(
              (u + 0.5) * tileSize + Math.cos(j * aStep - yAlign) * tileQuarter,
              c.height -
                (v + 0.5) * tileSize +
                Math.sin(j * aStep - yAlign) * tileQuarter,
            )
            ctx.rotate((j * Math.PI * 2) / 3)
            ctx.fillText(arrOfNums[i][j], 0, 0)
            ctx.restore()
          }
        }
        g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))

        let tex = new THREE.CanvasTexture(c)
        tex.colorSpace = THREE.SRGBColorSpace

        let m = new THREE.MeshPhongMaterial({
          map: tex,
        })

        tetrahedron = new THREE.Mesh(g, m)
      } else if (tempTransparent) {
        const tetrahedronTransparentGeometry = new THREE.TetrahedronGeometry(2) // Size of the tetrahedron
        const wireframe = new THREE.WireframeGeometry(
          tetrahedronTransparentGeometry,
        )
        const lineMaterial = new THREE.LineBasicMaterial({
          color: sharedColor != null ? sharedColor : presentColor,
          depthTest: true,
          opacity: 1,
          transparent: false,
        })
        const line = new THREE.LineSegments(wireframe, lineMaterial)
        tetrahedron = line
      } else if (tempImage) {
        const boxGeo = new THREE.TetrahedronGeometry(2)

        const texture = new THREE.TextureLoader().load(sharedImageData != null ? sharedImageData : imageData)
        
        
        // Create material using the texture
        const material = new THREE.MeshPhongMaterial({ map: texture })

        // Create cube mesh with the material
        tetrahedron = new THREE.Mesh(boxGeo, material)
      } else {
        const tetrahedronGeometry = new THREE.TetrahedronGeometry(2) // Size of the tetrahedron

        const tetraMaterial = new THREE.MeshStandardMaterial({
          color: sharedColor != null ? sharedColor : presentColor,
          wireframe: false,
        })

        tetrahedron = new THREE.Mesh(tetrahedronGeometry, tetraMaterial)
      }

      tetrahedron.rotation.set(Math.PI / 4, Math.PI / 4, 0) // Rotates 90 degrees on X, 45 degrees on Y
      tetrahedron.castShadow = true
      scene.add(tetrahedron)

      const verticesTetra = [
        new CANNON.Vec3(1, 1, 1), // Vertex 1 (right)
        new CANNON.Vec3(-1, -1, 1), // Vertex 2 (top)
        new CANNON.Vec3(-1, 1, -1), // Vertex 3 (left)
        new CANNON.Vec3(1, -1, -1), // Vertex 4 (front)
      ]
      const facesTetra = [
        [2, 1, 0], // Triangle 1 (right, top, left)
        [0, 3, 2], // Triangle 2 (right, front, top)
        [1, 3, 0], // Triangle 3 (top, front, left)
        [2, 3, 1], // Triangle 4 (left, right, front)
      ]
      // Create a ConvexPolyhedron shape from the vertices and faces
      const tetrahedronShape = new CANNON.ConvexPolyhedron({
        vertices: verticesTetra,
        faces: facesTetra,
      })

      let x = xCoordinateShared == null ? xCoordinate : xCoordinateShared
      let z = zCoordinateShared == null ? zCoordinate : zCoordinateShared

      const tetrahedronBody = new CANNON.Body({
        mass: 2, // Set mass
        shape: tetrahedronShape,
        position: new CANNON.Vec3(x, 10, z),
        friction: -1,
        restitution: 5,
      })
      if (tempShowNumbers) {
        tetrahedronBody.addEventListener('sleep', () => {
          sleepCounter++;
          getTetraScore(tetrahedron)
        })
      }
      world.addBody(tetrahedronBody)
      tetrahedronBody.angularVelocity.set(
        Math.random() - 0.5,
        Math.random(),
        Math.random() - 0.5,
      )
      tetrahedronBody.applyImpulse(offset, rollingForce)
      tetrahedron.position.copy(tetrahedronBody.position) // this merges the physics body to threejs mesh
      tetrahedron.quaternion.copy(tetrahedronBody.quaternion)
      diceArray.push([tetrahedron, tetrahedronBody, 'tetra'])
    }

    function createOctahedron(
      sharedColor,
      ifNumbers,
      ifTransparent,
      xCoordinateShared,
      zCoordinateShared,
      ifImage,
      sharedImageData
    ) {
      let octahedron
      let tempShowNumbers = ifNumbers == null ? showNumbers : ifNumbers
      let tempTransparent =
        ifTransparent == null ? toggleTransparent : ifTransparent
      let tempImage = ifImage == null ? showImage : ifImage
      if (tempShowNumbers) {
        let tileDimension = new THREE.Vector2(4, 5)
        let tileSize = 512
        let g = new THREE.OctahedronGeometry(2)

        let c = document.createElement('canvas')
        c.width = tileSize * tileDimension.x
        c.height = tileSize * tileDimension.y
        let ctx = c.getContext('2d')
        ctx.fillStyle = presentColor
        ctx.fillRect(0, 0, c.width, c.height)

        let uvs = []

        let baseUVs = [
          [0.067, 0.25],
          [0.933, 0.25],
          [0.5, 1],
        ].map(p => {
          return new THREE.Vector2(...p)
        })

        for (let i = 0; i < 9; i++) {
          let u = i % tileDimension.x
          let v = Math.floor(i / tileDimension.x)
          uvs.push(
            (baseUVs[0].x + u) / tileDimension.x,
            (baseUVs[0].y + v) / tileDimension.y,
            (baseUVs[1].x + u) / tileDimension.x,
            (baseUVs[1].y + v) / tileDimension.y,
            (baseUVs[2].x + u) / tileDimension.x,
            (baseUVs[2].y + v) / tileDimension.y,
          )

          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.font = `bold 200px Arial`
          ctx.fillStyle = textColor
          ctx.fillText(
            i + 1 + (i == 5 || i == 8 ? '' : ''),
            (u + 0.5) * tileSize,
            c.height - (v + 0.5) * tileSize,
          )
        }
        g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))

        let tex = new THREE.CanvasTexture(c)
        tex.colorSpace = THREE.SRGBColorSpace

        let m = new THREE.MeshPhongMaterial({
          map: tex,
        })

        octahedron = new THREE.Mesh(g, m)
      } else if (tempTransparent) {
        const octahedronTransparentGeometry = new THREE.OctahedronGeometry(2) // Size of the octahedron
        const wireframe = new THREE.WireframeGeometry(
          octahedronTransparentGeometry,
        )
        const lineMaterial = new THREE.LineBasicMaterial({
          color: sharedColor != null ? sharedColor : presentColor,
          depthTest: true,
          opacity: 1,
          transparent: false,
        })
        const line = new THREE.LineSegments(wireframe, lineMaterial)
        octahedron = line
      } else if (tempImage) {
        const octahedronGeometry = new THREE.OctahedronGeometry(2)

        const texture = new THREE.TextureLoader().load(sharedImageData != null ? sharedImageData : imageData)
        
        
        // Create material using the texture
        const material = new THREE.MeshPhongMaterial({ map: texture })

        // Create cube mesh with the material
        octahedron = new THREE.Mesh(octahedronGeometry, material)
      } else {
        const octahedronGeometry = new THREE.OctahedronGeometry(2) // Size of the octahedron

        const octaMaterial = new THREE.MeshPhongMaterial({
          color: sharedColor != null ? sharedColor : presentColor,
          wireframe: false,
        })
        octahedron = new THREE.Mesh(octahedronGeometry, octaMaterial)
      }
      octahedron.castShadow = true
      scene.add(octahedron)

      const verticesOcta = [
        new CANNON.Vec3(2, 0, 0), // Vertex 1 (right)
        new CANNON.Vec3(-2, 0, 0), // Vertex 2 (top)
        new CANNON.Vec3(0, 2, 0), // Vertex 3 (left)
        new CANNON.Vec3(0, -2, 0), // Vertex 4 (front)
        new CANNON.Vec3(0, 0, 2), // Vertex 4 (front)
        new CANNON.Vec3(0, 0, -2), // Vertex 4 (front)
      ]

      // Define the faces of the tetrahedron (counter-clockwise order)
      const facesOcta = [
        [0, 2, 4], // Triangle 1 (right, top, left)
        [0, 4, 3], // Triangle 2 (right, front, top)
        [0, 3, 5], // Triangle 3 (top, front, left)
        [0, 5, 2], // Triangle 4 (left, right, front)
        [1, 2, 5], // Triangle 1 (right, top, left)
        [1, 5, 3], // Triangle 1 (right, top, left)
        [1, 3, 4], // Triangle 1 (right, top, left)
        [1, 4, 2], // Triangle 1 (right, top, left)
      ]

      const octahedronShape = new CANNON.ConvexPolyhedron({
        vertices: verticesOcta,
        faces: facesOcta,
      })
      let x = xCoordinateShared == null ? xCoordinate : xCoordinateShared
      let z = zCoordinateShared == null ? zCoordinate : zCoordinateShared

      const octahedronBody = new CANNON.Body({
        mass: 2, // Set mass
        shape: octahedronShape,
        position: new CANNON.Vec3(x, 10, z),
        friction: -1,
        restitution: 5,
      })
      if (tempShowNumbers) {
        octahedronBody.addEventListener('sleep', () => {
          sleepCounter++;
          getOctaScore(octahedron)
        })
      }
      world.addBody(octahedronBody)

      octahedronBody.angularVelocity.set(
        Math.random() - 0.5,
        Math.random(),
        Math.random() - 0.5,
      )
      octahedronBody.applyImpulse(offset, rollingForce)
      octahedron.position.copy(octahedronBody.position) // this merges the physics body to threejs mesh
      octahedron.quaternion.copy(octahedronBody.quaternion)
      diceArray.push([octahedron, octahedronBody, 'octa'])
    }

    function createCube(
      sharedColor,
      ifNumbers,
      ifTransparent,
      xCoordinateShared,
      zCoordinateShared,
      ifImage,
      sharedImageData
    ) {
      let boxMesh
      let tempShowNumbers = ifNumbers == null ? showNumbers : ifNumbers
      let tempTransparent =
        ifTransparent == null ? toggleTransparent : ifTransparent
      let tempImage = ifImage == null ? showImage : ifImage;
      if (tempShowNumbers) {
        let tileDimension = new THREE.Vector2(4, 2)
        let tileSize = 512
        let g = new THREE.BoxGeometry(2, 2, 2)

        let c = document.createElement('canvas')
        c.width = tileSize * tileDimension.x
        c.height = tileSize * tileDimension.y
        let ctx = c.getContext('2d')
        ctx.fillStyle = sharedColor != null ? sharedColor : presentColor
        ctx.fillRect(0, 0, c.width, c.height)

        let baseUVs = [
          [0, 1],
          [1, 1],
          [0, 0],
          [1, 0],
        ].map(p => {
          return new THREE.Vector2(...p)
        })
        let uvs = []
        let vTemp = new THREE.Vector2()
        let vCenter = new THREE.Vector2(0.5, 0.5)
        for (let i = 0; i < 6; i++) {
          let u = i % tileDimension.x
          let v = Math.floor(i / tileDimension.x)
          baseUVs.forEach(buv => {
            uvs.push(
              (buv.x + u) / tileDimension.x,
              (buv.y + v) / tileDimension.y,
            )
          })

          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.font = `bold 300px Arial`
          ctx.fillStyle = textColor
          ctx.fillText(
            i + 1,
            (u + 0.5) * tileSize,
            c.height - (v + 0.5) * tileSize,
          )
        }
        g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))

        let tex = new THREE.CanvasTexture(c)
        tex.colorSpace = THREE.SRGBColorSpace

        let m = new THREE.MeshPhongMaterial({
          map: tex,
          // metalness: 0.75,
          // roughness: 0.25,
        })

        boxMesh = new THREE.Mesh(g, m)
      } else if (tempTransparent) {
        const boxTransparentGeometry = new THREE.BoxGeometry(2, 2, 2)
        const wireframe = new THREE.WireframeGeometry(boxTransparentGeometry)
        const lineMaterial = new THREE.LineBasicMaterial({
          color: sharedColor != null ? sharedColor : presentColor,
          depthTest: true,
          opacity: 1,
          transparent: false,
        })
        const line = new THREE.LineSegments(wireframe, lineMaterial)
        boxMesh = line
      } else if (tempImage) {
        const boxGeo = new THREE.BoxGeometry(2, 2, 2)

        const texture = new THREE.TextureLoader().load(sharedImageData != null ? sharedImageData : imageData)
        
        
        // Create material using the texture
        const material = new THREE.MeshPhongMaterial({ map: texture })

        // Create cube mesh with the material
        boxMesh = new THREE.Mesh(boxGeo, material)
      }  else {
        const boxGeo = new THREE.BoxGeometry(2, 2, 2)
        const boxMat = new THREE.MeshPhongMaterial({
          color: sharedColor != null ? sharedColor : presentColor,
          wireframe: false,
        })
        boxMesh = new THREE.Mesh(boxGeo, boxMat)
      }
      boxMesh.castShadow = true
      scene.add(boxMesh)

      const boxPhysmat = new CANNON.Material()
      let x = xCoordinateShared == null ? xCoordinate : xCoordinateShared
      let z = zCoordinateShared == null ? zCoordinate : zCoordinateShared
      const boxBody = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
        position: new CANNON.Vec3(xCoordinate, 10, zCoordinate),
        material: boxPhysmat,
        friction: 0.1,
        restitution: 5,
      })
      boxBody.addEventListener('click', function (boxBody) {
        console.log('clicked a box')
      })

      world.addBody(boxBody)
      if (tempShowNumbers) {
        boxBody.addEventListener('sleep', () => {
          sleepCounter++;
          getCubeScore(boxMesh)
        })
      }

      boxBody.angularVelocity.set(
        Math.random() - 0.5,
        Math.random(),
        Math.random() - 0.5,
      )
      boxBody.applyImpulse(offset, rollingForce)

      // what will happen when the two bodies touch
      const groundBoxContactMat = new CANNON.ContactMaterial(
        groundPhysMat,
        boxPhysmat,
        { friction: 0.5 },
      )

      world.addContactMaterial(groundBoxContactMat)
      diceArray.push([boxMesh, boxBody, 'cube'])
    }

    const cannonDebugger = new CannonDebugger(scene, world, {
      color: 0xadd8e6,
    })
    function createDodecahedron(
      sharedColor,
      ifNumbers,
      ifTransparent,
      xCoordinateShared,
      zCoordinateShared,
      ifImage,
      sharedImageData
    ) {
      console.log("creating a dodecahedron")
      let dodecahedron
      let tempShowNumbers = ifNumbers == null ? showNumbers : ifNumbers
      let tempTransparent =
        ifTransparent == null ? toggleTransparent : ifTransparent
      let tempImage = ifImage == null ? showImage : ifImage
      if (tempShowNumbers) {
        let tileDimension = new THREE.Vector2(4, 5)
        let tileSize = 512
        let g = new THREE.DodecahedronGeometry(2)

        let c = document.createElement('canvas')
        let div = document.createElement('div')
        c.width = tileSize * tileDimension.x
        c.height = tileSize * tileDimension.y
        let ctx = c.getContext('2d')
        ctx.fillStyle = presentColor
        ctx.fillRect(0, 0, c.width, c.height)

        let uvs = []

        let baseUVs = [
          [0.067, 0.25],
          [0.933, 0.25],
          [0.5, 1],
        ].map(p => {
          return new THREE.Vector2(...p)
        })
        let arrOfNums = [
          [2, 1, 3],
          [1, 2, 4],
          [3, 1, 4],
          [2, 3, 4],
        ]
        for (let i = 0; i < 4; i++) {
          let u = i % tileDimension.x
          let v = Math.floor(i / tileDimension.x)
          uvs.push(
            (baseUVs[0].x + u) / tileDimension.x,
            (baseUVs[0].y + v) / tileDimension.y,
            (baseUVs[1].x + u) / tileDimension.x,
            (baseUVs[1].y + v) / tileDimension.y,
            (baseUVs[2].x + u) / tileDimension.x,
            (baseUVs[2].y + v) / tileDimension.y,
          )

          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.font = `bold 150px Arial`
          ctx.fillStyle = textColor
          // ctx.fillText(
          //   i + 1,
          //   (u + 0.5) * tileSize,
          //   c.height - (v + 0.5) * tileSize
          // );
          let aStep = (Math.PI * 2) / 3
          let yAlign = Math.PI * 0.5
          let tileQuarter = tileSize * 0.25
          for (let j = 0; j < 3; j++) {
            ctx.save()
            ctx.translate(
              (u + 0.5) * tileSize + Math.cos(j * aStep - yAlign) * tileQuarter,
              c.height -
                (v + 0.5) * tileSize +
                Math.sin(j * aStep - yAlign) * tileQuarter,
            )
            ctx.rotate((j * Math.PI * 2) / 3)
            ctx.fillText(arrOfNums[i][j], 0, 0)
            ctx.restore()
          }
        }
        g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))

        let tex = new THREE.CanvasTexture(c)
        tex.colorSpace = THREE.SRGBColorSpace

        let m = new THREE.MeshPhongMaterial({
          map: tex,
        })

        dodecahedron = new THREE.Mesh(g, m)
      } else if (tempTransparent) {
        const dodecahedronTransparentGeometry = new THREE.DodecahedronGeometry(2) // Size of the dodecahedron   
        const wireframe = new THREE.WireframeGeometry(
          dodecahedronTransparentGeometry,
        )
        const lineMaterial = new THREE.LineBasicMaterial({
          color: sharedColor != null ? sharedColor : presentColor,
          depthTest: true,
          opacity: 1,
          transparent: false,
        })
        const line = new THREE.LineSegments(wireframe, lineMaterial)
        dodecahedron = line
      } else if (tempImage) {
        const boxGeo = new THREE.DodecahedronGeometry(2)

        const texture = new THREE.TextureLoader().load(sharedImageData != null ? sharedImageData : imageData)
        
        
        // Create material using the texture
        const material = new THREE.MeshPhongMaterial({ map: texture })

        // Create cube mesh with the material
        dodecahedron = new THREE.Mesh(boxGeo, material)
      } else {
        const dodecahedronGeometry = new THREE.DodecahedronGeometry(2) // Size of the dodecahedron

        const tetraMaterial = new THREE.MeshStandardMaterial({
          color: sharedColor != null ? sharedColor : presentColor,
          wireframe: false,
        })

        dodecahedron = new THREE.Mesh(dodecahedronGeometry, tetraMaterial)
      }

      dodecahedron.rotation.set(Math.PI / 4, Math.PI / 4, 0) // Rotates 90 degrees on X, 45 degrees on Y
      dodecahedron.castShadow = true
      scene.add(dodecahedron)

      // Vertices
const r = (1 + Math.sqrt(5)) / 2;
const t = 1 / r;
const verticesDodeca = [
    new CANNON.Vec3(-1, -1, -1), new CANNON.Vec3(-1, -1, 1),
    new CANNON.Vec3(-1, 1, -1), new CANNON.Vec3(-1, 1, 1),
    new CANNON.Vec3(1, -1, -1), new CANNON.Vec3(1, -1, 1),
    new CANNON.Vec3(1, 1, -1), new CANNON.Vec3(1, 1, 1),
    new CANNON.Vec3(0, -t, -r), new CANNON.Vec3(0, -t, r),
    new CANNON.Vec3(0, t, -r), new CANNON.Vec3(0, t, r),
    new CANNON.Vec3(-t, -r, 0), new CANNON.Vec3(-t, r, 0),
    new CANNON.Vec3(t, -r, 0), new CANNON.Vec3(t, r, 0),
    new CANNON.Vec3(-r, 0, -t), new CANNON.Vec3(r, 0, -t),
    new CANNON.Vec3(-r, 0, t), new CANNON.Vec3(r, 0, t)
];

// Faces
const facesDodeca = [
    [3, 11, 7], [3, 7, 15], [3, 15, 13],
    [7, 19, 17], [7, 17, 6], [7, 6, 15],
    [17, 4, 8], [17, 8, 10], [17, 10, 6],
    [8, 0, 16], [8, 16, 2], [8, 2, 10],
    [0, 12, 1], [0, 1, 18], [0, 18, 16],
    [6, 10, 2], [6, 2, 13], [6, 13, 15],
    [2, 16, 18], [2, 18, 3], [2, 3, 13],
    [18, 1, 9], [18, 9, 11], [18, 11, 3],
    [4, 14, 12], [4, 12, 0], [4, 0, 8],
    [11, 9, 5], [11, 5, 19], [11, 19, 7],
    [19, 5, 14], [19, 14, 4], [19, 4, 17],
    [1, 12, 14], [1, 14, 5], [1, 5, 9]
];

// Create a ConvexPolyhedron shape from the vertices and faces
const dodecahedronShape = new CANNON.ConvexPolyhedron({
    vertices: verticesDodeca,
    faces: facesDodeca
});


      let x = xCoordinateShared == null ? xCoordinate : xCoordinateShared
      let z = zCoordinateShared == null ? zCoordinate : zCoordinateShared

      const dodecahedronBody = new CANNON.Body({
        mass: 2, // Set mass
        shape: dodecahedronShape,
        position: new CANNON.Vec3(x, 10, z),
        friction: -1,
        restitution: 5,
      })
      if (tempShowNumbers) {
        dodecahedronBody.addEventListener('sleep', () => {
          sleepCounter++;
          getTetraScore(dodecahedron)
        })
      }
      world.addBody(dodecahedronBody)
      dodecahedronBody.angularVelocity.set(
        Math.random() - 0.5,
        Math.random(),
        Math.random() - 0.5,
      )
      dodecahedronBody.applyImpulse(offset, rollingForce)
      dodecahedron.position.copy(dodecahedronBody.position) // this merges the physics body to threejs mesh
      dodecahedron.quaternion.copy(dodecahedronBody.quaternion)
      diceArray.push([dodecahedron, dodecahedronBody, 'dodeca'])
    }

    function createIcosahedron(
      sharedColor,
      ifNumbers,
      ifTransparent,
      xCoordinateShared,
      zCoordinateShared,
      ifImage,
      sharedImageData
    ) {
      let icosahedron
      let tempShowNumbers = ifNumbers == null ? showNumbers : ifNumbers
      let tempTransparent =
        ifTransparent == null ? toggleTransparent : ifTransparent
      let tempImage = ifImage == null ? showImage : ifImage
      if (tempShowNumbers) {
        let tileDimension = new THREE.Vector2(4, 5)
        let tileSize = 512
        let g = new THREE.IcosahedronGeometry(2)

        let c = document.createElement('canvas')
        let div = document.createElement('div')
        c.width = tileSize * tileDimension.x
        c.height = tileSize * tileDimension.y
        let ctx = c.getContext('2d')
        ctx.fillStyle = presentColor
        ctx.fillRect(0, 0, c.width, c.height)

        let uvs = []

        let baseUVs = [
          [0.067, 0.25],
          [0.933, 0.25],
          [0.5, 1],
        ].map(p => {
          return new THREE.Vector2(...p)
        })
        let arrOfNums = [
          [2, 1, 3],
          [1, 2, 4],
          [3, 1, 4],
          [2, 3, 4],
        ]
        for (let i = 0; i < 4; i++) {
          let u = i % tileDimension.x
          let v = Math.floor(i / tileDimension.x)
          uvs.push(
            (baseUVs[0].x + u) / tileDimension.x,
            (baseUVs[0].y + v) / tileDimension.y,
            (baseUVs[1].x + u) / tileDimension.x,
            (baseUVs[1].y + v) / tileDimension.y,
            (baseUVs[2].x + u) / tileDimension.x,
            (baseUVs[2].y + v) / tileDimension.y,
          )

          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.font = `bold 150px Arial`
          ctx.fillStyle = textColor
          // ctx.fillText(
          //   i + 1,
          //   (u + 0.5) * tileSize,
          //   c.height - (v + 0.5) * tileSize
          // );
          let aStep = (Math.PI * 2) / 3
          let yAlign = Math.PI * 0.5
          let tileQuarter = tileSize * 0.25
          for (let j = 0; j < 3; j++) {
            ctx.save()
            ctx.translate(
              (u + 0.5) * tileSize + Math.cos(j * aStep - yAlign) * tileQuarter,
              c.height -
                (v + 0.5) * tileSize +
                Math.sin(j * aStep - yAlign) * tileQuarter,
            )
            ctx.rotate((j * Math.PI * 2) / 3)
            ctx.fillText(arrOfNums[i][j], 0, 0)
            ctx.restore()
          }
        }
        g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))

        let tex = new THREE.CanvasTexture(c)
        tex.colorSpace = THREE.SRGBColorSpace

        let m = new THREE.MeshPhongMaterial({
          map: tex,
        })

        icosahedron = new THREE.Mesh(g, m)
      } else if (tempTransparent) {
        const icosahedronTransparentGeometry = new THREE.IcosahedronGeometry(2) // Size of the Icosahedron   
        const wireframe = new THREE.WireframeGeometry(
          icosahedronTransparentGeometry,
        )
        const lineMaterial = new THREE.LineBasicMaterial({
          color: sharedColor != null ? sharedColor : presentColor,
          depthTest: true,
          opacity: 1,
          transparent: false,
        })
        const line = new THREE.LineSegments(wireframe, lineMaterial)
        icosahedron = line
      } else if (tempImage) {
        const boxGeo = new THREE.IcosahedronGeometry(2)

        const texture = new THREE.TextureLoader().load(sharedImageData != null ? sharedImageData : imageData)
        
        
        // Create material using the texture
        const material = new THREE.MeshPhongMaterial({ map: texture })

        // Create cube mesh with the material
        icosahedron = new THREE.Mesh(boxGeo, material)
      } else {
        const icosahedronGeometry = new THREE.IcosahedronGeometry(2) // Size of the icosahedron

        const tetraMaterial = new THREE.MeshStandardMaterial({
          color: sharedColor != null ? sharedColor : presentColor,
          wireframe: false,
        })

        icosahedron = new THREE.Mesh(icosahedronGeometry, tetraMaterial)
      }

      icosahedron.rotation.set(Math.PI / 4, Math.PI / 4, 0) // Rotates 90 degrees on X, 45 degrees on Y
      icosahedron.castShadow = true
      scene.add(icosahedron)

      // Vertices
// Vertices
const t = (1 + Math.sqrt(5)) / 2;
const verticesIcosa = [
    new CANNON.Vec3(-1, t, 0), new CANNON.Vec3(1, t, 0),
    new CANNON.Vec3(-1, -t, 0), new CANNON.Vec3(1, -t, 0),
    new CANNON.Vec3(0, -1, t), new CANNON.Vec3(0, 1, t),
    new CANNON.Vec3(0, -1, -t), new CANNON.Vec3(0, 1, -t),
    new CANNON.Vec3(t, 0, -1), new CANNON.Vec3(t, 0, 1),
    new CANNON.Vec3(-t, 0, -1), new CANNON.Vec3(-t, 0, 1)
];

// Faces
const facesIcosa = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
];

// Create a ConvexPolyhedron shape from the vertices and faces
const icosahedronShape = new CANNON.ConvexPolyhedron({
    vertices: verticesIcosa,
    faces: facesIcosa
});


      let x = xCoordinateShared == null ? xCoordinate : xCoordinateShared
      let z = zCoordinateShared == null ? zCoordinate : zCoordinateShared

      const icosahedronBody = new CANNON.Body({
        mass: 2, // Set mass
        shape: icosahedronShape,
        position: new CANNON.Vec3(x, 10, z),
        friction: -1,
        restitution: 5,
      })
      if (tempShowNumbers) {
        icosahedronBody.addEventListener('sleep', () => {
          sleepCounter++;
          getTetraScore(icosahedron)
        })
      }
      world.addBody(icosahedronBody)
      icosahedronBody.angularVelocity.set(
        Math.random() - 0.5,
        Math.random(),
        Math.random() - 0.5,
      )
      icosahedronBody.applyImpulse(offset, rollingForce)
      icosahedron.position.copy(icosahedronBody.position) // this merges the physics body to threejs mesh
      icosahedron.quaternion.copy(icosahedronBody.quaternion)
      diceArray.push([icosahedron, icosahedronBody, 'icosa'])
    }




    const timeStep = 1 / 20

    function throwDice() {
      for (let i = 0; i < diceArray.length; i++) {
        scene.remove(diceArray[i][0])
        world.removeBody(diceArray[i][1])
      }
      if (diceArray.length > 0) {
        lastRoll = ''
        presentScore = 0
        for (let i = 0; i < diceArray.length; i++) {
          diceArray[i][1].angularVelocity.set(
            Math.random() - 0.5,
            Math.random(),
            Math.random() - 0.5,
          )
          diceArray[i][1].applyImpulse(offset, rollingForce)
          diceArray[i][1].position.set(0, 10, 0)
        }
        for (let i = 0; i < diceArray.length; i++) {
          scene.add(diceArray[i][0])
          world.addBody(diceArray[i][1])
        }
      } else {
        for (let i = 0; i < dices.cube; i++) {
          createCube()
        }
        for (let i = 0; i < dices.tetra; i++) {
          createTetrahedron()
        }
        for (let i = 0; i < dices.octa; i++) {
          createOctahedron()
        }
        for (let i = 0; i < dices.dodeca; i++) {
          createDodecahedron()
        }
        for (let i = 0; i < dices.icosa; i++) {
          createIcosahedron()
        }
        lastRoll = ''
        // if (showNumbers) {
        //   getScore();
        // }
      }
    }
    function getOctaScore(body) {
      const faceVectors = [
        {
          vector: new THREE.Vector3(1, 0, 0), // Along the positive x-axis
          face: 4,
        },
        {
          vector: new THREE.Vector3(-1, 0, 0), // Along the negative x-axis
          face: 5,
        },
        {
          vector: new THREE.Vector3(0, 1, 0), // Along the positive y-axis
          face: 6,
        },
        {
          vector: new THREE.Vector3(0, -1, 0), // Along the negative y-axis
          face: 3,
        },
        {
          vector: new THREE.Vector3(1, 1, 1).normalize(), // Towards a corner (positive x, y, z)
          face: 1,
        },
        {
          vector: new THREE.Vector3(-1, 1, 1).normalize(), // Towards a corner (negative x, positive y, z)
          face: 8,
        },
        {
          vector: new THREE.Vector3(1, -1, 1).normalize(), // Towards a corner (positive x, negative y, z)
          face: 2,
        },
        {
          vector: new THREE.Vector3(-1, -1, 1).normalize(), // Towards a corner (negative x, negative y, z)
          face: 7,
        },
      ]

      let minValue = 1000000
      let minInd
      for (let i = 0; i < faceVectors.length; i++) {
        let faceVector = faceVectors[i]
        faceVector.vector.applyEuler(body.rotation)
        console.log(Math.abs(faceVector.vector.y))
        if (minValue > Math.abs(1 - faceVector.vector.y)) {
          minValue = Math.abs(1 - faceVector.vector.y)
          minInd = i
        }
        // if (Math.abs(faceVector.vector.y).toString().substring(0, 1) == '1') {
        //   lastRoll += faceVectors[i].face + ' +'
        //   presentScore += faceVectors[i].face
        //   updateElements()
        //   break
        // }
      }
      lastRoll += faceVectors[minInd].face + ' +'
      presentScore += faceVectors[minInd].face
      updateElements()
    }
    function getCubeScore(body) {
      const faceVectors = [
        {
          vector: new THREE.Vector3(1, 0, 0),
          face: 1,
        },
        {
          vector: new THREE.Vector3(-1, 0, 0),
          face: 2,
        },
        {
          vector: new THREE.Vector3(0, 1, 0),
          face: 3,
        },
        {
          vector: new THREE.Vector3(0, -1, 0),
          face: 4,
        },
        {
          vector: new THREE.Vector3(0, 0, 1),
          face: 5,
        },
        {
          vector: new THREE.Vector3(0, 0, -1),
          face: 6,
        },
      ]
      for (const faceVector of faceVectors) {
        faceVector.vector.applyEuler(body.rotation)

        if (Math.round(faceVector.vector.y) == 1) {
          lastRoll += faceVector.face + ' +'
          presentScore += faceVector.face
          updateElements()
          break
        }
      }
    }
    function getTetraScore(body) {
      const faceVectors = [
        {
          vector: new THREE.Vector3(1, 1, 1).normalize(), // Towards a corner (positive x, y, z)
          face: 1,
        },
        {
          vector: new THREE.Vector3(-1, -1, 1).normalize(), // Towards a corner (negative x, negative y, z)
          face: 3,
        },
        {
          vector: new THREE.Vector3(-1, 1, -1).normalize(), // Towards a corner (negative x, positive y, negative z)
          face: 2,
        },
        {
          vector: new THREE.Vector3(1, -1, -1).normalize(), // Towards a corner (positive x, negative y, negative z)
          face: 4,
        },
      ]

      for (const faceVector of faceVectors) {
        faceVector.vector.applyEuler(body.rotation)
        console.log(faceVector.vector.y)
        if (Math.round(faceVector.vector.y) == 1) {
          lastRoll += faceVector.face + ' +'
          presentScore += faceVector.face
          updateElements()
          break
        }
      }
    }
    function toggleTransparency() {
      for (let i = 0; i < diceArray.length; i++) {
        if (transparent) {
          leftLight.intensity = 5
          rightLight.intensity = 5
          backLight.intensity = 5
          bottomLight.intensity = 5
        } else {
          leftLight.intensity = 0.1
          rightLight.intensity = 0.1
          backLight.intensity = 0.5
          bottomLight.intensity = 0.1
        }
        diceArray[i][0].material.wireframe = !diceArray[i][0].material.wireframe
        diceArray[i][0].material.transparent =
          !diceArray[i][0].material.transparent
        diceArray[i][0].material.needsUpdate = true
      }
      groundMesh.material.wireframe = !groundMesh.material.wireframe
    }
    // function changeColors() {
    //   for (let i = 0; i < diceArray.length; i++) {
    //     diceArray[i][0].material.color?.set(presentColor);
    //     diceArray[i][0].material.needsUpdate = true;
    //   }
    // }

    function changeBoardBackground(selectedBoard) {
      let textureLoader = new THREE.TextureLoader()
      switch (selectedBoard) {
        case 'green-board':
          console.log('now changing bg to green')
          textureLoader.load(
            'images/grass_background.png',
            function (groundTexture) {
              groundMesh.material.wireframe = false
              groundMesh.material.map = groundTexture
              groundMesh.material.needsUpdate = true
              groundBody.material.friction = 5
            },
          )
          break
        case 'wood':
          console.log('wood changing')
          textureLoader.load('images/wood.png', function (groundTexture) {
            groundMesh.material.wireframe = false
            groundMesh.material.color.setHex(0xf0c592)
            groundMesh.material.map = groundTexture
            groundMesh.material.needsUpdate = true
            groundBody.material.friction = 3
          })
          break
        case 'default':
          groundMesh.material.needsUpdate = true
          groundMesh.material.color.setHex(0x425eff)
          groundMesh.material.wireframe = false
          groundMesh.material.map = null
          groundBody.material.friction = 1
          break
      }
    }
    animate()

    function animate() {
      world.step(timeStep)
      // cannonDebugger.update();

      groundMesh.position.copy(groundBody.position)
      groundMesh.quaternion.copy(groundBody.quaternion)

      // Loop to merge the cannon bodies to the threejs meshes
      for (let i = 0; i < diceArray.length; i++) {
        diceArray[i][0]?.position?.copy(diceArray[i][1].position)
        diceArray[i][0]?.quaternion?.copy(diceArray[i][1].quaternion)
      }

      renderer.render(scene, camera)
    }

    renderer.setAnimationLoop(animate)

    window.addEventListener('resize', function () {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    })
  })
})
