const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json())

const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

let db = null
const dbPath = path.join(__dirname, 'db', 'covid19India.db')

const init = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    const port = process.env.PORT || 3000
    app.listen(port, () => {
      console.log(`Server started at port ${port} .....`)
    })
  } catch (e) {
    console.log(`DB Error:${e.message}`)
    process.exit(1)
  }
}

// Your 8 APIs stay exactly as written (no need to change anything else)

init()
module.exports = app
 
