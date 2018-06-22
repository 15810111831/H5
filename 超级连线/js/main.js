var game,level = 0
game = new Phaser.Game(1024, 672,Phaser.AUTO,'game', state)
var pointColors = [
  0xC70039,0x7FE314,0xFF9000,0xF8FF2E,0x73E1C9,0xC90AB4,0xFF9B9B,0x129B48,0xE6CEA0
]
function state(){
  this.init = function(){
    if(game.device.desktop){
      game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
    }else{
      game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT
    }
    game.scale.pageAlignHorizontally = true
    game.scale.pageAlignVertically = true
  }
  this.preload = function(){
    game.load.image('bg', 'images/bg.jpg')
    game.load.image('next', 'images/next.png')
    game.load.atlas('pointer', 'images/pointer.png', 'images/pointer.json')
  }
  this.create = function(){
    game.add.image(0,0,'bg')
    var isMove = false, circleArr = [], lineCount = 0, littleCircleArr = [], tween = null,
      line = null, sign = null,index = -1, start = null
    var tipIndex = 0,tipPositions = [
      [[450,330],[450,500,500,550,550,600,600],[280,280,330,330,280,280,330]],
      [[450,380],[500,550,600],[380,380,380]],
      [[450,430],[500,550,600],[430,430,430]]
    ]
    var positions = config[level].positions
    /*[
        [[450,250],[600,250]],[[450,300],[600,300]],
        [[450,350],[600,350]],[[450,400],[600,400]],
        [[450,250],[450,400]],[[500,250],[500,400]],
        [[550,250],[550,400]],[[600,250],[600,400]]
      ]*/
/*    var positions = [
      [[400,100],[500,100]],[[600,100],[700,100]],[[500,150],[600,150]],[[400,200],[700,200]],
      [[400,250],[700,250]],[[400,300],[700,300]],[[500,350],[600,350]],
      [[400,400],[700,400]],[[400,100],[400,400]],[[450,200],[450,300]],
      [[500,100],[500,400]],[[550,100],[550,400]],[[600,100],[600,400]],
      [[650,200],[650,300]],[[700,100],[700,400]]
    ]*/
/*    var positions = [
      [[400,100],[700,100]],[[450,150],[650,150]],[[400,200],[700,200]],
      [[400,250],[700,250]],[[400,300],[700,300]],[[400,350],[700,350]],
      [[400,400],[700,400]],[[400,200],[400,400]],[[450,100],[450,400]],
      [[500,100],[500,400]],[[550,100],[550,400]],[[600,100],[600,400]],
      [[650,100],[650,400]],[[700,200],[700,400]]
    ]*/

    var points  = getPoint(positions)
    var graphics = game.add.graphics(0,0)
    graphics.lineStyle(3, 0xffffff, 1)
    for(var i=0;i< positions.length;i++){
      var position = positions[i]
      graphics.moveTo(position[0][0],position[0][1]).lineTo(position[1][0],position[1][1]).endFill()
    }
    for(var index=0,psum = points.length;index < psum;index++){
      var littleCircle = game.add.graphics(points[index][0],points[index][1]).beginFill(0xffffff).drawCircle(0,0,10).endFill()
      littleCircle.positionIndex = index;
      littleCircleArr.push(littleCircle)
    }
    // 每两个相同颜色的圆,有一个条相同的线。并且圆的key相同
    for(let i=0;i< config[level].points.length;i++){
      let point = config[level].points[i]
      let circle1 = game.add.graphics(point[0][0],point[0][1]).beginFill(point[2]).drawCircle(0,0,30).endFill();
      let circle2 = game.add.graphics(point[1][0],point[1][1]).beginFill(point[2]).drawCircle(0,0,30).endFill();
      let line = game.add.graphics(0,0)
      circle1.key = circle2.key = point[3]
      line.canDraw = true
      line.color = point[2]
      circle1.line = circle2.line = line
      circleArr.push(circle1,circle2)
    }
    // 引导
    if(level == 0){
      var tipPointer = game.add.sprite(tipPositions[tipIndex][0][0],tipPositions[tipIndex][0][1],'pointer')
      tipPointer.anchor.setTo(0.5,0.5)
      var tipTween = game.add.tween(tipPointer).to({x:tipPositions[tipIndex][1],y:tipPositions[tipIndex][2]},1500,Phaser.Easing.Linear.None,true,0,-1)
      tipTween.start()
    }
    for(var i=0;i< circleArr.length;i++){
      var circle = circleArr[i]
      circle.inputEnabled = true
      circle.events.onInputDown.add(function(evt,pointer){
        /* 在移动中是否经过了与start属性相同的点，如果经过后则当前线不能再画连点了，
        如果经过了与start属性不同的点，则不会链接到当前点
        每个相同的点有一条自己的线，并且每条线需要记录自己所经过的点，
        如果摧毁当前的线，则需要把点的限制解开。
        并且将lineCount--*/
        if(tipIndex < tipPositions.length -1){
          if(evt.x != tipPositions[tipIndex][0][0] || evt.y != (tipPositions[tipIndex][0][1] -30))return
        }
        isMove = true
        if(tween){
          game.tweens.removeAll()
          for(let i=0,sum=littleCircleArr.length;i <sum;i++){
            let littleCircle = littleCircleArr[i]
            littleCircle.alpha = 1
            littleCircle.scale.x = littleCircle.scale.y = 1
          }
        }
        tipPointer.visible = false
        for(var i=0,sum = points.length;i < sum;i++){
          if(evt.x == points[i][0] && evt.y == points[i][1]){
            // 显示鼠标位置
            sign = game.add.graphics(pointer.x,pointer.y)
            sign.beginFill(evt.line.color).drawCircle(0,0,100)
            sign.alpha = 0.5
            game.stage.children[0].setChildIndex(sign,1)
            // console.log("yes")
            evt.scale.set(1.4)
            index = i
            line = evt.line
            if(!start){
              start = evt.key
            }else{
              if(start != evt.key){
                start = evt.key
              }
              if(lineCount > 0 && !evt.line.canDraw)lineCount--;
              if(line.points){
                for(var k=0;k<line.points.length;k++){
                  points[line.points[k]][2] = false
                }
              }
              evt.line = game.add.graphics(0,0)
              evt.line.points = []
              evt.line.canDraw = true
              evt.line.color = line.color
              line.destroy()
              line = evt.line
              for(let i=0;i<circleArr.length;i++){
                circle = circleArr[i]
                if(circle.line == line)continue
                if(circle.key == evt.key)circle.line = line
              }
            }
            for(let i=0;i<circleArr.length;i++){
              circle = circleArr[i]
              if(circle == evt)continue
              if(circle.key == evt.key)circle.scale.set(1.4)
            }
            game.stage.children[0].setChildIndex(line,1)
            line.moveTo(points[index][0],points[index][1]).lineTo(points[index][0],points[index][1])
            points[index][2] = true
            line.points = []
            line.points.push(index)
            break;
          }
        }
      })
      circle.events.onInputUp.add(function(evt,pointer){
        isMove = false
        if(sign) sign.destroy()
        evt.scale.set(1)
        for(let i=0;i<circleArr.length;i++){
          circle = circleArr[i]
          if(circle == evt)continue
          if(circle.key == evt.key)circle.scale.set(1)
        }
      })
    }
    game.input.addMoveCallback(function(pointer){
      if(isMove){
        if(sign)sign.x = pointer.x,sign.y = pointer.y
        for(var i=0,sum = points.length;i < sum;i++){
          if(Math.abs(pointer.x - points[i][0]) <= 20 &&Math.abs(pointer.y - points[i][1]) <= 20){
            if((points[index][0] == points[i][0] && Math.abs(points[index][1] - points[i][1]) == 50) || (points[index][1] == points[i][1] && Math.abs(points[index][0] - points[i][0]) == 50)) {
              if(!points[i][2]){
                if(line.canDraw && checkCircle(pointer,circleArr,start)){
                /*
                   将两个相同的点绑定到一条线,定义个值等于我当前点的线,
                   并且当前线每经过一点,就将点记录下来,当线销毁的时候,点恢复限制
                   如果所有点都用了，并且每个颜色的点都连成了线，则游戏结束
                  */
                  index = i
                  line.lineStyle(10, line.color, 1).lineTo(points[index][0],points[index][1])
                  points[index][2] = true
                  line.points.push(i)
                  for(var j=0;j<circleArr.length;j++){
                    if(circleArr[j].x == points[index][0] && circleArr[j].y == points[index][1]){
                      if(circleArr[j].key == start) {
                        // console.log("这条线已经画完")
                        if(tipIndex < tipPositions.length - 1){
                          tipIndex++
                          tipPointer.x = tipPositions[tipIndex][0][0]
                          tipPointer.y = tipPositions[tipIndex][0][1]
                          tipPointer.visible = true
                          var tipTween = game.add.tween(tipPointer).to({x:tipPositions[tipIndex][1],y:tipPositions[tipIndex][2]},1500,Phaser.Easing.Linear.None,true,0,-1)
                          tipTween.start()
                        }

                        line.endFill()
                        line.canDraw = false
                        lineCount++
                        if(lineCount == circleArr.length / 2){
                          if(check(points)) {
                            level++
                            console.log('游戏结束  稍后进入下一关')
                            var timer = game.time.create(false)
                            timer.add(500,function(){
                              var mask = game.add.graphics()
                              mask.beginFill(0x000000).drawRect(0,0,game.world.width,game.world.height)
                              mask.alpha = 0.5
                              var next = game.add.sprite(game.world.centerX,game.world.centerY,'next')
                              next.inputEnabled = true
                              next.anchor.setTo(0.5,0.5)
                              next.events.onInputDown.add(function(){
                                if(level == config.length){
                                  window.location.href="/learning/student_navigation/";
                                }else{
                                  game.state.start('create')
                                }
                              })
                            })
                            timer.start()
                          }
                          else{
                            // console.log("点放大")
                            // 所有点全部链接完毕,而还有点没有用到,所以需要个提示
                            for(let i=0,sum=littleCircleArr.length;i <sum;i++){
                              let littleCircle = littleCircleArr[i]
                              if(!points[littleCircle.positionIndex][2]){
                                littleCircle.scale.x = littleCircle.scale.y = 1.4
                                tween = game.add.tween(littleCircle).to({ alpha: 0.5 }, 500, 'Linear', true , 0,100);
                              }
                            }
                          }
                        }
                        break;
                      }
                    }
                  }
                  break;
                }
              }
            }
          }
        }
      }
    })
  }

  this.play = function(){

  }
  this.update = function(){

  }
  this.render = function(){

  }
}

