import { quote, quotesPerAuthorCounter } from '../types'

const countQuotesPerAuthor = (
  quotesPerAuthorCounter: quotesPerAuthorCounter,
  unfilteredQuotes: quote[],
  unfilteredQuotesLength: number
): quotesPerAuthorCounter => {
  if (unfilteredQuotesLength === 0) {
    return quotesPerAuthorCounter
  }
  
  const unfilteredQuotesLengthOutput: number = unfilteredQuotesLength - 1
  const quotesPerAuthorCounterOutput: quotesPerAuthorCounter = quotesPerAuthorCounter
  const unfilteredQuotesOutput: quote[] = unfilteredQuotes
  const quote: quote = unfilteredQuotesOutput[unfilteredQuotesLengthOutput]

  quotesPerAuthorCounterOutput[quote.a] = quotesPerAuthorCounterOutput[quote.a]
    ? quotesPerAuthorCounterOutput[quote.a] + 1
    : 1

  return countQuotesPerAuthor(quotesPerAuthorCounterOutput, unfilteredQuotesOutput, unfilteredQuotesLengthOutput)
}

const fillQuotesArray = async (
  arrayOfAllQuotes: quote[],
  howManyTimes: number,
  author: string,
  quotesPerAuthorCounter: quotesPerAuthorCounter
): Promise<quote[]> => {
  if (howManyTimes === 0) {
    return arrayOfAllQuotes
  }

  const response: Response = await fetch('https://zenquotes.io/api/quotes')
  const unfilteredQuotes: quote[] = await response.json()
  const howManyTimesOutput: number = howManyTimes - 1
  const arrayOfAllQuotesOutput = [...arrayOfAllQuotes, ...unfilteredQuotes]

  if (author === 'maximumQuotes') {
    countQuotesPerAuthor(quotesPerAuthorCounter, unfilteredQuotes, howManyTimesOutput)
  }

  return fillQuotesArray(arrayOfAllQuotesOutput, howManyTimesOutput, author, quotesPerAuthorCounter)
}

const removeUnknownAuthors = (
  quotesPerAuthorCounter: quotesPerAuthorCounter
): quotesPerAuthorCounter => {
  const resultQuotesPerAuthorCounter = quotesPerAuthorCounter
  delete resultQuotesPerAuthorCounter.Unknown
  return resultQuotesPerAuthorCounter
}

const getKeyByValue = (object: quotesPerAuthorCounter, value: number): string => {
  const result: string | undefined = Object.keys(object).find((key) => object[key] === value)
  return result ? result : ''
}

const getMostFrequentAuthor = (quotesPerAuthorCounter: quotesPerAuthorCounter): string => {
  const values: number[] = Object.values(quotesPerAuthorCounter)
  return getKeyByValue(quotesPerAuthorCounter, Math.max(...values))
}

const getSingleAuthorQuotes = (arrayQuotes: quote[], singleAuthor: string): quote[] => {
  return arrayQuotes.filter((quote: quote) => quote.a === singleAuthor)
}

/* Two parameters:
 *   1. author - if mentioned, get all quotes from that author,
 *               otherwise get quotes from most frequent author
 *   2. howManyTimes - number of fetches per one function call
 */
const fetchQuotes = async (
  author: string = 'maximumQuotes',
  howManyTimes: number = 1
): Promise<quote[]> => {
  try {
    const quotesPerAuthorCounter: quotesPerAuthorCounter = {}
    const arrayOfAllQuotes = await fillQuotesArray([], howManyTimes, author, quotesPerAuthorCounter)

    removeUnknownAuthors(quotesPerAuthorCounter)
    const ourAuthor: string = author === 'maximumQuotes'
      ? getMostFrequentAuthor(quotesPerAuthorCounter)
      : author
    
    return getSingleAuthorQuotes(arrayOfAllQuotes, ourAuthor)
  } catch {
    console.log('Fetch: Couldn\'t fetch anything... using backup files!')
    return []
  }
}

export default fetchQuotes
