import "./test"
console.log("hello")

const ws = new WebSocket("ws://localhost:3496/ws");
ws.open = () => this.setSocketStatus("open");
ws.onclose = () => this.setSocketStatus("closed");

let player1ID;
let player2ID;

ws.onmessage = (e) => {
  const message = JSON.parse(e.data);
  if (message.kind === "currentState") {
    console.log("receiving initial state:", JSON.parse(message.content))
    const s = JSON.parse(message.content)
    player1ID = s.match[Object.keys(s.match)[0]].player1.id
    player2ID = s.match[Object.keys(s.match)[0]].player2.id
  } else if (message.kind === "update") {
    console.log("receiving update", JSON.parse(message.content));
  } else {
    this.setReceivedData("received message response", JSON.parse(message.content));
  }
};


setTimeout(() => {
  const message = {
    kind: "checkField",
    content: JSON.stringify({
      player: player1ID,
      x: 2,
      y: 1,
    })
  }
  ws.send(JSON.stringify(message))
}, 1000)

setInterval(() => {
  // console.log(ws)
}, 1000)
