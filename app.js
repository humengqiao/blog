/*
 *应用启动文件
 */
const express=require('express');
const app=express();
const nunjucks=require('nunjucks');
const path=require('path');
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const cookieParser=require('cookie-parser')

/*bodyParser配置*/
app.use(bodyParser.urlencoded({
	extended:true
}));

/*cookies配置*/
app.use(cookieParser());

/*
 *路由
 */
app.use('/admin',require('./routers/admin'));
app.use('/api',require('./routers/api'));
app.use('/',require('./routers/main'));

/*
 *配置
 */
//具体配置看nunjucks的API条目下的configure项(第一个参数配置模板目录)
nunjucks.configure(path.join(__dirname,'views'),{
	autoescape: true,
    express: app,
    watch : true,
    noCache :true
});
app.set('view engine', 'html');
//静态文件目录配置
app.use(express.static(path.join(__dirname,'public')));
//连接数据库
mongoose.Promise=global.Promise;   
mongoose.connect('mongodb://localhost:27017/blog',(err)=>{
	if(err){
		console.log('连接数据库失败')
	}else{
		console.log('连接数据库成功');
		const server=app.listen(3000,'localhost',()=>{
			console.log(`server run at ${server.address().port}...`);
		});
	}
});

