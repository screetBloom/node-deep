class Plugin {
  constructor(romeApi, options = {}) {
    this.api = romeApi
    this.options = options
  }
  install(){  
    console.log(JSON.stringify(this.options) )
  }

}

module.exports = Plugin
