const resourses = require('../models/resourses')
const User = require('../models/user')
const Folder = require('../models/resourceFolder')

const cookieParser = require('cookie-parser')
const express = require('express')
const mongoose = require('mongoose')
const Event = require('../models/events')
const passport =require('passport')
const passport_local = require('../config/passport-local-auth')
const cloudinary = require('../config/cloudinary')
const multer = require('multer')
const path=require('path')
const fs =require('fs')

module.exports.getresoursePage = async(req,res)=>{

    if(!req.isAuthenticated())
        {
      return   res.redirect('/login')
    }

    const category = req.params.category
    let cat_data = await Folder.find({categoryName:category})

    try {
        res.render('viewResourceList',{
            title:'hello',
            arr:cat_data,
            l:cat_data.length,
            category
        })
    } catch (error) {
        console.log('resources nhi dikha pa rha hai',error)
        res.render('error_page')
    }
}


module.exports.showFilesFromResources = async(req,res)=>{

    if(!req.isAuthenticated())
        {
      return   res.redirect('/login')
    }

    const foldername = req.params.foldername
    console.log(foldername)
    let cat_data = await Folder.findOne({name:foldername})
    console.log(cat_data)

    try {
        res.render('viewFilesFromResourceList',{
            title:'hello',
            arr:cat_data,
            l:cat_data.files.length
        })
    } catch (error) {
        console.log('resources nhi dikha pa rha hai',error)
        res.render('error_page')
    }
}


/*module.exports.create = async(req,res)=>{
    const category = req.params.category
    const allFolders = await Folder.find({category}).populate('userid')
    const user = await Folder.findOne({userid:req.user._id}) 

    try {

        if(user.length==0)
        {
            res.render('create_folder',{
                allFolders,
                isPresent:false
            })
        }
        else{
            res.render('create_folder',{
                allFolders,
                isPresent:true
            }) 
        }
       
    } catch (error) {
        console.log(error.message)
        res.render('error_page')
        
    }
}*/

module.exports.createFolder = async (req,res)=>{
    const category = req.params.category
    const str = req.user.username+'_'+category
    console.log(str)
    const user = await Folder.findOne({name:str})
    let allFiles

   try {
    if(!user)
    {
        const folder = await new Folder({
            name:req.user.username+'_'+category,
            userid: req.user._id,
            categoryName:category
        })

        await folder.save()
    }
    else
    {
        allFiles = await Folder.findOne({name:str}).populate('userid')
    }

    console.log(allFiles)
    res.render('viewUploadPage',{
        title:'Hello',
        category,
       allFiles
    })
   } catch (error) {
       console.log(error.message)
       res.render('error_page')
   }
}

module.exports.deleteResource = async (req,res)=>{
    if(!req.isAuthenticated())
        {
          return   res.redirect('/login')
       }

    //    let rid1 = '\\uploads\\resources/'
    let rid1 = '/uploads/resources/'
       let fileName = req.params.rid
      console.log('cuta hua string',fileName)
       rid1+=fileName
       console.log(rid1)

       let foldername = req.params.foldername
       console.log(foldername)

       try {

        let cat_data = await Folder.findOne({name:foldername})
        var Newarr = [] 

           let arr = cat_data.files

           console.log('array before deletion',arr)

           console.log(rid1)

            arr.forEach((obj)=>{
               
                if(obj.ele!==rid1)
                {
                    console.log(obj.ele)
                    Newarr.push(obj)
                }
                   
            })

           console.log('array after deletion',Newarr)
           cat_data.files=Newarr
            await cat_data.save()
            

            const user = await User.findById(req.user._id)
                user.resourcesuploaded -= 1
                await user.save()


            fs.unlinkSync(path.join(__dirname,'..',rid1))
             res.redirect('back')
    }        
        catch (error) {
           console.log('delete resources ka error',error.message)
           res.render('error_page')
       }
}


module.exports.getuploadPage =  (req,res)=>{//tmko hata denge hm beta!

    if(!req.isAuthenticated())
        {
          return   res.redirect('/login')
       }

    res.render('viewUploadPage',{
        title:'hello'
    })
}

