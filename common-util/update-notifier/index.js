const updateNotifier = require('update-notifier');

// Checks for available update and returns an instance
const notifier = updateNotifier({
  pkg: {
      name: 'chalk',
      version: '0.1.1'
  },
  updateCheckInterval: 0
})

// Notify using the built-in convenience method
const notify = notifier.notify();

console.log('notify >', notify)
// `notifier.update` contains some useful info about the update
console.log(notifier.update);