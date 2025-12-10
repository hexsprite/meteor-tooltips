// Defaults
const Tooltip = {
  text: false,
  css: { top: 0, left: 0 },
  direction: 'tooltip--top',
  classes: '',
}

const dep = new Tracker.Dependency()
const offset = [10, 10]

const DIRECTION_MAP = {
  n: 'tooltip--top',
  s: 'tooltip--bottom',
  e: 'tooltip--right',
  w: 'tooltip--left',
}

// Tooltip functions

const getTooltip = function () {
  dep.depend()
  return Tooltip
}

const setTooltip = function (what, where) {
  if (where) {
    Tooltip.css = where
  }
  Tooltip.text = what
  dep.changed()
}

const setPosition = function (position, direction) {
  Tooltip.css = position
  if (direction) {
    Tooltip.direction = DIRECTION_MAP[direction]
  }
  dep.changed()
}

const setClasses = function (classes) {
  Tooltip.classes = classes || ''
}

const hideTooltip = function () {
  setTooltip(false)
}

const toggleTooltip = function () {
  if (getTooltip().text) {
    hideTooltip()
  } else {
    showTooltip(null, $(this))
  }
}

const positionTooltip = function ($el) {
  const direction = $el.attr('data-tooltip-direction') || 'n'
  const $tooltip = $('.tooltip')

  const position = $el.offset()
  let offLeft = $el.attr('data-tooltip-left')
  let offTop = $el.attr('data-tooltip-top')
  let hasOffsetLeft = false
  let hasOffsetTop = false

  if (_.isUndefined(offLeft)) {
    offLeft = 0
  } else {
    hasOffsetLeft = true
  }

  if (_.isUndefined(offTop)) {
    offTop = 0
  } else {
    hasOffsetTop = true
  }

  switch (direction) {
    case 'w':
    case 'e':
      position.top = center(vertically($tooltip, $el)) + Number(offTop)
      break
    case 'n':
      position.top =
        position.top -
        $tooltip.outerHeight() -
        (hasOffsetTop ? Number(offTop) : offset[1])
      break
    case 's':
      position.top =
        position.top +
        $el.outerHeight() +
        (hasOffsetTop ? Number(offTop) : offset[1])
      break
  }

  switch (direction) {
    case 'n':
    case 's':
      position.left = center(horizontally($tooltip, $el)) + Number(offLeft)
      break
    case 'w':
      position.left =
        position.left -
        $tooltip.outerWidth() -
        (hasOffsetLeft ? Number(offLeft) : offset[0])
      break
    case 'e':
      position.left =
        position.left +
        $el.outerWidth() +
        (hasOffsetLeft ? Number(offLeft) : offset[0])
      break
  }

  setPosition(position, direction)
}

const showTooltip = function (evt, $el) {
  $el = $el || $(this)
  const viewport = $el.attr('data-tooltip-disable')

  if (viewport && _.isString(viewport)) {
    const mq = window.matchMedia(viewport)
    if (mq.matches) {
      return false
    }
  }

  let content
  const selector = $el.attr('data-tooltip-element')
  if (selector) {
    const $target = $(selector)
    content = $target.length && $target.html()
  } else {
    content = $el.attr('data-tooltip')
  }

  setTooltip(content)
  setPosition({ top: 0, left: 0 })
  setClasses($el.attr('data-tooltip-classes'))

  Tracker.afterFlush(function () {
    positionTooltip($el)
  })
}

// Positioning

const center = function (args) {
  const middle = args[0] + args[1] / 2
  return middle - Math.round(args[2] / 2)
}

const horizontally = function ($el, $reference) {
  return [$reference.offset().left, $reference.outerWidth(), $el.outerWidth()]
}

const vertically = function ($el, $reference) {
  return [$reference.offset().top, $reference.outerHeight(), $el.outerHeight()]
}

// Exports

Tooltips = {
  disable: false,
  set: setTooltip,
  get: getTooltip,
  hide: hideTooltip,
  setPosition: setPosition,
}

// Enable/disable for viewports

Template.tooltips.onCreated(function () {
  this.disabled = new ReactiveVar(Tooltips.disable)

  if (Tooltips.disable && _.isString(Tooltips.disable)) {
    const mq = window.matchMedia(Tooltips.disable)
    this.disabled.set(mq.matches)

    mq.addListener((changed) => {
      this.disabled.set(changed.matches)
    })
  }
})

// Template helpers

Template.tooltips.helpers({
  display() {
    const tip = getTooltip()

    if (Template.instance().disabled.get() === true) {
      return 'hide'
    }

    return tip.text ? 'show' : 'hide'
  },

  position() {
    const css = getTooltip().css
    return `position: absolute; top: ${css.top}px; left: ${css.left}px;`
  },

  content() {
    return getTooltip().text
  },

  direction() {
    return getTooltip().direction
  },

  classes() {
    return getTooltip().classes
  },
})

// Init

Template.tooltip.onRendered(function () {
  this.lastNode._uihooks = {
    insertElement(node, next) {
      next.parentNode.insertBefore(node, next)
    },

    moveElement(node, next) {
      Tooltips.hide()
      next.parentNode.insertBefore(node, next)
    },

    removeElement(node) {
      Tooltips.hide()
      node.parentNode.removeChild(node)
    },
  }
})

Meteor.startup(function () {
  $(document).on(
    'mouseover',
    '[data-tooltip]:not([data-tooltip-trigger]), [data-tooltip-element]:not([data-tooltip-trigger]), [data-tooltip-trigger="hover"]',
    showTooltip,
  )

  $(document).on(
    'mouseout',
    '[data-tooltip]:not([data-tooltip-trigger]), [data-tooltip-element]:not([data-tooltip-trigger]), [data-tooltip-trigger="hover"]',
    hideTooltip,
  )

  $(document).on('click', '[data-tooltip-trigger="click"]', toggleTooltip)
  $(document).on('focus', '[data-tooltip-trigger="focus"]', showTooltip)
  $(document).on('blur', '[data-tooltip-trigger="focus"]', hideTooltip)
  $(document).on('tooltips:show', '[data-tooltip-trigger="manual"]', showTooltip)
  $(document).on('tooltips:hide', '[data-tooltip-trigger="manual"]', hideTooltip)
  $(document).on(
    'tooltips:toggle',
    '[data-tooltip-trigger="manual"]',
    toggleTooltip,
  )
})
