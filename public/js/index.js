import App from "./app.js";
import "/socket.io/socket.io.js";

const main = () => {
  let curApp = new App();
  window.curApp = curApp;
};
main();
