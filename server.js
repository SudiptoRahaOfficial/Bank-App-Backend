/**
	- file name: server.js
	- responsibility: responsible for application's server
 */

// importing dependencis
const app = require('./src/app')
const config = require('./src/config/env.config')
const connectDB = require('./src/db/connectDB')

const port = config.PORT || 5000 // defining port

// connecting server with database
connectDB()

// starting server or listening for server
app.listen(port, () => {
	console.log(`Server is running on port ${port}`)
})