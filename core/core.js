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
            const {url,type,template={}}=msg
            console.log(Object.keys(template || {}).length===0,"jbh")
            if(Object.keys(template || {}).length===0){
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
            }
            else{
              let styledButtons=[]
              template?.buttons.forEach(element => {
                if(element?.url){
                    styledButtons.push({index:styledButtons.length+1,urlButton:{displayText:element.text,url:element.url}})
                }
                else if(element.phone){
                  styledButtons.push({index:styledButtons.length+1,callButton:{displayText:element.text,phoneNumber:element.phone}})
                }
              });
              const formattedMessage={
                caption:template?.poster?.text,
                footer:template?.poster?.footer,
                image:{url:template?.poster?.url},
                templateButtons:styledButtons
              }
              console.log(formattedMessage)
              await sock.sendMessage(id,formattedMessage,{ephemeralExpiration:10000})
            }
           
           

            //example template
          //   console.log(template,"template")
          //   // const template={buttons:[{url:'',text:''},{text:'',phone:""}],poster:{text:'',footer:'',image:''}}
            

          //   const templateButtons = [
          //     {index: 1, urlButton: {displayText: 'Visit Online', url: 'http://www.baazarkolkata.com/'}},
          //     {index:4,urlButton:{displayText:'Store Address',url:"https://www.google.com/maps?rlst=f&lqi=CjdzaG9wcGluZyBmb3IgY2xvdGhlcyBtdW5pY2lwYWwgY2hvd2sgY2hhcHJhIHNhcmFuIGJpaGFySL2j986NsYCACFpLEAAQARACGAAYAhgDGAQYBRgHIjdzaG9wcGluZyBmb3IgY2xvdGhlcyBtdW5pY2lwYWwgY2hvd2sgY2hhcHJhIHNhcmFuIGJpaGFykgEOY2xvdGhpbmdfc3RvcmWqARwQASoYIhRzaG9wcGluZyBmb3IgY2xvdGhlcygA&vet=12ahUKEwiMnua-0p_9AhUKwnMBHQvkBA8Q8UF6BAgDEFQ..i&lei=aBHxY4zKAYqEz7sPi8iTeA&cs=1&um=1&ie=UTF-8&fb=1&gl=in&sa=X&geocode=KRUntFFAu5I5MRDWBsNX07J5&daddr=17/384,+Municipality+Chowk,+Dahiyawan+Tola,+Darshan+Nagar,+Chapra,+Bihar+841301"}},
          //     {index: 2, callButton: {displayText: 'Call me!', phoneNumber: '919431426600'}},
          //     {index: 3, urlButton: {displayText: 'Rate Us', url:'https://g.co/kgs/NkBoLX'}},
          // ]
          
          // const templateMessage = {
          //     caption: "Welcome to *BAAZAR KOLKATA*. We are offering a flat *59%*  on items above  Rs.~1499~ *699*. The offer is valid from *Monday* to *Friday* all over the month. Please Visit us to get early High discounts.",
          //     footer: 'Terms and Conditions Apply',
          //     templateButtons: templateButtons,
          //     image:{url:'https://img.freepik.com/premium-photo/shopping-online-concept-parcel-paper-cartons-with-shopping-cart-logo-trolley-laptop-keyboard-shopping-service-online-web-offers-home-delivery_9635-3959.jpg'},
          //     gifPlayback:true
          // }
          // await sock.sendMessage(id, templateMessage,{ephemeralExpiration:10000})

          }
        }
      }
    }
  });

  sock.ev.on("creds.update", saveState);

  return sock;
}
