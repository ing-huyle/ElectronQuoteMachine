export interface initialWindowSettings {
  width: number,
  height: number,
  show: boolean,
  frame: boolean,
  transparent: boolean,
  autoHideMenuBar: boolean,
  icon?: string | undefined
  webPreferences: {
    preload: string
    sandbox: boolean
  }
}

export interface handleResult {
  quote: string
  index: number
}

export interface quote {
  q: string
  a: string
  c: string
  h: string
}

export interface electronReadyChain {
  allQuotesFromRandomSingleAuthor: quote[]
  quoteCount: number
  ourAuthor: string
}

export interface quotesPerAuthorCounter {
  [author: string]: number
}

export interface fileType { 
  file: string
  mtimeMs: number
}
