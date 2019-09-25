'use strict';
const got = require('got');
const crypto = require('crypto');
const md5 = require('md5');
const API_HOST='https://openapi.mta.qq.com/'
const APPID='500667280'
const TOKEN='583f76125bcbc3f29e7e47e1a838c01d' + '&'
function getSign(soucr_str){
  soucr_str = soucr_str.replace('~', '%7E');
  let hmac = crypto.createHmac("sha1", TOKEN);
  hmac.update(soucr_str);
  let sha1str=hmac.digest('hex')
  //console.log('e62164cdb024f4bb779d0f1a10e757c1461a065a',sha1str)
  return md5(sha1str);
}

/**
 * @param path
 * @param params
 */
function getApiUrl(path,params={}){
  params.app_id=APPID
  params.timestamp=parseInt(new Date()/1000)
  let sign_str='GET&'+encodeURIComponent('/'+path)
  let param_keys=[]
  let param_str=[]
  Object.keys(params).forEach(key=>{
    param_keys.push(key)
    //param_str.push(key+'='+params[key])
  })
  param_keys=param_keys.sort()
  param_keys.forEach(key=>{
    param_str.push((key+'='+params[key]))
  })
  param_str=param_str.join('&')
  sign_str=sign_str+'&'+encodeURIComponent(param_str)
  //console.log(sign_str)
  let sign=getSign(sign_str)
  //console.log('f4ed22efc47fd0cba322bdaa4e258475',sign)
  let url=API_HOST+path+'?'+param_str+'&sign='+sign
  console.log(url)
  return url;
}
async function getMtaData(){
  /*
  //GET&/ctr_active_anal/get_offline_data&app_id=3102595408&end_date=2015-08-17&idx=10201,10202,10203&start_date=2015-07-01
  let strs = 'GET&%2Fctr_active_anal%2Fget_offline_data&app_id%3D3102595408&end_date%3D2015-08-17&idx%3D10201%2C10202%2C10203&start_date%3D2015-07-01
  let strs = 'GET&%2Fctr_active_anal%2Fget_offline_data&app_id%3D3102595408%26end_date%3D2015-08-17%26idx%3D10201%2C10202%2C10203%26start_date%3D2015-07-01';
  let sign=getSign(strs)
  //console.log('f4ed22efc47fd0cba322bdaa4e258475',sign)
  let url='https://openapi.mta.qq.com/ctr_active_anal/get_offline_data?'
    +'app_id=500667280&end_date=2015-08-17&idx=10201,10202,10203&start_date=2015-07-01'
  +'&sign='+sign
  */
  let url=getApiUrl('ctr_user_basic/get_offline_data',{
    start_date:'2019-07-01',
    end_date:'2019-08-17',
    idx:'10101,10102,10103,10104,10105,10106',
  })
  let res=await got(url);
  console.log(res.body);
}
exports.main_handler = async (event, context, callback) => {
  await getMtaData()
  return event
};
exports.main_handler()