const nodemailer = require('nodemailer')


//a transport is basically the method u use in sending mails, there are various transports but i'll be using an Smtp

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
})

//template for ur email
const makeANiceEmail = text => `
 <div className="email" 
 style="
 border: 1px solid black;
 padding: 20px;
 font-family: sans-serif;
 line-height : 2;
 font-size : 20px;
 "
 >
 <h2>Hello There!</h2>
 <p>${text}</p>

 <p>with love from muhammed</p>
 </div>
`

exports.transport = transport
exports.makeANiceEmail = makeANiceEmail