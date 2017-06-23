const express=require('express');
const router=express.Router();
const Category=require('../models/Category');
const Content=require('../models/Content');

/*
 * 处理通用数据
*/
let data;

router.use((req,res,next)=>{
	data={
		userInfo:req.cookies.userInfo&&JSON.parse(req.cookies.userInfo),
		categories:[]
	};
	Category.find().then(categories=>{
		data.categories=categories;
		next();
	});
});

router.get('/',(req,res,next)=>{
	Object.assign(data,{
		category:req.query.category||'',
		page:Number(req.query.page||1),
		limit:10,
		pages:0
	});

	let where={};
	if(data.category){
		where.category=data.category;
	}

	Content.where(where).count().then(count=>{
		data.count=count;
		data.pages=Math.ceil(data.count/data.limit);
		data.page=Math.min(data.page,data.pages);
		data.page=Math.max(data.page,1);
		let skip=(data.page-1)*data.limit;
		return Content.where(where).find().limit(data.limit).skip(skip).populate(['category','user']).sort({
			addTime:-1
		});
	}).then((contents)=>{
		data.contents=contents;
		res.render('main/index',data);
	});
});

/*
 * 查看文章详情
*/
router.get('/view',(req,res)=>{
	let contentId=req.query.contentid||'';
	Content.findOne({
		_id:contentId
	}).then(content=>{
		data.content=content;
		content.view++;
		content.save();
		res.render('main/view',data)
	});
});

module.exports=router;