if (!window.AudioContext) {
    window.AudioContext = window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
}

var GAME = (function(){

    function clone(obj) {
        if (typeof(obj) != 'object') return obj;
        if (obj == null) return obj;
        var myNewObj = {};
        for (var i in obj)
            myNewObj[i] = clone(obj[i]);
        return myNewObj;
    }

    function minus(origin, to, pre, speed) {
        var speed = speed || 1;
        return origin + (to - origin) * pre * speed;
    }

    function c_ele(name) {
        return document.createElement(name);
    }

    function rand(min, max) {
        return (min + Math.random() * (max - min) + 0.5) | 0;
    }


    //击退率
    var backrate = 0;


    var Debug = {
        rawFrequency: false
    }

    var speed = 1;
    var canvas = document.querySelector("canvas");
    //初始化图形库
    var COL = newCOL(canvas),
        Glib = getGraphlib(COL);;
    COL.setCanvas(canvas);
    COL.autoClear = true;
    COL.document.eventable = false;
    COL.document.drawtype = "function";
    //COL.Debug.on();
    //COL.Debug.eleinfo=true;

    //初始宽高数据
    var w = 3520, //window.innerWidth,
        h = 616; //window.innerHeight;
    var cr = (w > h ? h : w) / 2;
    //禁用右键菜单
    canvas.addEventListener("contextmenu", function(e) {
        e.preventDefault();
    });

    function drawlayerInit(){

        return new Promise(function(resolve,reject){
            //波形层
            var wavelayer = COL.Graph.New();
            wavelayer.relativesize.width = 1;
            wavelayer.relativesize.height = 1;
            wavelayer.wavearray = new Uint8Array(2048);
            wavelayer.drawfunction = function(ct) {
                if (wavelayer.wavearray) {
                    var sum = 0;
                    ct.beginPath();
                    ct.strokeStyle = "rgba(255, 0, 0, 0.84)";
                    ct.lineWidth = 20;
                    // ct.moveTo(1,COL.height/2);
                    for (var i = 0, _len = wavelayer.wavearray.length; i < _len; i++) {
                        var value = wavelayer.wavearray[i];
                        if (value > 128) sum += value;

                        // ct.lineTo(COL.width / _len * (i + 1), (value - 128) / 2 + COL.height / 2);
                        ct.lineTo(COL.width / _len * (i + 1), (value - 128) * 2.5 + 308);
                    }
                    ct.stroke();
                    GLOBAL_SUN = sum;
                    // Debugwave.height=sum/512;
                }
            };
            COL.document.addChild(wavelayer);

            //以较低频率定时获取波形
            setInterval(function() {
                analyser.getByteTimeDomainData(wavelayer.wavearray);
                // analyser.getByteTimeDomainData(cavelayer2.wavearray);
            }, 1000 / 50);
            resolve();
        });
    }



    // var cas = document.querySelector('canvas');

    var GLOBAL_SUN = 0;
    var TIMECONTRL = 0;

    function drawSlideCircle(){

    }

    //两边的小圆
    var sidecircletemple = Glib.getGraphObj("arc", {
        r: cr * 0.5,
        fillColor: "rgba(102, 102, 102, 0.4)"
    });
    sidecircletemple.relativerotatecenter.x = 0.5;
    sidecircletemple.relativerotatecenter.y = 0.5;
    sidecircletemple.relativepositionpoint.x = 0.5;
    sidecircletemple.relativepositionpoint.y = 0.5;
    //sidecircletemple.Composite="source-out";

    var sidecirclearr = [];
    (function() {
        //var 
        for (var i = 0; i < 4; i++) {
            sidecirclearr[i] = sidecircletemple.New(true, false, true);
            sidecirclearr[i].offsetzoom = 0;
            COL.Graph.Eventable(sidecirclearr[i]);
            COL.document.addChild(sidecirclearr[i]);
        }
    })();
    sidecirclearr[1].relativeposition = {
        x: 1,
        y: 0
    };
    sidecirclearr[2].relativeposition = {
        x: 0,
        y: 1
    };
    sidecirclearr[3].relativeposition = {
        x: 1,
        y: 1
    };

    //星星层
    var starlayer = COL.Graph.New();
    starlayer.relativesize.width = 1;
    starlayer.relativesize.height = 1;
    starlayer.needsort = false;
    COL.document.addChild(starlayer);

    //圆圈框架
    var circleframe = COL.Graph.New();
    circleframe.zoom.x = 0.86;
    circleframe.zoom.y = 0.86;
    circleframe.relativesize.width = 1;
    circleframe.relativesize.height = 1;
    circleframe.relativerotatecenter.x = 0.5;
    circleframe.relativerotatecenter.y = 0.5;
    circleframe.relativeposition.x = 0.5;
    circleframe.relativeposition.y = 0.5;
    circleframe.relativepositionpoint.x = 0.5;
    circleframe.relativepositionpoint.y = 0.5;
    COL.document.addChild(circleframe);

    //频率条框架
    var pinlvbarframe = COL.Graph.New({
        width: 0,
        height: 0
    });
    pinlvbarframe.relativeposition.x = 0.5;
    pinlvbarframe.relativeposition.y = 0.5;
    pinlvbarframe.rotate = 45;
    circleframe.addChild(pinlvbarframe);

    //后方黑圆(最外层圆圈)
    var backcircle = Glib.getGraphObj("arc", {
        r: cr * 0.96,
        fillColor: "rgba(245, 64, 64, 0.79)",
        anticlockwise: false,
        opacity: 0.5
    });
    backcircle.relativeposition.x = 0.5;
    backcircle.relativeposition.y = 0.5;
    backcircle.relativepositionpoint.x = 0.5;
    backcircle.relativepositionpoint.y = 0.5;
    backcircle.relativerotatecenter.x = 0.5;
    backcircle.relativerotatecenter.y = 0.5;
    circleframe.addChild(backcircle);

    var framezoominterval; //整体框架缩放定时器

    //coding圆圈,内存圆圈
    var codingcircle = Glib.getGraphObj("arc", {
        r: cr * 0.75,
        fillColor: "rgba(255,255,255,1)",
        anticlockwise: false,
        borderWidth: cr * 0.08,
        borderColor: "#353535"
    });
    circleframe.addChild(codingcircle);
    COL.Graph.Eventable(codingcircle);
    codingcircle.relativeposition.x = 0.5;
    codingcircle.relativeposition.y = 0.5;
    codingcircle.relativepositionpoint.x = 0.5;
    codingcircle.relativepositionpoint.y = 0.5;
    codingcircle.relativerotatecenter.x = 0.5;
    codingcircle.relativerotatecenter.y = 0.5;
    // codingcircle.Composite = "source-atop";
    codingcircle.Composite = "destination-out";

    //星星模板
    var startemplate = Glib.getGraphObj("star", {
        r: cr * 0.126,
        color: "#FAFD02"
    });
    startemplate.opacity = 0;

    function a_star() {
        this.g = startemplate.New(true, true);
        this.g.x = rand(0, COL.width);
        this.g.y = rand(0, COL.height);
        this.dera = [1, -1][rand(0, 1)];
        this.full = false;
        starlayer.addChild(this.g);
        this.time = setInterval(a_star_fun, 1000 / 30, this);
    }
    var a_star_fun = function(t) {
        t.g.rotate = minus(t.g.rotate, t.g.rotate - 8 * t.dera, 0.5);
        if (t.full) {
            t.g.opacity = minus(t.g.opacity, 0, 0.04);
            if (t.g.opacity <= 0.01) {
                clearInterval(t.time);
                COL.Graph.Delete(t.g);
                delete t;
                return;
            }
        } else {
            t.g.opacity = minus(t.g.opacity, 1, 0.1);
            if (t.g.opacity >= 0.99) t.full = true;
        }
    }

    var array = new Uint8Array(640),
        averagepinlv = 0;
    var valley = 0,
        laststat = false,
        heavyrecord = 0;
    var cturn = [0.6, 0.4, 0.2, 0.45, 0.5, 0.4, 0.6, 0.3, 0.3, 0.4, 0.56, 0.61, 0.3, 0.6, 0.4, 0.3, 0.6, 0.4];

    function changecolor() {
        cturn.push(cturn.shift());
    }

    function beforedraw() { //绘制前处理函数
        if (!launched) {
            codingcircle.setZoom(minus(codingcircle.zoom.x, 1, 0.01, speed));
            if (codingcircle.zoom.x < 1.02) {
                launched = true;
            }
        }
        averagepinlv = 0;
        if (!redzoominterval) {
            codingcircle.zoom.x = codingcircle.zoom.y = minus(codingcircle.zoom.x, 1, 0.08, speed);
        }
        backcircle.zoom.x = backcircle.zoom.y = minus(backcircle.zoom.x, codingcircle.zoom.x, 0.05, speed);
        if (analyser) {
            analyser.getByteFrequencyData(array);
            var tmpavgpinlv = 0;
            heavyrecord = (array[2] * 1.2 + array[0] * 1.1) / 2;
            var pre, co;
            for (var iplc = pinlvbar.length; iplc--;) {
                var a = pinlvbar[iplc];
                if (iplc < 4 && sidecirclearr) {
                    pre = array[iplc * 5] / 255;
                    co = pre * 255 / 0.564;
                    sidecirclearr[iplc].zoom.x = sidecirclearr[iplc].zoom.y = 1 + pre * 0.2 + sidecirclearr[iplc].offsetzoom;
                }
                if (iplc >= 59) tmpavgpinlv += array[iplc * 5];
                a.height = minus(a.height, 0, 0.06 * speed);
                if (Debug.rawFrequency) {
                    a.height = array[iplc * 5] * cr / 255;
                } else if (a.height < array[iplc * 5] - 100) {
                    a.height = array[iplc * 5] * cr / 255 * 10.7;
                }

            }
            // a.height *= 3;
            sidecircletemple.fillColor = "rgba(" + ((co * cturn[0] + 0.5) | 0) + "," + ((co * cturn[1] + 0.5) | 0) + "," + ((co * cturn[2] + 0.5) | 0) + "," + pre * 0.8 + ")";
            pinlvbartemple.backgroundColor = "rgba(" + (255 - (co * cturn[0] + 0.5) | 0) + "," + (255 - (co * cturn[1] + 0.5) | 0) + "," + (255 - (co * cturn[2] + 0.5) | 0) + ",0.8)";

            averagepinlv = tmpavgpinlv / 69 * 0.8 + heavyrecord * 1.5;
            if (averagepinlv > valley + 17) {
                valley = averagepinlv;
                suo();
                changecolor();
            }
            if (averagepinlv < valley) {
                valley = averagepinlv;
            }

            //调整星星位置
            backrate = 4.4 * pre;
            var snode = starlayer.childNode;
            var cx = COL.width / 2,
                cy = COL.height / 2,
                sn;
            var cline = Math.sqrt(cx * cx, cy * cy);
            for (var i in snode) {
                sn = snode[i];
                var line = Math.sqrt(Math.pow(cx - sn.x, 2) + Math.pow(cy - sn.y, 2));
                sn.setZoom(line / cline + 0.2);
                sn.x -= backrate * (cx - sn.x) / line;
                sn.y -= backrate * (cy - sn.y) / line;
            }
        }


    }


    var redzoominterval;
    //中央圆圈缩进
    function suo() {
        //缩小比例 0.938
        if (codingcircle.zoom.x <= 0.938) {
            return;
        }
        if (redzoominterval) clearInterval(redzoominterval);
        redzoominterval = setInterval(function() {
            codingcircle.zoom.x = codingcircle.zoom.y = minus(codingcircle.zoom.x, 0.93, 0.87 * speed);
            if (codingcircle.zoom.x <= 0.935) {
                clearInterval(redzoominterval);
                redzoominterval = 0;
            }
        }, 1000 / 30);
        // new a_star();
        // new a_star();
    }


    //频率条模板
    var pinlvbartemple = COL.Graph.New({
        width: codingcircle.r * 2 * 3.141592653 / 138,
        height: 500,
        y: codingcircle.r,
        backgroundColor: "rgba(78, 145, 245, 0.29)"
    });
    pinlvbartemple.relativerotatecenter.x = 0.5;
    pinlvbartemple.relativepositionpoint.x = 0.5;
    pinlvbartemple.rotatecenter.y = -codingcircle.r;
    //生成128个频率条
    var pinlvbar = [];
    for (var i = 0; i < 128; i++) {
        pinlvbar[i] = pinlvbartemple.New(true);
        pinlvbar[i].rotate = 360 / 128 * i;
        pinlvbarframe.addChild(pinlvbar[i]);
    }



    (function() {
        var dir = 0.09;
        codingcircle.rotate = 0;
        window.cctm = setInterval(function() {
            if (!audio.paused) {
                codingcircle.rotate += dir;
                if (codingcircle.rotate > 10) dir = -0.09;
                if (codingcircle.rotate < -10) dir = 0.09;
            }
        }, 70);
    })();


    //音频上下文
    var audioCtx = new window.AudioContext();
    var audio = new Audio();
    var meAudioSourceNode = audioCtx.createMediaElementSource(audio);
    var analyser = audioCtx.createAnalyser();
    var gainNode = audioCtx.createGain();
    meAudioSourceNode.connect(gainNode);
    meAudioSourceNode.connect(analyser);
    gainNode.connect(audioCtx.destination);


    //音乐控制
    audio.onended = function() {
        console.log('播放完毕');
    };


    codingcircle.setZoom(5);


    var launched = false;
    //若歌曲不在播放且在前台，就定时打节奏
    setInterval(function() {
        if (launched && !document.hidden && audio.paused) suo();
    }, 1100);


    var START_DRAW_CENTER = false;
    function drawStart(){
        if(START_DRAW_CENTER){
            beforedraw();
        }
        // beforedraw(); //执行绘制前函数
        COL.draw(); //绘制
        requestAnimationFrame(drawStart);
    }

    return {
        //开始
        start:function(){
            return new Promise(function(resolve,reject){
                audio.pause();
                audio.src = 'assets/music.mp3';
                audio.play();
                resolve();
            });
        },
        drawlayerInit:drawlayerInit,
        //开始绘制
        startdraw:function(){
            drawStart();
            return Promise.resolve();
        },

        startCenterDraw:function(){
            START_DRAW_CENTER = true;
            return Promise.resolve();
        },
        removeAndStopCanvas:function(){
            
        }


    };
})();

