import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

const START_POS = { x: 0, y: 0 };
const REWARD_WIN = 10;
const REWARD_STEP = -0.1;

const LEVELS = [
  { size: 7, obstacles: 8 },
  { size: 9, obstacles: 15 },
  { size: 11, obstacles: 25 },
];

// BFS to check if a valid path exists
const isValidPath = (maze, size) => {
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let queue = [[0, 0]];
  let visited = Array.from({ length: size }, () => Array(size).fill(false));

  while (queue.length) {
    let [x, y] = queue.shift();
    if (x === size - 1 && y === size - 1) return true;

    for (let [dx, dy] of directions) {
      let nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < size && ny < size && !visited[nx][ny] && maze[nx][ny] !== 1) {
        visited[nx][ny] = true;
        queue.push([nx, ny]);
      }
    }
  }
  return false;
};

// Generate a maze ensuring a valid path exists
const generateMaze = (size, obstacleCount) => {
  let maze;
  do {
    maze = Array.from({ length: size }, () => Array(size).fill(0));
    for (let i = 0; i < obstacleCount; i++) {
      let x = Math.floor(Math.random() * size);
      let y = Math.floor(Math.random() * size);
      if ((x !== START_POS.x || y !== START_POS.y) && (x !== size - 1 || y !== size - 1)) {
        maze[x][y] = 1;
      }
    }
  } while (!isValidPath(maze, size)); // Keep generating until there's a valid path
  return maze;
};

const MazeGame = () => {
  const [level, setLevel] = useState(0);
  const [maze, setMaze] = useState(generateMaze(LEVELS[level].size, LEVELS[level].obstacles));
  const [player, setPlayer] = useState(START_POS);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
    }
  }, [timeLeft, gameOver]);

  const resetGame = () => {
    setLevel(0);
    setMaze(generateMaze(LEVELS[0].size, LEVELS[0].obstacles));
    setPlayer(START_POS);
    setScore(0);
    setTimeLeft(60);
    setGameOver(false);
    setShowInstructions(true);
  };

  const nextLevel = () => {
    if (level + 1 < LEVELS.length) {
      setLevel(level + 1);
      setMaze(generateMaze(LEVELS[level + 1].size, LEVELS[level + 1].obstacles));
      setPlayer(START_POS);
      setTimeLeft(60);
    } else {
      alert("🎉 Congratulations! You've completed all levels!");
      resetGame();
    }
  };

  const movePlayer = useCallback(
    (dx, dy) => {
      if (gameOver) return;

      const newX = player.x + dx;
      const newY = player.y + dy;

      if (
        newX >= 0 &&
        newX < LEVELS[level].size &&
        newY >= 0 &&
        newY < LEVELS[level].size &&
        maze[newX][newY] !== 1
      ) {
        setPlayer({ x: newX, y: newY });
        setScore(score + (newX === LEVELS[level].size - 1 && newY === LEVELS[level].size - 1 ? REWARD_WIN : REWARD_STEP));

        if (newX === LEVELS[level].size - 1 && newY === LEVELS[level].size - 1) {
          alert(`🏆 You Win Level ${level + 1}! Score: ${score.toFixed(1)}`);
          nextLevel();
        }
      }
    },
    [player, gameOver, score, level, maze]
  );

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameOver) return;

      switch (e.key) {
        case "ArrowUp":
          movePlayer(-1, 0);
          break;
        case "ArrowDown":
          movePlayer(1, 0);
          break;
        case "ArrowLeft":
          movePlayer(0, -1);
          break;
        case "ArrowRight":
          movePlayer(0, 1);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [movePlayer, gameOver]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      {showInstructions && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-90 z-50">
          <h1 className="text-4xl font-bold mb-4">How to Play</h1>
          <p className="text-lg mb-4">Use <span className="text-blue-500">arrow keys</span> or buttons to move.</p>
          <p className="text-lg mb-4">Avoid walls and reach 🏆 before time runs out!</p>
          <button className="bg-green-500 px-4 py-2 rounded-md text-lg" onClick={() => setShowInstructions(false)}>
            Start Game
          </button>
        </div>
      )}

      <h1 className="text-4xl font-bold mb-4">Maze Game</h1>
      <p className="text-xl mb-2">Level: {level + 1}</p>
      <p className="mb-4">Time Left: {timeLeft}s | Score: {score.toFixed(1)}</p>

      <div className="grid gap-1 p-4 border border-gray-500 bg-black"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${LEVELS[level].size}, 40px)`,
          gridTemplateRows: `repeat(${LEVELS[level].size}, 40px)`,
        }}>
        {maze.map((row, i) =>
          row.map((cell, j) => (
            <motion.div key={`${i}-${j}`} className={`w-10 h-10 flex items-center justify-center border border-gray-400 ${
              cell === 1 ? "bg-red-600" 
              : i === player.x && j === player.y ? "bg-blue-500" 
              : i === LEVELS[level].size - 1 && j === LEVELS[level].size - 1 ? "bg-green-500" 
              : "bg-gray-700"}`}>
              {i === player.x && j === player.y ? "😀" : i === LEVELS[level].size - 1 && j === LEVELS[level].size - 1 ? "🏆" : ""}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default MazeGame;








