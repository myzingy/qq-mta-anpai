'use strict';
const got = require('got');
const md5 = require('md5');
const API_HOST='https://openapi.mta.qq.com/wx/v1/'
const APPID='500667280'
const SECRET_KEY='583f76125bcbc3f29e7e47e1a838c01d'
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
  let url=getApiUrl('analytics/history',{
    start_date:'2019-07-01',
    end_date:'2019-08-17',
  })
  let res=await got(url);
  console.log(res.body);
}
exports.main_handler = async (event, context, callback) => {
  await getMtaData()
  return event
};
exports.main_handler()