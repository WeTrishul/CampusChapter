
let socketgiver
class NotiEngine{
    constructor(chatBoxId, username ,chattype){
        this.chatBox = $(`#${chatBoxId}`);
        this.username = username;
      

        this.socket = io.connect('http://18.206.209.88:7000');

        if (this.username){
            this.connectionHandler();
        }

    }


    connectionHandler(){

        const self = this

        this.socket.on('connect', function(){
            console.log('notification engine is running...!');

                self.socket.emit('join_room',{
                    
                    chatroom:self.username
                })
                
                socketgiver=self.socket
               
               

                self.socket.on('notification',(data)=>{
                    console.log(data)
                    
                    $("#bll").css("fill", '#FF0000');

                    let currcoti = $('#notis')

                    $('#nothing').remove()

                    currcoti.prepend('<a href="'+data.placetogo +'" class="flex items-center px-4 py-3 border-b hover:bg-gray-100 -mx-2"><img class="h-8 w-8 rounded-full object-cover mx-1" src="https://cdn.staticcrate.com/stock-hd/effects/footagecrate-4k-bell-icon-prev-full.png" alt="avatar"><p class="text-gray-600 text-sm mx-2"><span class="font-bold" href="#">'+data.msg +'</span></p></a>')
                    

                    new Noty({
                        theme: 'relax',
                        text: data.msg,
                        type: 'success',
                        layout: 'centerRight',
                        timeout: 1500
                        
                    }).show();

                    
                    
                })

                self.socket.on('changedbell',()=>{
                    let bell = $('#bll')

                    $("#bll").css("fill", '#000000');
                })

    
            
        });

    }

  
}


class Notihandler {
    constructor(notifieruser){
      
        this.notifieruser=notifieruser
      
    }

    notify(to,msg,placetogo)
    {
        console.log('imported')
        socketgiver.emit('notify',{
            to : to,
            from:this.notifieruser,
            msg : msg,
            placetogo:placetogo
        })
       
    }

    changebell()
    {
        socketgiver.emit('changebell',{

            userid:this.notifieruser

        })
    }

}

