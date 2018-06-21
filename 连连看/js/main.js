var game = new Phaser.Game(1024,672,Phaser.AUTO,'game')
var level = 0
var  states = {
  preload : function(){
    this.preload = function(){
      // console.log("preload")
      game.load.image('bg','images/bj.png')
      game.load.image('diban','images/diban.png')
      game.load.image('dibanClick','images/lianjiechenggong.png')
      game.load.image('strawberry','images/caomei.png')
      game.load.image('pear','images/li.png')
      game.load.image('apple','images/pingguo.png')
      game.load.image('peach','images/taozi.png')
      game.load.image('watermelon','images/xigua.png')
      game.load.image('next', 'images/next.png')
      game.load.image('restart', 'images/restart.png')

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
      var start = null,end = null,clickArr = [],answerArr = [],dibanArr = [],begin = true
      var positions = config[level]
      var bg = game.add.image(0,0,'bg')

      for(let i=0;i< positions.length;i++){
        var diban = game.add.sprite(positions[i][0],positions[i][1],'diban')
        diban.anchor.setTo(0.5,0.5)
        diban.inputEnabled = true
        diban.events.onInputDown.add(function(evt){
          inputDown(evt)
        })
        diban.events.onInputUp.add(inputUp)

        var dibanClick = game.add.image(positions[i][0],positions[i][1],'dibanClick')
        dibanClick.anchor.setTo(0.5,0.5)
        dibanClick.visible = false

        var fruit = game.add.sprite(positions[i][0],positions[i][1] - 5,positions[i][2])
        fruit.anchor.setTo(0.5,0.5)
        fruit.key = positions[i][2]
        fruit.inputEnabled = true
        fruit.events.onInputDown.add(function(evt){
          inputDown(evt)
        })
        fruit.events.onInputUp.add(inputUp)
        diban.fruit = fruit
        fruit.diban = diban
        diban.dibanClick = dibanClick
        clickArr.push(dibanClick)
        dibanArr.push(diban)
      }
      for(var i =0;i< dibanArr.length;i++){
        game.world.setChildIndex(dibanArr[i].fruit,game.world.children.length -1)
      }

      // console.log(clickArr)
      function inputDown(evt){
        var target = null
        if(evt.key == 'diban'){
           target = evt.fruit
        }else{
          target = evt
        }
        if(!begin)return
        if(!target.visible)return
        if(start && !end){
          if(start.key != target.key){
            for(let i=0;i<clickArr.length;i++){
              clickArr[i].visible = false
            }
            start = target
            answerArr[0] = target
          }else{
            if(answerArr[0] == target) return
            end = target
            answerArr.push(target)
          }
        }
        if(!start){
          start = target
          answerArr.push(target)
        }
        if(!target.diban.dibanClick.visible)target.diban.dibanClick.visible = true
      }

      function inputUp(){
        if(start && end){
          var result = checkResult(start,end)
          if(result != -1 ){
            begin = false
            console.log("yes yes yes")
            for(let j =0;j<answerArr.length;j++){
              // answerArr[j].visible = false
              var tween = game.add.tween(answerArr[j]).to({x:[680,710,900], y: [152,165,450]},
                1000,Phaser.Easing.Quadratic.InOut, true).interpolation(function(v, k){
                return Phaser.Math.bezierInterpolation(v, k);
              });
              tween.onComplete.add(function(evt){
                evt.visible = false
                begin = true
              })
            }
            if(result != 0){
              for(let m = 0;m<result.length;m++){
                // dibanArr[result[m]].fruit.visible = false
                var tween = game.add.tween(dibanArr[result[m]].fruit).to({x: [680,710,900], y: [152,165,450]},
                  1000,Phaser.Easing.Quadratic.InOut, true).interpolation(function(v, k){
                  return Phaser.Math.bezierInterpolation(v, k);
                });
                tween.onComplete.add(function(evt){
                  evt.visible = false
                  begin = true
                })
              }
            }
          }
          var timer = game.time.create(false)
          timer.add(100,function(){
            for(let i=0;i<clickArr.length;i++){
              clickArr[i].visible = false
            }
          })
          timer.start()
          start = null, end = null
          answerArr = []
          var endTime = game.time.create(false)
          endTime.add(1100,function(){
            var theEnd = checkMove(dibanArr)
            console.log(theEnd)
            if(theEnd == 1){
              begin = false
              level++
              var mask = game.add.graphics()
              mask.beginFill(0x000000).drawRect(0,0,game.world.width,game.world.height)
              mask.alpha = 0.5
              var next = game.add.sprite(game.world.centerX,game.world.centerY,'next')
              next.anchor.setTo(0.5,0.5)
              next.inputEnabled = true
              next.events.onInputDown.add(function(){
                if(level == config.length){
                  window.location.href="/learning/student_navigation/";
                }else{
                  game.state.start('create')
                }
              })
            }else if(theEnd == -1){
              begin = false
              var mask = game.add.graphics()
              mask.beginFill(0x000000).drawRect(0,0,game.world.width,game.world.height)
              mask.alpha = 0.5
              var restart = game.add.sprite(game.world.centerX,game.world.centerY,'restart')
              restart.anchor.setTo(0.5,0.5)
              restart.inputEnabled = true
              restart.events.onInputDown.add(function(){
                game.state.start('create')
              })
            }
          })
          endTime.start()
        }
      }

      function checkResult(start,end){
        var indexArr = []
        // 判断两点之间是否可以相连: 如果起始点与当前点key不同,则返回false;
        // 如果起始点与当前点key相同,需要判断起始点与当前点之间有无其他水果，如果没有返回true,
        // 如果有并且与起始点的key不相同,则返回false,反之返回true,并将中间的水果加入到answerArr中
        if(start.key != end.key)return -1
        else{
          // 横向
          if(start.y == end.y){
            if(Math.abs(start.diban.x - end.diban.x) <= start.diban.width){
              return 0
            }else{
              if(start.diban.x < end.diban.x){
                for(let i=0,sum = dibanArr.length;i<sum;i++){
                  if(dibanArr[i].y == start.diban.y && (dibanArr[i].x > start.diban.x && dibanArr[i].x < end.diban.x)){
                    if(dibanArr[i].fruit.key == start.key){
                      dibanArr[i].dibanClick.visible = true
                      indexArr.push(i)
                    }else{
                      if(!dibanArr[i].fruit.visible){
                        indexArr.push(i)
                      }else {
                        return -1
                      }
                    }
                  }
                }
              }else{
                for(let i=0,sum = dibanArr.length;i<sum;i++){
                  if(dibanArr[i].y == start.diban.y && (dibanArr[i].x > end.diban.x && dibanArr[i].x < start.diban.x)){
                    if(dibanArr[i].fruit.key == start.key){
                      dibanArr[i].dibanClick.visible = true
                      indexArr.push(i)
                    }else{
                      if(!dibanArr[i].fruit.visible){
                        indexArr.push(i)
                      }else {
                        return -1
                      }
                    }
                  }
                }
              }
              if(indexArr.length == 0)return -1
              return indexArr
            }
          }
          // 竖向
          else if(start.x == end.x){
            if(Math.abs(start.diban.y - end.diban.y) <= start.diban.height){
              return 0
            }else{
              if(start.diban.y < end.diban.y){
                for(let i=0,sum = dibanArr.length;i<sum;i++){
                  if(dibanArr[i].x == start.diban.x && (dibanArr[i].y > start.diban.y && dibanArr[i].y < end.diban.y)){
                    if(dibanArr[i].fruit.key == start.key){
                      dibanArr[i].dibanClick.visible = true
                      indexArr.push(i)
                    }else{
                      if(!dibanArr[i].fruit.visible){
                        indexArr.push(i)
                      }else {
                        return -1
                      }
                    }
                  }
                }
              }else{
                for(let i=0,sum = dibanArr.length;i<sum;i++){
                  if(dibanArr[i].x == start.diban.x && (dibanArr[i].y > end.diban.y && dibanArr[i].y < start.diban.y)){
                    if(dibanArr[i].fruit.key == start.key){
                      dibanArr[i].dibanClick.visible = true
                      indexArr.push(i)
                    }else{
                      if(!dibanArr[i].fruit.visible){
                        indexArr.push(i)
                      }else {
                        return -1
                      }
                    }
                  }
                }
              }
              return indexArr
            }
          }
          // 斜着
          else{
            if(Math.abs(start.diban.x - end.diban.x) / start.diban.width != Math.abs(start.diban.y - end.diban.y) / start.diban.width){
              return -1
            }else{
              var x = Math.abs(start.diban.x - end.diban.x) / start.diban.width
              if(x == 1) return 0
              if(start.diban.x < end.diban.x && start.diban.y > end.diban.y){
                for(let i=0,sum=dibanArr.length;i<sum;i++){
                  if(dibanArr[i].x == start.diban.x || dibanArr[i].y == start.diban.y)continue
                  if(dibanArr[i].x < start.diban.x || dibanArr[i].y > start.diban.y)continue
                  if((start.diban.x - dibanArr[i].x) % start.diban.width == 0 && (dibanArr[i].x - start.diban.x) / start.diban.width < x){
                    if((start.diban.y - dibanArr[i].y) % start.diban.width == 0 && (start.diban.y - dibanArr[i].y) / start.diban.width < x){
                      if(dibanArr[i].fruit.key == start.key) {
                        indexArr.push(i)
                      }else{
                        if(!dibanArr[i].fruit.visible){
                          indexArr.push(i)
                        }else{
                          return -1
                        }
                      }
                    }
                  }
                }
                if(indexArr.length == 0)return -1
                return indexArr
              }else if(start.diban.x < end.diban.x && start.diban.y < end.diban.y){
                for(let i=0,sum=dibanArr.length;i<sum;i++){
                  if(dibanArr[i].x == start.diban.x || dibanArr[i].y == start.diban.y)continue
                  if(dibanArr[i].x < start.diban.x || dibanArr[i].y < start.diban.y)continue
                  if((dibanArr[i].x - start.diban.x) % start.diban.width == 0 && (dibanArr[i].x - start.diban.x) / start.diban.width < x){
                    if((dibanArr[i].y - start.diban.y) % start.diban.width == 0 && (dibanArr[i].y - start.diban.y) / start.diban.width < x){
                      if(dibanArr[i].fruit.key == start.key) {
                        indexArr.push(i)
                      }else{
                        if(!dibanArr[i].fruit.visible){
                          indexArr.push(i)
                        }else{
                          return -1
                        }
                      }
                    }
                  }
                }
                if(indexArr.length == 0)return -1
                return indexArr
              }else if(start.diban.x > end.diban.x && start.diban.y > end.diban.y){
                for(let i=0,sum=dibanArr.length;i<sum;i++){
                  if(dibanArr[i].x == start.diban.x || dibanArr[i].y == start.diban.y)continue
                  if(dibanArr[i].x > start.diban.x || dibanArr[i].y > start.diban.y)continue
                  if((start.diban.x - dibanArr[i].x) % start.diban.width == 0 && (start.diban.x - dibanArr[i].x) / start.diban.width < x){
                    if((start.diban.y - dibanArr[i].y) % start.diban.width == 0 && (start.diban.y - dibanArr[i].y) / start.diban.width < x){
                      if(dibanArr[i].fruit.key == start.key) {
                        indexArr.push(i)
                      }else{
                        if(!dibanArr[i].fruit.visible){
                          indexArr.push(i)
                        }else{
                          return -1
                        }
                      }
                    }
                  }
                }
                if(indexArr.length == 0)return -1
                return indexArr
              }else if(start.diban.x > end.diban.x && start.diban.y < end.diban.y){
                for(let i=0,sum=dibanArr.length;i<sum;i++){
                  if(dibanArr[i].x == start.diban.x || dibanArr[i].y == start.diban.y)continue
                  if(dibanArr[i].x > start.diban.x || dibanArr[i].y < start.diban.y)continue
                  if((start.diban.x - start.diban.x) % start.diban.width == 0 && (start.diban.x - dibanArr[i].x) / start.diban.width < x){
                    if((dibanArr[i].y - start.diban.y) % start.diban.width == 0 && (dibanArr[i].y - start.diban.y) / start.diban.width < x){
                      if(dibanArr[i].fruit.key == start.key) {
                        indexArr.push(i)
                      }else{
                        if(!dibanArr[i].fruit.visible){
                          indexArr.push(i)
                        }else{
                          return -1
                        }
                      }
                    }
                  }
                }
                if(indexArr.length == 0)return -1
                return indexArr
              }
            }
          }
        }
      }

      function checkMove(arr){
        let other = []
        for(let i=0,sum=arr.length;i<sum;i++){
          if(arr[i].fruit.visible)other.push(arr[i])
        }
        if(other.length == 0)return 1 // game over
        if(other.length == 1)return -1
        else{
          let index = 0;
          while (index < other.length - 1){
            let step = 1
            while (step < other.length){
              if(index == step){
                step++
                continue
              }
              if(other[index].fruit.key == other[step].fruit.key){
                let result = checkResult(other[index].fruit,other[step].fruit)
                if(result != -1){
                  return 0
                }
              }
              step++
            }
            index++
          }
          return -1
        }
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