import { ElectronAPI } from '@electron-toolkit/preload'
import { handleResult } from '../main/types'

declare global {
  interface Window {
    electron: ElectronAPI
    hostname: string
    api: {
      getAuthor: () => Promise<string>
      getNextQuote: (window: string, index: number) => Promise<handleResult>
    }
  }
}
