var width = window.innerWidth
var height = window.innerHeight
var game = new Phaser.Game(1024,672,Phaser.AUTO,'game')
var children = ['child1','child2','child3']
var level = 0,scaleX,scaleY


// 物理引擎：需要game.add.sprite() 对象
//Box2D:
// 引入box2d插件,设置启动物理引擎 game.physics.startSystem()
// game.physics.box2d.restitution 设置效果, 如弹性等,最大值为1 , 为全局设置
// game.physics.box2d.setBoundsToWorlds() 设置世界边框 , 为全局设置
// 通过 game.physics.box2d.enable() 将元素设置物理效果,其中第一个参数可为列表
// sprite.body.setBodyContactCallback() 碰撞检测
// sprite.body.setCategoryPostsolveCallback() 碰撞检测可检测碰撞后的状态即逐渐静止
// sprite.body.fixedRotation = true 设置为固定不旋转
// sprite.body.static = true  设置为静态固定的
// 在销毁元素的时候要销毁sprite.body


// ARCADE
// 全局设置的相同的
// game.phyics.arcade.enable(sprite) 将元素添加到物理引擎中, 其中第一个参数可为列表
// 还可以通过 game.physics.enable(sprite,Phaser.Physics.ARCADE)添加
// sprite.body.immovable = true 设置元素固定
// game.physics.arcade.overlap() 无效果的碰撞检测
// game.physics.arcade.collide() 有效果的碰撞检测
// 碰撞检测需要再 update 中检测



