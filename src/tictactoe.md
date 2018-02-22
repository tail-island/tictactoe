# 関数型プログラミングのすゝめ

突然ですが、質問です。関数の引数が参照渡しになるプログラミング言語と値渡しになるプログラミング言語、あなたはどちらが好きですか？

プリミティブ型だと値渡しでオブジェクト型だと参照渡しになるというような意味での質問ではなくて、古き良きFORTRANのような参照渡ししか存在しないプログラミング言語と値渡しがサポートされている今時のプログラミング言語の、どちらが好きかという質問です。

当然、値渡しをサポートするプログラミング言語の方が好きですよね？　`foo(x)`と書く場合に、`x`の内容が関数の呼び出し前と後で変わるかもしれないと考えながらプログラミングするのは大変ですもん。副作用が少ない方が、楽にプログラミングできるというわけ。

この副作用を考えなくても良いプログラミングの方式があったら、嬉しいと思いませんか？　関数型プログラミングは、この面倒な副作用を究極まで抑えてくれるんです。

---

もう一つ質問を。コピー＆ペーストして新しいコードを作成したことがありますか？　コード途中の一部分が異なるのだけど、その部分はコピー＆ペーストした上で修正せざるをえなかったという場合です。

私は昔、大量にコピー＆ペーストしてコードを作成していました。forループの中の条件式がちょっと違うんだよなぁ、とか、`x`には`width`で`y`には`height`で処理しなければならないんだよなぁ、とかという場合です。重複が発生して嫌な臭いが漂ってくるんですけど、でもこれはどうにもならないんだと諦めていました。

もしこの重複をゼロにできるなら、嬉しいと思いませんか？　関数という小さな要素を組み合わせて関数を作成していく関数型プログラミングは、この重複を極限まで減らしてくれるんです。

---

もし上の提案を魅力的だと思ったら、お暇な時に本稿を読んでみてください。使用するプログラミング言語は多くの方に馴染みがあるだろうJavaScript（実行環境はNode.js。文法はECMAScript 2017）なので、ご安心を。Haskellのような関数型プログラミング言語を使用しなくても、今時の言語ならかなりのところまで関数型プログラミングできるんです。あなたが次のプロジェクトで使おうとしている、そのプログラミング言語でも。

## 副作用は悪です。根絶のために、昔から様々な工夫がなされてきました

大昔、私が初めてコンピューターに触ったころ、マイコン（マイクロ・コンピューター）からパソコン（パーソナル・コンピューター）に名前が変わり始めたころは、プログラミングはBASICという言語でやるものでした。このBASICって、今考えると信じられないのですけど、グローバル変数しかなかったんですよ。サブ・ルーチンで何か計算をしたら、その計算結果はグローバル変数に入れるしかなくて、だから、どのサブ・ルーチンがどの変数を変更するのかの対応表を頭の中においてプログラミングしていました。

実は、近代プログラミング言語であるJavaScriptでも、`var`や`const`や`let`で修飾しなければ、グローバルな変数になります[^1]。

~~~ javascript
<!DOCTYPE html>
<html>
  <head>
    <title>Pythonを書いた後だとやりがちなミス</title>
  </head>
  <body>
    <script>
      function foo() {
        i = 999;  // iはグローバル変数。
      }

      for (i = 0; i < 10; ++i) {  // iはグローバル変数。
         foo();

         document.write('' + (i + 1) + '回fooしました<br>');
      }
    </script>
  </body>
</html>
~~~

上のコード、グローバル変数をループのカウンターに使用していて、そのグローバル変数のカウンターを`foo`の中で変更していますから、ループの実行回数は1回だけ、しかも「1000回fooしました」と表示されてしまいます。大昔は、こんなプログラミング言語ばっかりだったんですよ。

こんな状態じゃあとてもプログラムなんか書いてられないので、関数内でだけ使える変数ってのが生まれました。JavaScriptでは、`var`を付けるとその変数のスコープ（有効範囲）は関数内のみになります（関数の外側で宣言されれば、グローバル変数ですけど）。しかし、`var`をつけていても、以下のような場合には混乱が発生しました。

~~~ javascript
function foo() {
  var x = 0;

  for (var i = 0; i < 10; ++i) {
    var x = i;  // このxは外側のxと同じ変数になります。

    ...
  }

  console.log(`${ x } == 9です`);
}
~~~

`for`の内側の`x`と外側の`x`のスコープは関数`foo`と同じものなので実体は同じ変数、だから最後の`console.log`では9が表示されてしまいます。この問題を避けるために、変数を`var`するときは同じ関数の中で同じ名前の変数が`var`されていないことを確認する……のは面倒ですね。

だから、ECMAScript 2015で`let`が追加されました。`let`のスコープはブロックなので、関数よりも小さな範囲であるブロックをチェックするだけで済んでとても嬉しい。

~~~ javascript
function foo() {
  var x = 0;

  for (var i = 0; i < 10; ++i) {
    let x = i;  // varをletに変更。これで外側のxとは別の変数になります。

    ...
  }

  console.log(`${ x } == 0です`);  // letなので、ブロック内の変更の影響を受けません
}
~~~

ふぅ、これでメデタシメデタシ……なわけじゃないですよね。ブロックが大きい場合はチェックが大変ですし、`for`の中の`let`を書き忘れたら外側に悪影響が出ちゃいますし。

なんだか、ここまでの話って、対症療法を繰り返しただけに思えませんか？　内側が迷惑をかける可能性がある範囲を少しずつ小さくしてきただけ。迷惑を被る外側にしてみると、内側を全部チェックしなければならないので面倒極まりなくて、根本解決じゃあない。

そもそも、変数ってのが良くないんじゃないでしょうか？　いや、変数そのものは別に悪くないのかも。たぶん、変数の値を変更できてしまうことが悪いのでしょう。処理にともなって状態（変数の値）が変更されることを副作用と呼ぶのですけど、この副作用が、諸悪の根源なのではないでしょうか？

## イミュータブルでいきましょう

というわけで、根本解決しちゃいましょう。ECMAScript 2015の`const`を使えば、再代入できない変数を定義できます。たとえば、以下のコードはきちんとエラーになるので安心です。

~~~ javascript
const x = 0;

for (var i = 0; i < 10; ++i) {
  x = i;  // ここでエラーになります。再代入はできません。

  ...
}

console.log(`${ x } == 0です。途中で再代入してエラーになるかもしれませんけど`);
~~~

でも、`const`って、再代入を防ぐだけなんですよ。だから、以下のような場合には問題が発生しちゃう。

~~~ javascript
function foo() {
  const xs = [1, 2, 3];

  for (var i = 0; i < 10; ++i) {
    xs[i] = 0;  // xsへの再代入ではないので、エラーにはなりません

    ...
  }

  console.log(`${ xs } == 0,0,0,0,0,0,0,0,0,0です`);
}
~~~

`xs = [0, 0, 0]`ならば再代入なのでエラーになりますけど、`xs[0] = 0`は`xs`そのものへの再代入ではないのでエラーになってくれません。

関数呼び出しのときにも、同じことが言えます。以下のコードなら`foo()`の中を見ないでも安心して`x`を使えますけど、

~~~ javascript
const x = 0;

foo(x);  // xはプリミティブな型なので、値渡しになります。だから、fooの中でどんな処理をしても影響されません。

const y = x + ...  // fooをチェックしないでも、安心してxを使えます。
~~~

以下のコードの場合は、`foo()`の中を見ないと怖くてしょうがない。

