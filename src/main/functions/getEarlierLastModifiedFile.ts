import fs from 'fs'
import { fileType } from '../types'

const fillFilesArray = (files: string[], filesArray: fileType[], filesLength: number): fileType[] => {
  if (filesLength === 0) {
    return filesArray
  }
  
  const filesLengthOutput: number = filesLength - 1
  const file: string = files[filesLengthOutput]
  const filesArrayOutput: fileType[] = [...filesArray, {
    file: file,
    mtimeMs: fs.statSync(`./src/jsons/${file}`).mtimeMs
  }]

  return fillFilesArray(files, filesArrayOutput, filesLengthOutput)
}

// Returns "older" file from the jsons folder
const getEarlierLastModifiedFile = (files: string[]): string => {
  const filesArray: fileType[] = fillFilesArray(files, [], files.length)

  return filesArray[filesArray[0].mtimeMs < filesArray[1].mtimeMs ? 0 : 1].file
}

export default getEarlierLastModifiedFile
