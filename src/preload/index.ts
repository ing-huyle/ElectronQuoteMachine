import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import os from 'os'

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('hostname', os.hostname())
    contextBridge.exposeInMainWorld('api', {
      getAuthor: () => ipcRenderer.invoke('get-author'),
      getNextQuote: (window: string, index: number) =>
        ipcRenderer.invoke('get-next-quote', window, index)
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.hostname = os.hostname()
  // @ts-ignore (define in dts)
  window.api = {
    getAuthor: () => ipcRenderer.invoke('get-author'),
    getNextQuote: (window: string, index: number) =>
      ipcRenderer.invoke('get-next-quote', window, index)
  }
}