~~~ javascript
const xs = [1, 2, 3];

foo(xs);  // xsはオブジェクト（Array）なので、参照渡しになります。だから、fooの処理次第では中身が変わってしまいます。

const y = xs[0];  // yに何が代入されるかは、fooの処理内容次第……。
~~~

この問題はECMAScriptの文法だけでは解決できません[^2]ので、facebook社が作成してくれた最近話題の[Immutable.js](https://facebook.github.io/immutable-js/)を使って解決しましょう。Immutable.jsを使ったコードは、以下のような感じになります。

~~~ javascript
import I from 'immutable';

const xs = I.List.of(1, 2, 3);
const ys = xs.set(0, 999);  // 0番目を999に変更した新しいリストを返します。

console.log(xs);  // List [ 1, 2, 3 ]。イミュータブルなので変更されません。
console.log(ys);  // List [ 999, 2, 3 ]。0番目の要素がきちんと999になっています。
~~~

うん、これで副作用がない安心なコードを書ける……のかな？　まだ関数型プログラミングが出てきていないけど……。

## メソッドの中の変数もイミュータブルにしたい

とりあえず、Immutable.jsを使ったオブジェクト指向なコードを考えてみましょう。お題は「絶対に負けない三目並べ」としました。コードは[GitHub](https://github.com/tail-island/tictactoe/)にあります。

~~~ javascript
import I        from 'immutable';
import process  from 'process';
import readline from 'readline';

// ゲームの状態を表すクラス。イミュータブル！
class GameState extends I.Record({board: I.List.of(0, 0, 0, 0, 0, 0, 0, 0, 0)}) {
  // まだマルやバツが書き込まれていないセルの数を数えます。他のメソッドの共通部分を抽出したものです。
  get vacantCellCount() {
    let vacantCellCount = 0;  // イミュータブルじゃないけど、しょうがない……。まぁ、メソッドの中でしか使わないし。

    for (const cell of this.board) {
      if (cell == 0) {
        vacantCellCount++;
      }
    }

    return vacantCellCount;
  }

  // 勝者を返します。プレイヤー1の勝ちなら1、プレイヤー2の勝ちなら2、引き分けなら0、まだ勝負がついていないなら-1を返します。勝利条件を、ここで実装します。
  get winner() {
    // 縦横斜めの、一直線になるセルのインデックス。
    const winningLines = I.List.of(I.List.of(0, 3, 6), I.List.of(1, 4, 7), I.List.of(2, 5, 8),  // 縦
                                   I.List.of(0, 1, 2), I.List.of(3, 4, 5), I.List.of(6, 7, 8),  // 横
                                   I.List.of(0, 4, 8), I.List.of(2, 4, 6));                     // 斜め

    // winningLinesのすべての要素に対してループ。
    for (const winningLine of winningLines) {
      // プレイヤーが書き込んだマルやバツの数。プレイヤーは2人なので要素数2の配列になります。
      const playerCellCounts = [0, 0];  // イミュータブルじゃないけど、メソッドの中でしか使わないし……。

      // winningLineのすべての要素に対してループ。
      for (const winningLineCell of winningLine) {
        // セルの値を取得。
        const cell = this.board.get(winningLineCell);
        if (cell > 0) {  // マルカバツが書き込まれているなら、
          playerCellCounts[cell - 1]++;  // 対応するプレイヤーのマルやバツの数をインクリメント。
        }
      }

      // もしプレイヤー1が3つ並べたなら、プレイヤー1の勝ち。
      if (playerCellCounts[0] == winningLine.size) {
        return 1;
      }

      // もしプレイヤー2が3つ並べたなら、プレイヤー2の勝ち。
      if (playerCellCounts[1] == winningLine.size) {
        return 2;
      }
    }

    // マルやバツが書き込まれていないセルの数が0なら引き分け、そうでなければまだ勝負がついていない。
    return this.vacantCellCount == 0 ? 0 : -1;
  }

  // 次のプレイヤーを取得します。
  get nextPlayer() {
    // マルやバツが書き込まれていないセルの数から次のプレイヤーを判断します。
    return this.vacantCellCount % 2 == 1 ? 1 : 2;
  }

  // 次に遷移可能なゲームの状態を返します。プレイヤーが実行可能なルールをここで実装します。
  get nextGameStates() {
    const nextGameStates = [];

    // すべてのボードのセルに対して……
    for (let i = 0; i < this.board.size; ++i) {  // イミュータブルじゃない。for (const i of [0, 1, 2])はちょっとなぁ……。
      // まだマルやバツが書き込まれていないなら……
      if (this.board.get(i) == 0) {
        // 新しいゲームの状態を作成して配列に追加。setInは、指定したパスの値が変更された新しいオブジェクトを作ります。
        nextGameStates.push(this.setIn(I.List.of('board', i), this.nextPlayer));
      }
    }

    // 配列をイミュータブルな形に変換して返します。
    return I.List(nextGameStates);
  }

  // ゲームの状態を描画します。CUIですけど……。
  draw() {
    // 3行なので、とりあえずループを3回。
    for (let i = 0; i < 3; ++i) {
      // ゲーム板の1行分の文字列。
      let lineString = '';  // イミュータブル……。どうにもならない……。

      // 3列なので、もういちどループを3回。
      for (let j = 0; j < 3; ++j) {
        // 詰まっていると見づらかったので、セルとセルの間に空白を1つ入れます。
        if (j != 0) {
          lineString += ' ';
        }
        // まだ書き込まれていない場合は「-」、マルかバツならそれを書き込みます。
        lineString += ['-', 'O', 'X'][this.board.get(i * 3 + j)];
      }

      // 1行分を画面に表示します。
      console.log(lineString);
    }

    // 連続して描画したときに区切りがないとわかりづらいので、もう一度改行しておきます。
    console.log();
  }
}

// コンピューターのプレイヤー。アルファ・ベータ法（正しくはネガ・アルファ法）で最適な手を打ちます。
class ComputerPlayer extends I.Record({gameState: null}) {
  // Wikipediaだと1つの関数になっていたのですけど、そのままだと書きづらかったので、これとgetScoreの2つに分けました。
  getNextScoreAndGameState(gameState, alpha, beta) {
    // 次に遷移可能なゲーム状態の中で、もっとも良いもののスコアとゲーム状態を入れる変数です。
    let nextScoreAndGameState = I.List.of(alpha, null);

    // 次に遷移可能なゲーム状態全てでループ（ただし、途中で枝刈りされる可能性があります）。
    for (const nextGameState of gameState.nextGameStates) {
      // 次のゲーム状態のスコアを計算します。
      const score = -this.getScore(nextGameState, -beta, -nextScoreAndGameState.get(0));

      // これまでのスコアよりも良いなら……
      if (score > nextScoreAndGameState.get(0)) {
        // 入れ替えます。
        nextScoreAndGameState = I.List.of(score, nextGameState);
      }

      // 枝刈り。詳しくはWikipediaのアルファ・ベータ法を参照してください。
      if (nextScoreAndGameState.get(0) >= beta) {
        return nextScoreAndGameState;
      }
    }

    // リターンします。スコアが欲しい場合は最初の値を、ゲーム状態が欲しい場合は2番目の値を使用してください。
    return nextScoreAndGameState;
  };

  // ゲーム状態のスコアを計算します。
  getScore(gameState, alpha, beta) {
    // 勝者を取得します。
    const winner = gameState.winner;

    // 勝負がついた場合は……
    if (winner >= 0) {
      // 引き分けなら0、勝ちなら1、負けなら-1をゲーム状態のスコアとします。
      return winner == 0 ? 0 : (winner == gameState.nextPlayer ? 1 : -1);
    }

    // まだ勝負がついていない場合は、遷移可能なゲーム状態のスコアを調べます。
    return this.getNextScoreAndGameState(gameState, alpha, beta).get(0);
  };

  // もっとも良い、次のゲーム状態を取得します。asyncなのは、HumanPlayerと揃えたためです。
  async getNextGameState() {
    return this.getNextScoreAndGameState(this.gameState, -Infinity, Infinity).get(1);
  }
}

// 人間のプレイヤー。遷移可能なゲーム状態を画面に表示して、その中から遷移先を選んでもらいます。
class HumanPlayer extends I.Record({gameState: null}) {
  async getNextGameState() {
    // 現在の状態を表示します。
    console.log(`You are player ${ this.gameState.nextPlayer }. Game is below.`);
    this.gameState.draw();

    // 遷移可能なゲーム状態を取得します。
    const nextGameStates = this.gameState.nextGameStates;

    // 遷移可能なゲーム状態をすべて表示します。
    for (let i = 0; i < nextGameStates.size; ++i) {
      console.log(`No. ${ i }`);
      nextGameStates.get(i).draw();
    }

    // プレイヤーにゲーム状態を選択してもらいます。エラー・チェックは無視で……。
    return await new Promise(resolve => {
      const readlineInterface = readline.createInterface({ input: process.stdin, output: process.stdout });

      readlineInterface.question('Which do you select? ', answer => {
        resolve(nextGameStates.get(answer));
        readlineInterface.close();
      });
    });
  }
}

// ゲーム。
export default class TicTacToe {
  constructor() {
    this.gameState = new GameState();
  }

  // 勝者を表示してtrueを返します。勝負がついていない場合は、何もしないでfalseを返します。
  drawWinner() {
    const winner = this.gameState.winner;
    if (winner < 0) {
      return false;
    }

    console.log(`Player ${ ['-', '1', '2'][winner] } win!`);
    this.gameState.draw();

    return true;
  }

  // ゲーム開始。
  async start() {
    // 無限ループ。
    while (true) {
      // 勝負がついたなら、勝者を表示して終了。
      if (this.drawWinner()) {
        return;
      }

      // 人間のターン。
      this.gameState = await new HumanPlayer({gameState: this.gameState}).getNextGameState();

      // 勝負がついたなら、勝者を表示して終了。
      if (this.drawWinner()) {
        return;
      }

      // コンピューターのターン。
      this.gameState = await new ComputerPlayer({gameState: this.gameState}).getNextGameState();
     }
  }
}
~~~

えっと、長くてごめんなさい。ともあれ、これで絶対に負けない三目並べが完成しました。Node.jsをインストール済みの人は、GitHubからコードをクローンして試してみてください。あなたがどれだけ優秀な三目並べ屋だとしても、このプログラムは絶対に負けないはず……なのですけど、バグがあって負けちゃったらこっそり教えてください。

で、コード中のコメントに書きましたけど、メソッドの中ではイミュータブル「ではない」変数がいっぱいですね。あと、なんだか`for`文の中身が似ている場合が多い気もします。`GameState.vacantCellCount`の`for`文と`GameState.winner`の内側の`for`文とか。

## 集合に対する操作は、ライブラリ化できます

まぁもっとも、先程のコードは、Immutable.jsの人が見たら激怒しちゃうような悪いコードなんですけどね。

例えば`GameState.vacantCellCount()`は、Immutable.jsの`List`の`filter()`メソッドとラムダ式を使用して、以下のような書き方をすべきでしょう。

~~~ javascript
get vacantCellCount() {
  // ボードの
  return this.board
    // 値が0のセルの、
    .filter(cell => cell == 0)
    // 数を返します。
    .size;
}
~~~

＃以下、filterやmap、reduceなどの集合操作の説明が続きます。すでにご存知の方は、説明は無視して、次の長いコードまでスキップしてください。

この`filter()`というのは、リストの要素を抽出するメソッドです。以下のようなコードがあった場合で考えてみましょう。

~~~ javascript
function getDevelopersByLanguage(developers, language) {
  const result = [];

  for (const developer of developers) {
    if (developer.language != language) {  // 下の関数と違うのは、ここだけ。
      continue;
    }

    result.push(developer);
  }

  return result;
}

function getDevelopersBySex(developers, sex) {
  const result = [];

  for (const developer of developers) {
    if (developer.sex != sex) {  // 上の関数と違うのは、ここだけ。
      continue;
    }

    result.push(developer);
  }

  return result;
}
~~~

このコード、「途中の`if`文の条件以外は一緒」なわけで、条件部分を外出して共通化したいですよね？　でも、条件や演算子を引数で渡す方式[^3]は汎用性が低いのでダメです。条件部分を「関数」として抜き出すことにして、関数をその場で定義できるラムダ式を活用する、`filter`という関数を作りましょう。

~~~ javascript
function filter(xs, f) {  // fは関数
  const result = [];

  for (const x of xs) {
    if (!f(x)) {  // 引数で受け取った関数を呼び出して、残すかどうかを判定します。
      continue;
    }

    result.push(x);
  }

  return result;
}

console.log(filter(developers, x => x.language == 'ECMAScript' && x.sex == 'Female'));
console.log(filter(filter(developers,
                          developer => developer.language == 'ECMAScript'),
                   developer => developer.sex == 'Female'));
~~~

ほら、これでコード量が激減しました。

集合に対する操作は、他にもあります。たとえば、要素の属性を取得するような場合がありますけど、

~~~ javascript
function getDeveloperNames(developers) {
  const result = [];

  for (const developer of developers) {
    result.push(developer.name);
  }

  return result;
}
~~~

この場合も同じやり方でライブラリ化できます。

~~~ javascriopt
function map(xs, f) {
  const result = [];

  for (const x of xs) {
    result.push(f(x));  // 引数で受け取った関数を使用して、別の値（属性の値とか）に変換します。
  }

  return result;
}

console.log(map(filter(developers,
                       developer => developer.language == 'ECMAScript'),
                developer => developer.name));
~~~

あとはアレだ、合計を出すような場合ですよ。

~~~ javascript
function getTotalSalary(developers) {
  let result = 0;

  for (const developer of developers) {
    result = result + developer.salary;
  }

  return result;
}
~~~

この場合はちょっと複雑で、引数に渡す関数の引数はそれまでの合計と集合の要素の2つになります（関数として抜き出すのは`result + developer.salary`の部分ですもんね）。あと、`result`の初期値も必要です。というわけで、こんな感じ。

~~~ javascript
function reduce(xs, f, initValue) {
  let result = initValue;

  for (const x of xs) {
    result = f(result, x);
  }

  return result;
}

console.log(reduce(filter(developers,
                          developer => developer.language == 'ECMAScript'),
                   (totalSalary, developer) => totalSalary + developer.salary,
                   0));
~~~

あとは、集合の1番目の要素を取得するための`first()`や2番目から最後までを取得する`rest()`とか（再帰で１つづつ処理したい場合などに便利。ラブラリによっては、名前が`head()`と`tail()`だったり`car`と`cdr`だったりします）、すべての要素が条件を満たすかを調べる`every()`や一個でも条件を満たす要素があるかを調べる`some()`なんてのもあります（ライブラリによっては、名前が`all()`と`some()`だったりします）。

と、ここまで書いたところで気がついたのですけど、先程書き直した`GameState.vacantCellCount()`、これは不要ですね。`vacantCellCount`を呼び出している箇所は2箇所あって、ゲームが終了しているか否かを判断する`GameState.winner()`の後半と次のプレイヤーを決める`GameState.nextPlayer()`ところ。で、ゲームが終了しているか否かを判断するには値が0のセルが1つでもあればよくて（`some()`だけでよい）、次のプレイヤーを決めるには値が0のセルの数を最後まで調べなければならない（`filter()`して`size`を調べないとダメ）。`GameState.winner()`の場合に、`GameState.vacantCellCount()`だと余計な処理をしちゃっていたんですね。

というわけで、書き直し。

~~~ javascript
get winner() {
  const winningLines = I.List.of(I.List.of(0, 3, 6), I.List.of(1, 4, 7), I.List.of(2, 5, 8),  // 縦
                                 I.List.of(0, 1, 2), I.List.of(3, 4, 5), I.List.of(6, 7, 8),  // 横
                                 I.List.of(0, 4, 8), I.List.of(2, 4, 6));                     // 斜め

  // winningLinesの集合を、
  const winner = winningLines
        // セルの値の集合の集合に変換して、
        .map(line => line.map(index => this.board.get(index)))
        // セルの値の集合の残りが1つ目とすべて同じ場合、かつ、1つ目が0でない集合の、
        .filter(cells => cells.rest().every(cell => cell == cells.first()) && cells.first() != 0)
        // 1つ目の要素だけ残して、
        .map(cells => cells.first())
        // さらに1つ目。[[1, 1, 2], [2, 2, 2], ...]→[[2, 2, 2], ...]→[2, ...]→2
        .first();

  // もし勝者がいるなら（空集合のfirst()はundefinedを返す。JavaScriptでは0は偽なので、プレイヤー番号を1から始めています）、
  if (winner) {
    // 勝者を返します。
    return winner;
  }

  // 値が0のセルが1つでもあるなら試合続行、そうでなければ引き分けを返します。
  return this.board.some(cell => cell == 0) ? -1 : 0;
}

get nextPlayer() {
  // 値が0のセルの数を2で割った余りが1ならばプレイヤー1、そうでなければプレイヤー2を返します。
  return this.board.filter(cell => cell == 0).size % 2 == 1 ? 1 : 2;
}
~~~

おお。短くなった上に分かりやすい。Immutable.jsには、他にもインデックスと要素の配列の集合に変換してくれる`entrySeq()`や指定した範囲の数値の集合を生成してくれる`Range()`や値を繰り返して集合を生成してくれる`Repeat()`、集合の集合（`[[1, 2], [3, 4]]`）をフラット（`[1, 2, 3, 4]`）にしてくれる`flatten()`なんてのもあります。

というわけで、これらのImmutable.jsの便利な機能を活用して、コードを書き直してみました。

~~~ javascript
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
    // Immutable.jsのreduceを途中で止める方法が分からなくて枝刈りできなかったので、ごめんなさい、for文のままです。
    // reducerの引数iterはES6のIteratorで、iter.done=trueにすれば止まるんだと思っていたら、Immutable.jsのSeqだった……。

    let nextScoreAndGameState = I.List.of(alpha, null);

    for (const nextGameState of gameState.nextGameStates) {
      const score = -this.getScore(nextGameState, -beta, -nextScoreAndGameState.get(0));
      if (score > nextScoreAndGameState.get(0)) {
        nextScoreAndGameState = I.List.of(score, nextGameState);
      }

      // 枝刈り
      if (nextScoreAndGameState.get(0) >= beta) {
        return nextScoreAndGameState;
      }
    }

    return nextScoreAndGameState;
  };

  getScore(gameState, alpha, beta) {
    const winner = gameState.winner;
    if (winner >= 0) {
      return winner == 0 ? 0 : (winner == gameState.nextPlayer ? 1 : -1);
    }

    return this.getNextScoreAndGameState(gameState, alpha, beta).get(0);
  };

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

// ゲームを実行します。GameStateが引数になって属性が不要になったので、関数にします。
export default async function tictactoe() {
  // 再帰でループします。引数は、ゲームの状態とプレイヤーの集合です。
  (async function _(gameState, players) {
    // 勝者を表示します。
    const winner = gameState.winner;
    if (winner >= 0) {
      console.log(`Player ${ I.List.of('-', '1', '2').get(winner) } win!`);
      gameState.draw();
      return;
    }

    // 最初のプレイヤーを使用してgetNextGameState()した結果と残りのプレイヤーの集合を引数にして再帰します。
    _(await players.first().set('gameState', gameState).getNextGameState(), players.rest());
  })(
    // ゲームの状態。
    new GameState(),
    // 人間、コンピューター、人間、コンピューターと無限に続く集合。Immutable.jsは無限の集合を扱えてとても便利。
    I.Repeat(I.List.of(new HumanPlayer(), new ComputerPlayer())).flatten(1)
  );
}
~~~

やりました！　完全にイミュータブルです。かなり短くなって、しかも、分かりやすくなりましたし。Immutable.jsすげぇ！[^4]

というわけで、これで完成かな？

## 関数の組み合わせで、楽をしましょう

いいえ、まだ完成ではありません。先程紹介した`filter`や`map`、`reduce`は関数型プログラミング由来の機能なので、これらの機能を使うだけでも関数型プログラミングと言える気がしますし、プログラミングはとても容易になりますけど。

でも、関数を引数にするということには、もっと大きな可能性があるんです。この可能性を捨てちゃうのは、ちょっともったいないでしょう。

先程のコードを、もう一度眺めてみてください。ラムダ式の中は普通にコードを書いていますよね？　この部分も、関数を引数に取る関数で楽できないでしょうか？

具体的にやります。`GameState.nextPlayer()`で考えましょう。

~~~ javascript
get nextPlayer() {
  return this.board.filter(cell => cell == 0).size % 2 == 1 ? 1 : 2;
}
~~~

このラムダ式では値が`0`か確認しているのですけど、まずはこの部分を関数として定義してみましょう。

~~~ javascript
function equals(a, b) {
  return a == b;
}
~~~

で、この関数を使うと、

~~~ javascripot
get nextPlayer() {
  return this.board.filter(cell => equals(0, cell)).size % 2 == 1 ? 1 : 2;
}
~~~

あれ？　ちっとも楽になりません。引数が2つだからダメなわけで、1つにしてみたら？

~~~ javascript
function equalsTo(a) {
  return (b) => equals(a, b);
}

get nextPlayer() {
  return this.board.filter(equalsTo(0)).size % 2 == 1 ? 1 : 2;
}
~~~

いわゆる、関数を返す関数ですね。関数を呼び出した戻り値も関数で、その戻り値の関数を呼び出すような感じです。

ともあれ、`nextPlayer()`の部分は、これで簡単になりました。でも、`equals`と`equalsTo`の2つの関数を作るのは馬鹿らしい。だから、引数の一部分だけを指定した関数を返す関数を考えてみます。

~~~ javascript
function partial(f, ...params) {
  return (...moreParams) => f(...params, ...moreParams);
}

get nextPlayer() {
  return this.board.filter(partial(equals, 0)).size % 2 == 1 ? 1 : 2;
}
~~~

これなら、`equals()`を書くだけで済みますな。でも、私は怠け者なので、`partial`を呼び出すのすら面倒くさい……。

というわけで、以下ではどうでしょうか？

~~~ javascript
function equals(a, b) {
  if (typeof b == 'undefined') {      // bが指定されなかった場合は、
    return (b) => curryEquals(a, b);  // 関数を返します。
  }

  return a == b;  // そうでなければ、普通に処理します。
}

get nextPlayer() {
  return this.board.filter(equals(0)).size % 2 == 1 ? 1 : 2;
}
~~~

ECMAScriptは引数の数が合わない場合はエラーにならずに単純に無視されますから、引数`b`が指定されなかった場合は関数を返して、両方を指定した場合は処理結果を返します。このように、引数を1つ指定すると残りの引数をとる関数を返すような関数にすることを、カリー化と呼びます[^5]。

でも、毎回こんな面倒な形で関数を書くのはやってられませんよね？　だから、カリー化を全面的に採用した関数型プログラミング用のライブラリである[Ramda](http://ramdajs.com/)を使用しましょう。

~~~ javascript
import R from 'ramda';

get nextPlayer() {
  // R.equals(a, b)の1つ目の引数だけ指定して、残りの1つを受け取る関数にします。
  return this.board.filter(R.equals(0)).size % 2 == 1 ? 1 : 2;
}
~~~

うん、スッキリしました。でも、たとえば、

~~~ javascript
const winner = winningLines
  .map(line => line.map(index => this.board.get(index)))
  // セルの値の集合の残りが1つ目とすべて同じ場合、かつ、1つ目が0でない集合を取得します。
  .filter(cells => cells.rest().every(cell => cell == cells.first()) && cells.first() != 0)
  .map(cells => cells.first())
  .first();
~~~~

の`cells => ... && cells.first() != 0`の部分、「1つ目が0でない」の部分は、カリー化だけじゃ対応できませんよね？　「集合の1つ目の値を取得する」と「値が0であることを確認する」の2段階に分かれているわけですから。こんな場合は、関数合成と呼ばれる技術を使用します。関数合成というのは、「g(f(x))」を「f∘g」と書く、書いた順序と実行される順序が異なるのでちょっと気持ち悪いアレです。コードにすると、こんな感じ。

~~~ javascript
function compose(f, g) {
  return (x) => f(g(x));
}

console.log(compose(R.multiply(2), R.add(2))(1));  // 6が表示されます。(1 + 2) * 2 = 6なので。後述するpipeなら、1 * 2 + 2で4が表示されます。
~~~

このcomposeを使えば、`cells.first() != 0`の部分は`compose(R.complement(R.equals(0)), R.head)`と書けます（Ramdaでは`first`ではなくて`head`。`complement()`は、真偽を逆転させた関数を返します。`complement()`すると`x == 0`が`!(x == 0)`になります）。あと、Ramdaには、`pipe()`という書いた順と実行順序が同じになる素敵バージョンの関数合成もあります。

というわけで、Ramdaを使用して`GameState.winner()`を書き直してみましょう。

~~~ javascripot
// 関数合成！
const f = R.pipe(R.map(R.map(R.nth(R.__, gameState.board))),  // R.__は、この部分をとばして引数を設定するようにとの指示。
                 R.filter(R.both(R.pipe(R.aperture(2), R.all(R.apply(R.equals))),  // 隣り同士が全部同じ場合、
                                 R.pipe(R.head, R.complement(R.equals(0))))),      // かつ、最初の要素の値が0じゃない場合、
                 R.ifElse(R.complement(R.isEmpty),  // 結果が空でなければ
                          R.pipe(R.head, R.head),   // 最初の要素の最初の要素が勝者。
                          R.always(R.any(R.equals(0), board) ? -1 : 0)));  // 0があるならまだ試合終了じゃない。なければ引き分け。

// 呼び出し。
return f(winningLines);
~~~

あれ？　`winningLines...first()`の部分だけじゃなくて、その後の`if`分や三項演算子の部分まで書けちゃった……。関数合成でプログラムを組むのがあまりに楽ちん[^6]だったもんで、勢い余っちゃいましたよ。

でも、関数合成と呼び出しと引数の設定を一度にできたら、もっと楽になるような気がします（ECMAScriptで提案されているパイプライン演算子（`|>`）みたいな感じ）。Ramdaを使う場合は、以下の書き方で似た機能を実現できます（`R.always`は、どんな引数で呼ばれても指定した値を返す関数を返す関数です）。

~~~ javascript
R.call(R.pipe(R.always(引数),
              f1,
              f2...));
~~~

こんな長いコードを毎回書くのは面倒なので、以下のコードで関数化してしまいましょう。

~~~ javascript
const cpa = (x, ...fs) => R.call(R.pipe(R.always(x), ...fs));
~~~

これを前提にして勝者を判定するメソッド全体を書いてみると、以下のようになります。

~~~ javascripot
get winner() {
  const winningLines = [[0, 3, 6], [1, 4, 7], [2, 5, 8],  // 縦
                        [0, 1, 2], [3, 4, 5], [6, 7, 8],  // 横
                        [0, 4, 8], [2, 4, 6]];            // 斜め

  return cpa(winningLines,
             R.map(R.map(R.nth(R.__, this.board))),
             R.filter(R.both(R.pipe(R.aperture(2), R.all(R.apply(R.equals))),
                             R.pipe(R.head, R.complement(R.equals(0))))),
             R.ifElse(R.complement(R.isEmpty),
                      R.pipe(R.head, R.head),
                      R.always(R.any(R.equals(0), board) ? -1 : 0)));
}
~~~

最初は文字がいっぱいで分かりづらく感じるかもしれませんけど、コードを書いていれば何回も何回も`map`だとか`equals`だとか`complement`とかに出会うことになるので、すぐに慣れてパターンとして認識できるようになります。そうなると、もープログラミングがちょー楽ちんなのですよ、本当に。

`R.pipe(R.aperture(2), R.all(R.apply(R.equals)))`のような、今後も使いそうな部分に名前をつけるという工夫をしてもよいですしね。

~~~ javascript
const allSame = R.pipe(R.aperture(2), R.all(R.apply(R.equals)));
~~~

もう少し。たとえば`R.filter(R.equals(0))`というコードは、「値が0の要素だけ抽出する」わけで、これだけで何をするのかだけが明確に分かります。外から見た仕様である外部仕様を、簡潔に明確に十分に記述しているわけですね（内部仕様である「どのようにやるか」は、コードの中ですら書く必要がないんですな、今は）。でも、上のコードの`const winningLines = ...`の部分は、あまり良い仕様の記述には思えません。これが何なのかが分からなくて、コメントで補足しているのですから。

だから、この部分も仕様化しちゃいましょう。縦というのが何なのかといえば、上下に伸びるモノですよね？　今回は3×3のボードを1次元配列で表現しているので、以下のような感じでしょうか？

~~~ javascript
// -3すると上、+3すると下になります。
const getVertical = center => [center - 3, center, center + 3];
~~~

横はこんな感じ。

~~~ javascript
const getHorizontal = center => [center - 1, center, center + 1];
~~~

`getVertical()`と`getHorizontal()`を組み合わせれば、「横のライン3つ」も表現できます。

~~~ javascripot
const getHorizontals = R.pipe(getVertical, R.map(getHorizontal));  // 縦に伸ばしたそれぞれを中心にして、横に伸ばしたもの。
~~~

斜めは複数あるので、こんな感じ。

~~~ javascript
// ベクトルの足し算がなかったので、定義しました。
const addVector = R.curry(R.pipe(R.zip, R.map(R.apply(R.add))));

// 縦に伸ばしたモノを、上を左に下を右にずらしたり、上を右に下を左にずらしたりしたもの。
const getDiagonals = center => R.map(addVector(getVertical(center)),
                                     [[-1, 0, +1], [+1, 0, -1]]);
~~~

というわけで、`winningLines`の定義は以下のようになりました。

~~~ javascript
const winningLines = R.call(() => {
  const getHorizontal = center => [center - 1, center, center + 1];
  const getVertical   = center => [center - 3, center, center + 3];
  const getDiagonals  = center => R.map(addVector(getVertical(center)),
                                        [[-1, 0, +1], [+1, 0, -1]]);

  return cpa(4,  // ゲーム板の中心。
             R.juxt([R.pipe(R.juxt([R.pipe(getVertical, R.map(getHorizontal)),
                                    R.pipe(getHorizontal, R.map(getVertical))]),
                            R.apply(R.concat)),
                     getDiagonals]),
             R.apply(R.concat));
});
~~~

3×3のゲーム板に限定しているので汎用性がないへっぽこなコードなのですけど、いきなり数字の羅列を書くより仕様が明確になったと考えます。……やり過ぎの気もするけどな。でも、関数型プログラミングをやっていると、「○○は××である」が不明確なところがあると落ち着かなくなるんですよ。

## 汎用的なデータ構造でやりましょう

これで最後。関数の話のあとは、データの話です。今回使用しているJavaScriptはとても面白い言語で、連想記憶をオブジェクトで表現します（ECMAScript 2015ではMapが追加されましたけど）。

~~~ javascript
class Computer {
  constructor(name, memorySizeInGB) {
    this.name = name;
    this.memorySizeInGB = memorySizeInGB;
  }
};

class Employee {
  constructor(name, computers) {
    this.name = name;
    this.computers = computers;
  }
};

const o = [new Employee('A',
                        [new Computer('MacBook Pro',    8),
                         new Computer('ThinkPad T470s', 16)]),
           new Employee('B',
                        [new Computer('Surface Pro',    4)])];

const m = [{name: 'A',
            computers: [{name: 'MacBook Pro',
                         memorySizeInGB: 8},
                        {name: 'THinkPad T470s',
                         memorySizeInGB: 16}]},
           {name: 'B',
            computers: [{name: 'Surface Pro',
                         memorySizeInGB: 4}]}];

// 連想記憶的にアクセスしてみます。
console.log(o[0]['computers'][0]['name']);  // 「MacBook Pro」が表示されます。
console.log(m[0]['computers'][0]['name']);  // 「MacBook Pro」が表示されます。

// オブジェクト的にアクセスしてみます。
console.log(o[0].computers[0].name);        // 「MacBook Pro」が表示されます。
console.log(m[0].computers[0].name);        // 「MacBook Pro」が表示されます。
~~~

で、前章で考えたように、組み合わせることを考えれば、オブジェクトのメソッドよりも関数を使用したほうが得。で、メソッドがないのだとしたら、オブジェクトと連想記憶にはあまり差がなくて、だったらわざわざクラスを定義しなくてもいいんじゃね？　オブジェクトの属性がカプセル化されずに公開されることになりますけど、副作用が無いのだから問題は無いしね。なにより、汎用的な集合操作の関数群で処理を記述できる利便性は捨てがたい[^7]。

というわけで、関数型プログラマーは、言語が提供する型、リストやマップで多くの事柄を表現しちゃいます（Haskellの人には型を追加して数学的な特性を定義してカッチリやるのが好きな人もいるかもしれませんけど、私はHaskellerじゃなくてClojurianなので……）。だからたとえば、`x`と`y`を持つ`Point`クラスを作成する代わりに、要素数が2つのリストで座標を表現しちゃいます。`Point`のメソッドとして幾何計算の機能を追加していくのではなくて、汎用的なベクトル演算の関数群を作成して幾何計算をやります。

本稿でも、クラスを定義しないで、あと、先程から紹介してきたRamdaを利用して三目並べを組み直してみましょう。というわけで、以下が最終的なコード。

~~~ javascript
import process  from 'process';
import R        from 'ramda';
import readline from 'readline';

// 引数や戻り値は、引数1 -> 引数2 -> 引数3 -> ... -> 戻り値で表現します。

// ベクトルの足し算です。
// [a] -> [a] -> [a]
const addVector = R.curry(R.pipe(R.zip, R.map(R.apply(R.add))));

// 集合の要素がすべて同じ場合はtrue、そうでなければfalseを返します。
// [a] -> Boolean
const allSame = R.pipe(R.aperture(2), R.all(R.apply(R.equals)));

// 集合を[要素, インデックス]の集合に変換します。
// [a] -> [[a, i]]
const getIndexed = R.addIndex(R.map)((a, i) => [a, i]);

// [要素, インデックス]の集合を、インデックスの集合に変換します、。
// [[a, i]] -> [i]
const getIndice = R.map(R.nth(1));

// fsで指定された関数群を順序を保って関数合成して、xを引数にして呼び出します。
// R.call(R.pipe(R.always(x), ...fs)
const cpa = (x, ...fs) => R.call(R.pipe(R.always(x), ...fs));

// 縦横斜めの、3つ取れば勝ちになる直線のセルのインデックス。
const winningLines = R.call(() => {
  const getHorizontal = center => [center - 1, center, center + 1];
  const getVertical   = center => [center - 3, center, center + 3];
  const getDiagonals  = center => R.map(addVector(getVertical(center)), [[-1, 0, +1], [+1, 0, -1]]);

  return cpa(4,  // ゲーム板の中心。
             R.juxt([R.pipe(R.juxt([R.pipe(getVertical, R.map(getHorizontal)),
                                    R.pipe(getHorizontal, R.map(getVertical))]),
                            R.apply(R.concat)),
                     getDiagonals]),
             R.apply(R.concat));
});

// 勝者を返します。プレイヤー1の勝ちなら1、プレイヤー2の勝ちなら2、引き分けなら0、まだ勝負がついていないなら-1を返します。
// ゲームのルールである勝利条件を定義します。
const getWinner = R.memoize(board => {
             // 勝利ラインの集合を、
  return cpa(winningLines,
             // セルの値の集合の集合に変換して、
             R.map(R.map(R.nth(R.__, board))),
             // すべて同じ値、かつ、先頭が0ではない集合だけ残して、
             R.filter(R.both(allSame, R.pipe(R.head, R.complement(R.equals(0))))),
             // もし結果が空でないなら、
             R.ifElse(R.complement(R.isEmpty),
                      // 先頭の先頭が勝者。
                      R.pipe(R.head, R.head),
                      // そうでなければ、0のセルがあるなら試合はまだ終了ではない。そうでなければ引き分け。
                      R.always(R.any(R.equals(0), board) ? -1 : 0)));
});

// 次のプレイヤーを取得します。ゲームのルールである手番を定義します。
const getNextPlayer = R.memoize(board => {
  // 値が0のセルの数を2で割った余りが1ならプレイヤー1、そうでなければプレイヤー2。
  return R.length(R.filter(R.equals(0), board)) % 2 == 1 ? 1 : 2;
});

// 次に遷移可能なゲーム版の状態を返します。プレイヤーが何をできるかというルールを、ここで実装します。
const getNextBoards = R.memoize(board => {
             // ゲーム板を、
  return cpa(board,
             // インデックス化して、
             getIndexed,
             // 値が0（まだマルもバツも書き込まれていない）を取得して、
             R.filter(R.pipe(R.head, R.equals(0))),
             // そのインデックスに変換して、
             getIndice,
             // ゲーム板の当該セルに次のプレイヤーを書き込んだモノの集合が次に遷移可能なゲーム板。
             R.map(R.update(R.__, getNextPlayer(board), board)));
});

// ゲーム板を描画します。
const drawBoard = board => {
                          // ゲーム板を、
  const boardString = cpa(board,
                          // 3つずつ（行単位）に分割して、
                          R.splitEvery(3),
                          // 0は「-」、1は「O」、2は「X」に変換して、
                          R.map(R.pipe(R.map(R.nth(R.__, ['-', 'O', 'X'])),
                                       // 空白でつなげて文字列化したものを、
                                       R.join(' '))),
                          // さらに改行でつなげた文字列にします。
                          R.join('\n'));

  // 表示します。
  console.log(boardString);

  // 連続して描画したときに区切りがないとわかりづらかったので、もう一度改行しておきます。
  console.log();
};

// コンピューターのプレイヤー。アルファ・ベータ法（正しくはネガ・アルファ法）で最適な手を打ちます。
const getNextBoardByComputer = async board => {
  // Wikipediaだと1つの関数になっていたのですけど、そのままだと書きづらかったので、これとgetScoreの2つに分けました。
  // getNextScoreAndBoard()の戻り値は、[最良のスコア, そのスコアのゲーム板]です。
  const getNextScoreAndBoard = (board, alpha, beta) => {
    // 枝刈り。スコアがベータ値以上の場合は、探索しても意味がありません。
    const prune = R.when(R.pipe(R.nth(0), R.gte(R.__, beta)),
                         // reducedしてreduceを打ち切ります。
                         R.reduced);

    // 最も大きなスコアのゲーム板を探します。アルファ・ベータ法での枝刈りもします。
    return R.reduce((acc, nextBoard) => prune(R.maxBy(R.head, acc,
                                                      [-getScore(nextBoard, -beta, -R.head(acc)),
                                                       nextBoard])),
                    [alpha, null],
                    getNextBoards(board));
  };

  // ゲーム状態のスコアを計算します。
  const getScore = (board, alpha, beta) => {
    // 勝負がついたときは、
    const winner = getWinner(board);
    if (winner >= 0) {
      // 引き分けなら0、勝ちなら1、負けなら-1をゲーム板のスコアとします。
      return winner == 0 ? 0 : (winner == getNextPlayer(board) ? 1 : -1);
    }

    // まだ勝負がついていない場合は、次に遷移可能なゲーム板のスコアがスコアとなります。
    return R.nth(0, getNextScoreAndBoard(board, alpha, beta));
  };

  // 最も良い、次のゲーム板を選択します。
  return R.nth(1, getNextScoreAndBoard(board, -Infinity, Infinity));
};

// 人間のプレイヤー。遷移可能なゲーム状態を画面に表示して、その中から遷移先を選んでもらいます。
const getNextBoardByHuman = async board => {
  // 現在の状態を表示します。
  console.log(`You are player ${ getNextPlayer(board) }. Now board is below.`);
  drawBoard(board);

  // 遷移可能なゲーム板の集合を取得します。
  const nextBoards = getNextBoards(board);

  // 遷移可能なゲーム板をすべて表示します。
  R.addIndex(R.forEach)((board, i) => {
    console.log(`No. ${ i }`);
    drawBoard(board);
  }, nextBoards);

  // プレイヤーにゲーム状態を選択してもらいます。エラー・チェックは無視で……。
  return await new Promise(resolve => {
    const readlineInterface = readline.createInterface({ input: process.stdin, output: process.stdout });

    readlineInterface.question('Which do you select? ', answer => {
      resolve(R.nth(answer, nextBoards));
      readlineInterface.close();
    });
  });
};

// ゲームを実行します。
export default async function tictactoe() {
  // Ramdaは無限集合を表現できないので、ECMSScript 2015のジェネレーターを使用します。
  const getNextBoardFunctionIterator = function*() {
    while (true) {
      yield getNextBoardByHuman;
      yield getNextBoardByComputer;
    }
  }();

  // 再帰でループします。ゲーム板を引数に取ります。
  (async function f(board) {
    const winner = getWinner(board);
    if (winner >= 0) {
      console.log(`Player ${ R.nth(winner, ['-', '1', '2']) } win!`);
      drawBoard(board);
      return;
    }

    // プレイヤーが選択したゲーム板を引数に、再帰します。
    f(await getNextBoardFunctionIterator.next().value(board));
  })(R.repeat(0, 9));
}
~~~

RamdaがECMAScriptのイテレーターを扱えなかったので最後の`tictactoe()`がかなり不細工（イテレーターは`next()`で内部状態が変わるのでイミュータブルじゃないし）ですけど、それ以外の部分は、重複のない、（関数型プログラミングの関数名に慣れていれば）読みやすいコードになったのではないでしょうか？

## パフォーマンス？　良くはないです。でも、それほど悪くは無いです

おまけとして、敢えて触れずに来たパフォーマンスの話題を。関数型プログラミングで作成したプログラムの実行速度は、ぶっちゃけ遅いです。オブジェクトを変更するとコピーが作られるんですからね（最初から関数型として作成されたプログラミング言語なら、うまいこと差分管理されてコピーは作られないのですけど）。

ともあれ、試してみましょう。コンピューター対コンピューターで100試合繰り返すのにかかった時間を、私のMacBook Pro（2017 TouchBar*非*搭載モデル。ヘッポコCPU）で調べてみました。

### コンピューター対コンピューター、試合数100

* 関数型プログラミング

~~~ shell
$ time npm start
real    0m31.906s
user    0m32.262s
sys     0m0.404s
~~~

* オブジェクト指向プログラミング（集合操作はfor文）

~~~ shell
$ time npm start
real    0m0.851s
user    0m1.010s
sys     0m0.108s
~~~

* オブジェクト指向プログラミング（集合操作はImmutable.js）

~~~ shell
$ time npm start
real    1m55.251s
user    2m57.125s
sys     0m5.720s
~~~

うわぁ、関数型プログラミングすげー遅い[^8]。`for`文の3%くらいの速度？　`for`文がすげー速いのは、たぶん、JITで最適化し易いからでしょうね。だって、1試合だけの勝負にしたら、以下の結果になりましたから。。

### コンピューター対コンピューター、試合数1

* 関数型プログラミング

~~~ shell
$ time npm start
real    0m1.196s
user    0m1.489s
sys     0m0.105s
~~~

* オブジェクト指向プログラミング（集合操作はfor文）

~~~ shell
$ time npm start
real    0m0.844s
user    0m1.002s
sys     0m0.104s
~~~

* オブジェクト指向プログラミング（集合操作はImmutable.js）

~~~ shell
$ time npm start
real    0m1.888s
user    0m2.720s
sys     0m0.178s
~~~

うん、`for`文の71%くらいですね（npmやnodeの起動時間を考えれば、実際はもっと低いのでしょうけど）。ただ、実際に動かしてみるとほとんど差を感じないので、問題ないんじゃないかな。

### メモ化が有効な場合は多いしね

今回のコードではあまり効いていない（アルファ・ベータ法による枝刈りが有効すぎた）のですけど、作成したコードには「関数型プログラミングならでは」の高速化テクニックを入れています。`getWinner`や`getNextPlayer`、`getNextBoards`のところに書いてある`R.memoize()`です。

考えてみましょう。副作用がなければ、同じ関数を同じ引数で呼び出した場合の戻り値は必ず同じになります。過去に計算した結果を覚えておけば、再度計算する必要なんかないわけ。これがメモ化と呼ばれるテクニックで、`R.memoize()`は、このメモ化を実現してくれる（引数と結果の対応表をメモリ内に作成して、関数を実行する代わりにその表の値を自動で返してくれる関数を作成する）関数なんです。

あとね、そもそもね、同じゲーム板での最適手は毎回同じなわけで、だったら先程のベンチマークみたいに複数回ゲームが実行されると分かっているなら、`getNextBoardByComputer()`を`R.memoize()`しちゃえばよい[^9]。というわけで、`getNextBoardByComputer()`を`R.memoize()`した場合の試合数100の実行時間はこちら。

~~~ shell
$ time npm start
real    0m1.042s
user    0m1.301s
sys     0m0.103s
~~~

おお、`for`文の82%くらいになりました。これなら、問題はないですよね？

## 関数型もいいけど、オブジェクト指向もね

もう1つおまけを。実は最初は、敢えてオブジェクト指向が得意とするシミュレーションをお題にしてやろうと考えていたんですよ。で、オブジェクト指向言語の元祖であるSimulaのWikipediaのページに載っていた試着室シミュレーションを、JavaScriptを使ってオブジェクト指向で組んでみたんです。そしてそのコードを関数型に書き換えようとしたらもー全然うまくいかなかったので途中で投げ出して三目並べにしたというわけ。「オブジェクトが相互にメッセージ・パッシングすることで状態が変わっていく」みたいな場合は、オブジェクト指向は無敵な気がします。

でも、私が関数型プログラミングの能力を引き出せていないだけの気もするし……。どなたか、以下のコードを関数型プログラミングで書き直していただけないでしょうか？

~~~ javascript
import util from 'util';

// オブジェクト指向で作成した、試着室とお客様のシミュレーション。
// 元ネタはhttps://ja.wikipedia.org/wiki/Simulaのシミュレーションの部分。

// ボックス・ミューラー法でひたすら正規乱数を生成するジェネレーター。
const normalRandomGenerator = function*() {
  while (true) {
    const x = 1 - Math.random();
    const y = 1 - Math.random();

    yield Math.sqrt(-2 * Math.log(x)) * Math.cos(2 * Math.PI * y);
    yield Math.sqrt(-2 * Math.log(x)) * Math.sin(2 * Math.PI * y);
  }
}();

// 平均値と標準偏差、最小値、最大値を指定して、正規乱数を1つ生成します。
const normalRandom = (mean = 0, std = 1, min = -Infinity, max = Infinity) => Math.max(Math.min(mean + std * normalRandomGenerator.next().value, max), min);

// 引数で指定したミリ秒の間、コルーチンを止めます。
const delay = util.promisify(setTimeout);

// シミュレーションを実行します。
export default function execute() {
  // report()でのレポートは開始時刻からの経過時間でするので、開始時刻を記録しておきます。
  const startingTime = Date.now();

  // 状況をレポートします。
  function report(message) {
    console.log(`${ ((Date.now() - startingTime) / 1000).toFixed(2) }: ${ message }`);
  }

  // 試着室。
  class FittingRoom {
    // コンストラクター。
    constructor() {
      this.hasUsed = false;
      this.requestQueue = [];
    }

    // 試着室に入ります。
    async enter() {  // asyncは不要なのですけど、呼び出し側にawaitしてもらいやすいように付けておきます。
      // 誰も使っていない場合は、
      if (!this.hasUsed) {
        // 使用中の札をかけて、
        this.hasUsed = true;
        // すぐに入ります。
        return Promise.resolve();
      }

      // 試着室が空くのを待つPromiseを作成して、そのresolveを待ち行列に入れておきます。
      // このresolveは、leave()で呼び出されます。
      return new Promise(resolve => {
        this.requestQueue.push(resolve);
      });
    }

    // 試着室を出ます。
    async leave() {
      // 誰も待っていないなら、
      if (this.requestQueue.length == 0) {
        // 使用中の札をもとにもして、
        this.hasUsed = false;
        // 終了します。
        return;
      }

      // 待ち行列の先頭のresolveを呼び出して、enter()の際に作成したPromiseを完了させます。
      this.requestQueue.shift()();
    }
  }

  // 試着室を1つ設置します。
  const fittingRoom = new FittingRoom();

  // お客様。
  class Customer {
    // コンストラクター。
    constructor(name) {
      this.name = name;
    }

    // 商品を選びます。平均12分で標準偏差3分の正規乱数分かかるものとします。
    async searchItem() {
      await delay(normalRandom(12, 3, 0, 24) * 1000);  // シミュレーション内の時間は、1分＝1秒とします。
    }

    // 商品を試着します。平均3分で標準偏差1分の正規乱数分かかるものとします。
    async useFittingRoom() {
      await delay(normalRandom( 3, 1, 0,  6) * 1000);
    }

    // 行動を開始します。
    async start() {
      while (true) {
        // 商品を選んで、
        await this.searchItem();

        // フィッティング・ルームに入ろうとします。他の人が使っているなら、空くまで待ちます。
        report(`${ this.name } is requesting the fitting room.`);
        await fittingRoom.enter();

        // 試着室に入れたら試着をして、
        report(`${ this.name } has entered the fitting room.`);
        await this.useFittingRoom();

        // 試着室を出ます。
        await fittingRoom.leave();
      }
    }
  }

  // お客様は3人とします。
  new Customer('Sam').start();
  new Customer('Sally').start();
  new Customer('Andy').start();
}
~~~

○○プログラミング最高！　○○プログラミング以外はダメ……という考え方は、やっぱりダメなのでしょうな。


[^1]: ブラウザ上で実行している場合は、ですけどね。記述を省略可能な`window`オブジェクトの属性の宣言になっちゃうんですな。`window`オブジェクトが無いnode.jsでは、きちんとエラーになります。

[^2]: `Object.freeze()`でかなり解決できるのですけど、`set()`のような感じでオブジェクトを変更するのは難しいです。

[^3]:`['equals', 'language', 'ECMAScript']`みたいな引数を渡す感じです。大昔には、こんな使いづらいライブラリもあったんですよ、本当に。

[^4]: まぁ、ECMAScriptだけでもほぼ同じ書き方ができるのですけど……。とはいえ、遅延評価があったりするので、Immutable.jsの集合操作が便利だというのは正しいはず。

[^5]: カリー化の実現方法は言語やライブラリによって様々で、このコードのようなテキトーな方式ではないのでご安心を。

[^6]: 今考えると、`R.pipe(R.aperture(2), R.all(R.apply(R.equals)))`の部分はラムダ式でやった方が楽な気もしますけど……。

[^7]: JavaScriptでは、オブジェクトに対しても汎用的な集合操作の関数を適用できるわけで、だから汎用データ構造を使う*積極的な*理由はあまりないけどね。

[^8]: Immutable.jsが妙に遅かったのは、すみません、今は理由が分かりません。たぶん、私のコードの書き方のせいだと思いますけど。

[^9]: 実は試合が1回だけの場合でも`getNextScoreAndBoard()`や`getScore()`に対するメモ化は有効です。でも、それをやると試合数を増やした場合に`getNextBoardByComputer()`をメモ化したのと同じ結果が出ちゃって、関数型プログラミングは速いという間違った結論になってしまうんですよ……。コンピュータ手番の1回目で、メモ化のオーバーヘッドで体感速度がかえって遅くなってしまいますしね。
