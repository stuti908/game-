import React, { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

const socket = new WebSocket("ws://localhost:8080"); // Connect to WebSocket server

const App = () => {
  const [game, setGame] = useState(new Chess());
  const [playerColor, setPlayerColor] = useState("w"); // Default player is White

  useEffect(() => {
    socket.onmessage = (event) => {
      const move = JSON.parse(event.data);
      setGame((prevGame) => {
        const updatedGame = new Chess(prevGame.fen());
        updatedGame.move(move);
        return new Chess(updatedGame.fen());
      });
    };

    socket.onopen = () => {
      console.log("Connected to WebSocket Server");
    };

    socket.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };
  }, []);

  const makeMove = (move) => {
    if (game.turn() !== playerColor) {
      alert("It's not your turn!");
      return;
    }

    const gameCopy = new Chess(game.fen());
    const result = gameCopy.move(move);

    if (result) {
      setGame(gameCopy);
      socket.send(JSON.stringify(move));

      if (gameCopy.isCheckmate()) {
        alert("Checkmate! Game Over.");
      } else if (gameCopy.isStalemate()) {
        alert("Stalemate! It's a draw.");
      } else if (gameCopy.isDraw()) {
        alert("Draw! No legal moves left.");
      } else if (gameCopy.isInsufficientMaterial()) {
        alert("Draw due to insufficient material!");
      }
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Online Chess Game</h1>
      <h2>You are playing as: {playerColor === "w" ? "White" : "Black"}</h2>
      <Chessboard
        position={game.fen()}
        onPieceDrop={(source, target) => makeMove({ from: source, to: target, promotion: "q" })}
        boardOrientation={playerColor === "w" ? "white" : "black"} // Rotate board for each player
      />
    </div>
  );
};

export default App;
