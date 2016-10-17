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

## Install

```js
npm install --save metalsmith-adaptive-images
```

## Usage

Just use it as regular Metalsmith plugin. If your environment does not support the import syntax, see further below.

The plugin expects an array of images within the metadata of a file. You can achieve that for example with [metalsmith-project-images](https://github.com/hoetmaaiers/metalsmith-project-images).
As soon as a matching metadata key is found, the plugin will convert the
array into a map of images with proper objects with image related metadata.

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

// Optionally get a render function to render adaptive images
// based on your configuration.
const imageRenderer = adaptiveImages.getImageRenderer()

Metalsmith('/path/to/project')
  // Use metalsmith-project-images to locate images and add to file metadata.
  .use(images({}))
  // Use the plugin to attach metadata.
  // The default options match the ones of metalsmith-project-images.
  .use(adaptiveImages.plugin)
  // Optionally pass the renderer to your templates for yourself or the author.
  .use(inPlace({
    engine: 'mustache',
    image: () => imageRenderer
  }))
  .build()
```

Every document with attached images like this:
@todo

Will be transformed into this:
@todo

While the render function will render for example:
@todo

### Node 6
```js
const sharp = require('metalsmith-adaptive-images').default
```

### Node 4
A version for the LTS version of node is also supplied. You can require it like this:

```js
const sharp = require('metalsmith-adaptive-images/dist/node-4').default
```

For further examples can be found in the test directory.

## Options

Default options:
```js
{
  imagesKey: 'images',
  imagesDirectory: 'images',
  imageWidths: [1440, 960, 480],
  imageSizes: ['(min-width: 960px) 960px', '100vw'],
  defaultSize: 960,
  namingPattern: '{dir}{name}-{size}{ext}', // foo/bar-200.jpg
  srcsetPattern: '{url} {size}w' // foo/bar-200.jpg 200w
}
```

### methods

@todo

## Methods
@todo

## Development

This project follows the [standard](https://github.com/feross/standard) coding and the [conventional changelog](https://github.com/conventional-changelog/conventional-changelog-angular/blob/master/convention.md) commit message style. Also it is configured to never decrease the code coverage of its tests.

Also make sure you check out all available npm scripts via `npm run`.

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/axe312ger/metalsmith-adaptive-images/issues/new).
But before doing anything, please read the [CONTRIBUTING.md](./CONTRIBUTING.md) guidelines.
