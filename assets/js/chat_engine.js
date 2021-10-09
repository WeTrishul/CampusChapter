



class ChatEngine{
    constructor(chatBoxId, username ,chattype){
        this.chatBox = $(`#${chatBoxId}`);
        this.username = username;
        this.chattype=chattype;

        this.socket = io.connect('http://18.206.209.88:5000');

        if (this.username){
            this.connectionHandler();
        }

    }


    connectionHandler(){

        const self = this

        this.socket.on('connect', function(){
            console.log('connection established using sockets...!');

                self.socket.emit('join_room',{
                    username:self.username,
                    chatroom:self.chattype,
                    chatbox : self.chatBox
                })
    
                self.socket.on('user_joined',(data)=>{
                    console.log('user joined',data)
                })
            
        });


        $('#send-message').click(()=>{
            
            let msg = $('#chat-message-input').val();
            console.log(msg)
             $('#chat-message-input').val('');
             $('#chat-message-input').focus();

            if (msg != ''){
                self.socket.emit('send_message', {
                    message: msg,
                    username: self.username,
                    chatroom: self.chattype
                });
            }
        });

        self.socket.on('receive_message',(data)=>{
            console.log('message recieved',data.message)
            let newMessage
            if(self.username==data.userid._id)
            {
                newMessage = $('<li class="float-right table clear-both bg-yellow-200 rounded-bl-2xl rounded-br-2xl rounded-tr-2xl p-2 mr-4 mt-3">');
            }
            else{
                newMessage = $('<li class="float-left table  clear-both bg-green-200 rounded-bl-2xl rounded-br-2xl rounded-tr-2xl p-2 ml-4 mt-3">');

            }
            newMessage.append($('<strong>', {
                'html': data.userid.username
            }));
            newMessage.append($('<sub>', {
                'html': moment(data.createdAt).format('h:mm a')
            }));
            newMessage.append($('<br>'));
            
            newMessage.append($('<small>', {
                'html': data.message
            }));


            $('#chat-messages-list').append(newMessage);

            self.socket.emit('caninotifyothers',{data:data,room : self.chattype})
        })

        self.socket.on('old_messages',(data)=>{
            // console.log(data)
            console.log(self.username)
            data.forEach((element) => {
                let newMessage
                if(self.username==element.userid._id)
                {
                    newMessage = $('<li class="float-right table clear-both justify-end bg-yellow-200 rounded-bl-2xl rounded-br-2xl rounded-tr-2xl p-2 mr-4 mt-3">');
                    
                }
                else{
                    newMessage = $('<li class="float-left table clear-both bg-green-200 rounded-bl-2xl rounded-br-2xl rounded-tr-2xl p-2 ml-4 mt-3">');

                }
                newMessage.append($('<strong>', {
                    'html': element.userid.username
                }));
                newMessage.append($('<sub>', {
                    'html': moment(element.createdAt).format('h:mm a')
                }));
                newMessage.append($('<br>'));
                
                newMessage.append($('<small>', {
                    'html': element.message
                }));
               
                $('#chat-messages-list').append(newMessage);
            });
          
        })

        self.socket.on('yesyoumaynotify',(data)=>{


            console.log('yes you may')

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

    }
}
