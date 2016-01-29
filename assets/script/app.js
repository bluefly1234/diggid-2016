var APP = (function() {
    //screenConfig
    var Sc = {
        width: 3520,
        height: 616
    };


    var vm = new Vue({
        el: '#app',

        data: function() {
            return {
                users: USER_CONTAINER,
                startLucky:false,
                luckyusers:[],
                thanksover:''
            };
        },
        methods: {
            //用户加入
            userJoin: function(uids) {

            }
        },

        computed: {
            row: function() {
                return getShowCloumn(this.users.length);
            }
        }
    });

    // setTimeout(allUserIsComing,5000);
    //用户加入动画
    function allUserIsComing() {
        var total = USER_CONTAINER.length,
            uidStart = total % 2 ? 1 : 0,
            uidEnd = total - 1;
        return new Promise(function(resolve, reject) {
            //偶数递增+
            var timeStart = setInterval(function() {
                if (uidStart >= total && uidEnd < 0) {
                    resolve();
                    return clearInterval(timeStart);
                }
                if (uidStart < total) {
                    USER_CONTAINER[uidStart].status = 1;
                }
                if (uidEnd > -1) {
                    USER_CONTAINER[uidEnd].status = 1;
                }
                uidEnd -= 2;
                uidStart += 2;

            }, 200);
        });

    }

    // 用户离开动画();
    function swiperToNextScreen() {
        var total = USER_CONTAINER.length,
            uidStart = total % 2 ? 1 : 0,
            uidEnd = total - 1;
        return new Promise(function(resolve, reject) {
            //偶数递增+
            var timeStart = setInterval(function() {
                if (uidStart >= total && uidEnd < 0) {
                    resolve();
                    return clearInterval(timeStart);
                }
                if (uidStart < total) {
                    USER_CONTAINER[uidStart].leave_eff = getAnimateClass(true);
                    USER_CONTAINER[uidStart].isleave = true;
                }
                if (uidEnd > -1) {
                    USER_CONTAINER[uidEnd].leave_eff = getAnimateClass(true);
                    USER_CONTAINER[uidEnd].isleave = true;

                }
                uidEnd -= 2;
                uidStart += 2;

            }, 100);
        });
    }


    //用户再次进场动画
    function allUserBackUp(reback) {
        return function(){
            var total = USER_CONTAINER.length,
                uidStart = total % 2 ? 1 : 0,
                uidEnd = total - 1;
            for (var i = 0; i < total; i++) {
                USER_CONTAINER[i].status = reback ? 0 : 1;
            }

            return Promise.resolve(reback);
        };
        
    }

    function getShowCloumn(lentg) {
        var cloMap = [0, 5 * 1, 10 * 2, 15 * 3, 20 * 4, 25 * 5, 30 * 6, 35 * 7, 40 * 8, 45 * 9, 50 * 10];
        // cloMap = cloMap.map(function(j){
        //  return j * 3.5/4;
        // });
        var row = 0;

        for (var i = 0; i < cloMap.length; i++) {
            if (lentg <= cloMap[i]) {
                row = i;
                break;
            }
        }
        return row;
    }
    //清空画布
    function clearDrawMap() {
        return new Promise(function(resolve, reject) {
            for (var i = 0; i < 245; i++) {
                if (!USER_CONTAINER[i].isleave) {
                    USER_CONTAINER[i].isleave = true;
                    USER_CONTAINER[i].leave_eff = getAnimateClass(true);
                }
            }
            resolve();
        });
    }

    function clearDrawMapFalse() {
        return new Promise(function(resolve, reject) {
            for (var i = 0; i < 245; i++) {
                USER_CONTAINER[i].status = 1;
                USER_CONTAINER[i].isleave = false;
                USER_CONTAINER[i].leave_eff = getAnimateClass(false);
            }
            resolve();
        });
    }

    function drawTextFont(str) {
        //总字数
        var textlen = str.length;
        //字宽 = 3,每个字间隔 1

        //开始列的坐标
        var startIndex = Math.ceil((35 - 4 * textlen) / 2),
            //当前画的汉字坐标
            fontIndex = 0,
            //当前笔画坐标
            drawIndex = 0;
            //before draw 清空画布
        return function() {
            return new Promise(function(resolve, reject) {
                var timeStart = setInterval(function() {
                    //字体索引大于=文字长度的时候,停止画字
                    if (fontIndex >= textlen) {
                        resolve();
                        //再清除最后一个字符
                        return clearInterval(timeStart);
                    }
                    //得到当前字的笔画组合
                    var text = FONT_MAP[str[fontIndex]],
                        num = text[drawIndex];

                    //计算当前坐标的相对坐标位置
                    var col = num % 3; //列,每列为startIndex
                    var row = Math.floor((num / 3)); //行,每行35个
                    //绝对坐标位置为

                    var absIndex = row * 35 + startIndex + col;

                    // console.log(absIndex);
                    USER_CONTAINER[absIndex].leave_eff = getAnimateClass();
                    USER_CONTAINER[absIndex].isleave = false;
                    //画下一个字符
                    drawIndex += 1;
                    //花完最后一个字符
                    if (drawIndex == text.length) {
                        drawIndex = 0;
                        fontIndex += 1;
                        startIndex += 4;
                    }
                    //还是画此字符

                }, 130);
            });
        };
    }


    /**
     * [true 出厂动画]
     * @param  {Array}  ) {                   var base_eff_arr [description]
     * @return {[type]}   [description]
     */
    var getAnimateClass = (function() {
        var base_eff_arr = ['bounce', 'fade', 'zoom']; //slideOut
        var leave_eff_arr = ['hinge', 'rollOut'];
        var in_eff_arr = ['bounce', 'rollIn'];
        base_eff_arr.forEach(function(base) {
            Array.prototype.push.apply(leave_eff_arr, ['OutDown', 'OutLeft', 'OutRight', 'OutUp'].map(function(di) {
                return base + di;
            }));

            Array.prototype.push.apply(in_eff_arr, ['InDown', 'InLeft', 'InRight', 'InUp'].map(function(di) {
                return base + di;
            }));
        });
        var count = leave_eff_arr.length;
        return function(isOut) {
            var arr = isOut ? leave_eff_arr : in_eff_arr;
            return arr[Math.floor(Math.random() * count)];
        };
    })();


    /**
     * [getNumberOfUsers 在场地上留下或者去掉随机的几个人物]
     * @param  {[type]} number [人数量]
     * @param  {[type]} back   [去还是留下]
     * @return {[type]}        [Promise 返回随机选中的人编号]
     */
    function getNumberOfUsers(number,back){        
        return function(){
            var total = USER_CONTAINER.length;
            var random = [];
            for(var i = 0 ; i < total ; i++){
                random[i] = i;
            }
            //排序
            random.sort(function(a,b){return Math.random() < 0.5 ? 1 : -1;});
            //取n个
            var gets = random.slice(0,number),
                nowIndex = 0;
            return new Promise(function(resolve,reject){
                var timeStart = setInterval(function() {
                    if (nowIndex >= total) {
                        resolve(gets);
                        return clearInterval(timeStart);
                    }
                    //没有,则翻滚此用户
                    if(!~gets.indexOf(nowIndex)){
                        USER_CONTAINER[nowIndex].leave_eff = getAnimateClass(true);
                    }
                    nowIndex++;
                }, 10);
            });
        };
    }


    /**
     * [showLuckRubikCube 显示魔方数据]
     * @return {[type]} [description]
     */
    function showLuckRubikCube(lucks){
        return new Promise(function(resolve,reject){
            var lucksall = 6, total = USER_CONTAINER.length;

            for(var i=0;i<6;i++){
                USER_CONTAINER[lucks[i]].leave_eff = 'movecenter';
            }

            setTimeout(function(){
                var userlist = [];
                for(var i=0;i<6;i++){
                    USER_CONTAINER[lucks[i]].leave_eff = getAnimateClass(true);
                    userlist.push(USER_CONTAINER[lucks[i]]);
                }

                vm.startLucky = true;
                vm.luckyusers = userlist;

                var ele = vm.$els.luckyele;
                var xyz = ['rotateX','rotateY','rotateZ'];
                function randn(n){
                    return Math.floor(Math.random() * n);
                }
                function ninety(){
                    return randn(5) * 90;
                }
                var times = 0;
                var roatedTimerId = setInterval(function(){
                    times ++;
                    var style = [
                        xyz[0] + '('+(90 * randn(5))+'deg)',
                        xyz[1] + '('+(90 * randn(5))+'deg)',
                        xyz[2] + '('+(90 * randn(5))+'deg)'
                    ];
                    style.sort(function(){return Math.random() < 0.5 ? 1 : -1});
                    ele.style.transform  = style.join(' ');
                    if(times >= 10){
                        resolve('恭喜');
                        clearInterval(roatedTimerId);
                    }
                    // console.log(style);
                    // ele.style.transform = 'rotate3d('+ninety()+'deg,'+ninety()+'deg,'+ninety()+'deg)';
                },1000);
            },2000);

        });
    };


    function drawChineseText(str){
        //总字数 , 7
        var textlen = str.length;
        //字宽 = 3,每个字间隔 1

        //开始列的坐标
        var startIndex = 14,
            //当前画的汉字坐标
            fontIndex = 0;
            //before draw 清空画布
        return function() {
            return new Promise(function(resolve, reject) {
                for(var j = 0; j< textlen ; j++){
                    //得到当前字的笔画组合
                    var text = CHINSE_FONT[str[j]];
                    for(var i =0,_len = text.length  ; i < _len;i++){
                        var num = text[i];
                        //计算当前坐标的相对坐标位置
                        var col = num % 7; //列,每列为startIndex
                        var row = Math.floor((num / 7)); //行,每行35个
                        var absIndex = row * 35 + startIndex + col;

                        USER_CONTAINER[absIndex].leave_eff = getAnimateClass();
                        USER_CONTAINER[absIndex].isleave = false;
                    }
                }
                
                resolve();
            });
        };
    }

    return {
        //所有玩家入场效果
        allUserIsComing: allUserIsComing,
        //切屏
        swiperToNextScreen: swiperToNextScreen,
        //获取当前行列数量
        getShowCloumn: getShowCloumn,
        //清空画布
        clearDrawMap: clearDrawMap,
        clearDrawMapFalse:clearDrawMapFalse,
        //写字
        drawTextFont: drawTextFont,
        drawChineseText:drawChineseText,
        //随机获取类名
        getAnimateClass: getAnimateClass,
        //所有玩家翻过来翻过去
        allUserBackUp: allUserBackUp,
        getNumberOfUsers:getNumberOfUsers,
        showLuckRubikCube:showLuckRubikCube,
        gameover:function(){
            vm.thanksover = 'active';
            return Promise.resolve();
        },
        timeout: function(ms) {
            return function() {
                return new Promise(function(resolve, reject) {
                    setTimeout(resolve, ms);
                });
            };
        },
        clearCanvasGame:function(){
            return new Promise(function(resolve,reject){
                var ele = vm.$els.canvasgame;
                ele.style.display = 'none';
                resolve();
            })

        }
    };
})();


