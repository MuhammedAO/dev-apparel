const { forwardTo } = require('prisma-binding')
const {hasPermission} = require('../utils')

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
  },
 async users(parent, args, ctx, info) {
   //1 check if the user is logged in
     if(!ctx.request.userId){
       throw new Error('You must be logged in!')
     }
  //2 check if the user has the permission to query all the users
  hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE'])
  //3 if they do, query all the user
  //the info will include the gql query that contains the fields....
  //that we are requesting from the client
  return ctx.db.query.users({}, info)
  }
  
};

module.exports = Query;
