const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json())

const path = require('path')
const { open } = require('sqlite')
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

// API 1
app.get('/states/', async (request, response) => {
  const query = `
    SELECT 
      state_id AS stateId,
      state_name AS stateName,
      population 
    FROM state;
  `
  const states = await db.all(query)
  response.send(states)
})

// API 2
app.get('/states/:stateId/', async (request, response) => {
  const { stateId } = request.params
  const query = `
    SELECT 
      state_id AS stateId,
      state_name AS stateName,
      population 
    FROM state 
    WHERE state_id = ?;
  `
  const state = await db.get(query, [stateId])
  response.send(state)
})

// API 3
app.post('/districts/', async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body
  const query = `
    INSERT INTO district 
      (district_name, state_id, cases, cured, active, deaths)
    VALUES (?, ?, ?, ?, ?, ?);
  `
  await db.run(query, [districtName, stateId, cases, cured, active, deaths])
  response.send('District Successfully Added')
})

// API 4
app.get('/districts/:districtId/', async (request, response) => {
  const { districtId } = request.params
  const query = `
    SELECT 
      district_id AS districtId,
      district_name AS districtName,
      state_id AS stateId,
      cases,
      cured,
      active,
      deaths 
    FROM district 
    WHERE district_id = ?;
  `
  const district = await db.get(query, [districtId])
  response.send(district)
})

// API 5
app.delete('/districts/:districtId/', async (request, response) => {
  const { districtId } = request.params
  const query = `DELETE FROM district WHERE district_id = ?;`
  await db.run(query, [districtId])
  response.send('District Removed')
})

// API 6
app.put('/districts/:districtId/', async (request, response) => {
  const { districtId } = request.params
  const { districtName, stateId, cases, cured, active, deaths } = request.body
  const query = `
    UPDATE district
    SET 
      district_name = ?,
      state_id = ?,
      cases = ?,
      cured = ?,
      active = ?,
      deaths = ?
    WHERE district_id = ?;
  `
  await db.run([
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
    districtId,
  ])
  response.send('District Details Updated')
})

// API 7
app.get('/states/:stateId/stats/', async (request, response) => {
  const { stateId } = request.params
  const query = `
    SELECT 
      SUM(cases) AS totalCases,
      SUM(cured) AS totalCured,
      SUM(active) AS totalActive,
      SUM(deaths) AS totalDeaths 
    FROM district 
    WHERE state_id = ?;
  `
  const stats = await db.get(query, [stateId])
  response.send(stats)
})

// API 8
app.get('/districts/:districtId/details/', async (request, response) => {
  const { districtId } = request.params
  const query = `
    SELECT state.state_name AS stateName
    FROM district 
    JOIN state 
      ON district.state_id = state.state_id
    WHERE district_id = ?;
  `
  const result = await db.get(query, [districtId])
  response.send(result)
})

init()
module.exports = app
