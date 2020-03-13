const config = require('../config')
const telegram = require('../utils/telegram')

const reject = (ctx, e='Not Allowed') => {
  if (ctx.updateType =='callback_query') telegram.answerCbQuery(ctx.update.callback_query.id, e);
  throw new Error(e);
}

module.exports.getMode = (ctx, next)=>{
  // console.log("heeeeey", ctx.chat.id)
  if (ctx.chat.id == config.telegram.group) ctx.mode = 'GROUP'
  else if (ctx.chat.id == config.telegram.adminGroup) ctx.mode = 'ADMIN_GROUP'
  else if (ctx.chat.id > 0) ctx.mode = 'PRIVATE'
  else return reject(ctx, "Invalid mode. Chat id: " + ctx.chat.id);
  return next(ctx);
}

module.exports.getCbQueryAction = (ctx, next)=>{
  if (ctx.updateType != 'callback_query' || !ctx.update.callback_query.data) return reject(ctx)
  ctx.body = {};
  ctx.body = JSON.parse(ctx.update.callback_query.data)
  ctx.body.user = ctx.from.id
  return next(ctx)
}

module.exports.checkCbQueryPermissions = (ctx, next)=>{
  if (config.test) return next(ctx)
  switch(ctx.body.action) {
    case 'RR_VOTE':
      if (ctx.mode != "GROUP") return reject(ctx);
      return next(ctx)
    case 'ADD_AMBASSADOR':
      if (ctx.mode != "ADMIN_GROUP") return reject(ctx);
      return next(ctx)
    default:
      return reject(ctx, 'Unknown operation');
  }
}

module.exports.checkStartPermissions = (ctx, next)=>{
  if (config.test) return next(ctx)
  if (ctx.mode != 'PRIVATE') return reject(ctx)
  return next(ctx);
}
