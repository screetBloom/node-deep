const ora = require('ora');

const spinner = ora('Loading unicorns').start();

setTimeout(() => {
	spinner.color = 'yellow';
  spinner.text = 'Loading rainbows';
  setTimeout(() => {
    spinner.stop()
  }, 1000)
}, 1000);