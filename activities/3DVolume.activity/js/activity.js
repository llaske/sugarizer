define([
  "sugar-web/activity/activity",
  "sugar-web/env",
  "./palettes/bgpalette",
  "./palettes/volumepalette",
  "./palettes/colorpalettefill",
  "./palettes/colorpalettetext",
  "./palettes/zoompalette",
  "sugar-web/graphics/presencepalette",
  "tutorial",
  "sugar-web/graphics/journalchooser",
  "sugar-web/datastore",
], function (
  activity,
  env,
  bgpalette,
  volumepalette,
  colorpaletteFill,
  colorpaletteText,
  zoompalette,
  presencepalette,
  tutorial,
  journalchooser,
  datastore
) {
  // Function to change the background color based on the provided string
  requirejs(["domReady!"], function (doc) {
    activity.setup();
    // Link presence palette
    var paletteBg = new bgpalette.BgPalette(
      document.getElementById("bg-button"),
      undefined
    );
    paletteBg.setBackgroundChangeCallback(changeBoardBackgroundHelper);
    function changeBoardBackgroundHelper(selectedBoard) {
      console.log("changing background from base func");
      if (presence) {
        presence.sendMessage(presence.getSharedInfo().id, {
          user: presence.getUserInfo(),
          action: "changeBg",
          content: selectedBoard,
        });
      }
      changeBoardBackground(selectedBoard);
    }
    var paletteVolume = new volumepalette.VolumePalette(
      document.getElementById("volume-button"),
      undefined
    );
    var paletteZoom = new zoompalette.ZoomPalette(
      document.getElementById("zoom-button"),
      undefined
    );
    var paletteColorFill = new colorpaletteFill.ColorPalette(
      document.getElementById("color-button-fill"),
      undefined
    );

    var paletteColorText = new colorpaletteText.ColorPalette(
      document.getElementById("color-button-text"),
      undefined
    );

    let presentScore = 0;
    let lastRoll = "";
    let diceArray = [];
    let journalDiceArray = [];
    let showNumbers = false;
    let showImage = false;
    let imageData;
    let presentColor;
    let textColor = "#ffffff";
    var currentenv;
    let removeVolume = false;
    let transparent = false;
    let toggleTransparent = false;
    let defaultVolume = true;

    var defaultButton = document.getElementById("default-button");
    defaultButton.classList.toggle("active");

    env.getEnvironment(function (err, environment) {
      currentenv = environment;

      presentColor =
        currentenv.user.colorvalue.fill != null
          ? currentenv.user.colorvalue.fill
          : presentColor;

      scene.background = new THREE.Color("#A9A9A9");
      console.log(presentColor);

      textColor =
        currentenv.user.colorvalue.stroke != null
          ? currentenv.user.colorvalue.stroke
          : textColor;

      document.getElementById("color-button-fill").style.backgroundColor =
        presentColor;
      document.getElementById("color-button-text").style.backgroundColor =
        textColor;

      if (environment.sharedId) {
        console.log("Shared instance");
        presence = activity.getPresenceObject(function (error, network) {
          network.onDataReceived(onNetworkDataReceived);
        });
      }
    });

    var onNetworkDataReceived = function (msg) {
      if (presence.getUserInfo().networkId === msg.user.networkId) {
        return;
      }
      if (msg.action == "init") {
        data = msg.content;
        console.log(data);
        for (let i = 0; i < data.length; i++) {
          let fillColorStored = data[i][3];
          let textColorStored = data[i][4];
          switch (data[i][0]) {
            case "cube":
              createCube(
                fillColorStored,
                data[i][5],
                data[i][6],
                data[i][1].x,
                data[i][1].z,
                false,
                null,
                data[i][1].y,
                data[i][2],
                textColorStored
              );
              break;
            case "octa":
              createOctahedron(
                fillColorStored,
                data[i][5],
                data[i][6],
                data[i][1].x,
                data[i][1].z,
                false,
                null,
                data[i][1].y,
                data[i][2],
                textColorStored
              );
              break;
            case "tetra":
              createTetrahedron(
                fillColorStored,
                data[i][5],
                data[i][6],
                data[i][1].x,
                data[i][1].z,
                false,
                null,
                data[i][1].y,
                data[i][2],
                textColorStored
              );
              break;
            case "deca":
              createDecahedron(
                fillColorStored,
                data[i][5],
                data[i][6],
                data[i][1].x,
                data[i][1].z,
                false,
                null,
                data[i][1].y,
                data[i][2],
                textColorStored
              );
              break;
            case "dodeca":
              createDodecahedron(
                fillColorStored,
                data[i][5],
                data[i][6],
                data[i][1].x,
                data[i][1].z,
                false,
                null,
                data[i][1].y,
                data[i][2],
                textColorStored
              );
              break;
            case "icosa":
              createIcosahedron(
                fillColorStored,
                data[i][5],
                data[i][6],
                data[i][1].x,
                data[i][1].z,
                false,
                null,
                data[i][1].y,
                data[i][2],
                textColorStored
              );
              break;
            default:
              // Default case (optional): Handle unexpected values
              console.log(`Unexpected shape: ${data[i][0]}`);
              break;
          }
        }
      }
      if (msg.action == "throw") {
        throwDice();
      }
      if (msg.action == "changeBg") {
        changeBoardBackground(msg.content);
      }
      if (msg.action == "resetScore") {
        presentScore = 0;
        totalScoreElement.textContent = 0;
        lastRoll = "";
        lastRollElement.textContent = "";
      }
      if (msg.action == "remove") {
        raycaster.setFromCamera(msg.content, camera);
        var intersects = raycaster.intersectObjects(scene.children);

        var intersectedObject = intersects[0]?.object;
        if (intersectedObject?.geometry.type == "PlaneGeometry") {
          return;
        }
        remove(intersectedObject);
      }
      let createFunction = null;

      switch (msg.content.shape) {
        case "cube":
          createFunction = createCube;
          break;
        case "octa":
          createFunction = createOctahedron;
          break;
        case "tetra":
          createFunction = createTetrahedron;
          break;
        case "dodeca":
          createFunction = createDodecahedron;
          break;
        case "deca":
          createFunction = createDecahedron;
          break;
        case "icosa":
          createFunction = createIcosahedron;
          break;
        default:
          console.error("Unknown shape: " + msg.content.shape);
          break;
      }

      if (createFunction) {
        createFunction(
          msg.content.color,
          msg.content.ifNumbers,
          msg.content.ifTransparent,
          msg.content.xCoordinateShared,
          msg.content.zCoordinateShared,
          msg.content.ifImage,
          msg.content.sharedImageData,
          msg.content.yCoordinateShared,
          msg.content.quaternionShared,
          msg.content.sharedTextColor
        );
      }
    };

    document
      .getElementById("stop-button")
      .addEventListener("click", function (event) {
        for (let i = 0; i < diceArray.length; i++) {
          journalDiceArray.push([
            diceArray[i][2],
            diceArray[i][1].position,
            diceArray[i][1].quaternion,
            diceArray[i][5],
            diceArray[i][6],
            diceArray[i][3],
            diceArray[i][4],
          ]);
        }
        console.log("writing...");
        var jsonData = JSON.stringify(journalDiceArray);
        console.log(jsonData);
        activity.getDatastoreObject().setDataAsText(jsonData);
        activity.getDatastoreObject().save(function (error) {
          if (error === null) {
            console.log("write done.");
          } else {
            console.log("write failed.");
          }
        });
      });

    env.getEnvironment(function (err, environment) {
      currentenv = environment;

      // Load from datastore
      if (!environment.objectId) {
        console.log("New instance");
      } else {
        activity
          .getDatastoreObject()
          .loadAsText(function (error, metadata, data) {
            if (error == null && data != null) {
              data = JSON.parse(data);
              for (let i = 0; i < data.length; i++) {
                let fillColorStored = data[i][3];
                let textColorStored = data[i][4];
                switch (data[i][0]) {
                  case "cube":
                    createFunction = createCube;
                    break;
                  case "octa":
                    createFunction = createOctahedron;
                    break;
                  case "tetra":
                    createFunction = createTetrahedron;
                    break;
                  case "deca":
                    createFunction = createDecahedron;
                    break;
                  case "dodeca":
                    createFunction = createDodecahedron;
                    break;
                  case "icosa":
                    createFunction = createIcosahedron;
                    break;
                  default:
                    console.log(`Unexpected shape: ${data[i][0]}`);
                    break;
                }

                if (createFunction) {
                  createFunction(
                    fillColorStored,
                    data[i][5],
                    data[i][6],
                    data[i][1].x,
                    data[i][1].z,
                    false,
                    null,
                    data[i][1].y,
                    data[i][2],
                    textColorStored
                  );
                }
              }
            }
          });
      }
    });

    // Launch tutorial
    document
      .getElementById("help-button")
      .addEventListener("click", function (e) {
        tutorial.start();
      });

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
      presentColor = hexColor;
      document.getElementById("color-button-fill").style.backgroundColor =
        presentColor;
    }

    function updateSlidersFill(color) {
      const rgb = color.match(/\d+/g).map((num) => parseInt(num, 10));
      redSliderFill.value = rgb[0];
      greenSliderFill.value = rgb[1];
      blueSliderFill.value = rgb[2];
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
      presentColor = selectedColorFill;
      document.getElementById("color-button-fill").style.backgroundColor =
        presentColor;
      updateSlidersFill(selectedColorFill);
    });

    const redSliderText = document.getElementById("red-slider-text");
    const greenSliderText = document.getElementById("green-slider-text");
    const blueSliderText = document.getElementById("blue-slider-text");

    let sliderColorText = { r: 0, g: 0, b: 0 };

    function updateColorDisplayText() {
      const hexColor = rgbToHex(
        sliderColorText.r,
        sliderColorText.g,
        sliderColorText.b
      );
      textColor = hexColor;
      document.getElementById("color-button-text").style.backgroundColor =
        textColor;
    }

    function updateSlidersText(color) {
      const rgb = color.match(/\d+/g).map((num) => parseInt(num, 10));
      redSliderText.value = rgb[0];
      greenSliderText.value = rgb[1];
      blueSliderText.value = rgb[2];
    }

    function handleSliderChangeText() {
      sliderColorText = {
        r: parseInt(redSliderText.value),
        g: parseInt(greenSliderText.value),
        b: parseInt(blueSliderText.value),
      };
      updateColorDisplayText();
    }

    redSliderText.addEventListener("input", handleSliderChangeText);
    greenSliderText.addEventListener("input", handleSliderChangeText);
    blueSliderText.addEventListener("input", handleSliderChangeText);

    document.addEventListener("color-selected-text", function (event) {
      const selectedColorText = event.detail.color;
      textColor = selectedColorText;
      document.getElementById("color-button-text").style.backgroundColor =
        textColor;
      updateSlidersText(selectedColorText);
    });

    // document.addEventListener('color-selected-fill', function (event) {
    //   const selectedColor = event.detail.color;
    //   presentColor = selectedColor;
    //   document.getElementById('color-button-fill').style.backgroundColor = presentColor;
    //   updateSlidersFill(selectedColor);
    // });

    function updateDice(type, value) {
      dices[type] += value;
      document.getElementById(type).innerHTML = "<br />" + dices[type];
    }

    document.querySelector("#throw-button").addEventListener("click", () => {
      throwDice();
      if (presence) {
        presence.sendMessage(presence.getSharedInfo().id, {
          user: presence.getUserInfo(),
          action: "throw",
        });
      }
    });

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

    document.querySelector("#number-button").addEventListener("click", () => {
      var numberButton = document.getElementById("number-button");
      numberButton.classList.toggle("active");
      document.getElementById("volume-button").style.backgroundImage =
        "url(icons/number_volume.svg)";
      if (defaultVolume) {
        var defaultButton = document.getElementById("default-button");
        defaultButton.classList.toggle("active");
        defaultVolume = !defaultVolume;
      }
      if (toggleTransparent) {
        var transparentButton = document.getElementById("transparent-button");
        transparentButton.classList.toggle("active");
        toggleTransparent = !toggleTransparent;
      }
      if (showImage) {
        var imageButton1 = document.getElementById("image-button");
        imageButton1.classList.toggle("active");
        showImage = !showImage;
      }
      showNumbers = !showNumbers;
      // toggleNumbers();
    });

    document
      .querySelector("#transparent-button")
      .addEventListener("click", () => {
        var transparentButton = document.getElementById("transparent-button");
        // Toggle the 'active' class on the clear button
        transparentButton.classList.toggle("active");
        document.getElementById("volume-button").style.backgroundImage =
          "url(icons/transparent_volume.svg)";
        console.log(defaultVolume);

        if (defaultVolume) {
          console.log("it is true");
          var defaultButton = document.getElementById("default-button");
          defaultButton.classList.toggle("active");
          defaultVolume = !defaultVolume;
        }

        if (showNumbers) {
          var numberButton = document.getElementById("number-button");
          numberButton.classList.toggle("active");
          showNumbers = !showNumbers;
        }
        if (showImage) {
          var imageButton1 = document.getElementById("image-button");
          imageButton1.classList.toggle("active");
          showImage = !showImage;
        }
        toggleTransparent = !toggleTransparent;
      });

    document
      .querySelector("#default-button")
      .addEventListener("click", (event) => {
        var defaultButton = document.getElementById("default-button");
        // Toggle the 'active' class on the clear button
        defaultButton.classList.toggle("active");
        document.getElementById("volume-button").style.backgroundImage =
          "url(icons/default_volume.svg)";

        if (toggleTransparent) {
          var transparentButton = document.getElementById("transparent-button");
          transparentButton.classList.toggle("active");
          toggleTransparent = !toggleTransparent;
        }

        if (showNumbers) {
          var numberButton = document.getElementById("number-button");
          numberButton.classList.toggle("active");
          showNumbers = !showNumbers;
        }
        if (showImage) {
          var imageButton1 = document.getElementById("image-button");
          imageButton1.classList.toggle("active");
          showImage = !showImage;
        }
        defaultVolume = !defaultVolume;
      });

    let addShape = {
      cube: true,
      tetra: false,
      octa: false,
      dodeca: false,
      deca: false,
      icosa: false,
    };
    document.getElementById("cube-button").classList.toggle("active");

    const buttons = ["cube", "tetra", "octa", "dodeca", "deca", "icosa"];
    const clearButton = document.getElementById("clear-button");
    const removeButton = document.querySelector("#clear-button");
    const solidButton = document.querySelector("#solid-button");

    const toggleShape = (shape) => {
      buttons.forEach((btn) => {
        addShape[btn] = btn === shape;
        document
          .getElementById(`${btn}-button`)
          .classList.toggle("active", btn === shape);
      });
      removeVolume = false;
      removeButton.classList.remove("active");

      if (transparent) {
        transparent = false;
        solidButton.style.backgroundImage = "url(icons/cube_solid.svg)";
        toggleTransparency();
      }
    };

    clearButton.addEventListener("click", () => {
      clearButton.classList.toggle("active");
      removeVolume = !removeVolume;
      buttons.forEach((btn) => {
        addShape[btn] = false;
        document.getElementById(`${btn}-button`).classList.remove("active");
      });
    });

    removeButton.addEventListener("click", () => {
      if (!removeButton.classList.contains("active")) {
        buttons.forEach((btn) => {
          addShape[btn] = false;
          document.getElementById(`${btn}-button`).classList.remove("active");
        });
        removeVolume = true;
        removeButton.classList.add("active");

        if (transparent) {
          transparent = false;
          solidButton.style.backgroundImage = "url(icons/cube_solid.svg)";
          toggleTransparency();
        }
      }
    });

    buttons.forEach((shape) => {
      document
        .getElementById(`${shape}-button`)
        .addEventListener("click", () => {
          if (
            !document
              .getElementById(`${shape}-button`)
              .classList.contains("active")
          ) {
            toggleShape(shape);
          }
        });
    });

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

    const lastRollElement = document.getElementById("roll");

    // Function to update the elements
    function updateElements() {
      // totalScoreElement.textContent = presentScore
      lastRollElement.textContent =
        lastRoll.substring(0, lastRoll.length - 2) + "= " + presentScore;
    }

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.shadowMap.enabled = true;

    let xCoordinate, zCoordinate, yCoordinate;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    document.querySelector("body").addEventListener("click", onRemoveClick);
    document.querySelector("body").addEventListener("click", onAddClick);

    function onAddClick(event) {
      if (!removeVolume) {
        var rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);

        // Calculate objects intersecting the picking ray
        var intersects = raycaster.intersectObjects(scene.children);

        for (let i = 0; i < intersects.length; i++) {
          var intersectedObject = intersects[i]?.object;
          if (intersectedObject.geometry.type == "PlaneGeometry") {
            xCoordinate = intersects[i].point.x;
            zCoordinate = intersects[i].point.z;

            let createFunction = null;
            let shapeType = null;

            if (addShape["cube"]) {
              createFunction = createCube;
              shapeType = "cube";
            } else if (addShape["tetra"]) {
              createFunction = createTetrahedron;
              shapeType = "tetra";
            } else if (addShape["deca"]) {
              createFunction = createDecahedron;
              shapeType = "deca";
            } else if (addShape["dodeca"]) {
              createFunction = createDodecahedron;
              shapeType = "dodeca";
            } else if (addShape["icosa"]) {
              createFunction = createIcosahedron;
              shapeType = "icosa";
            } else if (addShape["octa"]) {
              createFunction = createOctahedron;
              shapeType = "octa";
            }

            if (createFunction) {
              createFunction();

              if (presence) {
                presence.sendMessage(presence.getSharedInfo().id, {
                  user: presence.getUserInfo(),
                  content: {
                    shape: shapeType,
                    color: presentColor,
                    ifTransparent: toggleTransparent,
                    ifNumbers: showNumbers,
                    xCoordinateShared: xCoordinate,
                    zCoordinateShared: zCoordinate,
                    ifImage: showImage,
                    sharedImageData: imageData,
                    yCoordinateShared: null,
                    quaternionShared: null,
                    sharedTextColor: textColor,
                  },
                });
              }
            }
          }
        }
      }
    }
    function onRemoveClick(event) {
      if (removeVolume) {
        // Calculate mouse position in normalized device coordinates
        var rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);

        // Calculate objects intersecting the picking ray
        var intersects = raycaster.intersectObjects(scene.children);

        var intersectedObject = intersects[0]?.object;
        if (intersectedObject?.geometry.type == "PlaneGeometry") {
          return;
        }
        if (presence) {
          presence.sendMessage(presence.getSharedInfo().id, {
            user: presence.getUserInfo(),
            action: "remove",
            content: mouse,
          });
        }

        remove(intersectedObject);
      }
    }
    function remove(intersectedObject) {
      let num = 0;
      for (let i = 0; i < diceArray.length; i++) {
        if (diceArray[i][3]) {
          num++;
        }
      }
      for (let i = 0; i < diceArray.length; i++) {
        if (diceArray[i][0] == intersectedObject) {
          if (diceArray[i][3]) {
            let score;
            switch (diceArray[i][2]) {
              case "cube":
                score = getCubeScore(diceArray[i][0], true);
                break;
              case "icosa":
                score = getIcosaScore(diceArray[i][0], true);
                break;
              case "deca":
                score = getDecaScore(diceArray[i][0], true);
                break;
              case "dodeca":
                score = getDodecaScore(diceArray[i][0], true);
                break;
              case "octa":
                score = getOctaScore(diceArray[i][0], true);
                break;
              case "tetra":
                score = getTetraScore(diceArray[i][0], true);
                break;
              default:
                console.log(`Unknown type: ${diceArray[i][3]}`);
                continue;
            }
            presentScore = presentScore - score;
            console.log(presentScore);

            let scoresArray = lastRoll.split(" + ");

            // Find the index of the first occurrence of the score to remove
            let indexToRemove = scoresArray.indexOf(score.toString());

            // If the score is found, remove it
            if (indexToRemove !== -1) {
              scoresArray.splice(indexToRemove, 1);
            }

            // Join the remaining scores back into a string
            lastRoll = scoresArray.join(" + ");
            updateElements();
            console.log(lastRoll);
            console.log(presentScore);
            num--;
          }
          world.removeBody(diceArray[i][1]);
          scene.remove(diceArray[i][0]);
          diceArray.splice(i, 1);
        }
      }
      if (num == 0) {
        lastRollElement.textContent = "";
        lastRoll = "";
        presentScore = 0;
      }
    }

    var presence = null;
    var palette = new presencepalette.PresencePalette(
      document.getElementById("network-button"),
      undefined
    );
    palette.addEventListener("shared", function () {
      palette.popDown();
      console.log("Want to share");
      presence = activity.getPresenceObject(function (error, network) {
        if (error) {
          console.log("Sharing error");
          return;
        }
        network.createSharedActivity(
          "org.sugarlabs.3DVolume",
          function (groupId) {
            console.log("Activity shared");
          }
        );
        network.onDataReceived(onNetworkDataReceived);
        network.onSharedActivityUserChanged(onNetworkUserChanged);
      });
    });

    var onNetworkUserChanged = function (msg) {
      let presenceDiceArray = [];
      for (let i = 0; i < diceArray.length; i++) {
        presenceDiceArray.push([
          diceArray[i][2],
          diceArray[i][1].position,
          diceArray[i][1].quaternion,
          diceArray[i][5],
          diceArray[i][6],
          diceArray[i][3],
          diceArray[i][4],
        ]);
      }
      presence.sendMessage(presence.getSharedInfo().id, {
        user: presence.getUserInfo(),
        action: "init",
        content: presenceDiceArray,
      });
    };

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
    renderer.setSize(window.innerWidth, window.innerHeight);
    const canvas = document.getElementById("game-container");
    document.getElementById("game-container").appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(presentColor);
    const light = new THREE.DirectionalLight(0xffffff, 0.4);
    light.castShadow = true;
    const leftLight = new THREE.DirectionalLight(0xffffff, 0.25);
    leftLight.castShadow = true;
    const rightLight = new THREE.DirectionalLight(0xffffff, 0.1);
    rightLight.castShadow = true;
    const backLight = new THREE.DirectionalLight(0xffffff, 0.1);
    const bottomLight = new THREE.DirectionalLight(0xffffff, 0.1);
    const topLight = new THREE.DirectionalLight(0xffffff, 0.2);
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

    const world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.81, 0),
    });
    world.allowSleep = true;

    const groundGeo = new THREE.PlaneGeometry(30, 30);
    const groundMat = new THREE.MeshPhongMaterial({
      side: THREE.DoubleSide,
      wireframe: false,
    });
    groundMat.needsUpdate = true;
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.receiveShadow = true;

    groundMesh.material.color.setHex(0x656565);

    scene.add(groundMesh);
    const groundPhysMat = new CANNON.Material();
    const groundWidth = 0; // Desired width of the ground
    const groundDepth = 0; // Desired depth of the ground
    const groundThickness = 0;
    const boxWidth = groundWidth / 2;
    const boxDepth = groundDepth / 2;
    const boxHeight = 10; // Adjust this for desired box height

    const boxShape = new CANNON.Box(
      new CANNON.Vec3(boxWidth, boxHeight / 2, boxDepth)
    );

    const groundBody = new CANNON.Body({
      shape: new CANNON.Box(new CANNON.Vec3(15, 15, 0.1)),
      type: CANNON.Body.STATIC,
      material: groundPhysMat,
    });
    groundBody.material.friction = 1;
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(groundBody);

    const leftWallBody = new CANNON.Body({
      shape: new CANNON.Box(new CANNON.Vec3(15, 100, 0.1)),
      type: CANNON.Body.STATIC,
      material: groundPhysMat,
      friction: -10,
      restitution: 10,
    });
    world.addBody(leftWallBody);
    leftWallBody.position.set(15, 0, 0);
    leftWallBody.quaternion.setFromEuler(0, -Math.PI / 2, 0);

    const rightWallBody = new CANNON.Body({
      shape: new CANNON.Box(new CANNON.Vec3(15, 100, 0.1)),
      type: CANNON.Body.STATIC,
      material: groundPhysMat,
      friction: -10,
      restitution: 10,
    });
    world.addBody(rightWallBody);
    rightWallBody.position.set(-15, 0, 0);
    rightWallBody.quaternion.setFromEuler(0, -Math.PI / 2, 0);

    const backWallBody = new CANNON.Body({
      shape: new CANNON.Box(new CANNON.Vec3(100, 15, 0.1)),
      type: CANNON.Body.STATIC,
      material: groundPhysMat,
      friction: -10,
      restitution: 10,
    });
    world.addBody(backWallBody);
    backWallBody.position.set(0, 0, 15);
    backWallBody.quaternion.setFromEuler(0, 0, -Math.PI / 2);

    const frontWallBody = new CANNON.Body({
      shape: new CANNON.Box(new CANNON.Vec3(100, 15, 0.1)),
      type: CANNON.Body.STATIC,
      material: groundPhysMat,
      friction: -10,
      restitution: 10,
    });
    world.addBody(frontWallBody);
    frontWallBody.position.set(0, 0, -15);
    frontWallBody.quaternion.setFromEuler(0, 0, -Math.PI / 2);

    const rollingForceMagnitude = 2; // Adjust for desired intensity
    const randomDirection = new CANNON.Vec3(
      0.3, // Random x-axis value between -0.5 and 0.5
      0.05, // Random y-axis value between -0.1 and 0.1 (slightly tilted)
      0.3 // Random z-axis value between -0.5 and 0.5
    );
    randomDirection.normalize(); // Normalize to unit vector

    const rollingForce = randomDirection.scale(rollingForceMagnitude);

    const offset = new CANNON.Vec3(0, 0.1, 0);

    const orbit = new OrbitControls.OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 25, -30);
    orbit.update();
    orbit.listenToKeyEvents(document.querySelector("body"));

    const goRightButton = document.querySelector("#right-button");
    const goLeftButton = document.querySelector("#left-button");
    const goUpButton = document.querySelector("#up-button");
    const goDownButton = document.querySelector("#down-button");

    // Add click event listener to the button
    goRightButton.addEventListener("click", function (event) {
      orbit.rotateRight();
      event.stopPropagation();
    });

    goLeftButton.addEventListener("click", function (event) {
      orbit.rotateLeft();
      event.stopPropagation();
    });
    goUpButton.addEventListener("click", function (event) {
      orbit.rotateUp();
      event.stopPropagation();
    });
    goDownButton.addEventListener("click", function (event) {
      orbit.rotateDown();
      event.stopPropagation();
    });
    // Zoom code
    const evt = new Event("wheel", { bubbles: true, cancelable: true });

    const zoomInButton = document.getElementById("zoom-in-button");
    const zoomOutButton = document.getElementById("zoom-out-button");
    const zoomEqualButton = document.getElementById("zoom-equal-button");
    const zoomToButton = document.getElementById("zoom-to-button");

    const zoomInFunction = (e) => {
      const fov = getFov();
      camera.fov = clickZoom(fov, "zoomIn");
      camera.updateProjectionMatrix();
    };

    const zoomOutFunction = (e) => {
      const fov = getFov();
      camera.fov = clickZoom(fov, "zoomOut");
      camera.updateProjectionMatrix();
    };

    const zoomEqualFunction = (e) => {
      const fov = getFov();
      camera.fov = 29;
      camera.updateProjectionMatrix();
    };

    const zoomToFunction = (e) => {
      const fov = getFov();
      camera.fov = 35;
      camera.updateProjectionMatrix();
    };

    const clickZoom = (value, zoomType) => {
      if (value >= 20 && zoomType === "zoomIn") {
        return value - 5;
      } else if (value <= 75 && zoomType === "zoomOut") {
        return value + 5;
      } else {
        return value;
      }
    };

    const getFov = () => {
      return Math.floor(
        (2 *
          Math.atan(camera.getFilmHeight() / 2 / camera.getFocalLength()) *
          180) /
          Math.PI
      );
    };

    const fov = getFov();
    camera.fov = 29;
    camera.updateProjectionMatrix();

    zoomInButton.addEventListener("click", zoomInFunction);
    zoomOutButton.addEventListener("click", zoomOutFunction);
    zoomEqualButton.addEventListener("click", zoomEqualFunction);
    zoomToButton.addEventListener("click", zoomToFunction);

    function createTetrahedron(
      sharedColor,
      ifNumbers,
      ifTransparent,
      xCoordinateShared,
      zCoordinateShared,
      ifImage,
      sharedImageData,
      yCoordinateShared,
      quaternionShared,
      sharedTextColor
    ) {
      let tetrahedron;
      let tempShowNumbers = ifNumbers == null ? showNumbers : ifNumbers;
      let tempTransparent =
        ifTransparent == null ? toggleTransparent : ifTransparent;
      let tempImage = ifImage == null ? showImage : ifImage;
      let tempFillColor = sharedColor != null ? sharedColor : presentColor;
      let tempTextColor = sharedTextColor != null ? sharedTextColor : textColor;
      if (tempShowNumbers) {
        let tileDimension = new THREE.Vector2(4, 5);
        let tileSize = 512;
        let g = new THREE.TetrahedronGeometry(1.7);

        let c = document.createElement("canvas");
        let div = document.createElement("div");
        c.width = tileSize * tileDimension.x;
        c.height = tileSize * tileDimension.y;
        let ctx = c.getContext("2d");
        ctx.fillStyle = tempFillColor;
        ctx.fillRect(0, 0, c.width, c.height);

        let uvs = [];

        let baseUVs = [
          [0.067, 0.25],
          [0.933, 0.25],
          [0.5, 1],
        ].map((p) => {
          return new THREE.Vector2(...p);
        });
        let arrOfNums = [
          [2, 1, 3],
          [1, 2, 4],
          [3, 1, 4],
          [2, 3, 4],
        ];
        for (let i = 0; i < 4; i++) {
          let u = i % tileDimension.x;
          let v = Math.floor(i / tileDimension.x);
          uvs.push(
            (baseUVs[0].x + u) / tileDimension.x,
            (baseUVs[0].y + v) / tileDimension.y,
            (baseUVs[1].x + u) / tileDimension.x,
            (baseUVs[1].y + v) / tileDimension.y,
            (baseUVs[2].x + u) / tileDimension.x,
            (baseUVs[2].y + v) / tileDimension.y
          );

          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = `bold 150px Arial`;
          ctx.fillStyle = tempTextColor;
          // ctx.fillText(
          //   i + 1,
          //   (u + 0.5) * tileSize,
          //   c.height - (v + 0.5) * tileSize
          // );
          let aStep = (Math.PI * 2) / 3;
          let yAlign = Math.PI * 0.5;
          let tileQuarter = tileSize * 0.25;
          for (let j = 0; j < 3; j++) {
            ctx.save();
            ctx.translate(
              (u + 0.5) * tileSize + Math.cos(j * aStep - yAlign) * tileQuarter,
              c.height -
                (v + 0.5) * tileSize +
                Math.sin(j * aStep - yAlign) * tileQuarter
            );
            ctx.rotate((j * Math.PI * 2) / 3);
            ctx.fillText(arrOfNums[i][j], 0, 0);
            ctx.restore();
          }
        }
        g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));

        let tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;

        let m = new THREE.MeshPhongMaterial({
          map: tex,
        });

        tetrahedron = new THREE.Mesh(g, m);
      } else if (tempTransparent) {
        const tetrahedronTransparentGeometry = new THREE.TetrahedronGeometry(
          1.7
        ); // Size of the tetrahedron
        const wireframe = new THREE.WireframeGeometry(
          tetrahedronTransparentGeometry
        );
        const lineMaterial = new THREE.LineBasicMaterial({
          color: sharedColor != null ? sharedColor : presentColor,
          depthTest: true,
          opacity: 1,
          transparent: false,
        });
        const line = new THREE.LineSegments(wireframe, lineMaterial);
        tetrahedron = line;
      } else if (tempImage) {
        const boxGeo = new THREE.TetrahedronGeometry(1.7);

        const texture = new THREE.TextureLoader().load(
          sharedImageData != null ? sharedImageData : imageData
        );

        // Create material using the texture
        const material = new THREE.MeshPhongMaterial({ map: texture });

        // Create cube mesh with the material
        tetrahedron = new THREE.Mesh(boxGeo, material);
      } else {
        const tetrahedronGeometry = new THREE.TetrahedronGeometry(1.7); // Size of the tetrahedron

        const tetraMaterial = new THREE.MeshStandardMaterial({
          color: sharedColor != null ? sharedColor : presentColor,
          wireframe: false,
        });

        tetrahedron = new THREE.Mesh(tetrahedronGeometry, tetraMaterial);
      }

      tetrahedron.rotation.set(Math.PI / 4, Math.PI / 4, 0); // Rotates 90 degrees on X, 45 degrees on Y
      tetrahedron.castShadow = true;
      scene.add(tetrahedron);

      const verticesTetra = [
        new CANNON.Vec3(1, 1, 1), // Vertex 1 (right)
        new CANNON.Vec3(-1, -1, 1), // Vertex 2 (top)
        new CANNON.Vec3(-1, 1, -1), // Vertex 3 (left)
        new CANNON.Vec3(1, -1, -1), // Vertex 4 (front)
      ];
      const facesTetra = [
        [2, 1, 0], // Triangle 1 (right, top, left)
        [0, 3, 2], // Triangle 2 (right, front, top)
        [1, 3, 0], // Triangle 3 (top, front, left)
        [2, 3, 1], // Triangle 4 (left, right, front)
      ];
      // Create a ConvexPolyhedron shape from the vertices and faces
      const tetrahedronShape = new CANNON.ConvexPolyhedron({
        vertices: verticesTetra,
        faces: facesTetra,
      });

      let x = xCoordinateShared == null ? xCoordinate : xCoordinateShared;
      let z = zCoordinateShared == null ? zCoordinate : zCoordinateShared;
      let y = yCoordinateShared == null ? 10 : yCoordinateShared;

      const tetrahedronBody = new CANNON.Body({
        mass: 2, // Set mass
        shape: tetrahedronShape,
        position: new CANNON.Vec3(x, y, z),
        friction: -1,
        restitution: 5,
      });
      if (tempShowNumbers) {
        tetrahedronBody.addEventListener("sleep", () => {
          sleepCounter++;
          getTetraScore(tetrahedron);
        });
      }
      world.addBody(tetrahedronBody);
      tetrahedronBody.angularVelocity.set(0.5, 0.5, 0.5);
      tetrahedronBody.applyImpulse(offset, rollingForce);
      tetrahedron.position.copy(tetrahedronBody.position); // this merges the physics body to threejs mesh
      tetrahedron.quaternion.copy(tetrahedronBody.quaternion);
      if (quaternionShared != null && quaternionShared != undefined) {
        tetrahedron.quaternion.copy(quaternionShared);
        tetrahedronBody.quaternion.copy(quaternionShared);
      }
      diceArray.push([
        tetrahedron,
        tetrahedronBody,
        "tetra",
        tempShowNumbers,
        tempTransparent,
        tempFillColor,
        tempTextColor,
      ]);
    }

    function createOctahedron(
      sharedColor,
      ifNumbers,
      ifTransparent,
      xCoordinateShared,
      zCoordinateShared,
      ifImage,
      sharedImageData,
      yCoordinateShared,
      quaternionShared,
      sharedTextColor
    ) {
      let octahedron;
      let tempShowNumbers = ifNumbers == null ? showNumbers : ifNumbers;
      let tempTransparent =
        ifTransparent == null ? toggleTransparent : ifTransparent;
      let tempImage = ifImage == null ? showImage : ifImage;
      let tempFillColor = sharedColor != null ? sharedColor : presentColor;
      let tempTextColor = sharedTextColor != null ? sharedTextColor : textColor;

      if (tempShowNumbers) {
        let tileDimension = new THREE.Vector2(4, 5);
        let tileSize = 512;
        let g = new THREE.OctahedronGeometry(1.6);

        let c = document.createElement("canvas");
        c.width = tileSize * tileDimension.x;
        c.height = tileSize * tileDimension.y;
        let ctx = c.getContext("2d");
        ctx.fillStyle = tempFillColor;
        ctx.fillRect(0, 0, c.width, c.height);

        let uvs = [];

        let baseUVs = [
          [0.067, 0.25],
          [0.933, 0.25],
          [0.5, 1],
        ].map((p) => {
          return new THREE.Vector2(...p);
        });

        for (let i = 0; i < 9; i++) {
          let u = i % tileDimension.x;
          let v = Math.floor(i / tileDimension.x);
          uvs.push(
            (baseUVs[0].x + u) / tileDimension.x,
            (baseUVs[0].y + v) / tileDimension.y,
            (baseUVs[1].x + u) / tileDimension.x,
            (baseUVs[1].y + v) / tileDimension.y,
            (baseUVs[2].x + u) / tileDimension.x,
            (baseUVs[2].y + v) / tileDimension.y
          );

          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = `bold 200px Arial`;
          ctx.fillStyle = tempTextColor;
          ctx.fillText(
            i + 1 + (i == 5 || i == 8 ? "" : ""),
            (u + 0.5) * tileSize,
            c.height - (v + 0.5) * tileSize
          );
        }
        g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));

        let tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;

        let m = new THREE.MeshPhongMaterial({
          map: tex,
        });

        octahedron = new THREE.Mesh(g, m);
      } else if (tempTransparent) {
        const octahedronTransparentGeometry = new THREE.OctahedronGeometry(1.6); // Size of the octahedron
        const wireframe = new THREE.WireframeGeometry(
          octahedronTransparentGeometry
        );
        const lineMaterial = new THREE.LineBasicMaterial({
          color: sharedColor != null ? sharedColor : presentColor,
          depthTest: true,
          opacity: 1,
          transparent: false,
        });
        const line = new THREE.LineSegments(wireframe, lineMaterial);
        octahedron = line;
      } else if (tempImage) {
        const octahedronGeometry = new THREE.OctahedronGeometry(2);

        const texture = new THREE.TextureLoader().load(
          sharedImageData != null ? sharedImageData : imageData
        );

        // Create material using the texture
        const material = new THREE.MeshPhongMaterial({ map: texture });

        // Create cube mesh with the material
        octahedron = new THREE.Mesh(octahedronGeometry, material);
      } else {
        const octahedronGeometry = new THREE.OctahedronGeometry(1.6); // Size of the octahedron

        const octaMaterial = new THREE.MeshPhongMaterial({
          color: sharedColor != null ? sharedColor : presentColor,
          wireframe: false,
        });
        octahedron = new THREE.Mesh(octahedronGeometry, octaMaterial);
      }
      octahedron.castShadow = true;
      scene.add(octahedron);

      const scaleFactor = 1; // Change this value to scale the shape (e.g., 2 for doubling the size)

      const verticesOcta = [
        new CANNON.Vec3(2 * scaleFactor, 0, 0), // Vertex 1 (right)
        new CANNON.Vec3(-2 * scaleFactor, 0, 0), // Vertex 2 (left)
        new CANNON.Vec3(0, 2 * scaleFactor, 0), // Vertex 3 (top)
        new CANNON.Vec3(0, -2 * scaleFactor, 0), // Vertex 4 (bottom)
        new CANNON.Vec3(0, 0, 2 * scaleFactor), // Vertex 5 (front)
        new CANNON.Vec3(0, 0, -2 * scaleFactor), // Vertex 6 (back)
      ];

      // Define the faces of the octahedron (counter-clockwise order)
      const facesOcta = [
        [0, 2, 4], // Triangle 1 (right, top, front)
        [0, 4, 3], // Triangle 2 (right, front, bottom)
        [0, 3, 5], // Triangle 3 (right, bottom, back)
        [0, 5, 2], // Triangle 4 (right, back, top)
        [1, 2, 5], // Triangle 5 (left, top, back)
        [1, 5, 3], // Triangle 6 (left, back, bottom)
        [1, 3, 4], // Triangle 7 (left, bottom, front)
        [1, 4, 2], // Triangle 8 (left, front, top)
      ];

      const octahedronShape = new CANNON.ConvexPolyhedron({
        vertices: verticesOcta,
        faces: facesOcta,
      });

      let x = xCoordinateShared == null ? xCoordinate : xCoordinateShared;
      let z = zCoordinateShared == null ? zCoordinate : zCoordinateShared;
      let y = yCoordinateShared == null ? 10 : yCoordinateShared;

      const octahedronBody = new CANNON.Body({
        mass: 2, // Set mass
        shape: octahedronShape,
        position: new CANNON.Vec3(x, y, z),
        friction: -1,
        restitution: 5,
      });
      if (tempShowNumbers) {
        octahedronBody.addEventListener("sleep", () => {
          sleepCounter++;
          getOctaScore(octahedron);
        });
      }
      world.addBody(octahedronBody);

      octahedronBody.angularVelocity.set(0.5, 0.5, 0.5);
      octahedronBody.applyImpulse(offset, rollingForce);
      octahedron.position.copy(octahedronBody.position); // this merges the physics body to threejs mesh
      octahedron.quaternion.copy(octahedronBody.quaternion);
      if (quaternionShared != null && quaternionShared != undefined) {
        octahedron.quaternion.copy(quaternionShared);
        octahedronBody.quaternion.copy(quaternionShared);
      }
      diceArray.push([
        octahedron,
        octahedronBody,
        "octa",
        tempShowNumbers,
        tempTransparent,
        tempFillColor,
        tempTextColor,
      ]);
    }

    function createCube(
      sharedColor,
      ifNumbers,
      ifTransparent,
      xCoordinateShared,
      zCoordinateShared,
      ifImage,
      sharedImageData,
      yCoordinateShared,
      quaternionShared,
      sharedTextColor
    ) {
      let boxMesh;
      let tempShowNumbers = ifNumbers == null ? showNumbers : ifNumbers;
      let tempTransparent =
        ifTransparent == null ? toggleTransparent : ifTransparent;
      let tempImage = ifImage == null ? showImage : ifImage;
      let tempFillColor = sharedColor != null ? sharedColor : presentColor;
      let tempTextColor = sharedTextColor != null ? sharedTextColor : textColor;
      if (tempShowNumbers) {
        let tileDimension = new THREE.Vector2(4, 2);
        let tileSize = 512;
        let g = new THREE.BoxGeometry(2, 2, 2);

        let c = document.createElement("canvas");
        c.width = tileSize * tileDimension.x;
        c.height = tileSize * tileDimension.y;
        let ctx = c.getContext("2d");
        ctx.fillStyle = tempFillColor;
        ctx.fillRect(0, 0, c.width, c.height);

        let baseUVs = [
          [0, 1],
          [1, 1],
          [0, 0],
          [1, 0],
        ].map((p) => {
          return new THREE.Vector2(...p);
        });
        let uvs = [];
        let vTemp = new THREE.Vector2();
        let vCenter = new THREE.Vector2(0.5, 0.5);
        for (let i = 0; i < 6; i++) {
          let u = i % tileDimension.x;
          let v = Math.floor(i / tileDimension.x);
          baseUVs.forEach((buv) => {
            uvs.push(
              (buv.x + u) / tileDimension.x,
              (buv.y + v) / tileDimension.y
            );
          });

          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = `bold 300px Arial`;
          ctx.fillStyle = tempTextColor;
          ctx.fillText(
            i + 1,
            (u + 0.5) * tileSize,
            c.height - (v + 0.5) * tileSize
          );
        }
        g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));

        let tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;

        let m = new THREE.MeshPhongMaterial({
          map: tex,
          // metalness: 0.75,
          // roughness: 0.25,
        });

        boxMesh = new THREE.Mesh(g, m);
      } else if (tempTransparent) {
        const boxTransparentGeometry = new THREE.BoxGeometry(2, 2, 2);
        const wireframe = new THREE.WireframeGeometry(boxTransparentGeometry);
        const lineMaterial = new THREE.LineBasicMaterial({
          color: sharedColor != null ? sharedColor : presentColor,
          depthTest: true,
          opacity: 1,
          transparent: false,
        });
        const line = new THREE.LineSegments(wireframe, lineMaterial);
        boxMesh = line;
      } else if (tempImage) {
        const boxGeo = new THREE.BoxGeometry(2, 2, 2);

        const texture = new THREE.TextureLoader().load(
          sharedImageData != null ? sharedImageData : imageData
        );

        // Create material using the texture
        const material = new THREE.MeshPhongMaterial({ map: texture });

        // Create cube mesh with the material
        boxMesh = new THREE.Mesh(boxGeo, material);
      } else {
        const boxGeo = new THREE.BoxGeometry(2, 2, 2);
        const boxMat = new THREE.MeshPhongMaterial({
          color: sharedColor != null ? sharedColor : presentColor,
          wireframe: false,
        });
        boxMesh = new THREE.Mesh(boxGeo, boxMat);
      }
      boxMesh.castShadow = true;
      scene.add(boxMesh);

      const boxPhysmat = new CANNON.Material();

      let x = xCoordinateShared == null ? xCoordinate : xCoordinateShared;
      let z = zCoordinateShared == null ? zCoordinate : zCoordinateShared;
      let y = yCoordinateShared == null ? 10 : yCoordinateShared;

      const boxBody = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
        position: new CANNON.Vec3(x, y, z),
        material: boxPhysmat,
        friction: 0.1,
        restitution: 5,
      });

      world.addBody(boxBody);

      if (tempShowNumbers) {
        boxBody.addEventListener("sleep", () => {
          sleepCounter++;
          getCubeScore(boxMesh);
        });
      }

      boxBody.angularVelocity.set(0.5, 0.5, 0.5);
      boxBody.applyImpulse(offset, rollingForce);

      // what will happen when the two bodies touch

      const groundBoxContactMat = new CANNON.ContactMaterial(
        groundPhysMat,
        boxPhysmat,
        { friction: 0.5 }
      );

      world.addContactMaterial(groundBoxContactMat);
      if (quaternionShared != null && quaternionShared != undefined) {
        boxMesh.quaternion.copy(quaternionShared);
        boxBody.quaternion.copy(quaternionShared);
      }
      diceArray.push([
        boxMesh,
        boxBody,
        "cube",
        tempShowNumbers,
        tempTransparent,
        tempFillColor,
        tempTextColor,
      ]);
    }

    const cannonDebugger = new CannonDebugger(scene, world, {
      color: 0xadd8e6,
    });

    function createDecahedron(
      sharedColor,
      ifNumbers,
      ifTransparent,
      xCoordinateShared,
      zCoordinateShared,
      ifImage,
      sharedImageData,
      yCoordinateShared,
      quaternionShared,
      sharedTextColor
    ) {
      let decahedron;
      let tempShowNumbers = ifNumbers == null ? showNumbers : ifNumbers;
      let tempTransparent =
        ifTransparent == null ? toggleTransparent : ifTransparent;
      let tempImage = ifImage == null ? showImage : ifImage;
      let tempFillColor = sharedColor != null ? sharedColor : presentColor;
      let tempTextColor = sharedTextColor != null ? sharedTextColor : textColor;

      const sides = 10;
      const radius = 1.3;
      const verticesGeo = [
        [0, 0, 1],
        [0, 0, -1],
      ].flat();

      for (let i = 0; i < sides; ++i) {
        const b = (i * Math.PI * 2) / sides;
        verticesGeo.push(-Math.cos(b), -Math.sin(b), 0.105 * (i % 2 ? 1 : -1));
      }

      const facesGeo = [
        [0, 2, 3],
        [0, 3, 4],
        [0, 4, 5],
        [0, 5, 6],
        [0, 6, 7],
        [0, 7, 8],
        [0, 8, 9],
        [0, 9, 10],
        [0, 10, 11],
        [0, 11, 2],
        [1, 3, 2],
        [1, 4, 3],
        [1, 5, 4],
        [1, 6, 5],
        [1, 7, 6],
        [1, 8, 7],
        [1, 9, 8],
        [1, 10, 9],
        [1, 11, 10],
        [1, 2, 11],
      ].flat();
      const args = [verticesGeo, facesGeo, radius, 0];
      let decaGeometry = new THREE.PolyhedronGeometry(...args);

      if (tempShowNumbers) {
        let g = decaGeometry;

        let tileDimension = new THREE.Vector2(4, 5);
        let tileSize = 512;

        let c = document.createElement("canvas");
        c.width = tileSize * tileDimension.x;
        c.height = tileSize * tileDimension.y;
        let ctx = c.getContext("2d");
        ctx.fillStyle = tempFillColor;
        ctx.fillRect(0, 0, c.width, c.height);

        let uvs = [];

        let baseUVs = [
          new THREE.Vector2(0.67, 1), // br
          new THREE.Vector2(0, 0.5), // bt
          new THREE.Vector2(1, 0.5), // tl
          new THREE.Vector2(0.67, 0), // bl
        ];

        for (let i = 0; i < 10; i++) {
          let u = i % tileDimension.x;
          let v = Math.floor(i / tileDimension.x);
          uvs.push(
            (baseUVs[0].x + u) / tileDimension.x,
            (baseUVs[0].y + v) / tileDimension.y,
            (baseUVs[1].x + u) / tileDimension.x,
            (baseUVs[1].y + v) / tileDimension.y,
            (baseUVs[2].x + u) / tileDimension.x,
            (baseUVs[2].y + v) / tileDimension.y,
            (baseUVs[3].x + u) / tileDimension.x,
            (baseUVs[3].y + v) / tileDimension.y
          );

          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = `bold 175px Arial`;
          ctx.fillStyle = tempTextColor;
          let text = i + 1;
          if (i === 5) {
            text += ".";
          }
          ctx.fillText(
            text,
            (u + 0.5) * tileSize,
            c.height - (v + 0.5) * tileSize
          );
        }

        g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));

        let tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;

        let m = new THREE.MeshPhongMaterial({
          map: tex,
        });
        decahedron = new THREE.Mesh(g, m);
      } else if (tempTransparent) {
        const decahedronTransaprentGeometry = decaGeometry;
        const wireframe = new THREE.WireframeGeometry(
          decahedronTransaprentGeometry
        );
        const lineMaterial = new THREE.LineBasicMaterial({
          color: sharedColor != null ? sharedColor : presentColor,
          depthTest: true,
          opacity: 1,
          transparent: false,
        });
        const line = new THREE.LineSegments(wireframe, lineMaterial);
        decahedron = line;
      } else if (tempImage) {
        const decaGeo = decaGeometry;

        const texture = new THREE.TextureLoader().load(
          sharedImageData != null ? sharedImageData : imageData
        );

        // Create material using the texture
        const material = new THREE.MeshPhongMaterial({ map: texture });

        // Create cube mesh with the material
        decahedron = new THREE.Mesh(decaGeo, material);
      } else {
        const decahedronGeometry = decaGeometry;

        const decaMaterial = new THREE.MeshStandardMaterial({
          color: sharedColor != null ? sharedColor : presentColor,
          wireframe: false,
        });

        decahedron = new THREE.Mesh(decahedronGeometry, decaMaterial);
      }

      decahedron.rotation.set(Math.PI / 4, Math.PI / 4, 0); // Rotates 90 degrees on X, 45 degrees on Y
      decahedron.castShadow = true;
      scene.add(decahedron);

      const t = (1 + Math.sqrt(5)) / 2;
      const r = 1 / t;
      const scaleFactor = 1.2; // Change this value to scale the shape (e.g., 2 for doubling the size)

      const verticesCannon = [];
      for (let i = 0; i < verticesGeo.length; i += 3) {
        verticesCannon.push(
          new CANNON.Vec3(
            verticesGeo[i] * scaleFactor,
            verticesGeo[i + 1] * scaleFactor,
            verticesGeo[i + 2] * scaleFactor
          )
        );
      }

      const facesCannon = [];
      for (let i = 0; i < facesGeo.length; i += 3) {
        facesCannon.push([facesGeo[i], facesGeo[i + 1], facesGeo[i + 2]]);
      }

      // Create a ConvexPolyhedron shape from the scaled vertices and faces
      const decahedronShape = new CANNON.ConvexPolyhedron({
        vertices: verticesCannon,
        faces: facesCannon,
      });

      let x = xCoordinateShared == null ? xCoordinate : xCoordinateShared;
      let z = zCoordinateShared == null ? zCoordinate : zCoordinateShared;
      let y = yCoordinateShared == null ? 10 : yCoordinateShared;

      const decahedronBody = new CANNON.Body({
        mass: 2, // Set mass
        shape: decahedronShape,
        position: new CANNON.Vec3(x, y, z),
        friction: -1,
        restitution: 5,
      });
      if (tempShowNumbers) {
        decahedronBody.addEventListener("sleep", () => {
          sleepCounter++;
          getDecaScore(decahedron);
        });
      }
      world.addBody(decahedronBody);
      decahedronBody.angularVelocity.set(0.5, 0.5, 0.5);
      decahedronBody.applyImpulse(offset, rollingForce);
      decahedron.position.copy(decahedronBody.position); // this merges the physics body to threejs mesh
      decahedron.quaternion.copy(decahedronBody.quaternion);

      if (quaternionShared != null && quaternionShared != undefined) {
        decahedron.quaternion.copy(quaternionShared);
        decahedronBody.quaternion.copy(quaternionShared);
      }

      diceArray.push([
        decahedron,
        decahedronBody,
        "deca",
        tempShowNumbers,
        tempTransparent,
        tempFillColor,
        tempTextColor,
      ]);
    }

    function makeNumbers() {
      let c = document.createElement("canvas");
      c.width = 1024;
      c.height = 1024;
      let ctx = c.getContext("2d");
      ctx.fillStyle = "#f0f";
      ctx.fillRect(0, 0, c.width, c.height);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#0f8";
      ctx.font = "bold 60px Arial";
      let step = 1024 / 10;
      let start = step * 0.5;

      for (let i = 0; i < 10; i++) {
        ctx.fillText(i + 1, start + step * i, 512);
      }

      return new THREE.CanvasTexture(c);
    }

    function createDodecahedron(
      sharedColor,
      ifNumbers,
      ifTransparent,
      xCoordinateShared,
      zCoordinateShared,
      ifImage,
      sharedImageData,
      yCoordinateShared,
      quaternionShared,
      sharedTextColor
    ) {
      let dodecahedron;
      let tempShowNumbers = ifNumbers == null ? showNumbers : ifNumbers;
      let tempTransparent =
        ifTransparent == null ? toggleTransparent : ifTransparent;
      let tempImage = ifImage == null ? showImage : ifImage;
      let tempFillColor = sharedColor != null ? sharedColor : presentColor;
      let tempTextColor = sharedTextColor != null ? sharedTextColor : textColor;
      if (tempShowNumbers) {
        let tileDimension = new THREE.Vector2(4, 3); // 12 faces, arranged in a 4x3 grid
        let tileSize = 512;
        let g = new THREE.DodecahedronGeometry(1.25);

        let c = document.createElement("canvas");
        c.width = tileSize * tileDimension.x;
        c.height = tileSize * tileDimension.y;
        let ctx = c.getContext("2d");
        ctx.fillStyle = tempFillColor;
        ctx.fillRect(0, 0, c.width, c.height);

        let uvs = [];
        const base = new THREE.Vector2(0, 0.5);
        const center = new THREE.Vector2();
        const angle = THREE.MathUtils.degToRad(72);
        let baseUVs = [
          base
            .clone()
            .rotateAround(center, angle * 1)
            .addScalar(0.5),
          base
            .clone()
            .rotateAround(center, angle * 2)
            .addScalar(0.5),
          base
            .clone()
            .rotateAround(center, angle * 3)
            .addScalar(0.5),
          base
            .clone()
            .rotateAround(center, angle * 4)
            .addScalar(0.5),
          base
            .clone()
            .rotateAround(center, angle * 0)
            .addScalar(0.5),
        ];

        for (let i = 0; i < 12; i++) {
          // 12 faces for a dodecahedron
          let u = i % tileDimension.x;
          let v = Math.floor(i / tileDimension.x);
          uvs.push(
            (baseUVs[1].x + u) / tileDimension.x,
            (baseUVs[1].y + v) / tileDimension.y,
            (baseUVs[2].x + u) / tileDimension.x,
            (baseUVs[2].y + v) / tileDimension.y,
            (baseUVs[0].x + u) / tileDimension.x,
            (baseUVs[0].y + v) / tileDimension.y,

            (baseUVs[2].x + u) / tileDimension.x,
            (baseUVs[2].y + v) / tileDimension.y,
            (baseUVs[3].x + u) / tileDimension.x,
            (baseUVs[3].y + v) / tileDimension.y,
            (baseUVs[0].x + u) / tileDimension.x,
            (baseUVs[0].y + v) / tileDimension.y,

            (baseUVs[3].x + u) / tileDimension.x,
            (baseUVs[3].y + v) / tileDimension.y,
            (baseUVs[4].x + u) / tileDimension.x,
            (baseUVs[4].y + v) / tileDimension.y,
            (baseUVs[0].x + u) / tileDimension.x,
            (baseUVs[0].y + v) / tileDimension.y
          );

          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = `bold ${tileSize / 3}px Arial`;
          ctx.fillStyle = tempTextColor;
          ctx.fillText(
            i + 1,
            (u + 0.5) * tileSize,
            c.height - (v + 0.5) * tileSize
          );
        }

        g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));

        let tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

        let m = new THREE.MeshPhongMaterial({
          map: tex,
        });

        dodecahedron = new THREE.Mesh(g, m);
      } else if (tempTransparent) {
        const dodedodecahedronTransaprentGeometry =
          new THREE.DodecahedronGeometry(1.25); // Size of the tetrahedron
        const wireframe = new THREE.WireframeGeometry(
          dodedodecahedronTransaprentGeometry
        );
        const lineMaterial = new THREE.LineBasicMaterial({
          color: sharedColor != null ? sharedColor : presentColor,
          depthTest: true,
          opacity: 1,
          transparent: false,
        });
        const line = new THREE.LineSegments(wireframe, lineMaterial);
        dodecahedron = line;
      } else if (tempImage) {
        const dodecaGeo = new THREE.DodecahedronGeometry(2);

        const texture = new THREE.TextureLoader().load(
          sharedImageData != null ? sharedImageData : imageData
        );

        // Create material using the texture
        const material = new THREE.MeshPhongMaterial({ map: texture });

        // Create cube mesh with the material
        dodecahedron = new THREE.Mesh(dodecaGeo, material);
      } else {
        const dodecahedronGeometry = new THREE.DodecahedronGeometry(1.25); // Size of the tetrahedron

        const dodecaMaterial = new THREE.MeshStandardMaterial({
          color: sharedColor != null ? sharedColor : presentColor,
          wireframe: false,
        });

        dodecahedron = new THREE.Mesh(dodecahedronGeometry, dodecaMaterial);
      }

      dodecahedron.rotation.set(Math.PI / 4, Math.PI / 4, 0); // Rotates 90 degrees on X, 45 degrees on Y
      dodecahedron.castShadow = true;
      scene.add(dodecahedron);

      const t = 1.618;
      const r = 0.618;
      const scaleFactor = 0.75;

      const vertices = [
        new CANNON.Vec3(-1, -1, -1).scale(scaleFactor),
        new CANNON.Vec3(-1, -1, 1).scale(scaleFactor),
        new CANNON.Vec3(-1, 1, -1).scale(scaleFactor),
        new CANNON.Vec3(-1, 1, 1).scale(scaleFactor),
        new CANNON.Vec3(1, -1, -1).scale(scaleFactor),
        new CANNON.Vec3(1, -1, 1).scale(scaleFactor),
        new CANNON.Vec3(1, 1, -1).scale(scaleFactor),
        new CANNON.Vec3(1, 1, 1).scale(scaleFactor),
        new CANNON.Vec3(0, -r, -t).scale(scaleFactor),
        new CANNON.Vec3(0, -r, t).scale(scaleFactor),
        new CANNON.Vec3(0, r, -t).scale(scaleFactor),
        new CANNON.Vec3(0, r, t).scale(scaleFactor),
        new CANNON.Vec3(-r, -t, 0).scale(scaleFactor),
        new CANNON.Vec3(-r, t, 0).scale(scaleFactor),
        new CANNON.Vec3(r, -t, 0).scale(scaleFactor),
        new CANNON.Vec3(r, t, 0).scale(scaleFactor),
        new CANNON.Vec3(-t, 0, -r).scale(scaleFactor),
        new CANNON.Vec3(t, 0, -r).scale(scaleFactor),
        new CANNON.Vec3(-t, 0, r).scale(scaleFactor),
        new CANNON.Vec3(t, 0, r).scale(scaleFactor),
      ];

      const indices = [
        [3, 11, 7],
        [3, 7, 15],
        [3, 15, 13],
        [7, 19, 17],
        [7, 17, 6],
        [7, 6, 15],
        [17, 4, 8],
        [17, 8, 10],
        [17, 10, 6],
        [8, 0, 16],
        [8, 16, 2],
        [8, 2, 10],
        [0, 12, 1],
        [0, 1, 18],
        [0, 18, 16],
        [6, 10, 2],
        [6, 2, 13],
        [6, 13, 15],
        [2, 16, 18],
        [2, 18, 3],
        [2, 3, 13],
        [18, 1, 9],
        [18, 9, 11],
        [18, 11, 3],
        [4, 14, 12],
        [4, 12, 0],
        [4, 0, 8],
        [11, 9, 5],
        [11, 5, 19],
        [11, 19, 7],
        [19, 5, 14],
        [19, 14, 4],
        [19, 4, 17],
        [1, 12, 14],
        [1, 14, 5],
        [1, 5, 9],
      ];

      // Create a ConvexPolyhedron shape from the vertices and faces
      const dodecahedronShape = new CANNON.ConvexPolyhedron({
        vertices: vertices,
        faces: indices,
      });

      let x = xCoordinateShared == null ? xCoordinate : xCoordinateShared;
      let z = zCoordinateShared == null ? zCoordinate : zCoordinateShared;
      let y = yCoordinateShared == null ? 10 : yCoordinateShared;

      const dodecahedronBody = new CANNON.Body({
        mass: 2, // Set mass
        shape: dodecahedronShape,
        position: new CANNON.Vec3(x, y, z),
        friction: -1,
        restitution: 5,
      });
      dodecahedronBody.sleepSpeedLimit = 0.5;
      dodecahedronBody.sleepTimeLimit = 3;
      console.log(dodecahedronBody);
      if (tempShowNumbers) {
        dodecahedronBody.addEventListener("sleep", () => {
          sleepCounter++;
          getDodecaScore(dodecahedron);
        });
      }
      world.addBody(dodecahedronBody);
      dodecahedronBody.angularVelocity.set(0.5, 0.5, 0.5);
      dodecahedronBody.applyImpulse(offset, rollingForce);
      dodecahedron.position.copy(dodecahedronBody.position); // this merges the physics body to threejs mesh
      dodecahedron.quaternion.copy(dodecahedronBody.quaternion);
      if (quaternionShared != null && quaternionShared != undefined) {
        dodecahedron.quaternion.copy(quaternionShared);
        dodecahedronBody.quaternion.copy(quaternionShared);
      }
      diceArray.push([
        dodecahedron,
        dodecahedronBody,
        "dodeca",
        tempShowNumbers,
        tempTransparent,
        tempFillColor,
        tempTextColor,
      ]);
    }

    function createIcosahedron(
      sharedColor,
      ifNumbers,
      ifTransparent,
      xCoordinateShared,
      zCoordinateShared,
      ifImage,
      sharedImageData,
      yCoordinateShared,
      quaternionShared,
      sharedTextColor
    ) {
      let icosahedron;
      let tempShowNumbers = ifNumbers == null ? showNumbers : ifNumbers;
      let tempTransparent =
        ifTransparent == null ? toggleTransparent : ifTransparent;
      let tempImage = ifImage == null ? showImage : ifImage;
      let tempFillColor = sharedColor != null ? sharedColor : presentColor;
      let tempTextColor = sharedTextColor != null ? sharedTextColor : textColor;

      if (tempShowNumbers) {
        let tileDimension = new THREE.Vector2(4, 5);
        let tileSize = 512;
        let g = new THREE.IcosahedronGeometry(1.5);

        let c = document.createElement("canvas");
        c.width = tileSize * tileDimension.x;
        c.height = tileSize * tileDimension.y;
        let ctx = c.getContext("2d");
        ctx.fillStyle = tempFillColor;
        ctx.fillRect(0, 0, c.width, c.height);

        let uvs = [];

        let baseUVs = [
          [0.067, 0.25],
          [0.933, 0.25],
          [0.5, 1],
        ].map((p) => {
          return new THREE.Vector2(...p);
        });
        for (let i = 0; i < 20; i++) {
          let u = i % tileDimension.x;
          let v = Math.floor(i / tileDimension.x);
          uvs.push(
            (baseUVs[0].x + u) / tileDimension.x,
            (baseUVs[0].y + v) / tileDimension.y,
            (baseUVs[1].x + u) / tileDimension.x,
            (baseUVs[1].y + v) / tileDimension.y,
            (baseUVs[2].x + u) / tileDimension.x,
            (baseUVs[2].y + v) / tileDimension.y
          );

          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = `bold 175px Arial`;
          ctx.fillStyle = tempTextColor;
          let text = i + 1;
          if (i == 5) {
            text + ".";
          }
          ctx.fillText(
            i + 1,
            (u + 0.5) * tileSize,
            c.height - (v + 0.5) * tileSize
          );
        }
        g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));

        let tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;

        let m = new THREE.MeshPhongMaterial({
          map: tex,
        });

        icosahedron = new THREE.Mesh(g, m);
      } else if (tempTransparent) {
        const icosahedronTransparentGeometry = new THREE.IcosahedronGeometry(
          1.5
        ); // Size of the Icosahedron
        const wireframe = new THREE.WireframeGeometry(
          icosahedronTransparentGeometry
        );
        const lineMaterial = new THREE.LineBasicMaterial({
          color: sharedColor != null ? sharedColor : presentColor,
          depthTest: true,
          opacity: 1,
          transparent: false,
        });
        const line = new THREE.LineSegments(wireframe, lineMaterial);
        icosahedron = line;
      } else if (tempImage) {
        const boxGeo = new THREE.IcosahedronGeometry(2);

        const texture = new THREE.TextureLoader().load(
          sharedImageData != null ? sharedImageData : imageData
        );

        // Create material using the texture
        const material = new THREE.MeshPhongMaterial({ map: texture });

        // Create cube mesh with the material
        icosahedron = new THREE.Mesh(boxGeo, material);
      } else {
        const icosahedronGeometry = new THREE.IcosahedronGeometry(1.5); // Size of the icosahedron

        const icosaMaterial = new THREE.MeshStandardMaterial({
          color: sharedColor != null ? sharedColor : presentColor,
          wireframe: false,
        });

        icosahedron = new THREE.Mesh(icosahedronGeometry, icosaMaterial);
      }
      icosahedron.rotation.set(Math.PI / 4, Math.PI / 4, 0); // Rotates 90 degrees on X, 45 degrees on Y
      icosahedron.castShadow = true;
      scene.add(icosahedron);

      // Vertices
      // Vertices
      const t = (1 + Math.sqrt(5)) / 2;
      const scaleFactor = 0.6;
      const verticesIcosa = [
        new CANNON.Vec3(-1, t, 0).scale(scaleFactor),
        new CANNON.Vec3(1, t, 0).scale(scaleFactor),
        new CANNON.Vec3(-1, -t, 0).scale(scaleFactor),
        new CANNON.Vec3(1, -t, 0).scale(scaleFactor),
        new CANNON.Vec3(0, -1, t).scale(scaleFactor),
        new CANNON.Vec3(0, 1, t).scale(scaleFactor),
        new CANNON.Vec3(0, -1, -t).scale(scaleFactor),
        new CANNON.Vec3(0, 1, -t).scale(scaleFactor),
        new CANNON.Vec3(t, 0, -1).scale(scaleFactor),
        new CANNON.Vec3(t, 0, 1).scale(scaleFactor),
        new CANNON.Vec3(-t, 0, -1).scale(scaleFactor),
        new CANNON.Vec3(-t, 0, 1).scale(scaleFactor),
      ];

      // Faces
      const facesIcosa = [
        [0, 11, 5],
        [0, 5, 1],
        [0, 1, 7],
        [0, 7, 10],
        [0, 10, 11],
        [1, 5, 9],
        [5, 11, 4],
        [11, 10, 2],
        [10, 7, 6],
        [7, 1, 8],
        [3, 9, 4],
        [3, 4, 2],
        [3, 2, 6],
        [3, 6, 8],
        [3, 8, 9],
        [4, 9, 5],
        [2, 4, 11],
        [6, 2, 10],
        [8, 6, 7],
        [9, 8, 1],
      ];

      // Create a ConvexPolyhedron shape from the vertices and faces
      const icosahedronShape = new CANNON.ConvexPolyhedron({
        vertices: verticesIcosa,
        faces: facesIcosa,
      });

      let x = xCoordinateShared == null ? xCoordinate : xCoordinateShared;
      let z = zCoordinateShared == null ? zCoordinate : zCoordinateShared;
      let y = yCoordinateShared == null ? 10 : yCoordinateShared;

      const icosahedronBody = new CANNON.Body({
        mass: 2, // Set mass
        shape: icosahedronShape,
        position: new CANNON.Vec3(x, y, z),
        friction: -1,
        restitution: 5,
      });
      icosahedronBody.sleepSpeedLimit = 0.5;
      icosahedronBody.sleepTimeLimit = 3;

      if (tempShowNumbers) {
        icosahedronBody.addEventListener("sleep", () => {
          console.log("icosa going to sleeep");
          sleepCounter++;
          getIcosaScore(icosahedron);
        });
      }
      world.addBody(icosahedronBody);
      icosahedronBody.angularVelocity.set(0.5, 0.5, 0.5);
      icosahedronBody.applyImpulse(offset, rollingForce);
      icosahedron.position.copy(icosahedronBody.position); // this merges the physics body to threejs mesh
      icosahedron.quaternion.copy(icosahedronBody.quaternion);

      if (quaternionShared != null && quaternionShared != undefined) {
        icosahedron.quaternion.copy(quaternionShared);
        icosahedronBody.quaternion.copy(quaternionShared);
      }

      diceArray.push([
        icosahedron,
        icosahedronBody,
        "icosa",
        tempShowNumbers,
        tempTransparent,
        tempFillColor,
        tempTextColor,
      ]);
    }

    const timeStep = 1 / 20;

    function throwDice() {
      for (let i = 0; i < diceArray.length; i++) {
        scene.remove(diceArray[i][0]);
        world.removeBody(diceArray[i][1]);
      }
      if (diceArray.length > 0) {
        lastRoll = "";
        presentScore = 0;
        for (let i = 0; i < diceArray.length; i++) {
          diceArray[i][1].angularVelocity.set(0.5, 0.5, 0.5);
          diceArray[i][1].applyImpulse(offset, rollingForce);
          diceArray[i][1].position.set(0, 10, 0);
        }
        for (let i = 0; i < diceArray.length; i++) {
          scene.add(diceArray[i][0]);
          world.addBody(diceArray[i][1]);
        }
      } else {
        for (let i = 0; i < dices.cube; i++) {
          createCube();
        }
        for (let i = 0; i < dices.tetra; i++) {
          createTetrahedron();
        }
        for (let i = 0; i < dices.octa; i++) {
          createOctahedron();
        }
        for (let i = 0; i < dices.dodeca; i++) {
          createDodecahedron();
        }
        for (let i = 0; i < dices.deca; i++) {
          createDecahedron();
        }
        for (let i = 0; i < dices.icosa; i++) {
          createIcosahedron();
        }
        lastRoll = "";
        // if (showNumbers) {
        //   getScore();
        // }
      }
    }
    function getOctaScore(body, ifRemove) {
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
      ];

      let minValue = 1000000;
      let minInd;
      for (let i = 0; i < faceVectors.length; i++) {
        let faceVector = faceVectors[i];
        faceVector.vector.applyEuler(body.rotation);
        console.log(Math.abs(faceVector.vector.y));
        if (minValue > Math.abs(1 - faceVector.vector.y)) {
          minValue = Math.abs(1 - faceVector.vector.y);
          minInd = i;
        }
        // if (Math.abs(faceVector.vector.y).toString().substring(0, 1) == '1') {
        //   lastRoll += faceVectors[i].face + ' +'
        //   presentScore += faceVectors[i].face
        //   updateElements()
        //   break
        // }
      }
      if (!ifRemove) {
        lastRoll += faceVectors[minInd].face + " + ";
        presentScore += faceVectors[minInd].face;
        updateElements();
      }
      return faceVectors[minInd].face;
    }
    function getCubeScore(body, ifRemove) {
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
      ];
      for (const faceVector of faceVectors) {
        faceVector.vector.applyEuler(body.rotation);

        if (Math.round(faceVector.vector.y) == 1) {
          if (!ifRemove) {
            lastRoll += faceVector.face + " + ";
            presentScore += faceVector.face;
            updateElements();
          }
          return faceVector.face;
        }
      }
    }
    function getTetraScore(body, ifRemove) {
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
      ];

      for (const faceVector of faceVectors) {
        faceVector.vector.applyEuler(body.rotation);
        if (Math.round(faceVector.vector.y) == 1) {
          if (!ifRemove) {
            lastRoll += faceVector.face + " + ";
            presentScore += faceVector.face;
            updateElements();
            break;
          }
          return faceVector.face;
        }
      }
    }

    function getDecaScore(body, ifRemove) {
      console.log("getting deca");
    }

    function getIcosaScore(body, ifRemove) {
      // Define the golden ratio
      const phi = (1 + Math.sqrt(5)) / 2;

      // Icosahedron face vectors
      const faceVectors = [
        { vector: new THREE.Vector3(0, 1, phi).normalize(), face: 7 },
        { vector: new THREE.Vector3(0, -1, phi).normalize(), face: 16 },
        { vector: new THREE.Vector3(0, 1, -phi).normalize(), face: 4 },
        { vector: new THREE.Vector3(0, -1, -phi).normalize(), face: 20 },
        { vector: new THREE.Vector3(1, phi, 0).normalize(), face: 6 },
        { vector: new THREE.Vector3(-1, phi, 0).normalize(), face: 5 },
        { vector: new THREE.Vector3(1, -phi, 0).normalize(), face: 9 },
        { vector: new THREE.Vector3(-1, -phi, 0).normalize(), face: 17 },
        { vector: new THREE.Vector3(phi, 0, 1).normalize(), face: 15 },
        { vector: new THREE.Vector3(-phi, 0, 1).normalize(), face: 8 },
        { vector: new THREE.Vector3(phi, 0, -1).normalize(), face: 19 },
        { vector: new THREE.Vector3(-phi, 0, -1).normalize(), face: 13 },
        { vector: new THREE.Vector3(1, phi, phi).normalize(), face: 2 },
        { vector: new THREE.Vector3(-1, phi, phi).normalize(), face: 1 },
        { vector: new THREE.Vector3(1, -phi, phi).normalize(), face: 11 },
        { vector: new THREE.Vector3(-1, -phi, phi).normalize(), face: 12 },
        { vector: new THREE.Vector3(1, phi, -phi).normalize(), face: 10 },
        { vector: new THREE.Vector3(-1, phi, -phi).normalize(), face: 3 },
        { vector: new THREE.Vector3(1, -phi, -phi).normalize(), face: 14 },
        { vector: new THREE.Vector3(-1, -phi, -phi).normalize(), face: 18 },
      ];

      let closestFace = null;
      let closestDot = -1; // Initialize with the smallest possible dot product

      // Reference vector pointing up
      let upVector = new THREE.Vector3(0, 1, 0);

      for (const faceVector of faceVectors) {
        // Apply the body's quaternion to the face vector
        let worldVector = faceVector.vector
          .clone()
          .applyQuaternion(body.quaternion);

        // Calculate the dot product with the up vector
        let dot = worldVector.dot(upVector);

        // Check if this is the closest to pointing up
        if (dot > closestDot) {
          closestDot = dot;
          closestFace = faceVector;
        }
      }

      if (closestFace) {
        let faceNumber = closestFace.face;
        if (!ifRemove) {
          lastRoll += faceNumber + " + ";
          presentScore += faceNumber;
          updateElements();
        }
        return faceNumber;
      }
    }

    // Function to calculate a face vector based on spherical coordinates
    function calculateFaceVector(theta, phi) {
      return new THREE.Vector3(
        Math.cos(theta) * Math.sin(phi),
        Math.sin(theta) * Math.sin(phi),
        Math.cos(phi)
      );
    }

    function getDodecaScore(body, ifRemove) {
      // Define the golden ratio
      const phi = (1 + Math.sqrt(5)) / 2;

      // Dodecahedron face vectors
      const faceVectors = [
        { vector: new THREE.Vector3(1, 1, 1), face: 1 },
        { vector: new THREE.Vector3(1, 1, -1), face: 6 },
        { vector: new THREE.Vector3(1, -1, 1), face: 11 },
        { vector: new THREE.Vector3(1, -1, -1), face: 4 },
        { vector: new THREE.Vector3(-1, 1, 1), face: 7 },
        { vector: new THREE.Vector3(-1, 1, -1), face: 2 },
        { vector: new THREE.Vector3(-1, -1, 1), face: 5 },
        { vector: new THREE.Vector3(-1, -1, -1), face: 8 },
        { vector: new THREE.Vector3(0, phi, 1 / phi), face: 9 },
        { vector: new THREE.Vector3(0, phi, -1 / phi), face: 10 },
        { vector: new THREE.Vector3(0, -phi, 1 / phi), face: 3 },
        { vector: new THREE.Vector3(0, -phi, -1 / phi), face: 12 },
      ];

      for (const faceVector of faceVectors) {
        faceVector.vector.normalize().applyEuler(body.rotation);

        if (Math.round(faceVector.vector.y) === 1) {
          if (!ifRemove) {
            lastRoll += faceVector.face + " + ";
            presentScore += faceVector.face;
            updateElements();
            break;
          }
          return faceVector.face;
        }
      }
    }

    function toggleTransparency() {
      for (let i = 0; i < diceArray.length; i++) {
        if (transparent) {
          leftLight.intensity = 5;
          rightLight.intensity = 5;
          backLight.intensity = 5;
          bottomLight.intensity = 5;
        } else {
          leftLight.intensity = 0.1;
          rightLight.intensity = 0.1;
          backLight.intensity = 0.5;
          bottomLight.intensity = 0.1;
        }
        diceArray[i][0].material.wireframe =
          !diceArray[i][0].material.wireframe;
        diceArray[i][0].material.transparent =
          !diceArray[i][0].material.transparent;
        diceArray[i][0].material.needsUpdate = true;
      }
      groundMesh.material.wireframe = !groundMesh.material.wireframe;
    }
    // function changeColors() {
    //   for (let i = 0; i < diceArray.length; i++) {
    //     diceArray[i][0].material.color?.set(presentColor);
    //     diceArray[i][0].material.needsUpdate = true;
    //   }
    // }

    function changeBoardBackground(selectedBoard) {
      console.log("changing bg now");
      console.log(selectedBoard);
      let textureLoader = new THREE.TextureLoader();
      switch (selectedBoard) {
        case "green-board":
          console.log("now changing bg to green");
          textureLoader.load(
            "images/grass_background.png",
            function (groundTexture) {
              groundMesh.material.wireframe = false;
              groundMesh.material.map = groundTexture;
              groundMesh.material.needsUpdate = true;
              groundBody.material.friction = 5;
            }
          );
          break;
        case "wood":
          console.log("wood changing");
          textureLoader.load("images/wood.png", function (groundTexture) {
            groundMesh.material.wireframe = false;
            groundMesh.material.color.setHex(0xf0c592);
            groundMesh.material.map = groundTexture;
            groundMesh.material.needsUpdate = true;
            groundBody.material.friction = 3;
          });
          break;
        case "default":
          groundMesh.material.needsUpdate = true;
          groundMesh.material.color.setHex(0x656565);
          groundMesh.material.wireframe = false;
          groundMesh.material.map = null;
          groundBody.material.friction = 1;
          break;
      }
    }
    animate();

    function animate() {
      world.step(timeStep);
      cannonDebugger.update();

      groundMesh.position.copy(groundBody.position);
      groundMesh.quaternion.copy(groundBody.quaternion);

      // Loop to merge the cannon bodies to the threejs meshes
      for (let i = 0; i < diceArray.length; i++) {
        diceArray[i][0]?.position?.copy(diceArray[i][1].position);
        diceArray[i][0]?.quaternion?.copy(diceArray[i][1].quaternion);
      }

      renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(animate);

    window.addEventListener("resize", function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  });
});
