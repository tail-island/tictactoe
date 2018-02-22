import R from 'ramda';

// 関数型プログラミングで作成した（しようとして挫折した）、試着室とお客様のシミュレーション。
// 元ネタはhttps://ja.wikipedia.org/wiki/Simulaのシミュレーションの部分。

// ボックス・ミューラー法でひたすら正規乱数を生成するジェネレーター。
const normalRandomGenerator = function*() {
  while (true) {
    const [x, y] = R.times(() => 1 - Math.random(), 2);

    yield* R.map(f => Math.sqrt(-2 * Math.log(x)) * f(2 * Math.PI * y), [Math.sin, Math.cos]);
  }
}();

// 引数で指定された数値をminからmaxの間に限定します。
const limit = (min, max) => R.pipe(R.max(min), R.min(max));

// 平均値と標準偏差、最小値、最大値を指定して、正規乱数を1つ生成します。
const normalRandom = (mean = 0, std = 1, min = -Infinity, max = Infinity) => limit(min, max)(mean + std * normalRandomGenerator.next().value);

export default function execute() {
  const initialState = {'now': 0,
                        'customers': [{'name': 'Sam'},
                                      {'name': 'Sally'},
                                      {'name': 'Andy'}],
                        'fittingRoom': {'inUse': false, 'waitingPersons': []},
                        'actions': [{'action': 'searchItem', 'on': 0},
                                    {'action': 'searchItem', 'on': 0},
                                    {'action': 'searchItem', 'on': 0}]};

  // ごめんなさい。ここまで書いたところで挫折しました……。
}
