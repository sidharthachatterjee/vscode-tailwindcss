const _ = require('lodash')

async function generateDynamicClasses(config) {
  const backgroundColors = _.map(
    config.backgroundColors,
    (colorHash, colorName) => `bg-${colorName}`
  )

  const backgroundSize = _.map(
    config.backgroundSize,
    (sizeValue, sizeName) => `bg-${sizeName}`
  )

  const borderColors = _.map(
    config.borderColors,
    (colorHash, colorName) => `border-${colorName}`
  )

  const fontColors = _.map(
    config.textColors,
    (colorHash, colorName) => `text-${colorName}`
  )

  const fontFamilies = _.map(
    config.fonts,
    (fonts, fontName) => `font-${fontName}`
  )

  const widths = _.map(
    config.width,
    (widthValue, widthName) => `w-${widthName}`
  )

  const minWidths = _.map(
    config.minWidth,
    (widthValue, widthName) => `min-w-${widthName}`
  )

  const maxWidths = _.map(
    config.maxWidth,
    (widthValue, widthName) => `max-w-${widthName}`
  )

  const heights = _.map(
    config.height,
    (heightValue, heightName) => `h-${heightName}`
  )

  const minHeights = _.map(
    config.minHeight,
    (heightValue, heightName) => `min-h-${heightName}`
  )

  const maxHeights = _.map(
    config.maxHeight,
    (heightValue, heightName) => `max-h-${heightName}`
  )

  const leading = _.map(
    config.leading,
    (leadingValue, leadingName) => `leading-${leadingName}`
  )

  const tracking = _.map(
    config.tracking,
    (trackingValue, trackingName) => `tracking-${trackingName}`
  )

  const opacity = _.map(
    config.opacity,
    (opacityValue, opacityName) => `opacity-${opacityName}`
  )

  const fill = _.map(
    config.svgFill,
    (fillValue, fillName) => `fill-${fillName}`
  )

  const stroke = _.map(
    config.svgStroke,
    (strokeValue, strokeName) => `stroke-${strokeName}`
  )

  const zIndex = _.map(
    config.zIndex,
    (zIndexValue, zIndexName) => `z-${zIndexName}`
  )

  const shadows = _.map(
    config.shadows,
    (shadowValue, shadowName) => `shadow-${shadowName}`
  )

  const textSizes = _.map(
    config.textSizes,
    (value, modifier) => `text-${modifier}`
  )

  const fontWeights = _.map(
    config.fontWeights,
    (value, modifier) => `font-${modifier}`
  )

  const defaultBorderRadius = [
    'rounded',
    'rounded-t',
    'rounded-r',
    'rounded-b',
    'rounded-l',
    'rounded-tl',
    'rounded-tr',
    'rounded-br',
    'rounded-bl	'
  ]

  const borderRadius = _.flatMap(
    _.omit(config.borderRadius, 'default'),
    (value, modifier) => [
      `rounded-${modifier}`,
      `rounded-t-${modifier}`,
      `rounded-r-${modifier}`,
      `rounded-b-${modifier}`,
      `rounded-l-${modifier}`,
      `rounded-tl-${modifier}`,
      `rounded-tr-${modifier}`,
      `rounded-br-${modifier}`,
      `rounded-bl-${modifier}`
    ]
  )

  const borders = _.flatMap(config.borderWidths, (value, modifier) => [
    `border-${modifier}`,
    `border-t-${modifier}`,
    `border-r-${modifier}`,
    `border-b-${modifier}`,
    `border-l-${modifier}`
  ])

  const margin = _.flatMap(config.margin, (value, modifier) => [
    `m-${modifier}`,
    `my-${modifier}`,
    `mx-${modifier}`,
    `mt-${modifier}`,
    `mr-${modifier}`,
    `mb-${modifier}`,
    `ml-${modifier}`
  ])

  const negativeMargin = _.flatMap(config.margin, (value, modifier) => [
    `-m-${modifier}`,
    `-my-${modifier}`,
    `-mx-${modifier}`,
    `-mt-${modifier}`,
    `-mr-${modifier}`,
    `-mb-${modifier}`,
    `-ml-${modifier}`
  ])

  const padding = _.flatMap(config.padding, (value, modifier) => [
    `p-${modifier}`,
    `py-${modifier}`,
    `px-${modifier}`,
    `pt-${modifier}`,
    `pr-${modifier}`,
    `pb-${modifier}`,
    `pl-${modifier}`
  ])

  return _.concat(
    backgroundColors,
    backgroundSize,
    borderColors,
    fontColors,
    fontFamilies,
    widths,
    minWidths,
    maxWidths,
    heights,
    minHeights,
    maxHeights,
    leading,
    tracking,
    opacity,
    fill,
    stroke,
    zIndex,
    shadows,
    textSizes,
    fontWeights,
    defaultBorderRadius,
    borderRadius,
    borders,
    margin,
    negativeMargin,
    padding
  )
}

module.exports = generateDynamicClasses