var states = {
  preload:function(){
    console.log("preload")
    this.preload = function(){
      if(width < height){
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
      }else{
        game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT
      }
      game.load.spritesheet('dodo-loading', 'img/dodo-loading.png',400,360,13,0,2)
      game.load.image('bg','img/bg.png')
    }
    this.create = function(){
      console.log("preload create")
      game.state.start("created")
    }
  },
  created:function(){
    console.log("created")
    this.preload = function(){
      game.load.atlas('flower', 'img/huahua.png', 'img/huahua.json')
      game.load.image('btn_home','img/btn_home.png')
      game.load.image('btn_nosnd','img/btn_nosnd.png')
      game.load.image('btn_snd','img/btn_snd.png')
      game.load.image('btn_replay','img/btn_replay.png')
      game.load.image('child1','img/child1.png')
      game.load.image('child2','img/child2.png')
      game.load.image('child3','img/child3.png')
      game.load.image('huapen','img/huapen.png')
      game.load.image('line','img/line.png')
      game.load.image('point','img/point.png')
      game.load.image('muban','img/muban.png')
      game.load.image('tengman','img/tengman.png')
      game.load.image('start','img/start.png')
      game.load.image('back','img/back.png')
      game.load.audio('bg_sound', 'sounds/snake_bg.mp3')

      var bg = game.add.sprite(0,0,'bg')
      bg.width = game.world.width
      bg.height = game.world.height
      var bgImg = game.cache.getImage('bg')
      scaleY = bg.height / bgImg.height
      scaleX = bg.width / bgImg.width

      var dodo_load = game.add.sprite(game.world.centerX,game.world.centerY - (100 * scaleY), 'dodo-loading')
      dodo_load.anchor.setTo(0.5,0.5)
      dodo_load.animations.add('play',[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
      dodo_load.play('play',15,true)
      if(scaleX < 1)dodo_load.scale.x = dodo_load.scale.y = scaleX

      var progressText = game.add.text(game.world.centerX, game.world.height - (200 * scaleY),'0%',{
        fontSize:'60px',
        fill:'#ffffff'
      })
      progressText.anchor.setTo(0.5,0.5)
      game.load.onFileComplete.add(function(progress){
        progressText.text = progress + '%'
      })

      game.load.onLoadComplete.add(onLoad)
      var dealine = false
      setTimeout(function(){
        dealine = true
      },1000)
      function onLoad(){
        if(dealine){
          // game.state.start('')
          return
        }else{
          setTimeout(onLoad,1000)
        }
      }
    }
    this.create = function(){
      level = 0
      game.state.start('play')
 /*     game.input.onTap.add(function(){
        game.state.start('play')
      })*/
    }
  },
  play:function(){
    console.log("play")
    var child,currentLine,huapen,points,group
    var isDown = false,isStart = false,isOver,lines,groups,isComplete

    this.create = function(){
      game.physics.startSystem(Phaser.Physics.BOX2D)
      game.physics.box2d.gravity.y = 400
      game.physics.box2d.restitution = 0.6
      game.physics.box2d.setBoundsToWorld()
      // game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT

      game.input.mouse.capture = true //取消冒泡
      points = []
      lines = []  //存放edge
      groups = [] //存放graphics
      isDown = false,isStart = false,isOver = false,isComplete = false
      var bg_sound = game.add.audio('bg_sound',1,true)
      bg_sound.play()

      var bg = game.add.image(0,0,'bg')
      bg.width = game.world.width
      bg.height = game.world.height

      var btnGroup = game.add.group()
      btnGroup.inputEnableChildren = true
      btnGroup.onChildInputDown.add(function(evt){
        // console.log(evt.key)
        if(evt.key == "btn_home"){
          window.location = "//dodobaike.com/learning/student_navigation/"
        }else if(evt.key == "btn_replay"){
          game.state.start('play')
        }else if(evt.key == "btn_snd"){
          btnGroup.getAt(3).visible = true
          evt.visible = false
          bg_sound.pause()
        }else if(evt.key == "btn_nosnd"){
          btnGroup.getAt(2).visible = true
          evt.visible = false
          bg_sound.play()
        }
      })
      // btnGroup.create()
      //菜单按钮

      var btn_home = btnGroup.create(game.world.width * 0.96,game.world.height * 0.05,'btn_home')
      btn_home.anchor.setTo(0.5,0.5)
      btn_home.scale.set(scaleY)
      var btn_replay = btnGroup.create(game.world.width * 0.82,game.world.height * 0.05,'btn_replay')
      btn_replay.anchor.setTo(0.5,0.5)
      btn_replay.scale.set(scaleY)
      var btn_snd = btnGroup.create(game.world.width * 0.89,game.world.height * 0.05,'btn_snd')
      btn_snd.anchor.setTo(0.5,0.5)
      btn_snd.scale.set(scaleY)
      var btn_nosnd = btnGroup.create(game.world.width * 0.89,game.world.height * 0.05,'btn_nosnd')
      btn_nosnd.anchor.setTo(0.5,0.5)
      btn_nosnd.scale.set(scaleY)
      btn_nosnd.visible = false
      // console.log(btnGroup)

      var tengman = game.add.image(0, 60 * scaleY,'tengman')
      var tengmanImg = game.cache.getImage('tengman')
      tengman.width = bg.width
      tengman.height = tengman.width / tengmanImg.width * tengmanImg.height

      var child_type = children[Math.floor(Math.random()*children.length)]
      child = game.add.sprite(game.world.centerX, 90 *scaleY, child_type)
      child.anchor.setTo(0.5,0.5)
      child.scale.set(scaleY)

      huapen = game.add.sprite(game.world.centerX,game.world.height - (150*scaleY), 'huapen')
      huapen.anchor.setTo(0.5,0.5)
      huapen.scale.set(scaleY)

      var back = game.add.image(50*scaleY, game.world.height - (50*scaleY), 'back')
      var start = game.add.image(game.world.width - (50*scaleY), game.world.height - (50*scaleY), 'start')
      back.scale.set(scaleY)
      start.scale.set(scaleY)
      start.anchor.setTo(0.5, 0.5)
      back.anchor.setTo(0.5, 0.5)
      //给按钮添加点击事件
      start.inputEnabled = true
      start.events.onInputDown.add(function(evt){
        if(evt.key == 'start') {
          isStart = true
          tengman.destroy()
          game.physics.box2d.enable([child, currentLine])
          child.body.setCircle(20 * scaleY)
          currentLine.body.static = true
          child.body.setBodyContactCallback(huapen,huapenCallback,this)
          child.body.setBodyContactCallback(group,huapenCallback,this)
          child.body.setCategoryPostsolveCallback(0x8000, callback, this);

          var childTimer = game.time.create(true)
          childTimer.add(13000,function(){
            if(!isOver){
              // console.log("over!!!")
              game.state.start("play")
            }
          })
          childTimer.start()
        }
      })
      back.inputEnabled = true
      back.events.onInputDown.add(function(evt){
        if(evt.key == 'back' && !isStart){
          group.destroy()
          for(var j = 0; j < groups.length;j++){
            groups[j].destroy()
          }
          for(var index = 0; index < lines.length;index++){
            var line = lines[index]
            for(var i =0; i < line.length; i++){
              line[i].destroy()
            }
          }
        }
      })
      function callback(body1, body2, fixture1, fixture2, contact, impulseInfo) {
        //检测触碰到四周
        // console.log("碰到世界框了")
        // body1 is the ship because it's the body that owns the callback
        // body2 is the body it impacted with, in this case the world boundary
        // fixture1 is the fixture of body1 that was touched
        // fixture2 is the fixture of body2 that was touched
        // impulseInfo is a box2d.b2ContactImpulse object

        // The impulse info is split into a normal component (used to push the ship directly out of the wall)
        // and a tangential component (along the wall surface like friction, causes the ship to spin around)
        if (impulseInfo.count > 0) {
          // console.log(impulseInfo.normalImpulses[0])
          // console.log(impulseInfo.tangentImpulses[0])
          // console.log(body2)
          if(impulseInfo.normalImpulses[0] < 0.1){
            // console.log("over !!")
            // child.destroy()
            game.state.start('play')
          }
        }

      }
      function huapenCallback(body1, body2, fixture1, fixture2, begin){
        //检测碰撞到花盆
        // console.log(begin)
        if(begin){
          if(body2.sprite){
            isOver = true
            // console.log("game over")
            var flower = game.add.sprite(body2.sprite.x, body2.sprite.y , 'flower')
            flower.anchor.setTo(0.5,0.5)
            var anim = flower.animations.add('play')
            flower.scale.set(scaleY)
            body1.sprite.destroy()
            body2.sprite.destroy()
            flower.play('play',10)
            anim.onComplete.add(function(){
              // console.log("donghuawanbi")
              if(level < contentConfig.content.length - 1){
                level +=1
                game.state.start('play')
              }else{
                game.state.start('over')
              }
            })
          }
        }/*else{
          if(!body2.sprite){
          }
        }*/
      }

      group = new Phaser.Physics.Box2D.Body(this.game, null, 0, 0);
      group.static = true

      var line = game.add.image(game.world.centerX,game.world.height - (30 * scaleY), 'line')
      line.anchor.setTo(0.5, 0.5)
      line.scale.set(scaleX,scaleY)

      //给元素添加到物理引擎
      game.physics.box2d.enable(huapen)
      huapen.body.fixedRotation = true
      huapen.body.static = true

      game.input.onDown.add(function(pointer,evt){
        // console.log("按下")
        if(!isDown && evt.key != "start"){
          isDown = true
          currentLine = game.add.graphics(0,0)
          currentLine.moveTo(pointer.x,pointer.y)
          points = []
        }
      })
      game.input.onUp.add(function(){
        isDown = false
        groups.push(currentLine)
        lines.push(points)
        var point_line = lines[lines.length - 1]
        for(var i = 0 ; i < point_line.length - 1;i++){
          var point = point_line[i]
          group.addEdge(point.x,point.y,point_line[i+1].x,point_line[i+1].y)
        }
        if(line.scale.x <= 0){
          isComplete = true
        }
      })
      game.input.addMoveCallback(function(pointer){
        if(isDown && !isStart){
          // console.log("move")
          if(!isComplete){
            currentLine.lineStyle(10 * scaleY, 0xFF700B, 1).lineTo(pointer.x,pointer.y)
            var point = game.add.sprite(pointer.x,pointer.y,'point')
            point.anchor.setTo(0.5,0.5)
            point.scale.set(scaleY)
            points.push(point)
          }
          if(line.scale.x >= 0){
            if(scaleX < 1)line.scale.x -= 0.02
            else{line.scale.x -= 0.02 * scaleX}
          }else{
            isComplete = true
          }
          // console.log(line.scale.x)
        }
      })


      var config = contentConfig.content[level]
      for(var i= 0 ; i < config.children.length;i++){
        var children_config = config.children[i]
        var muban = game.add.sprite(children_config.x * scaleX,children_config.y * scaleY,children_config.id)
        var mubanImg = game.cache.getImage(children_config.id)
        muban.width = mubanImg.width * scaleY
        muban.height = mubanImg.height * muban.width / mubanImg.width
        muban.anchor.setTo(0.5,0.5)
        // muban.rotation = 30
        // console.log(muban)
        game.physics.box2d.enable(muban)
        if(children_config.rotation) muban.body.rotation = children_config.rotation
        muban.body.static = true
      }
    }
    this.render = function(){
      // game.debug.box2dWorld()
    }
    this.update = function() {
      // if(isStart) {console.log(child)}
    }
  },
  over:function(){
    console.log("game over")
    this.create = function(){
      level = 0
      var bg = game.add.sprite(0,0,'bg')
      bg.width = game.world.width
      bg.height = game.world.height
      var title = game.add.text(game.world.centerX, game.world.centerY, '游戏结束,点击任意从新开始游戏', {
        fontSize:'50px',
        fill:'#f2bb15'
      })
      title.anchor.setTo(0.5,0.5)
      // game.state.start('play')
      game.input.onTap.add(function(){
        game.state.start('play')
      })
    }
  },
  update:function(){
    console.log("update")
  },
  render:function(){
    console.log("render")
  }
}

Object.keys(states).map(function(key){
  game.state.add(key,states[key])
})

game.state.start('preload')