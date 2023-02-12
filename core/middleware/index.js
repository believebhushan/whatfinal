const {createClient} =require('@supabase/supabase-js')
const supabaseUrl =  process.env.supabaseUrl;
const supabaseAnonKey = process.env.supabaseAnonKey;
const supabase = createClient(supabaseUrl, supabaseAnonKey)
const checkIsAllowed=async(apiKey)=>{
    if(!apiKey){
        return false
    }
    const {data}=await supabase.from("apikeys").select('key')
    console.log(data.map((ele)=>ele.key).includes(apiKey),"dhbjhjh")

    if(data.map((ele)=>ele.key).includes(apiKey)){
        return true
    }
    return false
}
module.exports=checkIsAllowed