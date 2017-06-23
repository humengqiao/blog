const mongoose=require('mongoose');
const Schema=mongoose.Schema;

//分类表结构
const userSchema=new Schema({
	name:String
});

module.exports=userSchema;