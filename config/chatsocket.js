
const Chat = require('../models/chat')
const User = require('../models/user')

module.exports.chat = (socketserver) =>{



    let io = require('socket.io')(socketserver, {
        cors: {
          origin: "http://18.206.209.88:80",
          methods: ["GET", "POST"]
        }
      })


    io.sockets.on('connection',(socket)=>{
        console.log('yes i am also connected')

        
      
        socket.on('join_room',async(data)=>{
          console.log('joining request by ' , data)
          if(data.chatroom=='corenotification')
          {
              var user = await User.findById(data.username)
              user.seenAllCoreChats='no'
              user.save()
              socket.join('corenotification')
          }
          else if(data.chatroom=='executivenotification')
          {
            var user = await User.findById(data.username)
              user.seenAllExecChats='no'
              user.save()
            socket.join('executivenotification')
          }
          else{
          let chats = []
            chats = await Chat.find({chatroom:data.chatroom}).populate('userid')
            // console.log(chats)
            var user = await User.findById(data.username)
            if(data.chatroom=='core')
            {
              user.seenAllCoreChats='yes'
            }
            else if(data.chatroom=='executive')
            {
              user.seenAllExecChats='yes'
            }
            
            user.save()
            socket.join(data.chatroom)
            
            socket.emit('old_messages',chats)
            
            io.in(data.chatroom).emit('user_joined',data)
          }
        })

        socket.on('send_message', async(data)=>{
          // Chat.create(data,(error,chat)=>{
          //   io.in(data.chatroom).emit('receive_message', chat);
          // })
          console.log(data)
          const c = {
            userid : data.username,
            chatroom : data.chatroom,
            message : data.message
          }
          var chat = await Chat.create(c)
          chat = await chat.populate('userid').execPopulate()
          // console.log(chat)
          io.in(data.chatroom).emit('receive_message', chat);
          
          
          
      })

      socket.on('caninotifyothers',async(data)=>{

        console.log('aagya idhar')


// io.emit('notifyroom',notific)

        if(data.room=='core')
        {




          const user = await User.find({ $or:[ {UserType:'Admin'}, {UserType:'EventsLead'},{UserType:'MediaLead'}],seenAllCoreChats:'no'})
          console.log(user)
          const notific = {
            msg : data.data.userid.username + ' texted in core chat',
            placetogo:'/coreteam'
          }
      
        user.forEach((user)=>{
          if(user._id!=data.data.userid._id)
          {
            user.Notifications.push(notific)
            user.seenAllCoreChats='no'
             user.save()
          }
      
       })



       io.in('corenotification').emit('yesyoumaynotify',notific)


        }
        else{

          const user = await User.find({ $or:[ {UserType:'Admin'}, {UserType:'Executive'}, {UserType:'EventsLead'},{UserType:'MediaLead'}],seenAllExecChats:'no'})
          // console.log(user)
          const notific = {
            msg : data.data.userid.username + ' texted in executive chat',
            placetogo:'/executivechat'
          }
      
        user.forEach((user)=>{
          if(user._id!=data.data.userid._id)
          {
            user.Notifications.push(notific)
            user.seenAllExecChats='no'
             user.save()
          }
       })


       io.in('executivenotification').emit('yesyoumaynotify',notific)


        }

      })
    })

}