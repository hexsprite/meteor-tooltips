Package.describe({
  name: 'lookback:tooltips',
  summary: 'Reactive tooltips.',
  version: '0.6.1',
  git: 'https://github.com/lookback/meteor-tooltips.git'
})

Package.onUse(function (api) {
  api.versionsFrom('1.7')
  api.use(
    'coffeescript reactive-var jquery templating tracker'.split(' '),
    'client'
  )
  api.addFiles('tooltips.html tooltips.coffee'.split(' '), 'client')
  api.export('Tooltips', 'client')
})
