const {
  default: makeWASocket,
  DisconnectReason,
  useSingleFileAuthState,  
} = require("@adiwajshing/baileys");

const pino = require("pino");
const fs = require("fs");
const path = "./core/";
const axios=require('axios')

exports.gas = function (msg, no, to, type) {
  const numb = no + ".json";
  connect(numb, msg, to, type);
};

async function connect(sta, msg, to, type) {
  const { state, saveState } = useSingleFileAuthState(path.concat(sta));

  const sock = makeWASocket({
    auth: state,
    defaultQueryTimeoutMs: undefined,
    logger: pino({ level: "fatal" }),
    browser: ["FFA", "EDGE", "1.0"],
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (connection == "connecting") return;

    if (connection === "close") {
      let statusCode = lastDisconnect.error?.output?.statusCode;

      if (statusCode === DisconnectReason.restartRequired) {
        return;
      } else if (statusCode === DisconnectReason.loggedOut) {
        if (fs.existsSync(path.concat(sta))) {
          fs.unlinkSync(path.concat(sta));
        }
        return;
      }
    } else if (connection === "open") {
      if (msg != null && to != null) {
        for (let x in to) {
          const id = to[x] + "@s.whatsapp.net";
          if (type === "chat") {
            // const templateButtons = [
            //   {index: 1, urlButton: {displayText: '⭐ Star Baileys on GitHub!', url: 'https://github.com/adiwajshing/Baileys'}},
            //   {index: 2, callButton: {displayText: 'Call me!', phoneNumber: '+1 (234) 5678-901'}},
            //   {index: 3, quickReplyButton: {displayText: 'This is a reply, just like normal buttons!', id: 'id-like-buttons-message'}},
            // ]
            
            // const buttonMessage = {
            //     text: "Hi it's a template message",
            //     footer: 'Hello World',
            //     templateButtons: templateButtons,
            //     image: {url: 'https://cdn.pixabay.com/photo/2016/03/21/23/25/link-1271843__480.png'}
            // }
           
            // const simplebuttons = [
            //   {buttonId: 'id1', urlButton: {displayText: '⭐ Dowlaod ', url: 'https://offerplant.com/'}},
            //   {buttonId: 'id2', buttonText: {displayText: 'Button 2'}, type: 1},
            //   {buttonId: 'id3', buttonText: {displayText: 'Button 3'}, type: 1}
            // ]
            // const buttons = [
            //   {index: 1, urlButton: {displayText: '⭐ Dowlaod ', url: 'https://offerplant.com/'}},
            //   // {index: 2, callButton: {displayText: 'Call Us!', phoneNumber: '+917321965118'}},
            //   {index: 3, quickReplyButton: {displayText: 'Reply', id: 'id-like-buttons-message'}},
            // ]
            const dataToSend={}
            let dataOptions={}
            const {url,type}=msg
            if(url){
              const response = await axios.get(url,  { responseType: 'arraybuffer' })
              if(type==='pdf'){
                dataToSend.document=Buffer.from(response.data,"utf-8")
                dataOptions={mimetype:"application/pdf" }
              }
              if(type==='image'){
                dataToSend.image=Buffer.from(response.data,"utf-8")
              }
              dataToSend.caption=msg.text
            }
            else{
              dataToSend.text=msg.text
            }
          
            try {
              if(Object.keys(dataOptions).length){
                await sock.sendMessage(id, dataToSend, dataOptions )
              }
              else{
                await sock.sendMessage(id, dataToSend )
              }
            } catch (error) {
              
            }

        //     const mmm={
        //     document:Buffer.from(response.data,"utf-8"), 
        //     caption:msg
        //     // caption:msg,
        //     // buttons:simplebuttons,
        //     // headerType: 4
        //  }

        //  const foemat=


        //  const date= new Date()

        //    await  sock.sendMessage(id, 
        //     mmm
        //     );
          }
        }
      }
    }
  });

  sock.ev.on("creds.update", saveState);

  return sock;
}
