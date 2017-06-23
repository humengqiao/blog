const mongoose=require('mongoose');
const Schema=mongoose.Schema;

//用户表结构
const userSchema=new Schema({
	username:String,
	password:String,
	isAdmin:{
		type:Boolean,
		default:false
	}
});

module.exports=userSchema;