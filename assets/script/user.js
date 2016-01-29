var USER_CONTAINER = [];

function initApp(){
	return new Promise(function(resolve,reject){
		window.addEventListener('load', resolve);
	});
}

/**
 * [getAllUserByAjax 入场获取所有用户]
 * @return {[type]} [description]
 */
function getAllUserByAjax(){
	return new Promise(function(resolve,reject){
		var xhr = new XMLHttpRequest();
		xhr.open('GET','wechatuser.json');
		xhr.responseType = 'json';

		xhr.onload = function(){
			var res = xhr.response.data;
			res.sort(function(a,b){
				return Math.random() < 0.5 ? 1 : -1;
			});
			for(var i=0,_len = res.length  ; i < _len; i++ ){
				var user = res[i];
				user.view = i;
				user.status = -1;
				user.leave_eff = '';
				user.isleave = false;
				USER_CONTAINER.push(user);
			}

			resolve();
		};
		xhr.send();
	});
}

/**
 * [getAllUserByAjaxLuck 获取最近互动用户进行抽奖]
 * @return {[type]} [description]
 */
function getAllUserByAjaxLuck(){
	return new Promise(function(resolve,reject){
		var xhr = new XMLHttpRequest();
		xhr.open('GET','wechatuser.json');
		xhr.responseType = 'json';
		xhr.onload = function(){
			var res = xhr.response.data;
			res.sort(function(a,b){
				return Math.random() < 0.5 ? 1 : -1;
			});
			for(var i=0,_len = res.length  ; i < _len; i++ ){
				var user = res[i];
				user.view = i;
				user.status = -1;
				user.leave_eff = '';
				user.isleave = false;
				USER_CONTAINER.push(user);
			}

			resolve();
		};
		xhr.send();
	});
}

var FONT_MAP = {
	A:[1,3,6,9,12,15,18,10,5,8,11,14,17,20],
	B:[0,3,6,9,12,15,18,1,5,8,10,11,14,17,19],
	C:[2,1,3,6,9,12,15,19,20],
	D:[0,3,6,9,12,15,18,19,17,14,11,],
	F:[0,1,2,3,6,9,12,15,18,10,11],
	S:[2,1,3,6,9,10,11,14,17,19,18],
	T:[0,1,2,4,7,10,13,16,19],
	R:[18,15,12,9,6,3,0,1,5,8,10,13,17,20],
	'!':[1,4,7,10,13,19],
	'田':[6,7,8,9,10,11,12,13,14],
	'*':[10],
	2:[0,1,2,5,8,11,10,9,12,15,18,19,20],
	0:[0,1,2,5,8,11,14,17,20,19,18,15,12,9,6,3],
	1:[1,4,7,10,13,16,19],
	6:[2,1,0,3,6,9,10,11,14,17,20,19,18,15,12],
	9:[10,9,6,3,0,1,2,5,8,11,14,17,20,19,18],
	8:[10,9,6,3,0,1,2,5,8,11,14,17,20,19,18,15,12],
	7:[0,1,2,5,8,11,14,17,20],
	5:[2,1,0,3,6,9,10,11,14,17,20,19,18],
	4:[0,3,6,9,10,11,8,5,2,14,17,20],
	3:[0,1,2,5,8,11,10,9,14,17,20,19,18]
};

var CHINSE_FONT = {
	'五':[1,2,3,4,5,14,15,16,17,18,19,26,33,40,10,24,31,38,42,43,44,45,46,47,48],
	'四':[0,1,2,3,4,5,6,13,20,27,34,41,48,47,46,45,44,43,42,35,28,21,14,7,9,16,23,22,11,18,25,26],
	'三':[1,2,3,4,5,22,23,24,25,26,42,43,44,45,46,47,48],
	'二':[8,9,10,11,12,35,36,37,38,39,40,41],
	'一':[21,22,23,24,25,26,27]
};
