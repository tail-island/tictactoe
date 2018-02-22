import process  from 'process';
import R        from 'ramda';
import readline from 'readline';

// [a] -> [a] -> [a]
const addVector = R.curry(R.pipe(R.zip, R.map(R.apply(R.add))));

// [a] -> Boolean
const allSame = R.pipe(R.aperture(2), R.all(R.apply(R.equals)));

// [a] -> [[a, i]]
const getIndexed = R.addIndex(R.map)((a, i) => [a, i]);

// [[a, i]] -> [i]
const getIndice = R.map(R.nth(1));

// R.call(R.pipe(R.always(x), ...fs)
const cpa = (x, ...fs) => R.call(R.pipe(R.always(x), ...fs));

const winningLines = R.call(() => {
  const getHorizontal = center => [center - 1, center, center + 1];
  const getVertical   = center => [center - 3, center, center + 3];
  const getDiagonals  = center => R.map(addVector(getVertical(center)), [[-1, 0, +1], [+1, 0, -1]]);

  return cpa(4,
             R.juxt([R.pipe(R.juxt([R.pipe(getVertical, R.map(getHorizontal)),
                                    R.pipe(getHorizontal, R.map(getVertical))]),
                            R.apply(R.concat)),
                     getDiagonals]),
             R.apply(R.concat));
});

const getWinner = R.memoize(board => {
  return cpa(winningLines,
             R.map(R.map(R.nth(R.__, board))),
             R.filter(R.both(allSame, R.pipe(R.head, R.complement(R.equals(0))))),
             R.ifElse(R.complement(R.isEmpty),
                      R.pipe(R.head, R.head),
                      R.always(R.any(R.equals(0), board) ? -1 : 0)));
});

const getNextPlayer = R.memoize(board => {
  return R.length(R.filter(R.equals(0), board)) % 2 == 1 ? 1 : 2;
});

const getNextBoards = R.memoize(board => {
  return cpa(board,
             getIndexed,
             R.filter(R.pipe(R.head, R.equals(0))),
             getIndice,
             R.map(R.update(R.__, getNextPlayer(board), board)));
});

const drawBoard = board => {
  const boardString = cpa(board,
                          R.splitEvery(3),
                          R.map(R.pipe(R.map(R.nth(R.__, ['-', 'O', 'X'])),
                                       R.join(' '))),
                          R.join('\n'));

  console.log(boardString);
  console.log();
};

const getNextBoardByComputer = async board => {
  const getNextScoreAndBoard = (board, alpha, beta) => {
    const prune = R.when(R.pipe(R.nth(0), R.gte(R.__, beta)),
                         R.reduced);

    return R.reduce((acc, nextBoard) => prune(R.maxBy(R.head, acc, [-getScore(nextBoard, -beta, -R.head(acc)), nextBoard])),
                    [alpha, null],
                    getNextBoards(board));
  };

  const getScore = (board, alpha, beta) => {
    const winner = getWinner(board);
    if (winner >= 0) {
      return winner == 0 ? 0 : (winner == getNextPlayer(board) ? 1 : -1);
    }

    return R.nth(0, getNextScoreAndBoard(board, alpha, beta));
  };

  return R.nth(1, getNextScoreAndBoard(board, -Infinity, Infinity));
};

const getNextBoardByHuman = async board => {
  console.log(`You are player ${ getNextPlayer(board) }. Now board is below.`);
  drawBoard(board);

  const nextBoards = getNextBoards(board);

  R.addIndex(R.forEach)((board, i) => {
    console.log(`No. ${ i }`);
    drawBoard(board);
  }, nextBoards);

  return await new Promise(resolve => {
    const readlineInterface = readline.createInterface({ input: process.stdin, output: process.stdout });

    readlineInterface.question('Which do you select? ', answer => {
      resolve(R.nth(answer, nextBoards));
      readlineInterface.close();
    });
  });
};

export default async function execute() {
  const getNextBoardFunctionIterator = function*() {
    while (true) {
      yield getNextBoardByHuman;
      yield getNextBoardByComputer;
    }
  }();

  (async function f(board) {
    const winner = getWinner(board);
    if (winner >= 0) {
      console.log(`Player ${ R.nth(winner, ['-', '1', '2']) } win!`);
      drawBoard(board);
      return;
    }

    f(await getNextBoardFunctionIterator.next().value(board));
  })(R.repeat(0, 9));
}
