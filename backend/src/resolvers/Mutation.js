const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { randomBytes } = require('crypto')
const { promisify } = require('util')
const {transport, makeANiceEmail} = require('../mail')
const  { hasPermission } = require ('../utils')

//Crypto is a module in Node.js which deals with an algorithm that performs data encryption and decryption
// randomBytes is used to generate a cryptographically well-built artificial random data and the number of bytes to be generated in the written code.
//promisify => runs randomBytes asynchronously(promise based).

const Mutations = {
  async createItem(parent, args, ctx, info) {
    //check if they are logged in
    if(!ctx.request.userId) {
      throw new Error('You must be logged in to create an item')
    }
    const item = await ctx.db.mutation.createItem(
      {
      data: {
        //This is how we create a relationship between the item and the user.
        user: {
          connect:{
          id: ctx.request.userId
          }
        },
        ...args,
      }
    }, info)

    return item
  },

  updateItem(parent, args, ctx, info) {
    // first take a copy of the updates
    const updates = { ...args };
    // remove the ID from the updates
    delete updates.id;
    // run the update method
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id,
        },
      },
      info
    );
  },

  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id }
    //1.find the item
    const item = await ctx.db.query.item({ where }, `{id title}`)
    //2.check if they own the item/have permission to delete
    //3/Delete item
    return ctx.db.mutation.deleteItem({ where }, info)
  },

  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase()

    //hash password
    const password = await bcrypt.hash(args.password, 10)

    //create the user in the database
    const user = await ctx.db.mutation.createUser({
      data: {
        ...args,
        password,
        permissions: { set: ['USER'] }
      }
    }, info)

    //generate JWT token for use
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)

    //set Jwt as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 //1 year cookie
    })

    //return user
    return user
  },

  async signin(parent, { email, password }, ctx, info) {
    //check if there is a user with that email
    const user = await ctx.db.query.user({ where: { email } })
    if (!user) {
      throw new Error(`No user found for ${email}`)
    }
    //check if the user's password is correct
    const valid = await bcrypt.compare(password, user.password)

    if (!valid) {
      throw new Error('Invalid password!')
    }
    //generate jwt for the user
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)
    //set the cookie with the token
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 //1 year cookie
    })
    //return user 
    return user
  },

  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token')
    return { message: 'Goodbye!' }
  },

  async requestReset(parent, { email }, ctx, info) {
    //check if this is a real user
    const user = await ctx.db.query.user({ where: { email } })

    if (!user) {
      throw new Error(`No user found for ${email}`)
    }
    //set a reset token and expiry on that user
    //randomBytes = random && unique token
    const randomBytesPromisified = promisify(randomBytes)
    const resetToken = (await randomBytesPromisified(20)).toString('hex')
    const resetTokenExpiry = Date.now() + 3600000; //1 hour from now
    //save to the user
    const res = await ctx.db.mutation.updateUser({
      where: { email },
      data: { resetToken, resetTokenExpiry }
    })
    //email reset token to the user
    const mailRes = await transport.sendMail({
    from: 'mspeaks910@gmail.com',
    to: user.email,
    subject: 'Your password reset token',
    html: makeANiceEmail(`Your Password reset token is here! 
    \n\n 
    <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click here to reset your password</a>`)
    })
    //Return the message
    return { message: 'Reset!!!!' }
  },

  async resetPassword(parent, {password, confirmPassword, resetToken}, ctx, info) {
  //check if the passwords match
  if(password !== confirmPassword){
    throw new Error('Password does not match!')
  }
  //check if its a legit token
  //check if its expired
  const [user] = await ctx.db.query.users({
    where: {
      resetToken,
      resetTokenExpiry_gte: Date.now() - 3600000
    }
  })
  if(!user) {
    throw new Error('This token is either invalid or expired!')
  }
  //hash their new password
  const newHashedPassword = await bcrypt.hash(password, 10)
  //save the new password to the user and clear out old resettoken fields
  const updatedUser = await ctx.db.mutation.updateUser({
    where: {email: user.email},
    data: {
      password: newHashedPassword,
      resetToken: null,
      resetTokenExpiry: null
    }
  })
  //generate JWT
  const token = jwt.sign({userId: updatedUser.id}, process.env.APP_SECRET)
  //set Jwt cookie
   //set the cookie with the token
   ctx.response.cookie('token', token, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 365 //1 year cookie
  })
  //return new user
  return updatedUser
  },

  async updatePermissions(parent, args, ctx, info){
   //check if they are logged in
   if(!ctx.request.userId){
     throw new Error('You need to be logged in')
   }

   //Query the current user
   const currentUser = await ctx.db.query.user({
     where: {
       id: ctx.request.userId
     }
   }, info)
   //check if they have the permission to do this
   hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE'])
   //update the permissions
   //updateUser is from prisma
   return ctx.db.mutation.updateUser({
     data: {
       permissions: {
         set: args.permissions
       }
     },
     where: {
       id: args.userId
     }
   }, info)
  }
};

//the info param allows the query e.g updateItem to know exactly what to return to the client e.g Item!..
//it will contain the query from the client side to return 'that' 'Item'.
module.exports = Mutations;
