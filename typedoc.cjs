/** @type {import('typedoc').TypeDocOptions} */
module.exports = {
  name: 'Partyline',
  media: 'media',
  hideGenerator: true,
  excludePrivate: true,
  sidebarLinks: {
    Github: 'https://github.com/totallyradlabs/partyline',
  },
  disableSources: true,
  plugin: './typedoc-plugins/defaults.cjs',
  customCss: './theme/style.css',
}
