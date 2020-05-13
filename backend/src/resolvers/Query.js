const { forwardTo } = require('prisma-binding')

const Query = {
  items: forwardTo('db'),
  item: forwardTo('db'),
  itemsConnection: forwardTo('db'),
  me(parent, args, ctx, info) {
    //check if there is a current userId
    //the userId(decoded) is being passed unto the ctx via a request from middleware
    if (!ctx.request.userId) {
      return null
    }
    return ctx.db.query.user({
      where: { id: ctx.request.userId }
    }, info)
  }
  
};

module.exports = Query;
