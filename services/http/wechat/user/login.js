const crypto = require("crypto");
const request = require('request');

function getAccessToken(swc, options) {
    return new Promise(resolve => {
        var option = {
            url: `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${swc.config.wechat.appid}&secret=${swc.config.wechat.secret}`,
        }

		/**
		* 检查accessToken是否过期
		*/
        var now = +new Date();
        if (now < global.swc.wechat.access_token.expire) {
            resolve(global.swc.wechat.access_token.value);
            return;
        }

        request(option, function (err, res, body) {
            if (err || res.statusCode != 200) {
                resolve(undefined);
                return;
            }

            body = JSON.parse(body);
            if (body.errcode != undefined) {
                resolve(undefined);
                return;
            }
            now = +new Date();
            global.swc.wechat.access_token.value = body.access_token;
            global.swc.wechat.access_token.expire = now + ((parseInt(body.expires_in) - 200) * 1000);
            resolve(global.swc.wechat.access_token.value);
        })
    })
}

function getJscode2Session(swc, options) {
    return new Promise(resolve => {
        var option = {
            url: `https://api.weixin.qq.com/sns/jscode2session?appid=${swc.config.wechat.appid}&secret=${swc.config.wechat.secret}&js_code=${options.code}&grant_type=authorization_code`,
        }

        request(option, function (err, res, body) {
            if (err || res.statusCode != 200) {
                resolve(undefined);
                return;
            }
            body = JSON.parse(body);
            if (body.errcode != undefined) {
                resolve(undefined);
                return;
            }
            resolve(body);
        })
    })
}
/*
* 进入小程序，获取code后进行后台用户创建的操作。
* @param.code
*/
module.exports = {
    config: {
        path: '/api/wechat/user/login',
        method: 'post',
        middlewares: [],
        model: {
            code: 2000,
            session_key: '',
        }
    },
    service: async (req, res, next) => {
        var query = req.body;
        var swc = req.swc;

        /**
         * 调用微信接口，目的是通过code获取session，openid等数据。此后每次打开小程序，都通过jscode获取session，作为此次小程序的鉴权工具
         */
        var jscode2session = await getJscode2Session(swc, {
            code: query.code
        })
        if (!jscode2session) {
            req.response = await swc.Error(swc, {
                code: '4003',
            });
            next();
            return;
        }

        /**
         * 先检查用户是否存在，如果不存在，则创建
         */
        var session = Buffer.from(jscode2session.session_key).toString('base64');
        var wechatUser = await swc.dao.models.users.findAndCountAll({
            where : {
                openid : jscode2session.openid
            }
        })
        // 用户不存在，创建
        if(wechatUser.count == 0) {
            await swc.models.wechatUser.create(swc, {
                openid : jscode2session.openid,
                session : session
            })
        } else { // 用户存在，更新session
            await wechatUser.rows[0].update({
                session : session
            })
        }

        req.response.session = session;
        next();
    }
}