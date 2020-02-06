const crypto = require('crypto');
/**
 * 在数据库中创建自己用户体系，需要用到微信的openid做唯一
 * @param openid
 */
exports.create = async function(swc, options){
    var userid = crypto.createHash('sha1').update(swc.config.server.public_salt + options.openid).digest('hex');
    var now = +new Date();
    /**
     * 需要先把用户模型写出来，然后同步到数据库里
     */
    var user = {
        user_id: userid,
        session: options.session,
        nick_name: '',
        avatar_url: '',
        openid: '',

        create_by: 'wechat',
        update_by: 'wechat',
        create_at: now,
        update_at: now,
    }

    await swc.dao.models.users.create(user);
    return user;
}