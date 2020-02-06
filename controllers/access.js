module.exports = async (swc, options)=>{
	/**
	 * 注册一下services/http下的所有http服务，接口程序入口。
	 */
	swc = await swc.registerHttpService(swc, {
		httpServiceFilePath: `${__dirname}/../services/http`
	})

	/**
	 * 注册一系列对象模块，对象模块用来封装对象接口
	 */ 
	swc = await swc.registerModel(swc, {
		modelsName : 'wechatUser',
		path : `${__dirname}/../models/wechatUser`
	})
	return swc;
}
	