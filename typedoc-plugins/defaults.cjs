const { JSX } = require('typedoc')

exports.load = function load(app) {
  app.renderer.hooks.on('head.begin', () => {
    return JSX.createElement(
      'script',
      null,
      JSX.createElement(JSX.Raw, {
        html: `
        localStorage.setItem('tsd-theme', localStorage.getItem('tsd-theme') || 'light');
        localStorage.setItem('tsd-accordion--settings', localStorage.getItem('tsd-accordion--settings') || 'false')
        
        // let r = document.querySelector(':root');
        // r.style.setProperty('--light-color-background', 'white');
        // r.style.setProperty('--light-color-background-secondary', 'white');
        `,
      })
    )
  })

  app.renderer.hooks.on('head.end', () => {
    // create a link to the favicon
    return JSX.createElement(
      'link',
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/favicon/apple-touch-icon.png',
      },
      null
    )
  })

  app.renderer.hooks.on('head.end', () => {
    // create a link to the favicon
    return JSX.createElement(
      'link',
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon/favicon-32x32.png',
      },
      null
    )
  })

  app.renderer.hooks.on('head.end', () => {
    // create a link to the favicon
    return JSX.createElement(
      'link',
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon/favicon-16x16.png',
      },
      null
    )
  })

  app.renderer.hooks.on('head.end', () => {
    // create a link to the favicon
    return JSX.createElement(
      'link',
      {
        rel: 'manifest',
        href: '/favicon/site.webmanifest',
      },
      null
    )
  })

  app.renderer.hooks.on('head.end', () => {
    // create a link to the favicon
    return JSX.createElement(
      'link',
      {
        rel: 'mask-icon',
        href: '/favicon/safari-pinned-tab.svg',
        color: '#5bbad5',
      },
      null
    )
  })

  app.renderer.hooks.on('head.end', () => {
    // create a link to the favicon
    return JSX.createElement(
      'meta',
      {
        name: 'msapplication-TileColor',
        content: '#292929',
      },
      null
    )
  })

  app.renderer.hooks.on('head.end', () => {
    // create a link to the favicon
    return JSX.createElement(
      'meta',
      {
        name: 'theme-color',
        content: '#333333',
      },
      null
    )
  })
}
