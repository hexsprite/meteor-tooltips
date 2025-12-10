Package.describe({
  name: 'lookback:tooltips',
  summary: 'Reactive tooltips.',
  version: '0.7.0',
  git: 'https://github.com/lookback/meteor-tooltips.git',
})

Package.onUse(function (api) {
  api.versionsFrom(['2.3', '3.0'])
  api.use(['reactive-var', 'jquery', 'templating', 'tracker'], 'client')
  api.addFiles(['tooltips.html', 'tooltips.js'], 'client')
  api.export('Tooltips', 'client')
})
