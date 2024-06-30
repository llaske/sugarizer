define([], function () {
  var tutorial = {}

  tutorial.start = function () {
    var steps = [
      {
        title: 'Volume Activity',
        intro:
          'Welcome into the Volume activity. Feel free to zoom in and rotate the board to your preference using touch gestures or simply by clicking and scrolling.',
      },
      {
        element: '#bg-button',
        position: 'bottom',
        title: 'Change board background',
        intro: 'Choose any one of the three boards backgrounds according to their different frictions.',
      },
      {
        element: '#color-button',
        title: 'Change Volume Color',
        intro: 'Choose any one of the colors for your volumes. The default is your buddy color.',
      },
      {
        element: '#cube-button',
        title: 'Add Cubes',
        intro: 'Select this and click anywhere on the board to add cubes to that position. The default is a solid cube without numbers.',
      },
      {
        element: '#tetra-button',
        title: 'Add Tetrahedrons',
        intro: 'Select this and click anywhere on the board to add tetrahedrons to that position. The default is a solid tetrahedron without numbers.',
      },
      {
        element: '#octa-button',
        title: 'Add Octahedrons',
        intro: 'Select this and click anywhere on the board to add octahedrons to that position. The default is a solid octahedron without numbers.',
      },
      {
        element: '#clear-button',
        title: 'Remove volumes',
        intro: 'Select this and click on any volume on the board to remove it.',
      },
      {
        element: '#reset-button',
        title: 'Reset Scores',
        intro: 'Click on this button to reset the scores calculated through the numbered dice.',
      },
      {
        element: '#number-button',
        title: 'Add volumes with numbers',
        intro: 'Select this to add volumes with numbers on their sides. These will be used to calculate the score. This works with the earlier volume buttons, keep this and any one of the volume buttons selected and click on the board to add numbered volumes.',
      },
      {
        element: '#transparent-button',
        title: 'Add transparent volumes to the board',
        intro: 'Select this to add transparent volumes. This works with the earlier volume buttons, keep this and any one of the volume buttons selected and click on the board to add transparent volumes to the board.',
      },
      {
        element: '#image-button',
        title: 'Add images to the sides of the volume',
        intro: 'Select this to add volumes with images on their sides. You can select an image from the journal to apply it to the volumes. This works with the earlier volume buttons, keep this and any one of the volume buttons selected and click on the board to add image volumes to the board.',
      },
      {
        element: '#solid-button',
        title: 'Make all volumes transparent',
        intro: 'Toggle this button to make all the volumes added on the board transparent.',
      },
      {
        element: '#zoom-in-button',
        title: 'Zoom In Button',
        intro: 'Click this button to zoom in on the scene.',
      },
      {
        element: '#zoom-out-button',
        title: 'Zoom Out Button',
        intro: 'Click this button to zoom out of the scene.',
      },
      {
        element: '#throw-button',
        title: 'Throw Button',
        intro: 'Use this button to shake the volumes on the board.',
      },
      {
        element: '.arrow-container',
        title: 'Rotate the board',
        intro: 'Select the arrow pointing in the direction you wish the board to rotate.',
      },
      
    ]
    steps = steps.filter(function (obj) {
      return (
        !('element' in obj) ||
        (obj.element.length &&
          document.querySelector(obj.element) &&
          document.querySelector(obj.element).style.display != 'none')
      )
    })
    introJs()
      .setOptions({
        tooltipClass: 'customTooltip',
        steps: steps,
        prevLabel: 'Prev',
        nextLabel: 'Next',
        exitOnOverlayClick: false,
        nextToDone: false,
        showBullets: false,
      })
      .start()
  }

  return tutorial
})
