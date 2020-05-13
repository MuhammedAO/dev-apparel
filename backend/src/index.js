const cookieParser = require('cookie-parser')
require('dotenv').config({ path: 'variables.env' })
const createServer = require('./creatServer')
const db = require('./db')

const server = createServer();

//use express middleware to handle cookies(JWT)
//every single time that someone requests a page, the cookie is going to send along..
//something called a jsonWebToken for current user validation
server.express.use(cookieParser())

server.start({
  cors: {
    credentials: true,
    origin: process.env.FRONTEND_URL
  }
}, deets => {
  console.log(`Server is now running on http://localhost:${deets.port}`)

})
