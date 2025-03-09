import Notification from '../models/notificationModel.js'
import User from '../models/userModel.js'
import {wss} from '../server.js'  //import webocket server

// send a notification to all server 
// @param {object} req - the request object
// @param {object} res - the response object

export const sendNotificationToAll=async(req,res)=>{
    const {message}=req.body
try{
const users=await User.find()
const notification=users.map((user)=>({
    message,
    recipent:user_id,
}));

await Notification.insertMany(notifications)

//broadcast the notificaction to all connected clients
wss.clients.forEach((client)=>{
    if(client.readyState===WebSocket.OPEN){
        client.send(JSON.stringify({type:'notifiation',date:notification}))
    }
})
res.status(200).json({message:'notification sent to all users'})
}catch(error){
    res.status(500).json({message:'failed to send notification',error:error.message})
}
}