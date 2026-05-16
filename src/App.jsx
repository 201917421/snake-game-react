import { useState, useEffect, useCallback } from 'react'
import './App.css'

const GRID_SIZE = 20
const CELL_SIZE = 20
const INITIAL_SPEED = 150

function App() {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }])
  const [food, setFood] = useState({ x: 15, y: 15 })
  const [direction, setDirection] = useState({ x: 1, y: 0 })
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  const generateFood = useCallback((currentSnake) => {
    let newFood
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      }
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y))
    return newFood
  }, [])

  const checkCollision = (head, snakeBody) => {
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true
    }
    return snakeBody.some(segment => segment.x === head.x && segment.y === head.y)
  }

  const moveSnake = useCallback(() => {
    if (!isPlaying || gameOver) return

    setSnake(currentSnake => {
      const head = currentSnake[0]
      const newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y
      }

      if (checkCollision(newHead, currentSnake)) {
        setGameOver(true)
        setIsPlaying(false)
        return currentSnake
      }

      const newSnake = [newHead, ...currentSnake]

      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(prev => prev + 10)
        setFood(generateFood(newSnake))
      } else {
        newSnake.pop()
      }

      return newSnake
    })
  }, [direction, food, gameOver, isPlaying, generateFood])

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameOver) return

      switch (e.key) {
        case 'ArrowUp':
          if (direction.y !== 1) setDirection({ x: 0, y: -1 })
          break
        case 'ArrowDown':
          if (direction.y !== -1) setDirection({ x: 0, y: 1 })
          break
        case 'ArrowLeft':
          if (direction.x !== 1) setDirection({ x: -1, y: 0 })
          break
        case 'ArrowRight':
          if (direction.x !== -1) setDirection({ x: 1, y: 0 })
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [direction, gameOver])

  useEffect(() => {
    if (!isPlaying || gameOver) return

    const gameLoop = setInterval(moveSnake, INITIAL_SPEED)
    return () => clearInterval(gameLoop)
  }, [moveSnake, isPlaying, gameOver])

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }])
    setFood({ x: 15, y: 15 })
    setDirection({ x: 1, y: 0 })
    setGameOver(false)
    setScore(0)
    setIsPlaying(true)
  }

  return (
    <div className="game-container">
      <h1>🐍 贪吃蛇游戏</h1>
      <div className="score-board">
        分数: {score}
      </div>
      <div className="game-board" style={{
        width: GRID_SIZE * CELL_SIZE,
        height: GRID_SIZE * CELL_SIZE
      }}>
        {Array.from({ length: GRID_SIZE }, (_, y) =>
          Array.from({ length: GRID_SIZE }, (_, x) => (
            <div
              key={`${x}-${y}`}
              className="grid-cell"
              style={{
                left: x * CELL_SIZE,
                top: y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE
              }}
            />
          ))
        )}
        {snake.map((segment, index) => (
          <div
            key={index}
            className={`snake-segment ${index === 0 ? 'snake-head' : ''}`}
            style={{
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE
            }}
          />
        ))}
        <div
          className="food"
          style={{
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE
          }}
        />
      </div>
      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-content">
            <h2>游戏结束!</h2>
            <p>最终得分: {score}</p>
            <button onClick={resetGame} className="restart-button">
              重新开始
            </button>
          </div>
        </div>
      )}
      <div className="instructions">
        <p>使用方向键 ↑ ↓ ← → 控制蛇的移动</p>
      </div>
    </div>
  )
}

export default App