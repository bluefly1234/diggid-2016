Vue.filter('smallimg', function(headimgurl) {
	if(!headimgurl || headimgurl.length <= 1){
		return 'assets/images/default-head.jpg';
	}
    return headimgurl.substr(0, headimgurl.length-1) + '132';
});

Vue.filter('randomhead', function(id) {
	var num = Math.floor(Math.random() * 12);
	return 'assets/images/random'+num+'.jpg';
});
