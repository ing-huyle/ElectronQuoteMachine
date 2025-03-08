import fs from 'fs'
import { quote } from '../types'

const readFile = (file: string): quote[] => {
  const data: string = fs.readFileSync(`./src/jsons/${file}`, 'utf-8')
  const parsedData: quote[] = JSON.parse(data)
  
  return parsedData
}

export default readFile
