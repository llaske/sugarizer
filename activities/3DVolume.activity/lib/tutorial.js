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
        element: '#tetra-button',
        title: 'Add Tetrahedrons',
        intro: 'Select this and click anywhere on the board to add tetrahedrons to that position. The default is a solid tetrahedron without numbers.',
      },
      {
        element: '#cube-button',
        title: 'Add Cubes',
        intro: 'Select this and click anywhere on the board to add cubes to that position. The default is a solid cube without numbers.',
      },
      {
        element: '#octa-button',
        title: 'Add Octahedrons',
        intro: 'Select this and click anywhere on the board to add octahedrons to that position. The default is a solid octahedron without numbers.',
      },
      {
        element: '#deca-button',
        title: 'Add Decahedrons',
        intro: 'Select this and click anywhere on the board to add decahedrons to that position. The default is a solid decahedron without numbers.',
      },
      {
        element: '#dodeca-button',
        title: 'Add Dodecahedron',
        intro: 'Select this and click anywhere on the board to add dodecahedron to that position. The default is a solid dodecahedrons without numbers.',
      },
      {
        element: '#icosa-button',
        title: 'Add Icosahedron',
        intro: 'Select this and click anywhere on the board to add icosahedron to that position. The default is a solid icosahedron without numbers.',
      },
      {
        element: '#clear-button',
        title: 'Remove volumes',
        intro: 'Select this and click on any volume on the board to remove it.',
      },
      {
        element: '#volume-button',
        title: 'Select Volume Type',
        intro: 'Select the type of volume you want to add to the board.',
      },
      {
        element: '#color-button-fill',
        title: 'Change Volume Color',
        intro: 'Choose any one of the colors for your volumes. The default is your buddy color.',
      },
      {
        element: '#color-button-text',
        title: 'Change Volume Text Color',
        intro: 'Choose any one of the colors for your the text on your volumes. The default is your buddy stroke color.',
      },
      {
        element: '#bg-button',
        position: 'bottom',
        title: 'Change board background',
        intro: 'Choose any one of the three boards backgrounds according to their different frictions.',
      },
      {
        element: '#zoom-button',
        title: 'Zoom In/Out',
        intro: 'Use the zoom pallette to zoom in or out..',
      },
      {
        element: '#throw-button',
        title: 'Throw Button',
        intro: 'Use this button to shake the volumes on the board.',
      },
      {
        element: '.right-container',
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
