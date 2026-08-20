import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port : 8080 });

const clients = new Map<WebSocket, string>();

type IncomingMessage = 
{
    type : 'join'; 
    payload : {name : string}
} |
{
    type : 'chat_message' ; 
    payload : {text : string}
};

type OutgoingMessage = 
{
    type : 'chat_message'; 
    payload : {
        from : string; 
        text : string
    }
} |
{
    type : 'user_list'; 
    payload : string[] 
};

interface TrackedSocket extends WebSocket{
    isAlive ?: boolean;
}

function broadcast(message : OutgoingMessage, exceptSocket : WebSocket | null = null){
    const data = JSON.stringify(message);
    wss.clients.forEach((c)=>{
        if(c!== exceptSocket && c.readyState === WebSocket.OPEN){
            c.send(data);
        }
    })
}

function broadcastUserList(){
    broadcast({
        type : 'user_list', 
        payload : [...clients.values()]
    });
}

wss.on('connection',(socket : TrackedSocket)=>{
    socket.isAlive = true;
    socket.on('pong',()=>{socket.isAlive = true;});

    socket.on('message',(raw : Buffer)=>{
        let msg : IncomingMessage;
        try{
            msg = JSON.parse(raw.toString());
        }
        catch(err){
            console.log('Malformed message, ignoring:', raw.toString());
            return;
        }

        console.log('received:',msg);

        switch(msg.type){
            case 'join':
                clients.set(socket,msg.payload.name);
                broadcastUserList();
                broadcast({
                    type : 'chat_message', 
                    payload : {
                        from : 'system', 
                        text : `${msg.payload.name} joined`
                    }
                });
                break;
            case 'chat_message':
                broadcast({
                    type : 'chat_message', 
                    payload : { 
                        from : clients.get(socket) || 'unknown', 
                        text : msg.payload.text
                    }
                }, socket);
                break;
            default:
                console.log('unknown message type:', (msg as any).type);
        }
    });

    socket.on('close',()=>{
        const name = clients.get(socket);
        clients.delete(socket);
        broadcastUserList();
        if(name){
            broadcast({
                type : 'chat_message',
                payload : {
                    from : 'system',
                    text : `${name} left`
                }
            });
            console.log(`${name || 'a client'} disconnected`);
        };
    });
});

setInterval(()=>{
        wss.clients.forEach((socket : TrackedSocket) =>{
            if(socket.isAlive === false) return socket.terminate();
            socket.isAlive = false;
            socket.ping();
        });
    },30000);


console.log('WebSocket server running on ws://localhost:8080');


