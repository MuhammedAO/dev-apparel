const Mutations = {
  async createItem(parent, args, context, info) {
    const item = await context.db.mutation.createItem({
      data: {
        ...args
      }
    }, info)
    return item
  } ,
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
  async deleteItem (parent, args, ctx, info) {
  const where = { id : args.id}
  //1.find the item
  const item = await ctx.db.query.item({where}, `{id title}` )
  //2.check if they own the item/have permission to delete
  //3/Delete item
  return ctx.db.mutation.deleteItem({where}, info)
  }
};

//the info param allows the query e.g updateItem to know exactly what to return e.g Item!..
//it will contain the query from the client side to return 'that' 'Item'.
module.exports = Mutations;
