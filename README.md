# metalsmith-adaptive-images

> A plugin for [Metalsmith](http://www.metalsmith.io/) to create adaptive images via `<img srcset="..." styles="..."/>`. It works well along with [metalsmith-project-images](https://github.com/hoetmaaiers/metalsmith-project-images).

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://axe312.mit-license.org)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)
[![Build Status](https://img.shields.io/circleci/project/axe312ger/metalsmith-adaptive-images/prototype.svg?maxAge=2592000)](https://circleci.com/gh/axe312ger/metalsmith-adaptive-images)
[![CodeCov Badge](https://img.shields.io/codecov/c/github/axe312ger/metalsmith-adaptive-images.svg?maxAge=2592000)](https://codecov.io/gh/axe312ger/metalsmith-adaptive-images)
![David](https://img.shields.io/david/axe312ger/metalsmith-adaptive-images.svg)
![David](https://img.shields.io/david/dev/axe312ger/metalsmith-adaptive-images.svg)
[![semantic-release](https://img.shields.io/badge/%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## Introduction

Providing images on websites nowadays can be tricky. You need to consider many different device sizes with good to to very bad connection speed.

So you will end up serving multiple versions of your images
with different dimensions. Also you need to tell the browser which image to pick for a breakpoint. The article [Don’t ruin your <img> - by Anthony Ng](https://medium.freecodecamp.com/you-need-to-stop-making-these-6-mistakes-with-your-img-s-e242c02d14be#.og235f7wq
) explains very well, what you need to keep in mind while serving images in today's web.

This plugin will create a map of images, containing metadata to properly output images with srcset and styles attributes.

It is up to you to generate a gallery in your layout engine or use it your javascript to provide sharp images.

## Install

```js
npm install --save metalsmith-adaptive-images
```

## Preparation

First you need to load your images into metalsmith, you could use [metalsmith-project-images](https://github.com/hoetmaaiers/metalsmith-project-images) for this.

To resize your images, you could use one of the following plugins for this:
* [metalsmith-sharp](https://github.com/axe312ger/metalsmith-sharp) - full sharp api integration
* [metalsmith-image-resizer](https://github.com/kenhoff/metalsmith-image-resizer) - simple sharp integration
* [metalsmith-convert](https://github.com/tomterl/metalsmith-convert) - old but good imagemagick

Also consider to compress your images. The [metalsmith-imagemin](https://github.com/ahmadnassri/metalsmith-imagemin) plugin should be a good bet here.
If you are looking for a very fast but effective JPEG compressor, I can really recommend to use [mozjpeg](https://github.com/imagemin/imagemin-mozjpeg).

## Usage

Just use it as regular Metalsmith plugin. If your environment does not support the import syntax, see further below.

The plugin expects an array of images within the metadata of a file.
As soon as a matching metadata key is found, the plugin will convert the
array into a map of images with proper objects with the parsed and generated metadata.

Also, it provides a function to render an adaptive image tag based on a provided image url.

```js
import Metalsmith from 'metalsmith'
import images from 'metalsmith-project-images'
import AdaptiveImages from 'metalsmith-adaptive-images'

// Initialize your instance of the plugin.
// This allows you to use multiple configurations.
const adaptiveImages = AdaptiveImages({
  ... your configuration here ...
})

Metalsmith('/path/to/project')
  // Use metalsmith-project-images to locate images and add to file metadata.
  .use(images({}))
  // Use the plugin to attach metadata.
  // The default options match the ones of metalsmith-project-images.
  .use(adaptiveImages.plugin)
  .build()
```

Every document with attached images like this:
```js
files: {
  'example.md': {
    ...,
    images: [ 'images/example.jpg', ... ]
  }
}
```

Will be transformed into this:
```js
files: {
  'example.md': {
    ...,
    images: {
      'example.jpg': {
        src: 'images/example-960.jpg',
        srcset: 'images/example-1440.jpg 1440w, images/example-960.jpg 960w, images/example-480.jpg 480w',
        sizes: '(min-width: 960px) 960px, 100vw',
        name: 'example.jpg'
      },
      ...
    }
  }
}
```

### Node 6
```js
const AdaptiveImages = require('metalsmith-adaptive-images').default
```

### Node 4
A version for the LTS version of node is also supplied. You can require it like this:

```js
const AdaptiveImages = require('metalsmith-adaptive-images/dist/node-4').default
```

For further examples can be found in the test directory.

## Options

Default options:
```js
{
  imagesKey: 'images',
  imageWidths: [1440, 960, 480],
  imageSizes: ['(min-width: 960px) 960px', '100vw'],
  defaultSize: 960,
  namingPattern: '{dir}{name}-{size}{ext}', // foo/bar-200.jpg,...
  srcsetPattern: '{url} {size}w' // foo/bar-200.jpg 200w,...
}
```

### imagesKey

The file metadata key where to look for images. [metalsmith-project-images](https://github.com/hoetmaaiers/metalsmith-project-images) uses `images` here, so does this plugin.

### imageWidths

Defines your breakpoints for which you actually want to server images for. Make
sure to define from biggest to lowest to prevent issues with old Internet Explorer
versions. Also do not forget, that this plugin does not resizes the images itself.

```js
{
  defaultSize: [2880, 1440, 960, 480, 320]
}
```

### defaultSize

Default size to select. The renderer will use this to set the src attribute and
so should you. Older browsers will use this as fallback when they do not support
the srcset attribute.

```js
{
  defaultSize: 960
}
```

### namingPattern

Naming pattern for the actual image file names.

Supported placeholders:
* `{dir}`: Directory of file followed by slash
* `{base}`: Full filename with extension
* `{name}`: Filename without extension
* `{ext}`: File extension with leading dot
* `{size}`: The width of the current srcset breakpoint

```js
{
  namingPattern: '{dir}/{name}-{size}{ext}'
}
```

### srcsetPattern

Pattern of the generated srcset syntax. The default should fit for most usecases.

Supported placeholders:
* `{url}`: The url of the image to serve for this breakpoint
* `{size}`: The width of the current srcset breakpoint

```js
{
  srcsetPattern: '{url} {size}w'
}
```

## Methods

### `getImageRenderer(attrs = {})`

Returns a function that renders a given image based on your configuration.
`attrs` is an object which contains extra attributes which will be
attached to the image tag.

Separated by pipe (`|`) you can provide a title for the image.
```js
const adaptiveImages = AdaptiveImages()
const imageRenderer = adaptiveImages.getImageRenderer()

console.log(imageRenderer('images/example.jpg|this is the title'))
```

```html
<img src="images/example-960.jpg" srcset="images/example-1440.jpg 1440w, images/example-960.jpg 960w, images/example-480.jpg 480w" sizes="(min-width: 960px) 960px, 100vw" title="this is the title" alt="this is the title" />
```

## Development

This project follows the [standard](https://github.com/feross/standard) coding and the [conventional changelog](https://github.com/conventional-changelog/conventional-changelog-angular/blob/master/convention.md) commit message style. Also it is configured to never decrease the code coverage of its tests.

Also make sure you check out all available npm scripts via `npm run`.

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/axe312ger/metalsmith-adaptive-images/issues/new).
But before doing anything, please read the [CONTRIBUTING.md](./CONTRIBUTING.md) guidelines.
