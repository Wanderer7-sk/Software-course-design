/**   
 * api接口统一管理
 */
import {get, post, upload } from './request.js'
// 登录
export const login = p => post('/API/Admin/Login', p);
export const query = g => get('http://localhost:8080/predict/batch/'+g);
export const query_position= g => get('http://localhost:8080/position/batch/'+g)

export const Query = g =>get('http://localhost:8080/predict/batch/'+g);
export const cmpt_hold = g =>get('http://localhost:8080/cmpt/predict/'+g+'/0');
export const cmpt_swing = g =>get('http://localhost:8080/cmpt/predict/'+g+'/1');
export const query_position_file = g =>get('http://localhost:8080/cmpt/position/'+g);