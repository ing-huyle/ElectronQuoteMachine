import '../assets/window.scss'
import { useState, useEffect, useRef } from 'react'

const Window = (props: Props): JSX.Element => {
  const [author, setAuthor] = useState<string>('Author incoming...')
  const [quote, setQuote] = useState<string>('Loading...')
  const indexRef = useRef<number>(-1)
  const quoteDivRef = useRef<HTMLDivElement>(null)

  const getAuthor = async (): Promise<void> => {
    const response: string = await window.api.getAuthor()
    setAuthor(response)
  }

  const getNextQuote = async (): Promise<void> => {
    const response: handleResult = await window.api.getNextQuote(`${props.position}`, indexRef.current)
    setQuote(response.quote)
    indexRef.current = response.index
  }

  useEffect(() => {
    const quoteDiv: HTMLDivElement | null = quoteDivRef.current

    getAuthor()
    getNextQuote()

    if (quoteDiv) {
      quoteDiv.addEventListener('animationend', getNextQuote)
      quoteDiv.addEventListener('animationiteration', getNextQuote)
    }

    return () => {
      if (quoteDiv) {
        quoteDiv.removeEventListener('animationend', getNextQuote)
        quoteDiv.removeEventListener('animationiteration', getNextQuote)
      }      
    }
  }, [])

  return (
    <div className='container'>
      <h1>{window.hostname}</h1>
      <div id={`${props.position}WindowQuoteContainer`} ref={quoteDivRef}>
        <p className='quote'>{`"${quote}"`}</p>
        <p>{`- ${author}`}</p>
      </div>
    </div>
  )
}

export default Window
