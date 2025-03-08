import { app, dialog } from 'electron'
import fs from 'fs'
import readFile from './readFile'
import fetchQuotes from './fetchQuote'
import getEarlierLastModifiedFile from './getEarlierLastModifiedFile'
import { disconnectFromDB } from '../db'
import { quote } from '../types'

// Initial fetches, getting quotes from random single author with max quotes
const getAllQuotesFromRandomSingleAuthor = async (): Promise<quote[]> => {
  const quotesFromSingleAuthor: quote[] = await fetchQuotes('maximumQuotes', 6)

  // If fetches not successful, get quotes from a file if exists, otherwise show error
  if (quotesFromSingleAuthor.length > 0 && quotesFromSingleAuthor[0].a !== 'zenquotes.io') {
    return quotesFromSingleAuthor
  } else {
    const files: string[] = fs.readdirSync('./src/jsons', 'utf-8')

    if (files.length === 0) {
      dialog.showErrorBox('No internet or backup files', 'Give it a while and try later once more!')
      disconnectFromDB()
      app.quit()
      return []
    } else {
      const file: string = files.length >= 2 ? getEarlierLastModifiedFile(files) : files[0]
      const quotesFromSingleAuthor: quote[] = readFile(`${file}`)

      return quotesFromSingleAuthor.length > 0 ? quotesFromSingleAuthor : []
    }   
  }
}

export default getAllQuotesFromRandomSingleAuthor
