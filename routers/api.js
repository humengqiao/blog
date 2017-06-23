const express=require('express');
const router=express.Router();
const User=require('../models/User');
const Content=require('../models/Content');

//同统一返回格式
let responseData;
router.use((req,res,next)=>{
	responseData={
		code:0,
		msg:''
	};
	next();
});

//注册逻辑
//1 用户名不能为空
//2 密码不能为空
//3 确认密码不能为空而且与密码相同
//4 用户名是否被注册
router.post('/user/register',(req,res,next)=>{
	const username=req.body.username;
	const password=req.body.password;
	const repassword=req.body.repassword;
	if(username===''){
		responseData.code=1;
		responseData.msg='用户名不能为空';
		res.json(responseData);
		return;
	}

	if(password===''){
		responseData.code=2;
		responseData.msg='密码不能为空';
		res.json(responseData);
		return;
	}

	if(repassword===''){
		responseData.code=3;
		responseData.msg='确认密码不能为空';
		res.json(responseData);
		return;
	}

	if(password!==repassword){
		responseData.code=4;
		responseData.msg='两次输入的密码不一致';
		res.json(responseData);
		return;
	}

	User.findOne({
		username:username
	}).then(userInfo=>{
		if(userInfo){
			//用户名已被占用
			responseData.code=5;
			responseData.msg='用户名已被注册';
			res.json(responseData);
		}else{
			//保存用户信息到数据库
			const user=new User({
				username:username,
				password:password
			});
			user.save().then(newUserInfo=>{
				responseData.msg='注册成功';
				res.cookie('userInfo',JSON.stringify({
					_id:newUserInfo._id,
					username:newUserInfo.username
				}));
				res.json(responseData);
			});
		}
	});
});

//登录
router.post('/user/login',(req,res)=>{
	let username=req.body.username;
	let password=req.body.password;
	if(username===''||password===''){
		responseData.code=1;
		responseData.msg='用户名或密码不能为空';
		res.json(responseData);
		return;
	}

	//查询数据库是否有该记录
	User.findOne({
		username:username,
		password:password
	},(err,userInfo)=>{
		if(err){
			responseData.code=6;
			responseData.msg='登录失败，请重试';
			res.json(responseData);
			return;
		}
		if(!userInfo){
			responseData.code=2;
			responseData.msg='用户名或密码错误';
			res.json(responseData);
			return;
		}
		responseData.msg='登录成功';
		User.findById(userInfo._id).then(newUserInfo=>{
			res.cookie('userInfo',JSON.stringify({
				_id:newUserInfo._id,
				username:newUserInfo.username,
				isAdmin:Boolean(newUserInfo.isAdmin)
			}));
			responseData.userInfo={
				_id:newUserInfo._id,
				username:newUserInfo.username
			};
			res.json(responseData);
		});
	});
});

//退出登录
router.get('/user/logout',(req,res)=>{
	res.clearCookie('userInfo');
	res.json(responseData);
});

/*
 * 评论提交
*/
router.post('/comment/post',(req,res)=>{
	let contentId=req.body.contentid||'';
	let postData={
		username:req.cookies.userInfo&&JSON.parse(req.cookies.userInfo).username,
		postTime:new Date(),
		content:req.body.content
	};
	//查询当前文章信息
	Content.findOne({
		_id:contentId
	}).then(content=>{
		content.comments.push(postData);
		return content.save();
	}).then(newContent=>{
		responseData.message='评论成功';
		responseData.data=newContent;
		res.json(responseData);
	});
});

/*
 *显示评论
*/
router.get('/comment',(req,res)=>{
	let contentId=req.query.contentid;
	Content.findById(contentId,'comments').then(result=>{
		res.json({
			data:result.comments
		});
	});
});

module.exports=router;