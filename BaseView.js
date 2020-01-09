// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: { //注册
        // 这个属性引用了Barrel预制资源
        BarrelPrefab: {
            default: null,
            type: cc.Prefab
        },
        // 这个属性引用了Food预制资源
        FoodPrefab: {
            default: null,
            type: cc.Prefab
        },
        m_Tom:cc.Node,//字典，m_Tom是键，cc.Node是值（写上m_Tom的类型）
        m_Jerry:cc.Node,
        m_Boom:cc.Node,//碰撞效果
        m_BtDown:cc.Button,
        m_BtJump:cc.Button,
        m_Back1:[cc.Node],//定义为数组，可以多放Node
        m_Back2:[cc.Node],
        m_Floor:[cc.Node],
        newBarrel:cc.Node,
        newFood:cc.Node,
        closerX:0,

        //游戏结束画面组件
        m_BtRetry:cc.Button,
        m_BtExit:cc.Button,
        GameOver:cc.Node,

        //数值组件
        scoreDisplay: {
            default: null,
            type: cc.Label
        },
        hpDisplay: {
            default: null,
            type: cc.Label
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        cc.log('正常运行');
        this.score = 0;
        this.hp = 3;
        this.m_Tom = this.m_Tom.getComponent(cc.Animation);
        this.m_Jerry = this.m_Jerry.getComponent(cc.Animation);
        this.m_Boom = this.m_Boom.getComponent(cc.Animation);
        //暂停游戏结束界面节点上注册的所有节点系统事件，节点系统事件包含触摸和鼠标事件
        this.m_BtRetry.node.pauseSystemEvents();
        this.m_BtExit.node.pauseSystemEvents();
        //隐藏游戏结束界面
        this.GameOver.active = false;
        //Tom和Jerry初始进行奔跑
        this.m_Tom.play('TomRun');
        this.myJerryPlay('Run');
        //Tom靠近时的距离
        this.closerX = (this.m_Jerry.node.x-this.m_Tom.node.x)/3;
        //滑铲动作
        this.m_BtDown.node.on(cc.Node.EventType.TOUCH_START,this.touchStart,this);
        this.m_BtDown.node.on(cc.Node.EventType.TOUCH_END,this.touchEnd,this);
        this.m_BtDown.node.on(cc.Node.EventType.TOUCH_CANCEL,this.touchEnd,this);
        //跳跃动作
        this.m_BtJump.node.on(cc.Node.EventType.TOUCH_START,this.uptouchStart,this);
        this.m_BtJump.node.on(cc.Node.EventType.TOUCH_END,this.uptouchEnd,this);
        this.m_BtJump.node.on(cc.Node.EventType.TOUCH_CANCEL,this.uptouchEnd,this);
        // 生成一个新的Barrel
        this.newBarrel = this.spawnNewBarrel();
        this.newFood = this.spawnNewFood();


        //定义两背景位置再播放动作
        for(var i = 0; i < this.m_Back1.length;i++){
            window.width = this.m_Back1[i].width;//定义第一层（最里层）背景宽度
            this.m_Back1[i].setPosition(i*(width-6),0);

            var moveImgLeft = cc.moveTo((i+1)*SkyBackMoveTime,-(width-6),0);
            var seq = cc.sequence(moveImgLeft,cc.callFunc(this.backMoveEnd,this,SkyBackMoveTime));
            this.m_Back1[i].runAction(seq);
        }
        for(var i = 0; i < this.m_Back2.length;i++){
           //window.width = this.m_Back2[i].width;//定义两倍屏幕宽度的第二层背景宽度
            this.m_Back2[i].setPosition(i*1716,0);

            var moveImgLeft = cc.moveTo((i+1)*HouseBackMoveTime,-(1716-6),0);
            var seq = cc.sequence(moveImgLeft,cc.callFunc(this.backMoveEnd,this,HouseBackMoveTime));
            this.m_Back2[i].runAction(seq);
        }
        for(var i = 0; i < this.m_Floor.length;i++){
            //window.width = this.m_Floor[i].width;//定义第三层背景宽度
            this.m_Floor[i].setPosition(i*858,0);

            var moveImgLeft = cc.moveTo((i+1)*FloorBackMoveTime,-(858-28),0);
            var seq = cc.sequence(moveImgLeft,cc.callFunc(this.backMoveEnd,this,FloorBackMoveTime));
            this.m_Floor[i].runAction(seq);
        }
    },



    //一、背景和人物动画
    //背景图左移到底后再置于最前
    backMoveEnd:function(target,BackTime){
        var width = target.width;
        target.setPosition((width-6),0);

        var moveImgLeft = cc.moveTo(BackTime*2,-(width-6),0);
        var seq = cc.sequence(moveImgLeft,cc.callFunc(this.backMoveEnd,this,BackTime));
        target.runAction(seq);
    },
    

    callBackDownOver:function(){
        this.myJerryPlay('Run');
    },

    touchStart:function(){//按下（滑铲键）
        if(this.m_Jerry.currentClip.name == 'Jump' ){//判断落地才能继续
            return;
        }
        this.myJerryPlay('Down');
    },
    touchEnd:function(){//松开（滑铲键）
        if(this.m_Jerry.currentClip.name == 'Jump' ){//判断落地才能继续
            return;
        }
        this.myJerryPlay('Run');
    },
    uptouchStart:function(){//按下（跳跃键）
        if(this.m_Jerry.currentClip.name == 'Jump' ){//判断落地才能继续
            return;
        }
        this.onAnimationChange('Jump');
    },
    uptouchEnd:function(){//松开（跳跃键）
        if(this.m_Jerry.currentClip.name == 'Jump' ){//判断落地才能继续
            return;
        }
        this.myJerryPlay('Run');
    },

    onAnimationChange: function (data) {
        if(this.m_Jerry.currentClip.name == 'Jump' ){//判断落地才能继续
            return;
        }
        if(this.m_Jerry.currentClip.name == 'Down' ){//判断落地才能继续
            if (data == 'Jump') {
                var moveUp = cc.moveTo(0.4, -101.968, -51.87).easing(cc.easeCubicActionOut());
                var moveDown = cc.moveTo(0.4, -101.968, -151.87).easing(cc.easeCubicActionOut());
                var callBack = cc.callFunc(this.callBackDownOver.bind(this), this.m_Jerry.node, this);
                var seq = cc.sequence(moveUp, moveDown, callBack);
                this.m_Jerry.node.runAction(seq);
                cc.log('Jerry的位置在'+this.m_Jerry.node.x+','+this.m_Jerry.node.y);
            }
        }
        if (data == 'Jump') {
            var moveUp = cc.moveTo(0.3, -101.968, -81.87).easing(cc.easeCubicActionOut());
            var moveDown = cc.moveTo(0.3, -101.968, -151.87).easing(cc.easeCubicActionOut());
            var callBack = cc.callFunc(this.callBackDownOver.bind(this), this.m_Jerry.node, this);
            var seq = cc.sequence(moveUp, moveDown, callBack);
            this.m_Jerry.node.runAction(seq);
            cc.log('Jerry的位置在'+this.m_Jerry.node.x+','+this.m_Jerry.node.y);
        }
        this.myJerryPlay(data);
    },
    myJerryPlay:function(playName)//滑铲时移动位置
    {
        if( playName == 'Down' )
        {
            this.m_Jerry.node.setPosition(-101.968,-154.592);
        }
        else if( playName == 'Run')
        {
            this.m_Jerry.node.setPosition(-101.968,-151.87);
        }
        this.m_Jerry.play(playName);
    },





    //二、障碍物和食物
    //产生新Barrel
    spawnNewBarrel: function() {
        // 使用给定的模板在场景中生成一个新节点
        var newBarrel = cc.instantiate(this.BarrelPrefab);
        // 将新增的节点添加到 BaseView 节点下面
        this.node.addChild(newBarrel);

        // 为Barrel设置一个初始位置
        newBarrel.setPosition(this.getNewBarrelPosition());
        // 设定Barrel动画
        var moveImgLeft = cc.moveTo(BarrelBackMoveTime,-(858-14),-152.131);
        var seq = cc.sequence(moveImgLeft,cc.callFunc(this.barrelBackMoveEnd,this,BarrelBackMoveTime));
        newBarrel.runAction(seq);
        return newBarrel;
    },
    //获取Barrel位置
    getNewBarrelPosition: function () {
        var randX = 0;
        // 根据地平面位置，得到一个Barrel的 y 坐标
        var randY = -152.131;
        // 根据屏幕宽度，得到一个Barrel x 坐标
        var maxX = 858;
        randX = maxX + 858;
        // 返回Barrel坐标
        return cc.v2(randX, randY);
    },
    //Barrel左移到底后再置于最前
    barrelBackMoveEnd:function(target,BackTime){
        target.setPosition(this.getNewBarrelPosition());

        var moveImgLeft = cc.moveTo(BackTime,-(858-14),-152.131);
        var seq = cc.sequence(moveImgLeft,cc.callFunc(this.barrelBackMoveEnd,this,BackTime));
        target.runAction(seq);
    },

    //产生新Food
    spawnNewFood: function() {
        // 使用给定的模板在场景中生成一个新节点
        var newFood = cc.instantiate(this.FoodPrefab);
        // 将新增的节点添加到 BaseView 节点下面
        this.node.addChild(newFood);

        // 为Food设置一个初始位置
        newFood.setPosition(this.getNewFoodPosition());
        // 设定Food动画
        var moveImgLeft = cc.moveTo(BarrelBackMoveTime + 2,-(858-14),-81.87);
        var seq = cc.sequence(moveImgLeft,cc.callFunc(this.FoodBackMoveEnd,this,BarrelBackMoveTime + 2));
        newFood.runAction(seq);
        return newFood;
    },
    //获取Food位置
    getNewFoodPosition: function () {
        var randX = 0;
        // 根据地平面位置，得到一个Food的 y 坐标
        var randY = -81.87;
        // 根据屏幕宽度，得到一个Food x 坐标
        var maxX = 1058;
        randX = maxX + 1058;
        // 返回Food坐标
        return cc.v2(randX, randY);
    },
    //Food左移到底后再置于最前
    FoodBackMoveEnd:function(target,BackTime){
        target.setPosition(this.getNewFoodPosition());

        var moveImgLeft = cc.moveTo(BackTime,-(858-14),-81.87);
        var seq = cc.sequence(moveImgLeft,cc.callFunc(this.FoodBackMoveEnd,this,BackTime));
        target.runAction(seq);
    },

    //2.1碰撞检测
    getJerryDistance: function () {
        // 根据 Jerry 节点位置判断距离
        var JerryPos = this.m_Jerry.node.getPosition();
        // 根据两点位置计算两点之间距离
        var dist = this.newBarrel.position.sub(JerryPos).mag();
        return dist;
    },
    ontouched:function() {
        // 播放碰撞效果
        this.m_Boom.play('Boom');
        // Tom靠近，生命值减少
        var getClose = cc.moveTo(0.6,this.m_Tom.node.x+this.closerX,this.m_Tom.node.y);
        this.m_Tom.node.runAction(getClose);
        this.loseHp();
        // 然后销毁当前Barrel节点
        this.newBarrel.destroy();
        // 当Barrel被碰撞时，生成一个新的Barrel
        this.newBarrel = this.spawnNewBarrel();
    },

    //2.2被捕后的方法
    getCaught:function(){
        // 停止所有动画的播放
        this.m_Tom.node.stopAllActions();
        this.m_Tom.stop();
        this.m_Jerry.node.stopAllActions();
        this.m_Jerry.stop();
        this.m_Boom.node.stopAllActions();
        this.newBarrel.stopAllActions();
        this.newFood.stopAllActions();
        for(var i = 0; i < this.m_Back1.length;i++){
            this.m_Back1[i].stopAllActions();
        }
        for(var i = 0; i < this.m_Back2.length;i++){
            this.m_Back2[i].stopAllActions();
        }
        for(var i = 0; i < this.m_Floor.length;i++){
            this.m_Floor[i].stopAllActions();
        }
        // 弹出结束画面
        // 显示游戏结束界面
        this.GameOver.active = true;
        // 恢复注册
        this.m_BtRetry.node.resumeSystemEvents();
        this.m_BtExit.node.resumeSystemEvents();
    },
    //游戏结束后的两个按钮
    onSceneRetry:function (data) {
        cc.log('重试');
        cc.director.loadScene('GameScene');
        return;
    },
    onSceneExit:function (data) {
        cc.log('结束');
        cc.game.end();
        cc.director.end();
        return;
    },




    //三、得分与落命
    gainScore:function () {
        this.score += 1;
        // 更新 scoreDisplay Label 的文字
        this.scoreDisplay.string = 'Score : ' + this.score;
    },
    loseHp:function () {
        this.hp -= 1;
        // 更新 hpDisplay Label 的文字
        this.hpDisplay.string = '剩余生命值 : ' + this.hp;
    },
    //3.1拾取行为
    getFood:function () {
        // 若生命值小于3,Tom远离,生命值+1
        if(this.hp < 3){
            var getFarther = cc.moveTo(0.8,this.m_Tom.node.x-this.closerX,this.m_Tom.node.y);
            this.m_Tom.node.runAction(getFarther);
            this.hp += 1;
            // 更新 hpDisplay Label 的文字
            if(this.hp == 3)
            this.hpDisplay.string = '剩余生命值 : ' + this.hp + '(Max)';
            else
            this.hpDisplay.string = '剩余生命值 : ' + this.hp;
        }
        // 分数+1
        this.gainScore();
        // 销毁食物
        this.newFood.destroy();
        // 生成新食物
        this.newFood = this.spawnNewFood();
    },
    getJerryFoodDistance: function () {
        // 根据 Jerry 节点位置判断距离
        var JerryPos = this.m_Jerry.node.getPosition();
        // 根据两点位置计算两点之间距离
        var dist = this.newFood.position.sub(JerryPos).mag();
        return dist;
    },

    update: function (dt) {
        // 每帧判断Barrel和主角之间的距离是否小于碰撞距离
        if (this.getJerryDistance() < 10) {
            // 调用碰撞行为
            this.ontouched();
            cc.log('碰撞成功');
            return;
        }
        // 每帧判断Food和主角之间的距离是否小于拾取距离
        if (this.getJerryFoodDistance() < 15) {
            // 调用拾取行为
            this.getFood();
            cc.log('拾取成功');
            return;
        }
        // 每帧判断是否跨越成功
        if (Math.abs(this.m_Jerry.node.x - this.newBarrel.x) < 2.3) {
            // 调用碰撞行为
            this.gainScore();
            cc.log('跨越成功');
            return;
        }
        // 每帧判断Tom是否接触到Jerry
        if (this.m_Jerry.node.x-this.m_Tom.node.x < 5) {
            // 游戏结束
            this.getCaught();
            return;
        }
    },
    
});
