const mutations = {
  createItem: async (parent, args, context, info) => {
    const item = await context.db.mutation().createItem({
      data: {
        ...args
      }
    }, info)
    return item
  }
};

module.exports = mutations;
