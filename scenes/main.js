const MOVE_SPEED = 120
const JUMP_FORCE = 350
const BIG_JUMP_FORCE = 450
let CURRENT_JUMP_FORCE = JUMP_FORCE
const ENEMY_SPEED = -40
const FALL_DEATH = 400
let isJumping = false
const MUSHROOM_SPEED = 40

layers(['obj', 'ui'], 'obj')

const maps = [
  [
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '                             ',
    '     % =*=%=                 ',
    '                             ',
    '                      -+     ',
    '                 ^  ^ ()     ',
    'xxxxxxxxxxxxxxxxxxxxxxxx   xx',
  ],
  [
    '£                               £',
    '£                               £',
    '£                               £',
    '£                               £',
    '£       @7@77@        s         £',
    '£                   s s s       £',
    '£                 s s s s s   -+£',
    '£        !      s s s s s s s ()£',
    'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz',
  ],
  [
    '£                                                        £',
    '£                                                        £',
    '£                                                        £',
    '£                                                        £',
    '£                                                      éè£',
    '£                                                     !()£',
    '£                                                  @@@@@@£',
    '£                                                        £',
    '£                                             !          £',
    '£                                         @@@7@7         £',
    '£                                                        £',
    '£                                                        £',
    '£       @7@77@        s        @7@77@9       @7@77@      £',
    '£                   s s s                                £',
    '£                 s s s s s                              £',
    '£        !     !s s s s s s s         !             !    £',
    'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz',
  ]
]

const levelCfg = {
  width: 20,
  height : 20,
  '=' : [sprite('block-2'), solid()],
  'x' : [sprite('brick'), solid()],
  '$' : [sprite('coin'), 'coin', scale(0.5)],
  '%' : [sprite('question-2'), 'coin-surprise', solid()],
  '*' : [sprite('question-2'), 'mushroom-surprise', solid()],
  '}' : [sprite('unboxed-2'), solid()],
  '(' : [sprite('pipe-left-2'), 'wall', solid()],
  ')' : [sprite('pipe-right-2'), solid()],
  '-' : [sprite('pipe-top-left-side-2'), 'pipe', solid()],
  '+' : [sprite('pipe-top-right-side-2'), 'pipe', solid()],
  'é' : [sprite('pipe-top-left-side-2'), 'pipe-win', solid()],
  'è' : [sprite('pipe-top-right-side-2'), 'pipe-win', solid()],
  '^' : [sprite('evil-shroom-3'), 'dangerous', scale(0.02), solid(), body(), {dir: 1}],
  '#' : [sprite('mushroom'), 'mushroom', scale(0.03), body(), {dir: 1}],
  '£' : [sprite('blue-brick'), 'wall', solid()],
  'z' : [sprite('blue-block'), solid()],
  '@' : [sprite('blue-brick'), solid()],
  '!' : [sprite('blue-evil-shroom'), 'dangerous', scale(0.015), body(), {dir: 1}],
  's' : [sprite('blue-steel'), solid(), scale(0.025), 'wall'],
  '7' : [sprite('blue-surprise'), solid(), 'coin-surprise'],
  '9' : [sprite('blue-surprise'), solid(), 'mushroom-surprise']
}

const levelIndex = args.level ?? 0

const gameLevel = addLevel(maps[levelIndex], levelCfg)

const scoreGlobal = args.score ?? 0

const scoreText = add([
  text('score: '),
  pos(120, 6),
  layer('ui')
])

const scoreLabel = add([
  text(scoreGlobal),
  pos(180, 6),
  layer('ui'),
  {
    value: scoreGlobal,
  }
])

add([text('level ' + parseInt(levelIndex + 1)), pos(40, 6)])

function big() {
  let timer = 0
  let isBig = false
  return {
    update() {
      if (isBig) {
        timer -= dt()
        if(timer <= 0) {
          this.smallify()
        }
      }
    },
    isBig() {
      return isBig
    },
    smallify() {
      this.scale = vec2(0.5)
      timer = 0
      isBig = false
      CURRENT_JUMP_FORCE = JUMP_FORCE
    },
    biggify(time) {
      this.scale = vec2(1)
      timer = time
      isBig = true
      CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
     }
  }
}

const player = add([
  sprite('mario-running-right'),
  scale(0.5),
  pos(30, 0),
  body(),
  big(),
  origin('bot'),
  {
    dir: vec2(1, 0)
  }
])

player.collides('dangerous', (d) => {
  if(isJumping) {
    destroy(d)
  } else {
    go('lose', {score: scoreLabel.value})
  }
})

player.action( () => {
  camPos(player.pos)
  if(player.pos.y >= FALL_DEATH) {
    go('lose', {score: scoreLabel.value})
  }
})

keyDown('left', () => {
  player.changeSprite('mario-running-left')
  player.move(-MOVE_SPEED, 0)
  player.dir = vec2(-1, 0)
})

keyDown('right', () => {
  player.changeSprite('mario-running-right')
  player.move(MOVE_SPEED, 0)
  player.dir = vec2(1, 0)

})

player.action(() => {
  if(player.grounded()) {
    isJumping = false
  } 
})

keyPress('space', () => {
  if(player.grounded()) {
    isJumping = true
    player.jump(CURRENT_JUMP_FORCE)
  }
})

player.on('headbump', (obj) => {
  if(obj.is('coin-surprise')) {
    gameLevel.spawn('$', obj.gridPos.sub(0, 1.5))
    destroy(obj)
    gameLevel.spawn('}', obj.gridPos.sub(0, 0))
  }
  if(obj.is('mushroom-surprise')) {
    gameLevel.spawn('#', obj.gridPos.sub(0, 1.2))
    destroy(obj)
    gameLevel.spawn('}', obj.gridPos.sub(0, 0))
  }
})

action('mushroom', (m) => {
  m.move(m.dir * MUSHROOM_SPEED, 0)
})

player.collides('mushroom', (m) => {
  player.biggify(6)
  destroy(m)
}) 

player.collides('coin', (c) => {
  scoreLabel.value++
  scoreLabel.text = scoreLabel.value
  destroy(c)
})

action('dangerous', (d) => {
  d.move(d.dir * ENEMY_SPEED, 0)
})

player.collides('pipe', () => {
  keyPress('down', () => {
     go('main', {
       level: (levelIndex + 1) % maps.length,
       score: scoreLabel.value
     })
  })
})

player.collides('pipe-win', () => {
  keyPress('down', () => {
     go('win', {
       score: scoreLabel.value
     })
  })
})

collides('mushroom', 'wall', (m) => {
  m.dir = -(m.dir)
  
})

collides('dangerous', 'wall', (d) => {
  d.dir = -(d.dir)
})

collides('dangerous', 'dangerous', (d) => {
  d.dir = -(d.dir)
})
