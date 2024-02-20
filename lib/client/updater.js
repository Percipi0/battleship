import "/socket.io/socket.io.js";

window.updateSocket = io();

updateSocket.on("cssChange", (path) => {
  let timestamp = `${new Date().getTime()}`;
  let links = document.querySelectorAll("link[rel=stylesheet]");
  for (const link of links) {
    let url = new URL(link.href);
    if (!url.host.includes("localhost")) continue;
    url.searchParams.delete("_ts");
    url.searchParams.append("_ts", timestamp);
    link.href = url.href;
  }
});

updateSocket.on("reload", () => {
  window.location.reload();
});

updateSocket.on("roomUpdate", (msg) => {
  if (msg["id"] === window.roomId) {
    if (msg["message"] === ("player2 joined")) {
      window.curApp._updateRoom();
    }

    if (msg["message"] === ("room updated") & msg["player"] !== window.playerName) {
      window.otherPlayerReady = true;
      if (window.otherPlayerReady & window.curApp._playerReady) {
        window.curApp._updateRoom();
      }
    }

    if (msg["message"] === ("room updated") & msg["player"] === window.playerName) {
      window.curApp._updateRoom();
    }

    if (msg["message"] === ("turn changed") & msg["player"] !== window.playerName) {
      window.curApp._changeTurn();
    }

    if (msg["message"] === ("ship destroyed") & msg["player"] !== window.playerName) {
      window.curApp._shipsRemaining --;
    }

    if (msg["message"] === ("game over") & msg["player"] !== window.playerName) {
      alert("My apologies, " + window.playerName + " - you lose!");
      window.curApp._gameOver = true;
    }
  }

  return;
});

updateSocket.on("playerLost", async (msg) => {
  if (msg === window.roomId) {
    alert("Your opponent left!");
    window.curApp._deleteRoom();
    window.location.reload();
  }
  return;
});