function getPoint(positions){
  var hengxiang = [],zongxiang = [], points = [], hash = []
  for(let i=0,sum=positions.length;i<sum;i++){
    let position = positions[i]
    if(position[0][0] == position[1][0]){
      zongxiang.push(position)
    }else if(position[0][1] == position[1][1]){
      hengxiang.push(position)
    }
  }

  for(let i =0,isum = hengxiang.length;i< isum;i++){
    for(let j=0,jsum = zongxiang.length;j< jsum;j++){
      if((zongxiang[j][0][0] >= hengxiang[i][0][0] && zongxiang[j][0][0] <= hengxiang[i][1][0])
        || (hengxiang[i][0][1] >= zongxiang[j][0][1] && hengxiang[i][0][1] <= zongxiang[j][1][1]))
      {
        if(removeRepeat(points,[zongxiang[j][0][0],hengxiang[i][0][1]])){
          points.push([zongxiang[j][0][0],hengxiang[i][0][1],false])
        }
      }
    }
  }
  return points

  // 当有平行的线的时候需要去重
  function removeRepeat(arr,elem){
    if(arr.length < 1)return true
    for(let i =0,sum = arr.length;i<sum;i++){
      if(arr[i][0] == elem[0] && arr[i][1] == elem[1]){
        return false
      }
    }
    return true
  }
}

function check(points){
  for(var i =0; i < points.length;i++){
    if(!points[i][2]){
      return false
    }
  }
  return true
}

function checkCircle(pointer,circleArr,start){
  // 如果当前经过的点上没有circle,则返回true
  // 如果当前经过的点上有circle,然而circle.key != start,则返回false
  // 反之返回true
  for(let i=0,sum = circleArr.length;i<sum;i++){
    let circle = circleArr[i]
    if(Math.abs(pointer.x - circle.x) <= 20 && Math.abs(pointer.y - circle.y)<= 20){
      if(start == circle.key)return true;
      else{
        return false
      }
    }
  }
  return true
}


