/* eslint-disable linebreak-style */
/* eslint-disable comma-dangle */
/* eslint-disable linebreak-style */
import apiRequest from "./apirequest.js";
import "/socket.io/socket.io.js";

export class Tile {
  constructor(x, y, playerType) {
    this.x = x;
    this.y = y;
    this.playerType = playerType;
    this.id = "#" + playerType + x + y;
    this.state = "empty";
    this.guessMade = false;
    this.color = "#002F6C";
    this.prevColor = "#002F6C";
  }
}

export class Ship {
  constructor(length, name) {
    this.length = length;
    this.name = name;
    this.coords = [];
    this.hitsTaken = 0;
  }
}

export class Board {
  constructor(playerType) {
    this.tileArr = [];
    for (let x = 0; x < 10; x++) {
      this.tileArr[x] = [];
      for (let y = 0; y < 10; y++) {
        this.tileArr[x].push(new Tile(x, y, playerType));
      }
    }

    this.shipArr = [];
    this.shipArr.push(new Ship(5, "carrier"));
    this.shipArr.push(new Ship(4, "battleship"));
    this.shipArr.push(new Ship(3, "destroyer"));
    this.shipArr.push(new Ship(3, "submarine"));
    this.shipArr.push(new Ship(2, "patrol"));
  }
}

export default class Room {
  /* Returns a Room instance, creating the Room if necessary. */
  static async loadOrCreate(roomId, player) {
    try {
      let data = await apiRequest("GET", "/rooms/" + roomId);
      let curRoom = new Room(data);

      if (curRoom.player2 === "") {
        let data = await apiRequest("PATCH", "/rooms/" + roomId, {
          player1: curRoom.player1,
          player2: player,
        });
        curRoom = new Room(data);
        window.playerType = "player2";
        window.playerName = player;
        curRoom.socket.emit("roomUpdate", {
          id: roomId,
          message: "player2 joined",
        });
        return curRoom;
      }
      return curRoom;
    } catch (error) {
      if (
        (error.message === "room is full!") |
        (error.message === "name already taken!")
      ) {
        alert(error.message);
        return error.message;
      }
      let data = await apiRequest("POST", "/rooms", {
        id: roomId,
        player1: player,
        player2: "",
        playerBoard: new Board("p"),
        oppBoard: new Board("o"),
      });
      let curRoom = new Room(data);
      window.playerType = "player1";
      window.playerName = player;
      curRoom.socket.emit("roomUpdate", {
        id: roomId,
        message: "player1 joined",
      });
      return curRoom;
    }
  }

  static async update(roomId) {
    let data = await apiRequest("GET", "/update/" + roomId);
    let curRoom = new Room(data);
    return curRoom;
  }

  static async setUpdate(roomId, player1, player2, playerBoard, oppBoard) {
    let data = await apiRequest("PATCH", "/room_update/" + roomId, {
      id: roomId,
      player1: player1,
      player2: player2,
      playerBoard: playerBoard,
      oppBoard: oppBoard,
    });
    let curRoom = new Room(data);
    curRoom.socket.emit("roomUpdate", {
      id: roomId,
      message: "room updated",
      player: window.playerName,
    });
  }

  static async changeTurn(roomId) {
    curRoom.socket.emit("roomUpdate", {
      id: roomId,
      message: "turn changed",
      player: window.playerName,
    });
  }

  static async delete(roomId) {
    await apiRequest("DELETE", "/rooms/" + roomId);
  }

  static findTile(id, room, boardType) {
    let curBoard;
    if (boardType === "playerBoard") {
      curBoard = room.playerBoard;
    } else {
      curBoard = room.oppBoard;
    }

    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        if (curBoard.tileArr[x][y].id === id) {
          return curBoard.tileArr[x][y];
        }
      }
    }
    return -1;
  }

  static findHit(id, room, boardType) {
    let curBoard;
    if (boardType === "playerBoard") {
      curBoard = room.playerBoard;
    } else {
      curBoard = room.oppBoard;
    }

    for (let i = 0; i < curBoard.shipArr.length; i++) {
      for (let j = 0; j < curBoard.shipArr[i].coords.length; j++) {
        if (id === curBoard.shipArr[i].coords[j]) {
          curBoard.shipArr[i].hitsTaken++;
          if (curBoard.shipArr[i].hitsTaken >= curBoard.shipArr[i].length) {
            return "destroyed";
          } else {
            return "hit";
          }
        }
      }
    }
    return "miss";
  }

  constructor(data) {
    this.socket = io();
    this.roomId = data["id"];
    this.player1 = data["player1"];
    this.player2 = data["player2"];
    this.playerBoard = data["playerBoard"];
    this.oppBoard = data["oppBoard"];
  }
}
