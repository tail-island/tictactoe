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

      // 試着室が空くのを待つPromiseを作成して、そのresolveを待ち行列に入れておきます。このresolveはleave()で呼び出されます。
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
