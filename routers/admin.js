const express=require('express');
const router=express.Router();
const User=require('../models/User');
const Category=require('../models/Category');
const Content=require('../models/Content');

router.get('/',(req,res,next)=>{
	res.render('admin/index',{
		userInfo:req.cookies.userInfo&&JSON.parse(req.cookies.userInfo)
	});
});

router.get('/user',(req,res,next)=>{
	/*
	 *读取数据库中所有的用户数据
	 */
	let page=Number(req.query.page)||1;
	let limit=2;
	let pages=0;
	User.count().then(count=>{
		pages=Math.ceil(count/limit);
		page=Math.min(page,pages);
		age=Math.max(page,1);
		let skip=(page-1)*limit;
		User.find().skip(skip).limit(limit).then(users=>{
			res.render('admin/user_index',{
				users:users,
				total:count,
				limit:limit,
				pages:pages,
				page:page,
				nowIndex:0,
				action:'user'
			});
		});
	});
});

/*
 * 分类首页	
 */

router.get('/category',(req,res)=>{
	let page=Number(req.query.page)||1;
	let limit=3;
	let pages=0;
	Category.count().then(count=>{
		pages=Math.ceil(count/limit);
		page=Math.min(page,pages);
		age=Math.max(page,1);
		let skip=(page-1)*limit;
		Category.find().sort({
			_id:-1
		}).skip(skip).limit(limit).then(categories=>{
			res.render('admin/category_index',{
				userInfo:req.cookies.userInfo&&JSON.parse(req.cookies.userInfo),
				categories:categories,
				total:count,
				limit:limit,
				pages:pages,
				page:page,
				nowIndex:1,
				action:'category'
			});
		});
	});
});

/*
 * 分类添加
 */
router.get('/category/add',(req,res)=>{
	res.render('admin/category_add',{
		userInfo:req.cookies.userInfo&&JSON.parse(req.cookies.userInfo),
		nowIndex:1
	});
});

/*
 * 分类保存
 */

router.post('/category/add',(req,res)=>{
	let category_name=req.body.name||'';
	if(!category_name){
		res.render('admin/error',{
			message:'分类名不能为空'
		});
	}
	//查看是否存在该分类
	Category.findOne({
		name:category_name
	}).then(result=>{
		if(result){
			res.render('admin/error',{
				userInfo:req.cookies.userInfo&&JSON.parse(req.cookies.userInfo),
				message:'该分类已存在'
			});
			return Promise.reject();
		}else{
			return new Category({
				name:category_name
			}).save();
		}
	}).then(newCategory=>{
		res.render('admin/success',{
			userInfo:req.cookies.userInfo&&JSON.parse(req.cookies.userInfo),
			message:'分类保存成功',
			url:'/admin/category'
		});
	});
});

/*
 * 分类修改
*/
router.get('/category/edit',(req,res)=>{
	let id=req.query.id||'';
	Category.findOne({
		_id:id
	}).then(category=>{
		if(!category){
			res.render('admin/error',{
				userInfo:req.cookies.userInfo&&JSON.parse(req.cookies.userInfo),
				message:'分类信息不存在'
			});
			return Promise.reject();
		}else{
			res.render('admin/category_edit',{
				userInfo:req.cookies.userInfo&&JSON.parse(req.cookies.userInfo),
				category:category
			});
		}
	});
});

/*
 * 分类修改保存
*/
router.post('/category/edit',(req,res)=>{
	let id=req.query.id||'';
	let name=req.body.name||'';
	Category.findOne({
		_id:id
	}).then(category=>{
		if(!category){
			res.render('admin/error',{
				userInfo:req.cookies.userInfo&&JSON.parse(req.cookies.userInfo),
				message:'分类信息不存在'
			});
			return Promise.reject();
		}else{
			if(name===category.name){
				res.render('admin/success',{
					userInfo:req.cookies.userInfo&&JSON.parse(req.cookies.userInfo),
					message:'修改成功',
					url:'/admin/category'
				});
				return Promise.reject();
			}else{
				return Category.findOne({
					_id:{$ne:id},
					name:name
				});
			}
		}
	}).then(sameCategory=>{
		if(sameCategory){
			res.render('admin/error',{
				userInfo:req.cookies.userInfo&&JSON.parse(req.cookies.userInfo),
				message:'已存在相同分类'
			});
			return Promise.reject();
		}else{
			return Category.update({
				_id:id
			},{
				name:name
			});
		}
	}).then(()=>{
		res.render('admin/success',{
			userInfo:req.cookies.userInfo&&JSON.parse(req.cookies.userInfo),
			message:'修改成功'
		});
	});
});


