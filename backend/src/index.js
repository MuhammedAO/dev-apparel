const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
require('dotenv').config({ path: 'variables.env' })
const createServer = require('./creatServer')
const db = require('./db')

const server = createServer();

//use express middleware to handle cookies(JWT)
//every single time that someone requests a page, the cookie is going to send along..
//something called a jsonWebToken for current user validation
server.express.use(cookieParser())

//decode the jwt to get the userId on each request
//this means that if we ever need to figure out who the current user is,
//we can query the Db having already known the userId
server.express.use((req, res, next) => {
  const { token } = req.cookies

  if (token) {
    //userId is the payload gotten from the token
    const { userId } = jwt.verify(token, process.env.APP_SECRET)

    //add the userId to the request for further request accessibility
    req.userId = userId
  }
  next()
})

server.start({
  cors: {
    credentials: true,
    origin: process.env.FRONTEND_URL
  }
}, deets => {
  console.log(`Server is now running on http://localhost:${deets.port}`)

})
