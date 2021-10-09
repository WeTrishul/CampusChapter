const { findById } = require('../models/user')
const User = require('../models/user')


module.exports.notification = (socketserver) =>{



    let io = require('socket.io')(socketserver, {
        cors: {
          origin: "http://18.206.209.88:80",
          methods: ["GET", "POST"]
        }
      })


    io.sockets.on('connection',(socket)=>{
        // console.log('notification engine running')
        
        
      socket.on('notify',async(data)=>{
        try {

          if(data.to=='reportnoti')
          {
            console.log('huuu')
            const user = await User.find({$or:[ {UserType:'Admin'}, {UserType:'EventsLead'}]})
            const notific = {
              msg : data.msg,
              placetogo:data.placetogo
            }

            user.forEach((user)=>{
              user.Notifications.push(notific)
             user.seenAllNotifications='no'
              user.save()
              io.in(user.username).emit('notification',notific)
           })

           

           

          }

          else if(!data.to)
          {
            // notifying all users

            console.log('hello ')
            const user = await User.find({})
            const notific = {
              msg : data.msg,
              placetogo:data.placetogo
            }
            user.forEach((user)=>{
               user.Notifications.push(notific)
              user.seenAllNotifications='no'
               user.save()
            })

            io.emit('notification',notific)

          }

          else{

             // notifying specific users
          console.log('hello ')
          const user = await User.find({username:data.to})
          console.log(user[0].name)
          const str = data.msg
          if(str[2]=='n')
          {
              data.from = ''
          }
          if(str[0]=='r')
          {
            data.from='Someone '
          }
          const notific = {
            msg : data.from+' ' + data.msg,
            placetogo:data.placetogo
          }
          console.log(data.placetogo)
           user[0].Notifications.push(notific)
          user[0].seenAllNotifications='no'
           user[0].save()
          io.in(data.to).emit('notification',notific)
            
          }

          
        } catch (error) {
          console.log(error)
        }
            
      })

      socket.on('changebell',async(data)=>{

        const user = await User.find({username:data.userid})
        user[0].seenAllNotifications='yes'
        user[0].save()

        socket.emit('changedbell')

      })

        socket.on('join_room',async(data)=>{
         
          socket.join(data.chatroom)

          io.in('realshivam').emit('user_joined')
    
        })

    })

}