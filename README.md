# バドミントン実業団物語(アプリ版)

Claudeで作ったゲームを、iPhone・Androidのアプリとして動かすためのプロジェクトです。
中身は同じゲームなので、claude.ai版で遊んでいたデータも「引き継ぎコード」で移せます。

## フォルダの中身

| 場所 | 中身 |
|---|---|
| `src/game.html` | ゲーム本体。claude.aiで更新したら、ここを差し替えます |
| `www/` | アプリに入れる完成品。`npm run build` で自動で作られます(直接編集しない) |
| `android/` | Androidアプリのプロジェクト(Android Studioで開けます) |
| `ios/` | iPhoneアプリのプロジェクト(MacのXcodeで開けます) |
| `assets/` | アプリアイコンと起動画面の元画像 |
| `.github/workflows/` | GitHubが自動でアプリを作ってくれる設定 |

アプリでは、Webで読み込んでいたフォントを同梱しているので、電波がなくても同じ見た目で遊べます。
セーブデータは端末内に二重に保存されます。

---

## いちばん簡単:Macもパソコン作業もほぼなしでAndroidに入れる

GitHub(無料)にこのフォルダを置くと、GitHubのサーバーが自動でAndroidアプリ(APK)を作ってくれます。

1. https://github.com でアカウントを作り、「New repository」で新しいリポジトリ(非公開でOK)を作る
2. このフォルダの中身をアップロードする(画面の「uploading an existing file」にドラッグ&ドロップ。`node_modules` は不要)
3. 上の「Actions」タブを開く →「Androidアプリを作る」が自動で動く(5〜10分)
4. 終わったら、その実行結果の一番下「Artifacts」から `jitsugyodan-debug-apk` をダウンロード
5. ZIPを開いて出てくる `app-debug.apk` をAndroidスマホに送り、タップしてインストール
   (「提供元不明のアプリ」の許可を求められたら許可してください)

> この方法で入れられるのは自分のスマホ用の「試し版」です。Google Playに出すには下の手順が必要です。

---

## Webアプリとして公開する(無料・iPhoneでもOK)

1. 上と同じようにGitHubにアップロード
2. リポジトリの「Settings」→「Pages」→「Source」を **GitHub Actions** にする
3. 「Actions」タブで「Webアプリ(PWA)を公開する」が動き、`https://(あなたの名前).github.io/(リポジトリ名)/` で遊べるようになる
4. スマホでそのURLを開き、「ホーム画面に追加」→ アイコンから全画面で起動、オフラインでも遊べます

> リポジトリを非公開にしたままPagesを使うには、GitHubの有料プランが必要です。無料で使う場合は公開リポジトリにしてください。

---

## iPhoneだけで本物のアプリにする(Mac不要)

Macの代わりに、クラウド上のMacを貸してくれる **Codemagic**(無料枠あり)を使います。作業はすべてiPhoneのブラウザでできます。

