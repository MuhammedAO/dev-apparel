const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const Mutations = {
  async createItem(parent, args, context, info) {
    const item = await context.db.mutation.createItem({
      data: {
        ...args
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
  }
};

//the info param allows the query e.g updateItem to know exactly what to return to the client e.g Item!..
//it will contain the query from the client side to return 'that' 'Item'.
module.exports = Mutations;
