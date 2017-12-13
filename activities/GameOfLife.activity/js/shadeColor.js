const shadeColor = (color, percent) => {
  let Red = parseInt(color.substring(1, 3), 16)
  let Green = parseInt(color.substring(3, 5), 16)
  let Blue = parseInt(color.substring(5, 7), 16)

  Red = parseInt((Red * (100 + percent)) / 100, 10)
  Green = parseInt((Green * (100 + percent)) / 100, 10)
  Blue = parseInt((Blue * (100 + percent)) / 100, 10)

  Red = (Red < 255) ? Red : 255
  Green = (Green < 255) ? Green : 255
  Blue = (Blue < 255) ? Blue : 255

  const shadedRed =
      (Red.toString(16).length === 1)
        ? `0${Red.toString(16)}`
        : Red.toString(16)

  const shadedGreen =
      (Green.toString(16).length === 1)
        ? `0${Green.toString(16)}`
        : Green.toString(16)

  const shadedBlue =
      (Blue.toString(16).length === 1)
        ? `0${Blue.toString(16)}`
        : Blue.toString(16)

  return `#${shadedRed}${shadedGreen}${shadedBlue}`
}

define (() => shadeColor)