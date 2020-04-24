const EventEmitter = require('events')
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter()

myEmitter.on('event', function(data) {
  console.log(data.num) // 1
  data.num++
})

myEmitter.on('event', data => {
  console.log(data.num) // 2
})

myEmitter.emit('event', {
  num: 1
})