/*
 * 分类删除
*/
router.get('/category/delete',(req,res)=>{
	let id=req.query.id||'';
	Category.remove({
		_id:id
	}).then(()=>{
		res.render('admin/success',{
			userInfo:req.cookies.userInfo&&JSON.parse(req.cookies.userInfo),
			message:'分类删除成功',
			url:'/admin/category'
		})
	});
});

/*
 * 内容首页
 */
router.get('/content',(req,res)=>{
	let page=Number(req.query.page)||1;
	let limit=3;
	let pages=0;
	Content.count().then(count=>{
		pages=Math.ceil(count/limit);
		page=Math.min(page,pages);
		page=Math.max(page,1);
		let skip=(page-1)*limit;
		Content.find().sort({
			_id:-1
		}).skip(skip).populate(['category','user']).limit(limit).then(contents=>{
			console.log(contents);
			res.render('admin/content_index',{
				userInfo:req.cookies.userInfo&&JSON.parse(req.cookies.userInfo),
				contents:contents,
				total:count,
				limit:limit,
				pages:pages,
				page:page,
				nowIndex:1,
				action:'content'
			});
		});
	});
});

/*
 * 内容添加
 */
router.get('/content/add',(req,res)=>{
	Category.find().sort({
		_id:-1
	}).then(categories=>{
		res.render('admin/content_add',{
			userInfo:req.cookies.userInfo&&JSON.parse(req.cookies.userInfo),
			categories:categories
		});
	});
});

/*
 * 内容保存
*/
router.post('/content/add',(req,res)=>{
	if(req.body.category===''){
		res.render('admin/error',{
			userInfo:req.cookies.userInfo&&JSON.parse(req.cookies.userInfo),
			message:'分类名不能为空'
		});
		return;
	}
	if(req.body.title===''){
		res.render('admin/error',{
			userInfo:req.cookies.userInfo&&JSON.parse(req.cookies.userInfo),
			message:'分类标题不能为空'
		});
		return;
	}

	new Content({
		category:req.body.category,
		title:req.body.title,
		user:req.cookies.userInfo&&JSON.parse(req.cookies.userInfo)._id,
		description:req.body.description,
		content:req.body.content
	}).save().then(content=>{
		res.render('admin/success',{
			userInfo:req.cookies.userInfo&&JSON.parse(req.cookies.userInfo),
			message:'内容添加成功',
			url:'/admin/content'
		});
	});
});

/*
 * 内容修改
 */
router.get('/content/edit',(req,res)=>{
	let id=req.query.id||'';
	let categories=[];

	Category.find().sort({
		_id:-1
	}).then(result=>{
		categories=result;
		return Content.findOne({
			_id:id
		}).populate('category');	
	}).then(content=>{
		if(!content){
			res.render('admin/error',{
				userInfo:req.cookies.userInfo&&JSON.parse(req.cookies.userInfo),
				message:'内容不存在'
			});
			return Promise.reject();
		}else{
			res.render('admin/content_edit',{
				uerInfo:req.cookies.userInfo&&JSON.parse(req.cookies.userInfo),
				categories:categories,
				content:content
			});
		}
	});
});

/*
 * 内容修改保存
 */
router.post('/content/edit',(req,res)=>{
	let id=req.query.id||'';
	if(req.body.category===''){
		res.render('admin/error',{
			userInfo:req.cookies.userInfo&&JSON.parse(req.cookies.userInfo),
			message:'内容分类不能为空'
		});
		return;
	}
	if(req.body.title===''){
		res.render('admin/error',{
			userInfo:req.cookies.userInfo&&JSON.parse(req.cookies.userInfo),
			message:'内容标题不能为空'
		});
		return;
	}

	Content.update({
		_id:id
	},{
		category:req.body.category,
		title:req.body.title,
		description:req.body.description,
		content:req.body.content
	}).then(()=>{
		res.render('admin/success',{
			userInfo:req.cookies.userInfo&&JSON.parse(req.cookies.userInfo),
			message:'内容保存成功',
			url:`/admin/content/edit?id=${id}`
		});
	});
});

/*
 * 内容删除
*/
router.get('/content/delete',(req,res)=>{
	let id=req.query.id;
	Content.remove({
		_id:id
	}).then(()=>{
		res.render('admin/success',{
			userInfo:req.cookies.userInfo&&JSON.parse(req.cookies.userInfo),
			message:'内容删除成功',
			url:'/admin/content'
		})
	});
});

module.exports=router;