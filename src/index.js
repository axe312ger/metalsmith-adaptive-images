const { parse } = require('path')

function replacePlaceholders (text, placeholders) {
  return text.replace(/\{([^\}]+)\}/g, (match, pattern) => {
    if (placeholders.hasOwnProperty(pattern)) {
      return placeholders[pattern]
    }
    return match
  })
}

// Parses attached images in metadata and transforms the array in a proper map
export default function ResponsiveImages (options) {
  const defaultOptions = {
    imagesKey: 'images',
    imagesDirectory: 'images',
    imageWidths: [1440, 960, 480],
    imageSizes: ['(min-width: 960px) 960px', '100vw'],
    defaultSize: 960,
    namingPattern: '{dir}{name}-{size}{ext}', // foo/bar-200.jpg
    srcsetPattern: '{url} {size}w'
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
    const { base } = parseSrc(path)
    const image = generateImageObject(path)
    return {
      ...imageMap,
      [base]: image
    }
  }

  // Transform given array of images into a map of image objects
  function plugin (files, metalsmith, done) {
    setImmediate(done)

    Object.keys(files).map((filename) => {
      const file = files[filename]
      if (file.hasOwnProperty(options.imagesKey)) {
        file[options.imagesKey] = file[options.imagesKey]
          .reduce(addImageToMap, {})
      }
    })
  }

  // Renderer for a responsive image. Additional attributes can be passed.
  function getImageRenderer (extraAttrs) {
    extraAttrs = extraAttrs || {}

    return (text) => {
      const [src, title] = text.split('|')
      const image = generateImageObject(src)
      let attrs = {
        src: image.src,
        srcset: image.srcset,
        sizes: image.sizes
      }
      if (title) {
        attrs = {
          ...attrs,
          title,
          alt: title
        }
      }
      attrs = {
        ...attrs,
        ...extraAttrs
      }

      attrs = Object.keys(attrs)
        .reduce((attrList, attribute) => {
          return [
            ...attrList,
            `${attribute}="${attrs[attribute]}"`
          ]
        }, [])

      return [
        '<img',
        ...attrs,
        '/>'
      ].join(' ')
    }
  }

  options = {
    ...defaultOptions,
    ...options
  }

  return {
    plugin,
    getImageRenderer
  }
}
