const Bugsnag = require('@bugsnag/js')

Bugsnag.start({ apiKey: 'fb100b26bfb91f3ad7981c4f13cf52e6' })

exports.bugsnagWrapper = (handler) => {
  return (data, context) => {
    try {
      return handler(data, context)
    } catch (e) {
      Bugsnag.notify(e)
      throw e
    }
  }
}
