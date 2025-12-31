const FONT_COLOR1 = '#202020';
const BG_COLOR1 = '#FFFFFF';
const BG_COLOR2 = '#CBCBFF';

const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    fontSize: '24px',
    color: FONT_COLOR1,
    padding: { x: 10, y: 8 },
    backgroundColor: BG_COLOR1,
};

export default class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'Game' });
    }

    //プロパティ
    private btnText: Phaser.GameObjects.Text[];
    private btnReset: Phaser.GameObjects.Text;

    preload() {
        this.load.setBaseURL('assets');
        // 樹木のフォント
        this.load.image('oldtreefont', 'bitmapfonts/oldtreefont.png');
        // キャンディーのフォント
        this.load.bitmapFont('candy', 'bitmapfonts/candy.png', 'bitmapfonts/candy.xml');
        // 缶フォント
        this.load.bitmapFont('canfont', 'bitmapfonts/canfont.png', 'bitmapfonts/canfont.xml');
        // 岩石のフォント
        this.load.bitmapFont('rockdigits', 'bitmapfonts/rockdigits.png', 'bitmapfonts/rockdigits.xml');
        // チェックポイントフォント Version 2.107
        //   https://yokutobanaitori.web.fc2.com/quizfont.html
        // テクスチャ
        //   https://bg-patterns.com/?p=1683
        // Bitmapフォント生成
        //   https://snowb.org/
        this.load.bitmapFont('cp-font', 'bitmapfonts/cp-font.png', 'bitmapfonts/cp-font.xml');
    }

    create() {
        const msgText = this.add.text(60, 40, 'ボタンをクリックしてください', { ...textStyle, color: '#FFFFFF', backgroundColor: undefined });

        this.btnText = new Array<Phaser.GameObjects.Text>();
        let posY = 40;
        const SHIFT_Y = 80;
        const methodlist = [
            {
                caption: "ビットマップフォント（レトロフォント）",
                method: this.displayRetroFont
            },
            {
                caption: "ビットマップフォント ≪静止≫",
                method: this.displayBitmapFont
            },
            {
                caption: "ダイナミックビットマップフォント ≪波の演出≫",
                method: this.displayWavingMotion
            },
            {
                caption: "ダイナミックビットマップフォント ≪拡大と縮小≫",
                method: this.displayScalingMotion
            },
            {
                caption: "ダイナミックビットマップフォント ≪フォローパス≫",
                method: this.displayTextFollowPath
            },
        ];

        // メニューボタンの配置
        methodlist.forEach(e => {
            posY += SHIFT_Y;
            const btn = this.add.text(110, posY, e.caption, textStyle).once(Phaser.Input.Events.POINTER_DOWN, () => {
                msgText.setVisible(false);
                e.method.call(this);
                this.removeBtn();
            });
            btn.on(Phaser.Input.Events.POINTER_OVER, () => {
                btn.setStyle({ backgroundColor: BG_COLOR2 })
            }).on(Phaser.Input.Events.POINTER_OUT, () => {
                btn.setStyle({ backgroundColor: BG_COLOR1 })
            }).setInteractive();
            this.btnText.push(btn);
        });

        // 戻るボタン（シーンのリセット）
        this.btnReset = this.add.text(10, 10, "戻る", textStyle)
            .once(Phaser.Input.Events.POINTER_DOWN, () => this.scene.restart())
            .setInteractive().setVisible(false);
    }

    private removeBtn() {
        this.btnText.forEach((e: Phaser.GameObjects.Text) => {
            e.destroy();
        });
        this.btnText = [];
        this.btnReset.setVisible(true);
        this.children.bringToTop(this.btnReset);
    }

    /**
     * ビットマップフォント（レトロフォント）
     */
    private displayRetroFont(): void {
        const { width: cW, height: cH } = this.game.canvas;

        const FONTNAME = 'oldtreefont';
        const TEXT_SET = `!"#$%&'()*+,-./0123456789:;<=>?@   ABCDEFGHIJKLMNOPQRSTUVWXYZ`;

        const CAPTION = 'HELLO!\nPHASER3 WORLD'; // 表示文字列

        // 樹木のフォント
        this.add.rectangle(0, 0, cW, cH, 0x102028).setOrigin(0); // 背景
        const config = {
            image: FONTNAME,
            width: 64,
            height: 100,
            //chars: Phaser.GameObjects.RetroFont.TEXT_SET9,
            chars: TEXT_SET,
            charsPerRow: 7
        } as Phaser.Types.GameObjects.BitmapText.RetroFontConfig;
        this.cache.bitmapFont.add(FONTNAME, Phaser.GameObjects.RetroFont.Parse(this, config));
        this.add.bitmapText(50, 160, FONTNAME, CAPTION);
    }

    /**
     * ビットマップフォント  ≪静止≫
     */
    private displayBitmapFont(): void {
        const { width: cW, height: cH } = this.game.canvas;

        const FONTNAME = 'candy';
        const CAPTION = '$12345\n4567#\n67% 890%'; // 表示文字列

        // キャンディーのフォント
        this.add.rectangle(0, 0, cW, cH, 0xFAD8D4).setOrigin(0); // 背景
        this.add.bitmapText(50, 80, FONTNAME, CAPTION);
    }

    /**
     * ダイナミックビットマップフォント ≪波の演出≫
     */
    private displayWavingMotion(): void {
        type Pos = Phaser.Types.Math.Vector2Like;

        // 定数
        const SPEED = 4;         // スピードを1～50くらいで指定。値が大きいほど速い。
        const ANGLE_STEP_X = 30; // 文字間の周期差(X)。-180～180の範囲で指定。
        const ANGLE_STEP_Y = 30; // 文字間の周期差(Y)。-180～180の範囲で指定。
        const RADIUS_X = 20;     // 横のふり幅
        const RADIUS_Y = 15;     // 縦のふり幅

        const CAPTION = 'THESE ARE\nNICE CANNED DRINKS'; // 表示文字列

        // 缶フォント
        const { width: cW, height: cH } = this.game.canvas;
        this.add.rectangle(0, 0, cW, cH, 0xC0F0FF).setOrigin(0); // 背景水色
        const canText = this.add.dynamicBitmapText(30, 200, 'canfont', CAPTION).setScale(0.7);
        const charPos: Array<Pos> = Array.from({ length: CAPTION.length });
        let curSp = 0;
        canText.setDisplayCallback((data: Phaser.Types.GameObjects.BitmapText.DisplayCallbackConfig) => {
            if (!charPos[data.index]) {
                // 初回呼び出し時に文字位置の値を記録
                charPos[data.index] = { x: data.x, y: data.y } as Pos;
            }
            curSp += SPEED / 1000;
            const angX = data.index * Phaser.Math.DegToRad(ANGLE_STEP_X) + curSp;
            const angY = data.index * Phaser.Math.DegToRad(ANGLE_STEP_Y) + curSp;
            data.x = charPos[data.index].x + Math.cos(angX) * RADIUS_X;
            data.y = charPos[data.index].y + Math.sin(angY) * RADIUS_Y;
            if (curSp >= Math.PI * 2) {
                curSp -= Math.PI * 2;
            }
            return data;
        });
    }

    /**
     * ダイナミックビットマップフォント ≪拡大と縮小≫
     */
    private displayScalingMotion(): void {
        type Pos = Phaser.Types.Math.Vector2Like;

        // 定数
        const SPEED = 4;        // スピードを1～50くらいで指定。値が大きいほど速い。
        const MIN_SCALE = 0.5;  // スケールの最小値
        const MAX_SCALE = 1.1;  // スケールの最大値
        const ANGLE_STEP = -30; // 文字間の周期差。-180～180の範囲で指定。

        const CAPTION = '1234567\n890'; // 表示文字列

        // 岩石のフォント
        const { width: cW, height: cH } = this.game.canvas;
        this.add.grid(0, 0, cW, cH, 50, 50, 0x000000, 1, 0xFFFFFF).setOrigin(0); // 背景：碁盤目
        const rockText = this.add.dynamicBitmapText(50, 100, 'rockdigits', CAPTION).setOrigin(0);
        const textRect = rockText.getBounds();
        this.add.rectangle(textRect.left, textRect.top, textRect.width, textRect.height, 0xFFFFFF, 0.5).setOrigin(0);
        this.children.bringToTop(rockText);

        const charPos: Array<Pos> = Array.from({ length: CAPTION.length });
        let curSp = 0;
        rockText.setDisplayCallback((data: Phaser.Types.GameObjects.BitmapText.DisplayCallbackConfig) => {
            if (!charPos[data.index]) {
                // 初回呼び出し時に文字位置の値を記録
                charPos[data.index] = { x: data.x, y: data.y } as Pos;
            }
            const char: Phaser.Types.GameObjects.BitmapText.BitmapFontCharacterData
                = rockText.fontData.chars[data.charCode]
            curSp += SPEED / 1000;
            const ang = data.index * Phaser.Math.DegToRad(ANGLE_STEP) + curSp;
            const scale = (Math.sin(ang) + 1) / 2 * (MAX_SCALE - MIN_SCALE) + MIN_SCALE;
            data.scale = scale;
            const posXBase = charPos[data.index].x / scale;
            const halfCharW = (char.width / 2) / scale;
            data.x = posXBase + halfCharW * (1 - scale);
            data.y = charPos[data.index].y / scale +
                ((rockText.fontData.lineHeight / 2) / scale) * (1 - scale);
            if (curSp >= Math.PI * 2) {
                curSp -= Math.PI * 2;
            }
            return data;
        });
    }

    /**
     * ダイナミックビットマップフォント
     * テキストフォローパス
     */
    private displayTextFollowPath() {
        const { width: cW, height: cH } = this.game.canvas;
        const BASE_X = 500;
        const SPEED = 0.001;

        // パスの生成
        const path = new Phaser.Curves.Path(cW, BASE_X);
        path.lineTo(cW - 200, 500);

        const pointArray = [
            cW - 200, 100,
            cW / 2, 300,
            200, 100,
            200, BASE_X,
        ];
        const vecArray = new Array<Phaser.Math.Vector2>();
        for (let i = 0; i < pointArray.length; i += 2) {
            vecArray.push(new Phaser.Math.Vector2(pointArray[i], pointArray[i + 1]));
        }

        path.splineTo(vecArray);
        path.lineTo(-80, BASE_X); // すべての文字が隠れるまで移動させるため、最終点は画面外へ配置。

        const FONTNAME = 'cp-font';
        const CHAR_PADDING = 8;   // 文字間隔 （xmlにxadvanceがあるがdynamicBitmapTextでは保持していないため、文字間隔を固定値として設定）
        const CAPTION = '新しい朝が来た！希望の朝だ！'; // 表示文字列
        const text = this.add.dynamicBitmapText(0, 0, FONTNAME, CAPTION);

        const charW: Array<number> = Array.from({ length: CAPTION.length });

        let step = 0.5;
        text.setDisplayCallback((data: Phaser.Types.GameObjects.BitmapText.DisplayCallbackConfig) => {
            if (!charW[data.index]) {
                // 各文字の横幅を取得して保持する
                const char: Phaser.Types.GameObjects.BitmapText.BitmapFontCharacterData
                    = text.fontData.chars[data.charCode];
                charW[data.index] = char.width
            }

            if (data.index === 0) {
                step += SPEED;
                if (step >= 1) {
                    step -= 1;
                }
            }

            let shift = 0;
            if (0 < data.index) {
                // 2文字目以降はそれまでの文字の幅を加算して、先頭位置から後ろへずらす
                const sum = charW.slice(0, data.index).reduce((acc, curr) => acc + (curr ?? 0) + CHAR_PADDING, 0);
                shift = sum / path.getLength();
            }
            const charStep = step - shift;
            const pos = path.getPoint(charStep - Math.floor(charStep));
            if (pos) {
                data.x = pos.x;
                data.y = pos.y;
            }
            return data;
        });

        // 線と点の描画
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0xffffff, 1);
        path.draw(graphics, 128);
        graphics.fillStyle(0xff0000, 1);
        vecArray.forEach(e => graphics.fillCircle(e.x, e.y, 5));

        // 文字を最前面へ
        this.children.bringToTop(text);
    }
}
