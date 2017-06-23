const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const contentSchema=new Schema({
	category:{
		//类型
		type:mongoose.Schema.Types.ObjectId,
		//引用
		ref:'Category'
	},
	title:String,
	user:{
		type:mongoose.Schema.Types.ObjectId,
		ref:'User'
	},
	addTime:{
		type:Date,
		default:new Date()
	},
	view:{
		type:Number,
		default:0
	},
	description:{
		type:String,
		default:''
	},
	content:{
		type:String,
		default:''
	},
	comments:{
		type:Array,
		default:[]
	}
});

module.exports=contentSchema;