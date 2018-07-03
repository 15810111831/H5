var game = new Phaser.Game(1024,672,Phaser.AUTO,'game')
var  states = {
  preload : function(){
    this.preload = function(){
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
    var graphics = null,group,positions,max=2,move,graphicTween,burning = false
    var numbersKey = ['one','two','three','four','five','six','seven','eight','nine','ten']
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
      game.add.image(0,0,'bg')
      graphics = game.add.graphics(0,0)
      var lineImg = game.cache.getImage('line')
      graphics.lineStyle(20, 0xff623b, 1).moveTo(game.world.centerX - lineImg.width / 2, 50).lineTo(game.world.centerX+lineImg.width / 2,50)
      var line = game.add.image(game.world.centerX,50,'line')
      line.anchor.setTo(0.5,0.5)

      var mask = game.add.graphics(0,0)
      mask.beginFill(0xffffff).drawRoundedRect(game.world.centerX - lineImg.width / 2 + 3,40,lineImg.width - 6,20,10)
      graphics.mask = mask
      graphicTween = game.add.tween(graphics).to({x:- game.world.centerX - 50,y:0},20000,Phaser.Easing.Linear.None,true,0,-1)

      var width = game.world.width
      group = game.add.group()
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
      for(var j =0,sum=12/*positions.length*/;j<sum;j++){
        let position = positions[j]
        let number = group.create(position[0],position[1],numbersKey[Math.floor(Math.random()*max)])
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
      callback()
    }
    this.update = function(){
      if(graphics.x <= (- game.world.centerX - 50) || move){
        if(move){
          game.tweens.remove(graphicTween)
          graphicTween = game.add.tween(graphics).to({x:0},10,Phaser.Easing.Linear.None,true)
          graphicTween.onComplete.add(function(){
            game.tweens.remove(graphicTween)
            graphicTween = game.add.tween(graphics).to({x:- game.world.centerX - 50,y:0},30000,Phaser.Easing.Linear.None,true,0,-1)
          })
          move = false
        }
        for(var i=0;i<group.children.length;i++){
          var child = group.children[i]
          if(child.y == 112){
            console.log("game over")
            max = 2
            game.state.start('create')
          }
          game.add.tween(child).to({x:child.startX,y:child.startY - 80},300,Phaser.Easing.Linear.None,true)
          child.startY = child.startY - 80
          child.childIndex = child.childIndex + 12
          if(child.childIndex <=84)positions[child.childIndex][2] = true
          if(child.childIndex >=0)positions[child.childIndex - 12][2] = false
        }
        for(var j=0;j<12;j++){
          positions[j][2] = true
          var child = group.create(positions[j][0],positions[j][1],numbersKey[Math.floor(Math.random()*max)])
          child.startX = positions[j][0]
          child.startY = positions[j][1]
          child.childIndex = j
          child.inputEnabled = true
          child.input.enableDrag()
          child.events.onDragStart.add(dragStart,this)
          child.events.onDragUpdate.add(dragUpdate,this)
          child.events.onDragStop.add(dragStop,this)
          group.setChildIndex(child,j)
        }
        callback()
      }
    }

    function dragStart(sprite,pointer){
      burning = false
      positions[sprite.childIndex][2] = false
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
                // console.log("left")
              }
            }
            else if(Math.abs(child.y - sprite.world.y) <= 30 && child.x > sprite.world.x){
              if(sprite.x > (child.x - 70)){
                sprite.x = child.x - 70
                // console.log("right")
              }
            }
            //上下
            else if(Math.abs(child.x - sprite.world.x) <= 30 && child.y < sprite.world.y){
              if(sprite.y < (child.y + 70) ){
                sprite.y  = child.y + 70
                // console.log("up")
              }
            }
            else if(Math.abs(child.x - sprite.world.x) <= 30 && child.y > sprite.world.y){
              if(sprite.y > (child.y - 70) ){
                sprite.y = child.y - 70
                // console.log("down")
              }
            }
            break
          }else{
            if(Math.abs(sprite.x - child.x) <= 50 && Math.abs(sprite.y - child.y)<= 50){
              createSprite(sprite,child,callback)
              // if(!burning)childrenDown(sprite)
              burning = true
              break
            }
          }
        }
      }

      if(Math.abs(sprite.world.x - sprite.startX) >= 80){
        if(!burning)childrenDown(sprite)
        burning = true
      }
    }
    function dragStop(sprite,pointer){
      // 当拖拽结束后,判断如果当前位置附近有元素则判定这个元素是否与当前拖拽对象key值相等
      // 如果相等则消除两个元素,创建新元素放到这个元素的位置
      // 如果key值不相等,则将拖拽元素并不能越过这个元素,除非周围没有其他元素
      burning = false
      var index = 0
      for(var i = 0; i < positions.length;i++){
        if(Math.abs(sprite.x - positions[i][0]) <= 40 && Math.abs(sprite.y - positions[i][1]) <= 40){
          if(!positions[i][2]){
            index = i
            while (index >= 12){
              if(!positions[index-12][2]){
                index -= 12
              }else{
                break
              }
            }
            sprite.startX = positions[index][0]
            sprite.startY = positions[index][1]
            positions[sprite.childIndex][2] = false
            sprite.childIndex = index
            positions[index][2] = true
            var tween = game.add.tween(sprite).to({x:positions[index][0],y:positions[index][1]},100*(positions[index][1] / sprite.y),Phaser.Easing.Linear.None,true)
            tween.onComplete.add(function(){
              if(positions[index - 12]){
                for(var i=0;i<group.children.length;i++){
                  if(group.children[i] == sprite)continue
                  if(group.children[i].childIndex == index - 12 && group.children[i].key == sprite.key){
                    // console.log("下落并消除")
                    createSprite(sprite,group.children[i],callback)
                  }
                }
              }
            })
            break
          }else{
           sprite.x = sprite.startX
           sprite.y = sprite.startY
          }
        }
      }
    }

    function createSprite(current,next,callback){
      positions[current.childIndex][2] = false
      current.destroy()
      let plusKey = getKey(next.key)
      if(plusKey){
        let spritePlus = group.create(next.startX,next.startY,plusKey)
        spritePlus.startX = next.startX
        spritePlus.startY = next.startY
        spritePlus.childIndex = next.childIndex
        spritePlus.inputEnabled = true
        spritePlus.input.enableDrag()
        spritePlus.events.onDragUpdate.add(dragUpdate,this)
        spritePlus.events.onDragStart.add(dragStart,this)
        spritePlus.events.onDragStop.add(dragStop,this)
      }else{
        positions[next.childIndex][2] = false
      }
      next.destroy()
      if(checkRepeat()){
        move = true
      }else{
        move = false
      }
      if(callback)callback()
      if(plusKey){childrenDown(current)}
      else{childrenDown(next)}
    }

    function callback(){
      // console.log("callback")
      // 判断group中所有元素有没有竖向是相同元素，如果有则进行消除，消除一遍之后如果还有则继续消除
      for (var j =0;j<group.children.length;j++){
        var child1 = group.children[j]
        for(var i=0;i<group.children.length;i++){
          var child2 = group.children[i]
          if(child1.key == child2.key && child1.childIndex == child2.childIndex+12){
            // console.log("callback 消除")
            createSprite(child1,child2,callback)
          }
        }
      }
    }

    function checkRepeat(){
      var obj = {}
      for(var i=0;i<group.children.length;i++){
        if(!obj[group.children[i].key]){
          obj[group.children[i].key] = 1
        }else{
          return false
        }
      }
      return true
    }

    function getKey(key){
      switch(key){
        case 'one':
          return 'two'
        case 'two':
          return 'three'
        case 'three':
          if(max < 3)max = 3
          return 'four'
        case 'four':
          if(max < 4)max = 4
          return 'five'
        case 'five':
          if(max < 5)max = 5
          return 'six'
        case 'six':
          if(max < 6)max = 6
          return 'seven'
        case 'seven':
          if(max < 7)max = 7
          return 'eight'
        case 'eight':
          if(max < 8)max = 8
          return 'nine'
        case 'nine':
          if(max < 9)max = 9
          return 'ten'
        case 'ten':
          if(max < 10)max = 10
          return false
      }
    }

    function childrenDown(sprite){
      var indexArr = []
      for(var i=0;i< group.children.length;i++){
        var child = group.children[i]
        if(child == sprite)continue
        if(child.childIndex > sprite.childIndex && (child.childIndex - sprite.childIndex) % 12 ==0 && !positions[sprite.childIndex][2]){
          //有问题这里
          indexArr.push(child.childIndex-12)
          positions[child.childIndex][2] = false
          child.startY = child.startY + 80
          child.childIndex = child.childIndex - 12
          game.add.tween(child).to({y:child.startY},200,Phaser.Easing.Linear.None,true)
        }
      }
      for(var j=0;j<indexArr.length;j++){
        positions[indexArr[j]][2] = true
      }
    }
  },
  update : function(){

  },
  render : function(){

  },
}

Object.keys(states).map(function(key){
  game.state.add(key,states[key])
})
game.state.start('preload')
