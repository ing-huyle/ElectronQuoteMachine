import { Worker } from 'worker_threads'
import { quote } from '../types'

const writeFile = (fileName: string, quotes: quote[], ourAuthor: string): void => {
  const worker: Worker = new Worker('./src/main/worker.js')

  worker.postMessage({
    fileName: fileName,
    quotes: quotes,
    ourAuthor: ourAuthor
  })
}

export default writeFile