module.exports.postresourses = async(req,res)=>{
        
    try {

        if(!req.isAuthenticated())
        {
          return   res.redirect('/login')
        }

        var paths,arr=[];
        resourses.uploadedResources(req,res,async function(error){

            try {

                const _id = req.params.id
                const category = req.body.patanhi//yeh beta hatega
                console.log('category',category)
                console.log(req.body.flag)
                const name = req.body.name
                const str = req.user.username+'_'+category
                let catData = await Folder.findOne({name:str})

                console.log(catData)                
                if(error)
            {
                console.log('******Multer Error*****'+error.message)  
                if (req.body){
                
                    console.log('yahan aagya')
                    return res.status(200).json({
                        data: {
                            done: 'no'
                        },
                        message: "nhi hua!"
                    });
                }
            }
           if(req.files[0])
           { 
                paths = resourses.resourcesPath+'/'+ req.files[0].filename+','
               for(var i=1;i<req.files.length;i++)
            {
                    paths = paths + resourses.resourcesPath+'/'+ req.files[i].filename + ','
            }    
                var LastIndexOfComma = paths.lastIndexOf(',')
                paths = paths.substr(0,LastIndexOfComma)

                arr =  paths.split(',')

                console.log(arr)
                const user = await User.findById(req.user._id)
                user.resourcesuploaded += arr.length
                await user.save()
                arr.forEach((ele,i=1) =>{
                    var fileName= name+' '+i;
                    catData.files.push({ele,user:req.user.username,name:fileName})
                    i++;
                })



                /*switch (category) {
                        case 'DSA':
                        arr.forEach((ele,i=1) =>{
                            var fileName= name+' '+i;
                            catData.files.push({ele,user:user.username,name:fileName})
                            i++;
                        })
                        break;
                        case 'APTI':
                            arr.forEach((ele,i=1) =>{
                                var fileName= name+' '+i;
                                catData[0].apti.push({ele,user:user.username,name:fileName})
                                i++;
                            })                      
                        case 'DEV':
                           
                                arr.forEach((ele,i=1) =>{
                                    var fileName= name+' '+i;
                                    catData[0].dev.push({ele,user:user.username,name:fileName})
                                    i++;
                                })       
                            break;
                        case 'PLACEMENTS':
                         
                                arr.forEach((ele,i=1) =>{
                                    var fileName= name+' '+i;
                                    catData[0].placements.push({ele,user:user.username,name:fileName})
                                    i++;
                                })    
                               break;
                        case 'CP':
                       
                                arr.forEach((ele,i=1) =>{
                                    var fileName= name+' '+i;
                                    catData[0].cp.push({ele,user:user.username,name:fileName})
                                    i++;
                                })     
                                break;
                        case 'GATE':
                        
                                arr.forEach((ele,i=1) =>{
                                    var fileName= name+' '+i;
                                    catData[0].gate.push({ele,user:user.username,name:fileName})
                                    i++;
                                })       
                                break;
                        case 'CORE':
                         
                                arr.forEach((ele,i=1) =>{
                                    var fileName= name+' '+i;
                                    catData[0].coresub.push({ele,user:user.username,name:fileName})
                                    i++;
                                })      
                                break;
                    default:
                        console.log(category)
                        break;
                }*/

                console.log(catData)
                await catData.save()

                if (req.body.flag){
                
                    console.log('yahan aagya 1')
                   return res.status(200).json({
                        data: {
                            done: 'yes'
                        },
                        message: "uploaded!"
                    });
                }
                
                
           }
            } catch (error) {
                console.log('ajax ka natak',error)
                res.redirect('back')
            }  
        })     
    }catch (error) {
        console.log('Error'+error)
        res.redirect('back')
    }
}





module.exports.create = async(req,res)=>{
    const username = req.params.username

    try {
        const user = User.findOne({username})
        console.log(user)
        const folder = await Folder.find({username:user.username})

        console.log(folder)
        
        if(folder.length==0)
        {
            const newfolder = new Folder({})           
        }
        else
        {
           console.log('Madarchod!!') 
        }
    } catch (error) {
        console.log('lawda Madarchod!!')
    }
}