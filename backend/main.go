package main

import (
	"log"
	"strconv"
	state "ttt/backent"
)

const fps = 1

var possibleWins = [][][]int{
	// vertical
	{{0, 0}, {0, 1}, {0, 2}},
	{{1, 0}, {1, 1}, {1, 2}},
	{{2, 0}, {2, 1}, {2, 2}},
	// horizontal
	{{0, 0}, {1, 0}, {2, 0}},
	{{0, 1}, {1, 1}, {2, 1}},
	{{0, 2}, {1, 2}, {2, 2}},
	//diagonal
	{{0, 0}, {1, 1}, {2, 2}},
	{{2, 0}, {1, 1}, {0, 2}},
}

var matchID state.MatchID = 0

var sideEffects = state.SideEffects{
	OnDeploy: func(engine *state.Engine) {
		match := engine.CreateMatch()

		matchID = match.ID()

		match.Player1().SetName("Player1")
		match.Player2().SetName("Player2")

		fieldCount := 1
		for y := 0; y < 3; y++ {
			for x := 0; x < 3; x++ {
				match.AddField().SetX(x).SetY(y).SetFieldName("field" + strconv.Itoa(fieldCount))
				fieldCount++
			}
		}
	},
	OnFrameTick: func(engine *state.Engine) {},
}

func fieldsOfPlayer(playerID state.PlayerID, matchFields []state.Field) (fields []state.Field) {

	for _, matchField := range matchFields {
		if matchField.CheckedBy().ID() == playerID {
			fields = append(fields, matchField)
		}
	}

	return
}

func includeCompletedSequence(fields []state.Field) bool {
	for _, win := range possibleWins {
		sequenceCompleted := true
		for _, requiredField := range win {
			var requiredFieldChecked bool
			for _, field := range fields {
				if requiredField[0] == field.X() && requiredField[1] == field.Y() {
					requiredFieldChecked = true
					break
				}
			}
			if !requiredFieldChecked {
				sequenceCompleted = false
				break
			}
		}
		if sequenceCompleted {
			return true
		}
	}

	return false
}

var actions = state.Actions{
	CheckField: func(params state.CheckFieldParams, engine *state.Engine) {
		match := engine.Match(matchID)
		fields := match.Fields()

		for _, field := range fields {
			if field.X() == params.X && field.Y() == params.Y {
				field.SetCheckedBy(params.Player)
			}
		}

		playerFields := fieldsOfPlayer(params.Player, match.Fields())
		if includeCompletedSequence(playerFields) {
			match.SetWinner(params.Player)
		}
		log.Println(engine.Patch)
	},
	Reset: func(params state.ResetParams, engine *state.Engine) {
		engine.DeleteMatch(matchID)
		newMatch := engine.CreateMatch()
		matchID = newMatch.ID()
	},
	SelectPlayer: func(params state.SelectPlayerParams, engine *state.Engine) {
		engine.Player(params.Player).SetSelected(true)
	},
}

func main() {
	err := state.Start(actions, sideEffects, fps, 3496)
	if err != nil {
		panic(err)
	}
}
