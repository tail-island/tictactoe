import I        from 'immutable';
import process  from 'process';
import readline from 'readline';

class GameState extends I.Record({board: I.List.of(0, 0, 0, 0, 0, 0, 0, 0, 0)}) {
  get winner() {
    const winningLines = I.List.of(I.List.of(0, 3, 6), I.List.of(1, 4, 7), I.List.of(2, 5, 8),  // 縦
                                   I.List.of(0, 1, 2), I.List.of(3, 4, 5), I.List.of(6, 7, 8),  // 横
                                   I.List.of(0, 4, 8), I.List.of(2, 4, 6));                     // 斜め

    const winner = winningLines
          .map(line => line.map(index => this.board.get(index)))
          .filter(cells => cells.rest().every(cell => cell == cells.first()) && cells.first() != 0)
          .map(cells => cells.first())
          .first();

    if (winner) {
      return winner;
    }

    return this.board.some(cell => cell == 0) ? -1 : 0;
  }

  get nextPlayer() {
    return this.board.filter(cell => cell == 0).size % 2 == 1 ? 1 : 2;
  }

  get nextGameStates() {
    return this.board.entrySeq()
      .filter(entry => entry[1] == 0)
      .map(entry => this.setIn(I.List.of('board', entry[0]), this.nextPlayer));
  }

  draw() {
    const boardString = (
      I.Range(0, 3)
        .map(i => this.board.slice(i * 3, i * 3 + 3))
        .map(cells => {
          return cells
            .map(cell => I.List.of('-', 'O', 'X').get(cell))
            .interpose(' ')
            .reduce((acc, cellString) => `${ acc }${ cellString  }`);
        })
        .interpose('\n')
        .reduce((acc, lineString) => `${ acc }${ lineString }`));

    console.log(boardString);
    console.log();
  }
}

class ComputerPlayer extends I.Record({gameState: null}) {
  getNextScoreAndGameState(gameState, alpha, beta) {
    // Immutable.jsのreduceを途中で止める方法が分からなくて枝刈りできなかったので、ごめんなさい、再帰で。

    const _ = (acc, nextGameStates) => {
      const nextGameState = nextGameStates.first();
      if (!nextGameState) {
        return acc;
      }

      const score = -this.getScore(nextGameState, -beta, -acc.get(0));
      if (score > acc.get(0)) {
        // 枝刈り
        if (score >= beta) {
          return I.List.of(score, nextGameState);
        }

        return _(I.List.of(score, nextGameState), nextGameStates.rest());

      } else {
        return _(acc, nextGameStates.rest());
      }
    };

    return _(I.List.of(alpha, null), gameState.nextGameStates);
  }

  getScore(gameState, alpha, beta) {
    const winner = gameState.winner;
    if (winner >= 0) {
      return winner == 0 ? 0 : (winner == gameState.nextPlayer ? 1 : -1);
    }

    return this.getNextScoreAndGameState(gameState, alpha, beta).get(0);
  }

  async getNextGameState() {
    return this.getNextScoreAndGameState(this.gameState, -Infinity, Infinity).get(1);
  }
}

class HumanPlayer extends I.Record({gameState: null}) {
  async getNextGameState() {
    console.log(`You are player ${ this.gameState.nextPlayer }. Game is below.`);
    this.gameState.draw();

    const nextGameStates = this.gameState.nextGameStates;

    nextGameStates.entrySeq().forEach(entry => {
      console.log(`No. ${ entry[0] }`);
      entry[1].draw();
    });

    return await new Promise(resolve => {
      const readlineInterface = readline.createInterface({ input: process.stdin, output: process.stdout });

      readlineInterface.question('Which do you select? ', answer => {
        resolve(nextGameStates.get(answer));
        readlineInterface.close();
      });
    });
  }
}

export default async function tictactoe() {
  (async function _(gameState, players) {
    const winner = gameState.winner;
    if (winner >= 0) {
      console.log(`Player ${ I.List.of('-', '1', '2').get(winner) } win!`);
      gameState.draw();
      return;
    }

    _(await players.first().set('gameState', gameState).getNextGameState(), players.rest());
  })(new GameState(), I.Repeat(I.List.of(new HumanPlayer(), new ComputerPlayer())).flatten(1));
}