//抽奖流程
// getAllUserByAjaxLuck()
//     //把所有人都翻过来
//      .then(APP.allUserBackUp(false))
//      .then(APP.timeout(1000000))
//      .then(APP.clearDrawMap)
//      .then(APP.timeout(1000))
//      .then(APP.drawChineseText('五'))
//      .then(APP.timeout(1000))
//      .then(APP.clearDrawMap)
//      .then(APP.drawChineseText('四'))
//      .then(APP.timeout(1000))
//      .then(APP.clearDrawMap)
//      .then(APP.drawChineseText('三'))
//      .then(APP.timeout(1000))
//      .then(APP.clearDrawMap)
//      .then(APP.drawChineseText('二'))
//      .then(APP.timeout(1000))
//      .then(APP.clearDrawMap)
//      .then(APP.drawChineseText('一'))
//      .then(APP.getNumberOfUsers(6,true))
//      .then(APP.showLuckRubikCube);


/*
///////////////  开场动画
 */   
/*
getAllUserByAjax()
//开始画波形图
.then(GAME.start)
// // //画出波形图
.then(GAME.drawlayerInit)
// //开始画 requestAnimatFrame
.then(GAME.startdraw)
.then(APP.timeout(17000))

// //人物进场动画
.then(APP.allUserIsComing)
.then(APP.timeout(1500))
.then(APP.swiperToNextScreen)
.then(APP.timeout(1500))
.then(APP.drawTextFont('FS*2016'))
.then(GAME.startCenterDraw)
.then(APP.timeout(1500))
.then(APP.clearDrawMap)
.then(APP.timeout(1000))
.then(APP.drawTextFont('START!!'))
.then(APP.timeout(1500))
.then(APP.clearDrawMap)
.then(APP.timeout(2000))
.then(APP.drawChineseText('五'))
.then(APP.timeout(2000))
.then(APP.clearDrawMap)
.then(APP.drawChineseText('四'))
.then(APP.timeout(2000))
.then(APP.clearDrawMap)
.then(APP.drawChineseText('三'))
.then(APP.timeout(2000))
.then(APP.clearDrawMap)
.then(APP.drawChineseText('二'))
.then(APP.timeout(2000))
.then(APP.clearDrawMap)
.then(APP.drawChineseText('一'))
.then(APP.timeout(2000))
.then(APP.clearDrawMap)
.then(APP.timeout(2000))
.then(APP.clearDrawMapFalse)
.then(APP.timeout(2000))
.then(APP.clearCanvasGame)
.then(APP.gameover);
*/

/*
* --------------
*  TEST AREA
* --------------
 */


// getAllUserByAjax()
//     .then(APP.clearDrawMapFalse);











