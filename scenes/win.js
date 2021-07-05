add([
  text("YOU WIN"),
  color(0, 255, 255),
  origin('center'),
  scale(10),
  pos(width()/2, height()/2)
])

add([
  sprite('cup'),
  pos(width()/2, height()/4 -20),
  scale(3),
  origin('center')
])

add([
  text('your score: '+ args.score),
  origin('center'),
  scale(4),
  pos(width()/2, height()-50)
])