import { join } from 'path'
import test from 'ava'
import Metalsmith from 'metalsmith'
import markdown from 'metalsmith-markdown'
import images from 'metalsmith-project-images'

import AdaptiveImages from '../src/index'

const FIXTURES_DIR = join(__dirname, 'fixtures')

const NAME = 'koh-rong.jpg'
const PATH = `images/${NAME}`
const SRC = 'images/koh-rong-960.jpg'
const SRCSET = 'images/koh-rong-1440.jpg 1440w, images/koh-rong-960.jpg 960w, images/koh-rong-480.jpg 480w'
const SIZES = '(min-width: 960px) 960px, 100vw'
const ALT = 'Koh Rong - North Coast'
const RENDERED_IMAGE = `<img src="${SRC}" srcset="${SRCSET}" sizes="${SIZES}" alt="${ALT}"/>`

test.beforeEach(async (t) => {
  const metalsmith = Metalsmith(FIXTURES_DIR)
    .source('./input')
    .destination('./results')

  t.context = {
    metalsmith
  }
})

test.cb('test basic metadata transformation', (t) => {
  const { metalsmith } = t.context

  const adaptiveImages = AdaptiveImages()

  metalsmith
    .use(images({}))
    .use(adaptiveImages.processImages)
    .build((err, files) => {
      if (err) {
        t.fail()
        t.end()
        throw err
      }
      t.true(files.hasOwnProperty('example.md'))

      const document = files['example.md']
      t.true(document.hasOwnProperty('images'))

      t.true(Array.isArray(document.images))
      t.is(typeof document.imagesMap, 'object')
      t.is(Object.keys(document.imagesMap).length, document.images.length)
      t.true(document.imagesMap.hasOwnProperty(PATH))

      const image = document.imagesMap[PATH]
      t.deepEqual(image, {
        src: SRC,
        srcset: SRCSET,
        sizes: SIZES,
        name: NAME
      })

      t.pass()
      t.end()
    })
})

test.cb('test file renaming with placeholders', (t) => {
  const { metalsmith } = t.context

  const adaptiveImages = AdaptiveImages({
    namingPattern: '{dir}{name}-{size}-{unknown-placeholder}{ext}'
  })

  metalsmith
    .use(images({}))
    .use(adaptiveImages.processImages)
    .build((err, files) => {
      if (err) {
        t.fail()
        t.end()
        throw err
      }
      t.true(files.hasOwnProperty('example.md'))

      const document = files['example.md']
      t.true(document.hasOwnProperty('imagesMap'))
      t.true(document.imagesMap.hasOwnProperty(PATH))

      const image = document.imagesMap[PATH]
      t.deepEqual(image, {
        src: 'images/koh-rong-960-{unknown-placeholder}.jpg',
        srcset: 'images/koh-rong-1440-{unknown-placeholder}.jpg 1440w, images/koh-rong-960-{unknown-placeholder}.jpg 960w, images/koh-rong-480-{unknown-placeholder}.jpg 480w',
        sizes: SIZES,
        name: NAME
      })

      t.pass()
      t.end()
    })
})

test.cb('test img tag replacement', (t) => {
  const { metalsmith } = t.context

  const adaptiveImages = AdaptiveImages()

  metalsmith
    .use(images({}))
    .use(adaptiveImages.processImages)
    .use(markdown())
    .use(adaptiveImages.replaceImages)
    .build((err, files) => {
      if (err) {
        t.fail()
        t.end()
        throw err
      }
      t.true(files.hasOwnProperty('example.html'))
      const document = files['example.html']
      t.true(document.contents.indexOf(RENDERED_IMAGE) !== -1)
      t.pass()
      t.end()
    })
})

test('test image renderer', (t) => {
  const adaptiveImages = AdaptiveImages()

  const image = adaptiveImages.renderImage(PATH, {
    alt: ALT
  })

  t.is(image, RENDERED_IMAGE)
})
