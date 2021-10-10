const cookieParser = require('cookie-parser');
const express = require('express')
const mongoose = require('mongoose')
const User = require('../models/user')
const Post = require('../models/post')
const Like=require('../models/like')
const Comment = require('../models/comments')
const Report = require('../models/report')
const passport =require('passport')
const passport_local = require('../config/passport-local-auth')
const fetch = require('node-fetch')
const moment = require('moment')
const startingTime = require('../config/timecalc')



module.exports.discuss = (req,res)=>{

    if(!req.isAuthenticated())
        {
          return   res.redirect('/login')
        }
        else
        {
            Post.find({}).populate('userid').populate({
                path:'comments',
                populate:{
                    path:'userid'
                }
            }).exec((error,posts)=>{
                // console.log(posts)
                return res.render('DiscussionForum',{
                    posts:posts
                })
            })
        }

}

module.exports.postit =  (req,res)=>{


    if(!req.isAuthenticated())
        {
          return   res.redirect('/login')
        }
    
    Post.create({
        userid:req.user._id,
        postBody:req.body.postBody
    },async (error,post)=>{
        if(error){return res.redirect('back')}
        
        if (req.xhr){
            
            post = await post.populate('userid').execPopulate();
            return res.status(200).json({
                data: {
                    post: post
                },
                message: "Post created!"
            });
        }
        // req.flash('success', 'Post published!');
        return res.redirect('back');

        // return res.redirect('/Discuss')
        
    })

}

module.exports.commentit = (req,res)=>{


    if(!req.isAuthenticated())
        {
          return   res.redirect('/login')
        }

        Post.findById(req.body.postid, (error,post)=>{
            if(post)
            {
                 Comment.create({
                    userid:req.user._id,
                    postid:req.body.postid,
                    commentBody : req.body.commentBody
                },async(error,comment)=>{
                    post.comments.push(comment)
                    post.save()
                    
                    comment = await comment.populate('userid').execPopulate();
                    
                    post_user = await post.populate('userid').execPopulate()
                    // console.log(post_user.userid.username)
                    if (req.xhr){
                
                        console.log('yahan pohoch gya')
                        return res.status(200).json({
                            data: {
                                comment: comment,
                                postuser:post_user.userid.username
                            },
                            message: "Post created!"
                        });
                    }
                    return res.redirect('/Discuss')
                })
            }
        })
}


module.exports.deletepost = (req,res)=>{

    if(!req.isAuthenticated())
        {
          return   res.redirect('/login')
        }


    Post.findById(req.params.id,async (error,post)=>{
        if(req.user.id==post.userid || req.user.UserType=='Admin')
        {
            await Like.deleteMany({likeable:post._id,onModel:'post'})
            await Like.deleteMany({likeable:{$in:post.comments}})
            post.remove()
            await Comment.deleteMany({postid:req.params.id})

            if (req.xhr){
                console.log('hi')
                return res.status(200).json({
                    data: {
                        post_id: req.params.id
                    },
                    message: "Post deleted"
                });
            }

            res.redirect('back')
        }
        else{
            res.redirect('back')
        }
    })
}

module.exports.deletecomment = (req,res)=>{

    if(!req.isAuthenticated())
        {
          return   res.redirect('/login')
        }

    Comment.findById(req.params.id,async (error,comment)=>{

        try {

            if(req.user.id==comment.userid || req.user.UserType=='Admin')
            {
                var postid = comment.postid
                comment.remove()
    
                Post.findByIdAndUpdate(postid,{$pull : {comments:req.params.id}},(error,post)=>{
                    // return res.redirect('back')
                })
                await Like.deleteMany({likeable:comment._id,onModel:'comment'})
    
                if (req.xhr){
                    console.log('aagya')
                    return res.status(200).json({
                        data: {
                            comment_id: req.params.id
                        },
                        message: "Post deleted"
                    });
                }
                return res.redirect('/Discuss')
    
            }
            else{
                return res.redirect('back')
            }
            
        } catch (error) {
            return res.redirect('back')
        }
       
    })
}


module.exports.likehandler= async (req,res)=>{
    try{

        if(!req.isAuthenticated())
        {
          return   res.redirect('/login')
        }
       
        var likeable
        let deleted = false;

    if(req.query.type=='post')
    {
        likeable=await Post.findById(req.query.id).populate('likes');
    }else
    {
        likeable=await Comment.findById(req.query.id).populate('likes');
    }


    var ispresent=await Like.findOne({
        userid:req.user._id,
        likeable:req.query.id,
        onModel:req.query.type

    })

    if(ispresent)
    {
        
       likeable.likes.pull(ispresent._id)
       likeable.save()
       ispresent.remove()
       deleted = true;
    }
    else{
        
        var currlike = await Like.create({
            userid:req.user._id,
            likeable:req.query.id,
            onModel:req.query.type
        })
        likeable.likes.push(currlike._id)
        console.log(currlike._id)
        likeable.save()
    }
    const likeablepop = await  likeable.populate('userid').execPopulate()
   console.log(likeable._id)
    return res.json(200, {
        message: "Request successful!",
        data: {
            deleted: deleted,
            likeableowner:likeablepop.userid.username,
            likeabletype:req.query.type,
            likeable:likeable._id
        }
    })


    // return res.redirect('back')

    }catch(error){
        return console.log(error)
    }
    
}






module.exports.reporthandler= async (req,res)=>{
    try{
       
        var reportable
        let deleted = false;

    if(req.query.type=='post')
    {
        reportable=await Post.findById(req.query.id).populate('report');
    }else
    {
        reportable=await Comment.findById(req.query.id).populate('report');
    }


    var ispresent=await Report.findOne({
        userid:req.user._id,
        reportable:req.query.id,
        onModel:req.query.type

    })

    if(ispresent)
    {
        
        reportable.report.pull(ispresent._id)
        reportable.save()
       ispresent.remove()
       deleted = true;
    }
    else{
        
        var currreport = await Report.create({
            userid:req.user._id,
            reportable:req.query.id,
            onModel:req.query.type
        })
        reportable.report.push(currreport._id)
        console.log(currreport._id)
        reportable.save()
    }
    const reportablepop = await  reportable.populate('userid').execPopulate()
   console.log(reportable._id)
    return res.json(200, {
        message: "Request successful!",
        data: {
            deleted: deleted,
            reportableowner:reportablepop.userid.username,
            reportabletype:req.query.type,
            reportable:reportable._id
        }
    })


    // return res.redirect('back')

    }catch(error){
        return console.log(error)
    }
    
}

module.exports.reportedthings = async (req,res) => {

  const reportedposts = await Post.find({ "report.0": { "$exists": true }}) 
  console.log(reportedposts) 
  const reportedcomments = await Comment.find({ "report.0": { "$exists": true }}) 
  
  return res.render('reportedthings',{
      posts :reportedposts ,
      comments : reportedcomments
  })


}