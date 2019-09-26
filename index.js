'use strict';
const got = require('got');
const md5 = require('md5');
const API_HOST='https://openapi.mta.qq.com/wx/v1/'
const APPID='500667280'
const SECRET_KEY='583f76125bcbc3f29e7e47e1a838c01d'
let markdown={content:''}
function getSign(soucr_str){
  return md5(SECRET_KEY+'&'+soucr_str);
}
/**
 * @param path
 * @param params
 */
function getApiUrl(path,params={}){
  params.app_id=APPID
  params.timestamp=parseInt(new Date()/1000)
  let param_keys=[]
  let param_str=[]
  Object.keys(params).forEach(key=>{
    param_keys.push(key)
  })
  param_keys=param_keys.sort()
  param_keys.forEach(key=>{
    param_str.push((key+'='+params[key]))
  })
  param_str=param_str.join('&')
  let sign=getSign(param_str)
  //console.log('f4ed22efc47fd0cba322bdaa4e258475',sign)
  let url=API_HOST+path+'?'+param_str+'&sign='+sign
  console.log(url)
  return url;
}

async function getMtaData(){
  let url,res,content=''
  try{
    url=getApiUrl('analytics/history')//历史趋势
    res=await got(url);
    let yesd=JSON.parse(res.body).data[7]
    content+=`#### MTA快报${yesd.date} 
    > pv(浏览次数) ${yesd.pv}
    > uv(独立访客) ${yesd.uv}
    > vv(访问次数) ${yesd.vv}
    > iv(独立 IP) ${yesd.iv}
    `
    //console.log('历史趋势',yesd,content);
  }catch (e){}

  try{
    url=getApiUrl('analytics/user_compare')//新老用户
    res=await got(url);
    let yesd=JSON.parse(res.body).data[7]
    content+=`#### 新老用户
    > 新用户 ${yesd.new_visitor}
    > 老用户 ${yesd.old_visitor}
    `
    //console.log('新老用户',yesd,content);
  }catch (e){}

  try{
    url=getApiUrl('analytics/share')//分享分析
    res=await got(url);
    let yesd=JSON.parse(res.body).data[7]
    content+=`#### 分享分析
    > 分享次数 ${yesd.shared_times}
    > 分享用户 ${yesd.shared_users}
    `
    //console.log('分享分析',yesd,content);
  }catch (e){}

  try{
    url=getApiUrl('analytics/area')//地域
    res=await got(url);
    let yesd=JSON.parse(res.body).data
    content+=`#### 地域(pv/uv/vv/iv)
    > ${yesd[0].area_name} ${yesd[0].pv}/${yesd[0].uv}/${yesd[0].vv}/${yesd[0].iv}
    > ${yesd[1].area_name} ${yesd[1].pv}/${yesd[1].uv}/${yesd[1].vv}/${yesd[1].iv}
    > ${yesd[2].area_name} ${yesd[2].pv}/${yesd[2].uv}/${yesd[2].vv}/${yesd[2].iv}
    > ${yesd[3].area_name} ${yesd[3].pv}/${yesd[3].uv}/${yesd[3].vv}/${yesd[3].iv}
    > ${yesd[4].area_name} ${yesd[4].pv}/${yesd[4].uv}/${yesd[4].vv}/${yesd[4].iv}
    `
    //console.log('地域',yesd,content);

  }catch (e){}


  try{
    url=getApiUrl('analytics/period')//使用时段
    res=await got(url);
    let data=JSON.parse(res.body).data
    data=data.sort(function(a,b){
      return b.uv-a.uv
    })
    content+='#### 使用时段\n';
    data.slice(0,10).forEach(d=>{
      content+='> '+d.hour.substr(0,2)+'时(uv:'+d.uv+',pv:'+d.pv+')\n';
    })
    console.log('使用时段',content);
  }catch (e){}

  markdown={content:content}
}
async function sendMsg(){
  let jqr='https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=b5e4c008-ef97-4605-91b2-b8a4935abff0'
  let res=await got.post(jqr,{
    headers:{
      'Content-Type': 'application/json',
    },
    method:'POST',
    json: true,
    body: {
      "msgtype": "markdown",
      "markdown": markdown
    }
  })
  console.log('sendMsg',res.body);
}
exports.main_handler = async (event, context, callback) => {

  await getMtaData()
  await sendMsg()
  return event
};
exports.main_handler()