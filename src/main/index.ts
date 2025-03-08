import icon from '../../resources/icon.png?asset'
import { app, screen, BrowserWindow, ipcMain } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { join } from 'path'
import fs from 'fs'
import getAllQuotesFromRandomSingleAuthor from './functions/getAllQuotesFromRandomSingleAuthor'
import readFile from './functions/readFile'
import fetchQuotesInterval from './functions/fetchQuotesInterval'
import { connectToDB, disconnectFromDB, logQuoteToDB, logRunToDB } from './db'
import { initialWindowSettings, electronReadyChain, handleResult, quote as quoteType } from './types'

const createLeftWindow = (initialWindowSettings: initialWindowSettings): void => {  
  const leftWindow: BrowserWindow = new BrowserWindow(initialWindowSettings)

  leftWindow.on('ready-to-show', () => {
    leftWindow.setPosition(0, 0)
    leftWindow.show()
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    leftWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/left')
  } else {
    leftWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  connectToDB()
  
  logRunToDB()
}

const createRightWindow = (initialWindowSettings: initialWindowSettings, width: number): void => {  
  const rightWindow: BrowserWindow = new BrowserWindow(initialWindowSettings)

  rightWindow.on('ready-to-show', () => {
    rightWindow.setPosition(width / 2, 0)
    rightWindow.show()
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    rightWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/right')
  } else {
    rightWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}


app.whenReady()
  .then(async (): Promise<electronReadyChain> => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.electron')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    app.on('browser-window-created', (_, window): void => {
      optimizer.watchWindowShortcuts(window)
    })

    // Initial fetches and settings, getting quotes from random single author with max quotes
    const allQuotesFromRandomSingleAuthor: quoteType[] = await getAllQuotesFromRandomSingleAuthor()
    const quoteCount: number = allQuotesFromRandomSingleAuthor.length
    const ourAuthor: string = allQuotesFromRandomSingleAuthor[0].a

    return { 
      allQuotesFromRandomSingleAuthor: allQuotesFromRandomSingleAuthor,
      quoteCount: quoteCount,
      ourAuthor: ourAuthor
    }
  })
  .then(({ allQuotesFromRandomSingleAuthor, quoteCount, ourAuthor }: electronReadyChain): void => {
    const primaryDisplay: Electron.Display = screen.getPrimaryDisplay()
    const { width, height }: { width: number, height: number } = primaryDisplay.workAreaSize
    const windowWidth: number = width / 2
    const windowHeight: number = height
    const initialWindowSettings: initialWindowSettings = {
      width: windowWidth,
      height: windowHeight,
      show: false,
      frame: false,
      transparent: true,
      autoHideMenuBar: true,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
      }
    }

    // Fetch multiple times until having quoteCountMax quotes from ourAuthor in total
    // Then writeFile to the "older" file (older regarding last time modified)
    fetchQuotesInterval(5, quoteCount, ourAuthor, allQuotesFromRandomSingleAuthor, 30000)

    app.on('activate', (): void => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createLeftWindow(initialWindowSettings)
        createRightWindow(initialWindowSettings, width)
      }
    })

    createLeftWindow(initialWindowSettings)
    createRightWindow(initialWindowSettings, width)

    ipcMain.handle('get-author', (): string => {
      return ourAuthor
    })

    // Get next quote, preferably from ourAuthor file if written
    // Otherwise get next quote from the current array of quotes
    ipcMain.handle('get-next-quote', (_event, window: string, index: number): handleResult => {
      const allQuotesFromOurAuthor: quoteType[] = fs.existsSync(`./src/jsons/${ourAuthor}.json`)
        ? readFile(`${ourAuthor}.json`)
        : allQuotesFromRandomSingleAuthor
  
      if (window === 'left') {
        // Index reset due to quotes amount finity
        const quoteIndexLeftWindow = index === allQuotesFromOurAuthor.length - 1
          ? 0
          : index + 1
        
          if (quoteIndexLeftWindow >= 0) {
            const quote = allQuotesFromOurAuthor[quoteIndexLeftWindow].q
            logQuoteToDB(quote, ourAuthor)

            return { quote: quote, index: quoteIndexLeftWindow }
          }
      }

      if (window === 'right') {
        const quoteIndexRightWindow = index === allQuotesFromOurAuthor.length - 1
          ? 0
          : index + 1
        
        if (quoteIndexRightWindow >= 0) {
          const quote = allQuotesFromOurAuthor[quoteIndexRightWindow].q

          return { quote: quote, index: quoteIndexRightWindow }
        }
      }

      return { quote: 'Loading...', index: index + 1 }
    })
  })

app.on('will-quit', () => {
  disconnectFromDB()
})

app.on('window-all-closed', (): void => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
