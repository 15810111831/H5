var game = new Phaser.Game(1024,672,Phaser.AUTO,'game')
var  states = {
  preload : function(){
    this.preload = function(){
      // console.log("preload")
      game.load.image('bg', 'images/bj.png')
      game.load.image('line', 'images/line.png')
      game.load.image('one', 'images/1.png')
      game.load.image('two', 'images/2.png')
      game.load.image('three', 'images/3.png')
      game.load.image('four', 'images/4.png')
      game.load.image('five', 'images/5.png')
      game.load.image('six', 'images/6.png')
      game.load.image('seven', 'images/7.png')
      game.load.image('eight', 'images/8.png')
      game.load.image('nine', 'images/9.png')
      game.load.image('ten', 'images/10.png')

      var progressText = game.add.text(game.world.centerX, game.world.centerY,'0%',{
        fontSize:'60px',
        fill:'#ffffff'
      })
      progressText.anchor.setTo(0.5,0.5)
      game.load.onFileComplete.add(function(progress){
        progressText.text = progress + '%'
      })
    }
    this.create = function(){
      game.state.start('create')
    }
  },
  create : function(){
    var graphics = null,group,target,move,positions
    this.init = function(){
      if(game.device.desktop){
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
      }else{
        game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT
        // game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
      }
      game.scale.pageAlignVertically = true
      game.scale.pageAlignHorizontally = true
    }
    this.create = function(){
      var numbersKey = ['one','two','three','four','five','six','seven','eight','nine','ten']
      game.add.image(0,0,'bg')
      graphics = game.add.graphics(0,0)
      var lineImg = game.cache.getImage('line')
      graphics.lineStyle(20, 0xff623b, 1).moveTo(game.world.centerX - lineImg.width / 2, 50).lineTo(game.world.centerX+lineImg.width / 2,50)
      var line = game.add.image(game.world.centerX,50,'line')
      line.anchor.setTo(0.5,0.5)

      var mask = game.add.graphics(0,0)
      mask.beginFill(0xffffff).drawRoundedRect(game.world.centerX - lineImg.width / 2 + 3,40,lineImg.width - 6,20,10)
      graphics.mask = mask
      game.add.tween(graphics).to({x:- game.world.centerX - 50,y:0},3000,Phaser.Easing.Linear.None,true,0,-1)

      var width = game.world.width
      group = game.add.group()
      // group.y = 480
      game.physics.arcade.enable(group)
      group.enableBody = true
      var row = Math.floor((width - 50) / 80)
      var column = 0
      positions = []
      // 初始化
      while (column < 7){
        for(let i=0;i<row;i++){
          positions.push([35 +(80) * i,game.world.height - 80*(column+1),false])
        }
        column++
      }
      for(var j =0,sum=positions.length;j<sum;j++){
        let position = positions[j]
        let number = group.create(position[0],position[1],numbersKey[Math.floor(Math.random()*numbersKey.length)])
        position[2] = true
        number.startX = position[0]
        number.startY = position[1]
        number.inputEnabled = true
        number.input.enableDrag()
        number.events.onDragStart.add(dragStart,this)
        number.events.onDragUpdate.add(dragUpdate,this)
        number.events.onDragStop.add(dragStop,this)
        group.setChildIndex(number,j)
        number.childIndex = j
      }
      group.setAll('body.collideWorldBounds',true)
    }
    this.update = function(){
     /* if(group.y < 0){
        console.log('game over')
      }*/
      if(graphics.x <= (- game.world.centerX - 50)){
        // var tween = game.add.tween(group).to({y:group.y-80},1000,Phaser.Easing.Linear.None,true)
      }
    }
    function dragStart(sprite,pointer){

    }
    function dragUpdate(sprite,pointer){
      if(sprite.y < 100)sprite.y = 100
      if(sprite.y > 592)sprite.y = 592
      if(sprite.x < 27)sprite.x = 27
      if(sprite.x > 927)sprite.x = 927

      for(var i=0;i<group.children.length;i++){
        var child = group.children[i]
        if(child == sprite)continue
        if(Math.abs(sprite.world.x - child.x) <= 70 && Math.abs(sprite.world.y - child.y)<=70){
          if(child.key != sprite.key){
            //左右
            if(Math.abs(child.y - sprite.world.y) <= 30 && child.x < sprite.world.x){
              if(sprite.x < (child.x + 70)){
                sprite.x = child.x + 70
                console.log("left")
              }
            }
            else if(Math.abs(child.y - sprite.world.y) <= 30 && child.x > sprite.world.x){
              if(sprite.x > (child.x - 70)){
                sprite.x = child.x - 70
                console.log("right")
              }
            }
            //上下
            else if(Math.abs(child.x - sprite.world.x) <= 30 && child.y < sprite.world.y){
              if(sprite.y < (child.y + 70) ){
                sprite.y  = child.y + 70
                console.log("up")
              }
            }
            else if(Math.abs(child.x - sprite.world.x) <= 30 && child.y > sprite.world.y){
              if(sprite.y > (child.y - 70) ){
                sprite.y = child.y - 70
                console.log("down")
              }
            }
            break
          }else{
            if(Math.abs(sprite.x - child.x) <= 50 && Math.abs(sprite.y - child.y)<= 50){
              createSprite(sprite,child)
              break
            }
          }
        }
      }
    }

    function dragStop(sprite,pointer){
      // 当拖拽结束后,判断如果当前位置附近有元素则判定这个元素是否与当前拖拽对象key值相等
      // 如果相等则消除两个元素,创建新元素放到这个元素的位置
      // 如果key值不相等,则将拖拽元素并不能越过这个元素,除非周围没有其他元素
      sprite.maxDown = sprite.maxLeft = sprite.maxUp = sprite.maxRight = undefined

      for(var i = 0; i < positions.length;i++){
        if(Math.abs(sprite.x - positions[i][0]) <= 40 && Math.abs(sprite.y - positions[i][1]) <= 40){
          if(!positions[i][2]){
            sprite.x = positions[i][0]
            sprite.y = positions[i][1]
            sprite.startX = positions[i][0]
            sprite.startY = positions[i][1]
            positions[sprite.childIndex][2] = false
            sprite.childIndex = i
            positions[i][2] = true
            break
          }else{
           sprite.x = sprite.startX
           sprite.y = sprite.startY
          }
        }
      }
      // group.setChildIndex(sprite,sprite.childIndex)
      // move = false
    }

    function createSprite(current,next){
      positions[current.childIndex][2] = false
      current.destroy()
      let plusKey = getKey(next.key)
      if(plusKey){
        let spritePlus = group.create(next.startX,next.startY,plusKey)
        spritePlus.startX = next.startX
        spritePlus.startY = next.startY
        spritePlus.inputEnabled = true
        spritePlus.input.enableDrag()
        spritePlus.events.onDragUpdate.add(dragUpdate,this)
        spritePlus.events.onDragStart.add(dragStart,this)
        spritePlus.events.onDragStop.add(dragStop,this)
        // group.setChildIndex(spritePlus,next.childIndex)
        spritePlus.childIndex = next.childIndex
      }else{
        positions[next.childIndex][2] = false
      }
      next.destroy()
      move = false
    }
  },
  update : function(){

  },
  render : function(){

  },
}

function getKey(key){
  switch(key){
    case 'one':
      return 'two'
    case 'two':
      return 'three'
    case 'three':
      return 'four'
    case 'four':
      return 'five'
    case 'five':
      return 'six'
    case 'six':
      return 'seven'
    case 'seven':
      return 'eight'
    case 'eight':
      return 'nine'
    case 'nine':
      return 'ten'
    case 'ten':
      return false
  }
}

Object.keys(states).map(function(key){
  game.state.add(key,states[key])
})
game.state.start('preload')
