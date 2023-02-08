const axios=require('axios')
const sendMessage=({payload})=>{
     axios.post('http://localhost:9000/send',payload).then(()=>{alert("done")})
}
module.exports=sendMessage