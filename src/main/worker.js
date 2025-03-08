const { parentPort } = require('worker_threads')
const fs = require('fs')

parentPort.on('message', (data) => {
  const { fileName, quotes, ourAuthor } = data

  fs.writeFileSync(`./src/jsons/${fileName}.json`, JSON.stringify(quotes))

  if (fileName !== ourAuthor) {
    fs.renameSync(`./src/jsons/${fileName}.json`, `./src/jsons/${ourAuthor}.json`)
  }
})