1. [Apple Developer Program](https://developer.apple.com/programs/) に登録(年99ドル)。iPhoneの「Apple Developer」アプリからも登録できます
2. [App Store Connect](https://appstoreconnect.apple.com) で「マイApp」→「+」→ 新規App。バンドルIDは `capacitor.config.json` の `appId` と同じ値にする
3. App Store Connect の「ユーザとアクセス」→「統合」→「App Store Connect API」でキーを作り、`.p8` ファイルをダウンロード
4. このプロジェクトをGitHubに置く(上の手順と同じ)
5. [Codemagic](https://codemagic.io) にGitHubアカウントでログイン → リポジトリを追加 →「Teams / Personal account」→「Integrations」→「App Store Connect」に3のキーを登録(名前は `Codemagic`)
6. Codemagicでビルドを開始(ワークフロー「iPhoneアプリ(TestFlight)」)。終わると自動でTestFlightに届きます
7. iPhoneに「TestFlight」アプリを入れると、自分のアプリがインストールできます。友達にも招待リンクで配れます
8. App Storeに公開したくなったら、App Store Connect で説明文・スクリーンショットを入れて審査に出します

---

## 自分のパソコンで作る場合

必要なもの:Node.js 22以上

```bash
npm install          # 最初の1回だけ
npm run build:app    # ゲームを組み立てて、Android・iPhoneのプロジェクトに反映
```

### Android
- [Android Studio](https://developer.android.com/studio) を入れる
- `npm run android` で開く → 上の ▶ ボタンで、USBでつないだスマホやエミュレーターで起動

### iPhone(Macが必要)
- App Storeから Xcode を入れる
- `npm run ios` で開く →「Signing & Capabilities」で自分のApple IDを「Team」に選ぶ → ▶ で、つないだiPhoneに入る
- 無料のApple IDでも自分のiPhoneには入れられます(7日ごとに入れ直しが必要)
- Macがなくても、GitHubの「Actions」→「iPhoneアプリのビルド確認」を手動で実行すると、iPhone版がエラーなく組み立てられるかだけは確認できます

---

## ゲームを更新したとき

1. claude.aiで更新したゲームのHTMLを `src/game.html` に上書き保存
2. `npm run build:app`(GitHubを使っている場合は、`src/game.html` をアップロードし直すだけで自動で作り直されます)
3. ストアに出す場合は、`android/app/build.gradle` の `versionCode` を1つ増やし、`versionName` を変える(iPhoneはXcodeで Version / Build を上げる)

アイコンを変えたいときは `assets/icon-only.png`(1024×1024)などを差し替えて `npm run icons` を実行します。

---

## ストアに出す前に必ずやること

- **アプリIDを自分のものに変える**:`capacitor.config.json` の `appId`(今は `jp.jitsugyodan.badminton`)は世界で1つだけの値です。自分のドメインや名前を使った値(例:`com.yourname.jitsugyodan`)に変えて、`npx cap sync` を実行してください。ストア公開後は変えられません。Androidの `android/app/build.gradle` の `applicationId` と `namespace`、iPhoneのXcodeの Bundle Identifier も同じ値にそろえます。
- **プライバシーポリシー**:両ストアで提出が必要です。このゲームは外部に個人情報を送らないので、「データはすべて端末内に保存し、外部に送信しません」という内容の簡単なページで足ります。
- **スクリーンショットと説明文**:ストアの掲載ページに必要です。

### Google Play
- [Google Play Console](https://play.google.com/console) に登録(初回のみ25ドル)
- 署名鍵を作る(パソコンで1回だけ。**この鍵とパスワードはなくすと二度と更新できないので、必ず安全な場所に保管**)
  ```bash
  keytool -genkey -v -keystore release.keystore -alias jitsugyodan -keyalg RSA -keysize 2048 -validity 10000
  base64 -i release.keystore   # 出てきた長い文字列を次で使う
  ```
- GitHubの「Settings」→「Secrets and variables」→「Actions」に次の4つを登録すると、Actionsがストア提出用の `app-release.aab` も作るようになります
  - `ANDROID_KEYSTORE_BASE64`(上のbase64の文字列)
  - `ANDROID_KEYSTORE_PASSWORD` / `ANDROID_KEY_ALIAS`(例:jitsugyodan) / `ANDROID_KEY_PASSWORD`
- 個人の開発者アカウントは、本番公開の前に「12人以上のテスターで14日間のクローズドテスト」が求められます(2026年時点。最新の条件はPlay Consoleで確認してください)

### App Store(iPhone)
- Mac と Xcode が必要
- [Apple Developer Program](https://developer.apple.com/programs/) に登録(年99ドル。日本では約1万3千円)
- Xcodeで「Product」→「Archive」→「Distribute App」→ App Store Connect にアップロード
- まず TestFlight で自分や友達に配って試し、問題なければ審査に出します

---

## claude.ai版のデータを移す

1. claude.ai版のゲームで「経営」→「収支・施設」の一番下 →「セーブデータ」→「今のデータのコードを作る」→「コピー」
2. アプリ版を開き、スタート画面の「セーブデータ・引き継ぎコードから続ける」(遊んでいる途中なら同じく経営タブのセーブデータ)
3. 「コードから読み込む」に貼り付けて「読み込む」

## 使っている技術
- [Capacitor 7](https://capacitorjs.com/)(Webのゲームをそのまま iPhone / Android アプリにする仕組み)
- フォント:Dela Gothic One、Zen Kaku Gothic New、JetBrains Mono(いずれも SIL Open Font License)
