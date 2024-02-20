/* eslint-disable linebreak-style */
import Room from "./room.js";

let TANGERINE = "#F28500";
let NAVY_BLUE = "#002F6C";
let STEEL_GREY = "#43464B";
let AEGEAN_BLUE = "#075D82";

let captains = [
  "Cap'n Ahab",
  "Cap'n Magellan",
  "Cap'n Cook",
  "Cap'n Drake",
  "Cap'n Nemo",
  "Cap'n Sparrow",
  "Cap'n Reynolds",
  "Cap'n Kirk",
  "Cap'n Solo",
  "Cap'n Haddock",
  "Cap'n Flint",
  "Cap'n Picard",
  "Cap'n Hook",
  "Cap'n Morgan",
  "Cap'n Janeway",
  "Cap'n Miller",
  "Cap'n Jack",
  "Cap'n Planet",
  "Cap'n Nelson",
  "Cap'n Crunch",
];

export default class App {
  constructor() {
    this._room = null;

    this._setup = false;
    this._placedShips = 0;
    this._curShip = 0;
    this._setShipHorizontal = false;
    this.validPlacement = true;

    this._playerReady = false;
    window.otherPlayerReady = false;

    this._playerTurn = 1;
    this._activeGame = false;
    this._shipsRemaining = 5;
    this._oppShipsRemaining = 5;
    this._shotsFired = 0;

    this._gameOver = false;

    this._introForm = document.querySelector("#introForm");
    this._onIntro = this._onIntro.bind(this);
    this._introForm.introSubmit.addEventListener("click", this._onIntro);

    this._die = document.querySelector("#die");
    this._onDie = this._onDie.bind(this);
    this._die.addEventListener("click", this._onDie);

    this._shipSetup = document.querySelector("#shipSetup");
    this._onShipSetup = this._onShipSetup.bind(this);
    this._shipSetup.addEventListener("click", this._onShipSetup);

    this._shipHorizontalBtn = document.querySelector("#setShipHorizontal");
    this._onShipHorizontal = this._onShipHorizontal.bind(this);
    this._shipHorizontalBtn.addEventListener("click", this._onShipHorizontal);

    window.addEventListener(
      "beforeunload",
      async (event) => {
        await Room.delete(this._room.roomId);
      },
      false
    );

    //add event listeners for boards
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        this._onTile = this._onTile.bind(this);
        this._onTileHover = this._onTileHover.bind(this);
        this._onTileOut = this._onTileOut.bind(this);

        this._playerTile = document.querySelector("#p" + x + y);
        this._playerTile.addEventListener("click", this._onTile);
        this._playerTile.addEventListener("mouseenter", this._onTileHover);
        this._playerTile.addEventListener("mouseleave", this._onTileOut);

        this._oppTile = document.querySelector("#o" + x + y);
        this._oppTile.addEventListener("click", this._onTile);
        this._oppTile.addEventListener("mouseenter", this._onTileHover);
        this._oppTile.addEventListener("mouseleave", this._onTileOut);
      }
    }
  }

  _onDie() {
    this._introForm.querySelector("#name").value =
      captains[Math.floor(Math.random() * captains.length)];
  }

  _onShipHorizontal() {
    if (!this._setShipHorizontal) {
      this._setShipHorizontal = true;
      this._shipHorizontalBtn.textContent = "Place Ship Vertically";
    } else {
      this._setShipHorizontal = false;
      this._shipHorizontalBtn.textContent = "Place Ship Horizontally";
    }
  }

  async _onIntro() {
    event.preventDefault();

    let name = this._introForm.querySelector("#name").value;
    let roomId = this._introForm.querySelector("#room").value;

    if ((name.length === 0) | (name.length > 15)) {
      alert("Name must be between 1 and 15 characters long, inclusive!");
      return;
    } else if (roomId.length !== 6) {
      alert("Room ID must be 6 characters long!");
      return;
    }

    let data = await Room.loadOrCreate(roomId, name);

    if ((data !== "room is full!") & (data !== "name already taken!")) {
      this._room = data;
      window.roomId = this._room.roomId;
      this._loadRoom();
    }
  }

  async _onShipSetup() {
    this._playerReady = true;
    this._hideElem(document.querySelector("#shipSetup"));

    this._showElem(document.querySelector("#turnIndicator"));
    document.querySelector("#turnIndicator").textContent =
      "Waiting for opponent...";

    let data = await Room.update(this._room.roomId);
    if (window.playerType === "player1") {
      await Room.setUpdate(
        this._room.roomId,
        this._room.player1,
        this._room.player2,
        this._room.playerBoard,
        data["oppBoard"]
      );
    } else {
      await Room.setUpdate(
        this._room.roomId,
        this._room.player1,
        this._room.player2,
        data["playerBoard"],
        this._room.oppBoard
      );
    }
  }

  async _onTile() {
    let id = event.target.getAttribute("id");
    let playerType = id.slice(0, 1);
    let x = id.slice(1, 2);
    let y = id.slice(2, 3);
    id = "#" + id;

    let curBoard;
    let curLength;

    if (this._setup) {
      if (
        (playerType === "p") &
        (window.playerType === "player1") &
        (this._room.playerBoard.tileArr[x][y].prevColor === NAVY_BLUE)
      ) {
        curLength = this._room.playerBoard.shipArr[this._curShip].length;
        curBoard = "playerBoard";
      } else if (
        (playerType === "o") &
        (window.playerType === "player2") &
        (this._room.oppBoard.tileArr[x][y].prevColor === NAVY_BLUE)
      ) {
        curLength = this._room.oppBoard.shipArr[this._curShip].length;
        curBoard = "oppBoard";
      } else {
        return;
      }

      if (!this.validPlacement) {
        return;
      }

      for (let i = 0; i < curLength; i++) {
        let curId;
        if (this._setShipHorizontal) {
          curId = "#" + playerType + String(Number(x) + Number(i)) + y;
        } else {
          curId = "#" + playerType + x + String(Number(y) + Number(i));
        }

        let curTile = Room.findTile(curId, this._room, curBoard);
        curTile.color = STEEL_GREY;
        curTile.prevColor = STEEL_GREY;
        document.querySelector(id).style.backgroundColor = STEEL_GREY;

        if (curBoard === "playerBoard") {
          this._room.playerBoard.shipArr[this._curShip].coords.push(curId);
        } else {
          this._room.oppBoard.shipArr[this._curShip].coords.push(curId);
        }
      }

      this._placedShips++;
      this._curShip++;

      if (this._placedShips === 5) {
        this._setup = false;
        this._showElem(document.querySelector("#shipSetup"));
        this._hideElem(document.querySelector("#setShipHorizontal"));
      }
      this._loadTiles();
    } else if (this._activeGame & !this._gameOver) {
      let curBoard;

      if (
        (playerType === "o") &
        (window.playerType === "player1") &
        (this._playerTurn === 1)
      ) {
        curBoard = "oppBoard";
      } else if (
        (playerType === "p") &
        (window.playerType === "player2") &
        (this._playerTurn === 2)
      ) {
        curBoard = "playerBoard";
      } else {
        return;
      }

      let curTile = Room.findTile(id, this._room, curBoard);
      if ((curTile.color === "red") | (curTile.color === AEGEAN_BLUE)) {
        return;
      }

      let hitStatus = Room.findHit(id, this._room, curBoard);
      if ((hitStatus === "hit") | (hitStatus === "destroyed")) {
        document.querySelector("#hitIndicator").textContent = "direct hit!";
        curTile.color = "red";
        curTile.prevColor = "red";
        document.querySelector(id).style.backgroundColor = "red";
        await Room.setUpdate(
          this._room.roomId,
          this._room.player1,
          this._room.player2,
          this._room.playerBoard,
          this._room.oppBoard
        );
      }
      if (hitStatus === "destroyed") {
        document.querySelector("#hitIndicator").textContent =
          "enemy ship destroyed!";
        this._oppShipsRemaining--;
        await this._room.socket.emit("roomUpdate", {
          id: this._room.roomId,
          message: "ship destroyed",
          player: window.playerName,
        });
        if (this._oppShipsRemaining === 0) {
          await this._room.socket.emit("roomUpdate", {
            id: this._room.roomId,
            message: "game over",
            player: window.playerName,
          });
          document.querySelector("#hitIndicator").textContent = "game over!";
          alert(
            "Good work, " +
              window.playerName +
              " - you led your ships to victory!"
          );
          this._gameOver = true;
        }
      }

      if (hitStatus === "miss") {
        document.querySelector("#hitIndicator").textContent = "miss!";
        curTile.color = AEGEAN_BLUE;
        curTile.prevColor = AEGEAN_BLUE;
        document.querySelector(id).style.backgroundColor = AEGEAN_BLUE;
        await Room.setUpdate(
          this._room.roomId,
          this._room.player1,
          this._room.player2,
          this._room.playerBoard,
          this._room.oppBoard
        );
      }

      this._shotsFired++;
      if (this._shotsFired >= this._shipsRemaining) {
        this._shotsFired = 0;
        if (this._playerTurn === 1) {
          this._playerTurn = 2;
        } else {
          this._playerTurn = 1;
        }
        await this._room.socket.emit("roomUpdate", {
          id: this._room.roomId,
          message: "turn changed",
          player: window.playerName,
        });
        this._loadRoom();
      }
      this._loadTiles();
    }
  }

  async _onTileHover() {
    let id = event.target.getAttribute("id");
    let playerType = id.slice(0, 1);
    let x = id.slice(1, 2);
    let y = id.slice(2, 3);

    if (this._setup) {
      this.validPlacement = true;
      let curLength;
      let curColor = TANGERINE;
      let curBoard;

      if (
        (playerType === "p") &
        (window.playerType === "player1") &
        (this._room.playerBoard.tileArr[x][y].color === NAVY_BLUE)
      ) {
        curLength = this._room.playerBoard.shipArr[this._curShip].length;
        curBoard = "playerBoard";
      } else if (
        (playerType === "o") &
        (window.playerType === "player2") &
        (this._room.oppBoard.tileArr[x][y].color === NAVY_BLUE)
      ) {
        curLength = this._room.oppBoard.shipArr[this._curShip].length;
        curBoard = "oppBoard";
      } else {
        return;
      }

      for (let i = 0; i < curLength; i++) {
        let curId;
        if (this._setShipHorizontal) {
          curId = "#" + playerType + String(Number(x) + Number(i)) + y;
        } else {
          curId = "#" + playerType + x + String(Number(y) + Number(i));
        }
        let curTile = Room.findTile(curId, this._room, curBoard);

        if ((curTile === -1) | (curTile.color !== NAVY_BLUE)) {
          curColor = "red";
          this.validPlacement = false;
        }
      }

      for (let i = 0; i < curLength; i++) {
        let curId;
        if (this._setShipHorizontal) {
          curId = "#" + playerType + String(Number(x) + Number(i)) + y;
        } else {
          curId = "#" + playerType + x + String(Number(y) + Number(i));
        }

        let curTile = Room.findTile(curId, this._room, curBoard);
        if (curTile !== -1) {
          curTile.prevColor = curTile.color;
          document.querySelector(curId).style.backgroundColor = curColor;
        }
      }
    } else if (this._activeGame) {
      let curBoard;

      if ((playerType === "o") & (window.playerType === "player1")) {
        curBoard = "oppBoard";
      } else if ((playerType === "p") & (window.playerType === "player2")) {
        curBoard = "playerBoard";
      } else {
        return;
      }

      let curId = "#" + playerType + x + y;
      let curTile = Room.findTile(curId, this._room, curBoard);
      curTile.prevColor = curTile.color;
      document.querySelector(curId).style.backgroundColor = TANGERINE;
    }
  }

  _onTileOut() {
    let id = event.target.getAttribute("id");
    let playerType = id.slice(0, 1);
    let x = id.slice(1, 2);
    let y = id.slice(2, 3);

    let curBoard;

    if (this._setup) {
      let curLength;
      if ((playerType === "p") & (window.playerType === "player1")) {
        curLength = this._room.playerBoard.shipArr[this._curShip].length;
        curBoard = "playerBoard";
      } else if ((playerType === "o") & (window.playerType === "player2")) {
        curLength = this._room.oppBoard.shipArr[this._curShip].length;
        curBoard = "oppBoard";
      }

      for (let i = 0; i < curLength; i++) {
        let curId;
        if (this._setShipHorizontal) {
          curId = "#" + playerType + String(Number(x) + Number(i)) + y;
        } else {
          curId = "#" + playerType + x + String(Number(y) + Number(i));
        }
        let curTile = Room.findTile(curId, this._room, curBoard);
        if (curTile !== -1) {
          let prevColor = curTile.prevColor;
          let curColor = curTile.color;

          document.querySelector(curId).style.backgroundColor = prevColor;

          curTile.color = prevColor;
          curTile.prevColor = curColor;
        }
      }
    } else if (this._activeGame) {
      let curId = "#" + id;
      if ((playerType === "o") & (window.playerType === "player1")) {
        curBoard = "oppBoard";
      } else if ((playerType === "p") & (window.playerType === "player2")) {
        curBoard = "playerBoard";
      } else {
        return;
      }

      let curTile = Room.findTile(curId, this._room, curBoard);
      let prevColor = curTile.prevColor;
      let curColor = curTile.color;

      if (prevColor === STEEL_GREY) {
        document.querySelector(curId).style.backgroundColor = NAVY_BLUE;
      } else {
        document.querySelector(curId).style.backgroundColor = prevColor;
      }

      curTile.color = prevColor;
      curTile.prevColor = curColor;
    }
  }

  _changeTurn() {
    if (this._playerTurn === 1) {
      this._playerTurn = 2;
    } else {
      this._playerTurn = 1;
    }

    this._loadRoom();
  }

  async _updateRoom() {
    let data = await Room.update(this._room.roomId);
    this._room = data;
    this._loadRoom();
  }

  async _deleteRoom() {
    await Room.delete(this._room.roomId);
  }

  _hideElem(target) {
    target.style.animation = "fade-out .5s ease-in";
    target.style.opacity = "0";
    target.style.display = "none";
  }

  _showElem(target) {
    target.style.visibility = "visible";
    target.style.animation = "fade-in .5s ease-in";
    target.style.opacity = "1";
    target.style.display = "flex";
  }

  _waitForOpp() {
    let curStr = "waiting for opponent";
    let count = 0;
    let curTimer = setInterval(() => {
      if (this._room.player2 !== "") {
        document.querySelector("#opponentName").textContent =
          this._room.player2;
        clearInterval(curTimer);
        return;
      }

      if (count === 4) {
        count = 0;
        curStr = "waiting for opponent";
      }
      document.querySelector("#opponentName").textContent = curStr;
      curStr += ".";
      count += 1;
    }, 500);
  }

  _loadRoom() {
    document.querySelector("#playerName").textContent = this._room.player1;
    document.querySelector("#opponentName").textContent = this._room.player2;

    this._hideElem(document.querySelector(".intro"));
    this._showElem(document.querySelector(".games"));

    this._loadTiles();

    if (this._room.player2 === "") {
      this._waitForOpp();
    } else if (!this._playerReady) {
      this._setup = true;
      this._showElem(document.querySelector("#setShipHorizontal"));
    }

    if (this._playerReady & window.otherPlayerReady) {
      this._activeGame = true;
      document.querySelector("#turnIndicator").textContent =
        "Player " + this._playerTurn + "'s Turn";
      if (
        ((this._playerTurn === 1) & (window.playerType === "player1")) |
        ((this._playerTurn === 2) & (window.playerType === "player2"))
      ) {
        this._showElem(document.querySelector("#hitIndicator"));

        this._showElem(document.querySelector("#shotIndicator"));
        document.querySelector("#shotIndicator").textContent =
          "Shots Remaining: " + String(this._shipsRemaining - this._shotsFired);
      } else {
        setTimeout(() => {
          this._hideElem(document.querySelector("#hitIndicator"));
          document.querySelector("#hitIndicator").textContent = "";
        }, 1200);
        this._hideElem(document.querySelector("#shotIndicator"));
      }
    }
  }

  _loadTiles() {
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        let curPid = "#p" + x + y;
        let curOid = "#o" + x + y;
        if (window.playerType === "player1") {
          document.querySelector(curPid).style.backgroundColor =
            this._room.playerBoard.tileArr[x][y].color;
          if (this._room.oppBoard.tileArr[x][y].color !== STEEL_GREY) {
            document.querySelector(curOid).style.backgroundColor =
              this._room.oppBoard.tileArr[x][y].color;
          } else {
            document.querySelector(curOid).style.backgroundColor = NAVY_BLUE;
          }
        } else {
          document.querySelector(curOid).style.backgroundColor =
            this._room.oppBoard.tileArr[x][y].color;
          if (this._room.playerBoard.tileArr[x][y].color !== STEEL_GREY) {
            document.querySelector(curPid).style.backgroundColor =
              this._room.playerBoard.tileArr[x][y].color;
          } else {
            document.querySelector(curPid).style.backgroundColor = NAVY_BLUE;
          }
        }
      }
    }
  }
}
