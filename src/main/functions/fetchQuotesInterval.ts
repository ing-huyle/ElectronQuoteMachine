import fs from 'fs'
import getEarlierLastModifiedFile from './getEarlierLastModifiedFile'
import writeFile from './writeFile'
import fetchQuotes from './fetchQuote'
import { quote } from '../types'

const fetchQuotesInterval = (
  quoteCountMax: number,
  quoteCount: number,
  ourAuthor: string,
  allQuotesFromRandomSingleAuthor: quote[],
  intervalDuration: number
): void => {
  const fetchQuotesInterval: NodeJS.Timeout = setInterval(async (): Promise<void> => {

    // Having N quotes collected write them to the file
    // Otherwise continue fetching quotes
    if (quoteCount >= quoteCountMax) {
      const files: string[] = fs.readdirSync('./src/jsons', 'utf-8')
      const fileName: string = files.length < 2 ? ourAuthor : getEarlierLastModifiedFile(files).slice(0, -5)

      writeFile(fileName, allQuotesFromRandomSingleAuthor, ourAuthor)

      clearInterval(fetchQuotesInterval)
    } else {
      const stockQuotes: quote[] = await fetchQuotes(ourAuthor, 5)

      if (stockQuotes && allQuotesFromRandomSingleAuthor) {
        allQuotesFromRandomSingleAuthor.push(...stockQuotes)
        quoteCount += stockQuotes.length
      }
    }
  }, intervalDuration)
}

// const fetchQuotesInterval = (
//   quoteCountMax: number,
//   quoteCount: number,
//   ourAuthor: string,
//   allQuotesFromRandomSingleAuthor: quote[],
//   intervalDuration: number
// ): void => {
//   const execute = async (): Promise<void> => {

//     // Having N quotes collected write them to the file
//     // Otherwise continue fetching quotes
//     const stockQuotes: quote[] = await fetchQuotes(ourAuthor, 5)

//     if (stockQuotes && allQuotesFromRandomSingleAuthor) {
//       allQuotesFromRandomSingleAuthor.push(...stockQuotes)
//       quoteCount += stockQuotes.length

//       console.log('stockQuotes: ', stockQuotes)
//       console.log('quoteCount: ', quoteCount)
//     }
//   }

//   const fetchQuotesTimeout: NodeJS.Timeout = setTimeout(() => {
//     if (quoteCount >= quoteCountMax) {
//       const files: string[] = fs.readdirSync('./src/jsons', 'utf-8')
//       const fileName: string = files.length < 2 ? ourAuthor : getEarlierLastModifiedFile(files).slice(0, -5)

//       writeFile(fileName, allQuotesFromRandomSingleAuthor, ourAuthor)

//       clearTimeout(fetchQuotesTimeout)
//     }
    
//     execute()
//   }, intervalDuration)

//   setTimeout(execute, intervalDuration)
// }

export default fetchQuotesInterval
