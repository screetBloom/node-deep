const csv = require('csvtojson')
const fs = require('fs')

function parseCsvObj(arr = []) {
  return arr.map(obj => {
    let res = {}
    const keysStr = Object.keys(obj)[0] && Object.keys(obj)[0].replace(/"/g, '')
    const keys = keysStr.split(';')
    const valuesStr = Object.values(obj)[0] && Object.values(obj)[0].replace(/"/g, '')
    const values = valuesStr.split(';')
    keys.forEach((key, i) => {
      res[key] = values[i]
    })
    return res
  })
}

/**
 * @param {string} csvFilePath : csv文件路径
 */
function csv2json(csvFilePath) {
  csv()
    .fromFile(csvFilePath)
    .then(defaultJsonObj => {
      const parseObj = parseCsvObj(defaultJsonObj)
      var jsonContent = JSON.stringify(parseObj, null, 2)
      console.log('\n')
      console.log(jsonContent)
      fs.writeFile('output-json.json', jsonContent, 'utf8', function (err) {
        if (err) {
          console.log('\n 保存json文件出错.')
          return console.log(err)
        }
        console.log('\n JSON文件已经被保存为output.json.')
      })
    })
}

exports.csv2json = csv2json

/**
 * @param {*} jsonArr: json数组
 */
function json2csv(jsonArr = []) {
  let str = ''
  jsonArr.forEach((json, i) => {
    const keys = Object.keys(json).map(k => `"${k}"`)
    const values = Object.values(json).map(k => `"${k}"`)
    if (i === 0) {
      str += `\n ${keys.join(';')}`
    }
    str += `\n ${values.join(';')}`
  })
  fs.writeFile('output-csv.csv', str, 'utf8', function (err) {
    if (err) {
      console.log('\n 保存csv文件出错.')
      return console.log(err)
    }
    console.log('\n json已经转换为output-csv.csv.')
  })
}

exports.json2csv = json2csv
