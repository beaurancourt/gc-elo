var elo = require('elo-rank')(32);
var randgen = require('randgen');
var _ = require('underscore');

function play(player1, player2) {
  let chancePlayer1Wins = elo.getExpected(player1.skill, player2.skill);
  let score = (Math.random() < chancePlayer1Wins) ? 1 : 0;

  let expectedPlayer1Score = elo.getExpected(player1.rating, player2.rating);

  let updatedPlayer1Rating = elo.updateRating(expectedPlayer1Score, score, player1.rating)
  let updatedPlayer2Rating = elo.updateRating(1 - expectedPlayer1Score, 1 - score, player2.rating)
  player1.rating = updatedPlayer1Rating
  player2.rating = updatedPlayer2Rating

  player1.peak = Math.max(player1.peak, updatedPlayer1Rating);
  player2.peak = Math.max(player2.peak, updatedPlayer2Rating);

  player1.games = player1.games + 1;
  player2.games = player2.games + 1;

  return [player1, player2];
}

let players = []
for (var i = 0; i < 10000; i++) {
  players.push(
    {
      'skill': randgen.rnorm(1300, 400),
      'rating': 1300,
      'games': 0,
      'gc': false,
      'peak': 1300,
      'swing': 0
    }
  );
}

function playMatches(players) {
  players = players.sort((a, b) => a.rating - b.rating);
  for (var i = 0; i < players.length - 1; i = i + 2) {
    let result = play(players[i], players[i + 1]);
    players[i] = result[0];
    players[i+1] = result[1];
  }
  return players;
}

function matchmake(playerList) {
  let shuffedPlayers = _.shuffle(playerList);
  let inMatch = shuffedPlayers.slice(0, 1000);
  let noMatch = shuffedPlayers.slice(1000);
  return playMatches(inMatch).concat(noMatch);
}

for (var i = 0; i < 30000; i++) {
  console.log(i);
  players = matchmake(players);
  placedPlayers = _.filter(players, (player) => player.games > 50);
  unplacedPlayers = _.filter(players, (player) => player.games <= 50);
  if (placedPlayers.length > 500) {
    let sortedPlayers = placedPlayers.sort((a, b) => b.rating - a.rating);
    for (var j = 0; j < Math.floor(sortedPlayers.length * .003); j++) {
      sortedPlayers[j].gc = true;
    }
    players = sortedPlayers.concat(unplacedPlayers);
  }
}

let grandChamps = _.filter(players, (player) => player.gc);

console.log("A sample of Grand Champs")
console.log(_.sample(grandChamps, 10));

console.log("Portion of Grand Champs: " + (grandChamps.length / players.length));
