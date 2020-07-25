const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { randomBytes } = require('crypto')
const { promisify } = require('util')
const {transport, makeANiceEmail} = require('../mail')
const  { hasPermission } = require ('../utils')
const stripe = require('../stripe')

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
    const updates = { ...args }
    // remove the ID from the updates
    delete updates.id
    // run the update method
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id,
        },
      },
      info
    )
  },

  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id }
    //1.find the item
    const item = await ctx.db.query.item({ where }, `{id title user {id}}`)
    //2.check if they own the item/have permission to delete
    const ownsItem = item.user.id === ctx.request.userId
    const hasPermissions = ctx.request.user.permissions.some(permission => ['ADMIN', 'ITEMDELETE'].includes(permission))

    if(!ownsItem && !hasPermissions) {
      throw new Error('You don\'t have permission to do that')
    } 
    
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
    const resetTokenExpiry = Date.now() + 3600000 //1 hour from now
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
  },
  async addToCart(parent, args, ctx, info) {
    // 1. Make sure they are signed in
    const { userId } = ctx.request
    if (!userId) {
      throw new Error('You must be signed in soooon')
    }
    // 2. Query the users current cart
    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id },
      },
    })
    // 3. Check if that item is already in their cart and increment by 1 if it is
    if (existingCartItem) {
      console.log('This item is already in their cart')
      return ctx.db.mutation.updateCartItem(
        {
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 },
        },
        info
      )
    }
    // 4. If its not, create a fresh CartItem for that user!
    return ctx.db.mutation.createCartItem(
      {
        data: {
          user: {
            connect: { id: userId },
          },
          item: {
            connect: { id: args.id },
          },
        },
      },
      info
    )
  },
  async removeFromCart(parent, args, ctx, info) {
    // 1. Find the cart item
    const cartItem = await ctx.db.query.cartItem(
      {
        where: {
          id: args.id,
        },
      },
      `{ id, user { id }}`
    )
    // 1.5 Make sure we found an item
    if (!cartItem) throw new Error('No CartItem Found!')
    // 2. Make sure they own that cart item
    if (cartItem.user.id !== ctx.request.userId) {
      throw new Error('Cheatin huhhhh? Cant\'t delete whats not yours')
    }
    // 3. Delete that cart item
    return ctx.db.mutation.deleteCartItem(
      {
        where: { id: args.id },
      },
      info
    )
  },
  async createOrder(parent, args, ctx, info) {
    // 1. Query the current user and make sure they are signed in
    const { userId } = ctx.request
    if (!userId) throw new Error('You must be signed in to complete this order.')
    const user = await ctx.db.query.user(
      { where: { id: userId } },
      `{
      id
      name
      email
      cart {
        id
        quantity
        item { title price id description image largeImage }
      }}`
    )
    // 2. recalculate the total for the price
    const amount = user.cart.reduce(
      (tally, cartItem) => tally + cartItem.item.price * cartItem.quantity,
      0
    )
    console.log(`Going to charge for a total of ${amount}`)
    // 3. Create the stripe charge (turn token into $$$)
    const charge = await stripe.charges.create({
      amount,
      currency: 'USD',
      source: args.token,
    })
     // 4. Convert the CartItems to OrderItems
     const orderItems = user.cart.map(cartItem => {
      const orderItem = {
        ...cartItem.item,
        quantity: cartItem.quantity,
        user: { connect: { id: userId } },
      }
      delete orderItem.id
      return orderItem
    })

    // 5. create the Order
    const order = await ctx.db.mutation.createOrder({
      data: {
        total: charge.amount,
        charge: charge.id,
        items: { create: orderItems },
        user: { connect: { id: userId } },
      },
    })
    // 6. Clean up - clear the users cart, delete cartItems
    const cartItemIds = user.cart.map(cartItem => cartItem.id)
    await ctx.db.mutation.deleteManyCartItems({
      where: {
        id_in: cartItemIds,
      },
    })
    // 7. Return the Order to the client
    return order
  },
}

//the info param allows the query e.g updateItem to know exactly what to return to the client e.g Item!..
//it will contain the query from the client side to return 'that' 'Item'.
module.exports = Mutations
