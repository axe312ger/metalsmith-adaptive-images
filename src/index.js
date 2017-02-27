const { parse } = require('path')
const cheerio = require('cheerio')
const minimatch = require('minimatch')

function replacePlaceholders (text, placeholders) {
  return text.replace(/\{([^}]+)\}/g, (match, pattern) => {
    if (placeholders.hasOwnProperty(pattern)) {
      return placeholders[pattern]
    }
    return match
  })
}

// Parses attached images in metadata and transforms the array in a proper map
export default function AdaptiveImages (options) {
  const defaultOptions = {
    imagesKey: 'images',
    mapKey: 'imagesMap',
    imageWidths: [1440, 960, 480],
    imageSizes: ['(min-width: 960px) 960px', '100vw'],
    defaultSize: 960,
    namingPattern: '{dir}{name}-{size}{ext}',
    srcsetPattern: '{url} {size}w',
    htmlFileGlob: '**/*.html',
    htmlImageSelector: 'img'
  }

  function parseSrc (src) {
    const parsedSrc = parse(src)
    if (parsedSrc.dir.length) {
      parsedSrc.dir = `${parsedSrc.dir}/`
    }
    return parsedSrc
  }

  function formatName (src, size) {
    return replacePlaceholders(options.namingPattern, {
      ...parseSrc(src),
      size
    })
  }

  function formatSrcset (src) {
    return options.imageWidths
      .map((size) => {
        const url = formatName(src, size)
        return replacePlaceholders(options.srcsetPattern, {
          url,
          size
        })
      })
  }

  function generateImageObject (path) {
    const srcset = formatSrcset(path)
    const defaultIndex = options.imageWidths.indexOf(options.defaultSize)
    const src = srcset[defaultIndex].split(' ')[0]
    const sizes = options.imageSizes.join(', ')
    const { base } = parseSrc(path)

    return {
      src,
      srcset: srcset.join(', '),
      sizes,
      name: base
    }
  }

  function addImageToMap (imageMap, path) {
    const image = generateImageObject(path)
    return {
      ...imageMap,
      [path]: image
    }
  }

  // Plugin to transform array of images into a map of image objects
  function processImages (files, metalsmith, done) {
    setImmediate(done)

    Object.keys(files).map((filename) => {
      const file = files[filename]
      if (file.hasOwnProperty(options.imagesKey)) {
        file[options.mapKey] = file[options.imagesKey]
          .reduce(addImageToMap, {})
      }
    })
  }

  // Plugin to replace images
  function replaceImages (files, metalsmith, done) {
    setImmediate(done)

    Object.keys(files).map((filename) => {
      const file = files[filename]
      if (minimatch(filename, options.htmlFileGlob)) {
        replaceMatchingImages(file)
      }
    })
  }

  function replaceMatchingImages (file) {
    const $ = cheerio.load(file.contents)

    $(options.htmlImageSelector).map((index, img) => {
      const { src, ...attrs } = img.attribs

      const replacement = renderImage(src, attrs)
      $(img).replaceWith(replacement)
    })
    file.contents = new Buffer($.html())
  }

  // Renderer for a responsive image. Additional attributes can be passed.
  function renderImage (src, attrs) {
    const image = generateImageObject(src)
    attrs = {
      src: image.src,
      srcset: image.srcset,
      sizes: image.sizes,
      ...attrs
    }

    attrs = Object.keys(attrs)
      .reduce((attrList, attribute) => {
        return [
          ...attrList,
          `${attribute}="${attrs[attribute]}"`
        ]
      }, [])

    return `<img ${attrs.join(' ')}/>`
  }

  options = {
    ...defaultOptions,
    ...options
  }

  return {
    processImages,
    replaceImages,
    renderImage
  }
}
