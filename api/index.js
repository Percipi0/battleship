import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { MongoClient } from "mongodb";

let api = express.Router();

let Rooms;
let IDs = [];
let roomMap = {};

const initApi = async (app) => {
  app.set("json spaces", 2);
  app.use("/api", api);

  let conn = await MongoClient.connect("mongodb://127.0.0.1");

  let db = conn.db("battleship");
  Rooms = db.collection("rooms");

  let roomArr = await Rooms.find(
    {},
    { _id: 0, id: 1, player1: 1, player2: 1, playerBoard: 1, oppBoard: 1 }
  ).toArray();
  for (let i = 0; i < roomArr.length; i++) {
    IDs.push(roomArr[i]["id"]);
    roomMap[roomArr[i]["id"]] = [
      roomArr[i]["player1"],
      roomArr[i]["player2"],
      roomArr[i]["playerBoard"],
      roomArr[i]["oppBoard"],
    ];
  }
};

api.use(bodyParser.json());
api.use(cors());

api.get("/", (req, res) => {
  res.json({ message: "Hello, world!" });
});

api.get("/rooms/:id", (req, res) => {
  let id = req.params.id;
  if (IDs.includes(id)) {
    if ((roomMap[id][0] !== "") & (roomMap[id][1] !== "")) {
      res.status(400).json({ error: "room is full!" });
      return;
    }
    res.json({
      id: id,
      player1: roomMap[id][0],
      player2: roomMap[id][1],
      playerBoard: roomMap[id][2],
      oppBoard: roomMap[id][3],
    });
  } else {
    res.status(404).json({ error: "No room with ID " + id });
    return;
  }
});

api.get("/update/:id", (req, res) => {
  let id = req.params.id;
  if (IDs.includes(id)) {
    res.json({
      id: id,
      player1: roomMap[id][0],
      player2: roomMap[id][1],
      playerBoard: roomMap[id][2],
      oppBoard: roomMap[id][3],
    });
  } else {
    res.status(404).json({ error: "No room with ID " + id });
    return;
  }
});

api.use(bodyParser.json());
api.post("/rooms", (req, res) => {
  let id = req.body.id;
  let player1 = req.body.player1;
  let player2 = req.body.player2;
  let playerBoard = req.body.playerBoard;
  let oppBoard = req.body.oppBoard;

  if (!Object.keys(req.body).includes("id") || id === "") {
    res.status(400).json({ error: "Missing id" });
    return;
  }

  if (IDs.includes(id)) {
    res.status(400).json({ error: id + " already exists" });
    return;
  }
  IDs.push(id);
  roomMap[id] = [player1, player2, playerBoard, oppBoard];

  Rooms.insertOne({
    id: id,
    player1: player1,
    player2: player2,
    playerBoard: playerBoard,
    oppBoard: oppBoard,
  });
  res.json({
    id: id,
    player1: player1,
    player2: player2,
    playerBoard: playerBoard,
    oppBoard: oppBoard,
  });
});

api.patch("/rooms/:id", (req, res) => {
  let id = req.params.id;

  if (!IDs.includes(id)) {
    res.status(404).json({ error: "No room with ID " + id });
    return;
  }

  let player1 = req.body.player1;
  let player2 = req.body.player2;
  let playerBoard = roomMap[id][2];
  let oppBoard = roomMap[id][3];

  if (player1 === player2) {
    res.status(400).json({ error: "name already taken!" });
    return;
  }

  Rooms.replaceOne(
    { id: id },
    {
      id: id,
      player1: player1,
      player2: player2,
      playerBoard: playerBoard,
      oppBoard: oppBoard,
    }
  );

  roomMap[id] = [player1, player2, playerBoard, oppBoard];

  res.json({
    id: id,
    player1: player1,
    player2: player2,
    playerBoard: playerBoard,
    oppBoard: oppBoard,
  });
});

api.patch("/room_update/:id", (req, res) => {
  let id = req.params.id;

  if (!IDs.includes(id)) {
    res.status(404).json({ error: "No room with ID " + id });
    return;
  }

  let player1 = req.body.player1;
  let player2 = req.body.player2;
  let playerBoard = req.body.playerBoard;
  let oppBoard = req.body.oppBoard;

  Rooms.replaceOne(
    { id: id },
    {
      id: id,
      player1: player1,
      player2: player2,
      playerBoard: playerBoard,
      oppBoard: oppBoard,
    }
  );

  roomMap[id] = [player1, player2, playerBoard, oppBoard];

  res.json({
    id: id,
    player1: player1,
    player2: player2,
    playerBoard: playerBoard,
    oppBoard: oppBoard,
  });
});

api.delete("/rooms/:id", (req, res) => {
  let id = req.params.id;
  if (!IDs.includes(id)) {
    res.status(404).json({ error: "No room with ID " + id });
    return;
  }

  delete roomMap[id];
  let idx = IDs.indexOf(id);
  IDs.splice(idx, 1);

  Rooms.deleteOne({ id: id });

  res.json({ success: true });
});

/* Catch-all route to return a JSON error if endpoint not defined.
   Be sure to put all of your endpoints above this one, or they will not be called. */
api.all("/*", (req, res) => {
  res
    .status(404)
    .json({ error: `Endpoint not found: ${req.method} ${req.url}` });
});

export default initApi;
