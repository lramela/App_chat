const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;

//connect to mongo

mongo.connect('mongodb://127.0.0.1/App_chat', function(err, db){
    if(err){
        throw err;
    }

    console.log('MongoDB connected...');

    //connect to socket 
    client.on('connection', function(socket){
        let chat = db.collection('chats');

        //create fuction to send status

        sendStatus = function(s){
            socket.emit('status', s); 
        }
        // get chats from mongo collection
        chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
            if(err){
                throw err;
            }
            socket.emit('output', res);
        });

        // handle input events
        socket.on('input', function(data){
            let name = data.name;
            let message = data.message;

            if(name == ' ' || message == ' ' ){
                //send status
                sendStatus('Please enter a name and message');
            }else{
                //insert message
                chat.insert({name: name, message: message}, function(){
                    client.emit('output', [data]);

                    // send status
                    sendStatus({
                        message: 'Message sent',
                        clear: true
                    });
                });
            }
        });

        // handle clear
        socket.on('clear', function(data){
            //remove all chats from collection
            chat.remove({}, function(){
                socket.emit('cleared');
            }); 
        }) 
    });
});