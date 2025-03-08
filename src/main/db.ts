import pg from 'pg'

const { Client } = pg
export const client: any = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'p0stgr3SQL',
  port: 5432,
})

export const connectToDB = async (): Promise<void> => {
  await client.connect()
}

export const disconnectFromDB = async (): Promise<void> => {
  await client.end()
}

export const logRunToDB = async (): Promise<void> => {
  try {
    await client.query(`
      INSERT INTO runs (date_and_time)
      VALUES ('${new Date}')`
    )  
  } catch (error) {
    console.log('DB: ', error)
  }
}

export const logQuoteToDB = async (quote: string, author: string): Promise<void> => {
  const parse = (text: string): string => text.replace(/'/g, '\'\'')
  
  try {
    await client.query(`
      INSERT INTO quotes (quote_text, author)
      VALUES ('${parse(quote)}', '${parse(author)}')`
    )
  } catch (error: any) {
    console.log(error.constraint === 'quotes_unique'
      ? 'DB: Quote already exists in the database, hence will not be logged again.'
      : 'DB: ' + error
    )
  }
}
