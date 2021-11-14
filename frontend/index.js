const ws = new WebSocket("ws://localhost:3496/ws");
ws.open = () => this.setSocketStatus("open");
ws.onclose = () => this.setSocketStatus("closed");

let player1ID;
let player2ID;

let selectedPlayerID;

let matchID;

ws.onmessage = (e) => {
  const message = JSON.parse(e.data);
  if (message.kind === "currentState") {
    console.log("receiving initial state:", JSON.parse(message.content))
    const s = JSON.parse(message.content)
    matchID = Object.keys(s.match)[0]
    player1ID = s.match[matchID].player1.id
    player2ID = s.match[matchID].player2.id
  } else if (message.kind === "update") {
    const s = JSON.parse(message.content)
    updateMatch(s.match[matchID])
    console.log("receiving update", JSON.parse(message.content));
  } else {
    this.setReceivedData("received message response", JSON.parse(message.content));
  }
};

function updateMatch(match) {
  console.log(match)
  if (!match || !match.fields) return
  Object.keys(match.fields).forEach((key) => {
    const field = match.fields[key]
    if (!field.checkedBy) {
      document.getElementById(field.fieldName).style.backgroundColor = "white"
    }
    if (field.checkedBy.id === player1ID) {
      document.getElementById(field.fieldName).style.backgroundColor = "blue"
    }
    if (field.checkedBy.id === player2ID) {
      document.getElementById(field.fieldName).style.backgroundColor = "red"
    }
  })
}

function checkField(x, y) {
  const msg = {
    kind: "checkField",
    content: JSON.stringify({
      player: selectedPlayerID,
      x: x,
      y: y,
    })
  }
  ws.send(JSON.stringify(msg))
}

function selectPlayer1() {
  const msg = {
    kind: "selectPlayer",
    content: JSON.stringify({
      player: player1ID,
    })
  }
  ws.send(JSON.stringify(msg))
  selectedPlayerID = player1ID
  setButtonState(true)
}

function selectPlayer2() {
  const msg = {
    kind: "selectPlayer",
    content: JSON.stringify({
      player: player2ID,
    })
  }
  ws.send(JSON.stringify(msg))
  selectedPlayerID = player2ID
  setButtonState(true)
}

function setButtonState(disabled) {
  document.getElementById("selectPlayerOne").disabled = disabled;
  document.getElementById("selectPlayerTwo").disabled = disabled;
}

class FieldWrapper {
  constructor({x, y, fieldName, checkedBy}) {
    this.x = x
    this.y = y
    this.fieldName = fieldName
    this.checkedBy = checkedBy
  }

  _update(field) {
    if (field.x) {
      this.x = field.x
    }
    if (field.y) {
      this.y = field.y
    }
    if (field.fieldName) {
      this.fieldName = field.fieldName
    }
    if (field.checkedBy) {
      // TODO
    }
  }

  render() {
    this.render()
  }
}

// idea: instead if new FieldWrapper pass func through constructor (data) => new Field(data)
// so user can define the type
class MatchWrapper {
  constructor({player1, player2, fields, winner}) {
    this.player1 = new PlayerWrapper(player1)
    this.player2 = new PlayerWrapper(player2)
    this.fields = new Map()
    Object.keys(fields).forEach((key) => {
      const el = new FieldWrapper(fields[key])
      this.fields.set(key, el)
      el._parent = this
    })
    this.winner = winner
  }

  _update(match) {
    if (match.fields) {
      for (const fieldKey in match.fields) {
        const data = match.fields[fieldKey]
        const el = this.fields.get(data.id)
        if (data.operationKind === "DELETE") {
          this.fields.delete(data.id)
        } else {
          el._update(data)
        }
      }
    }
    if (match.player1) {
      this.player1._update(match.player1)
    }
    if (match.player2) {
      this.player1._update(match.player1)
    }
    if (match.winner) {
      if (match.winner.operationKind === "DELETE") {
        this.winner = null
      } else {
        // TODO: handle
      }
    }
  }

  _cascadeRender() {
    this.render()
    this.fields.forEach((_, field) => {
      field._cascadeRender()
    })
  }
}

class PlayerWrapper {
  constructor({name, selected}) {
    this.name = name
    this.selected = selected
  }

  _update(player) {
    if (player.name) {
      this.name = player.name
    }
    if (player.selected) {
      this.selected = player.selected
    }
  }

  _cascadeRender() {
    this.render()
  }
}
