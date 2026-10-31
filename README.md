# 分散型SNSのすゝめ

三田学園文化祭LT会向けの20分の叩き台です。<br>
Twitter・Instagramを使う、分散型SNSを初めて知る人に向けた本編26枚＋参考資料1枚です。<br>
15枚目に1分休憩を入れ、19分で本編を終えて残り1分を調整に使う配分です。<br>
所要時間はリハーサルで調整してください。

- 編集するファイルは `slides/index.md`。各ページのHTMLコメントが話すメモです。
- `mise exec -- pnpm dev` で <http://localhost:19720/> にプレビューを起動します。
- `mise exec -- pnpm run build:dark` で `dist/slides.html` を出力します。
- `mise exec -- pnpm run pdf` で `dist/slides.pdf` を出力します。PDF変換にはChrome系ブラウザーが必要です。
- このMacのHeliumを使う場合は `CHROME_PATH=/Applications/Helium.app/Contents/MacOS/Helium mise exec -- pnpm run pdf` で変換できます。
- 図は `slides/assets/` 内の編集可能なSVGです。投稿・人物・SNSの例は説明用の架空のものです。
- HTMLを別の場所へ渡す場合は、`dist/fonts/` と `dist/assets/` も一緒に渡してください。

以下は元のテンプレートの説明です。

# slide-template

まっちゃすきーの配色を使った、Marpのスライドテンプレートです。<br>
ダーク版・ライト版と、短い言葉や段階的なページ送りを試せる発表サンプルを用意しています。

## はじめる

GitHubの **Use this template** から自分のリポジトリを作り、クローンします。<br>
Node.jsとpnpmは [mise](https://mise.jdx.dev/) で管理します。<br>
`mise.toml` でNode.js 24.21.0とpnpm 10.34.5を指定しています。

```sh
mise trust
mise install
mise exec -- pnpm install --frozen-lockfile
mise exec -- pnpm dev
```

miseをシェルに組み込んでいる場合は、インストール後は `pnpm dev` のように直接実行できます。<br>
パッケージの追加も `mise exec -- pnpm add` を使い、`pnpm-lock.yaml` を更新してください。

## プレビューと編集

| 種類 | 編集するファイル | プレビュー |
| --- | --- | --- |
| ダーク | `slides/index.md` | <http://localhost:19720/> |
| ライト | `slides/light.md` | <http://localhost:19720/light.md> |
| 発表サンプル | `slides/demo.md` | <http://localhost:19720/demo.md> |
| 動きの比較サンプル | `slides/motion.md` | <http://localhost:19720/motion.md> |
| 動きの比較サンプル・ライト | `slides/motion-light.md` | <http://localhost:19720/motion-light.md> |

保存すると、ブラウザーの表示が自動更新されます。<br>
停止するにはターミナルで `Ctrl+C` を押します。<br>
各Markdownは独立しているので、使いたいものをコピーして内容を置き換えてください。

サンプルの「スライドに、全部書かなくてもいい話」は10枚です。<br>
問いかけ、一項目ずつ増えるページ、短い強調ページを含みます。<br>
テンプレート内の文言は作成例で、本人の実績や体験の記録ではありません。

## スライドの書き方

- `---` でページを区切ります。
- `<!-- _class: lead -->` で表紙のレイアウトになります。
- `<!-- _class: statement -->` で短い言葉を中央に配置します。
- クラス指定を省略すると、見出しと本文のレイアウトになります。
- `<!-- _paginate: false -->` でそのページの番号を隠せます。
- 日本語の説明文は、句点の後に半角スペースを2個置いて改行すると、表示でも改行されます。
- 画像は `slides/` に置き、`![説明](image.png)` のように参照します。
- 発表者ノートは `<!-- ここで話すこと -->` のようにコメントで書けます。

### ページをなめらかに切り替える

各Markdownの先頭に `transition: matcha 300ms` を設定しています。<br>
見出し・文章・箇条書き・表を要素ごとに対応付けています。<br>
同じ内容はフェードで消さず、位置や大きさが変わった部分だけをなめらかにつなぎます。<br>
異なる内容の見出し同士を無理につなぐことはありません。<br>
追加した要素だけが現れるため、箇条書きを増やす連続ページでも共通部分が保たれます。<br>
背景を含む画面全体の移動やフェードは行いません。<br>
Canvaで確認した「マッチ&ムーブ」と、表紙の「右向きワイプ」を参考にしています。<br>
Canvaと同じ描画エンジンではないため、効果は完全に同一ではありません。

表紙の `lead` は右向きワイプ、それ以外は新しい要素のフェードが基本です。<br>
`<!-- _class: statement motion-rise -->` で、中央配置とライズを組み合わせられます。<br>
`motion-wipe` を追加すると、本文ページでもワイプを使えます。<br>
動きを減らす設定では、要素の移動を省きます。<br>
非対応ブラウザーやPDFでは、ページ切り替えのアニメーションは動作しません。

要素の対応付けは `lib/slide-motion.mjs`、動きは `styles/motion.css` にあります。<br>
別のプロジェクトへ移す場合は、テーマCSSだけでなく、この2つと `marp.config.mjs` も含めてください。<br>
この3ファイルの変更後はプレビューサーバーを再起動してください。

### 箇条書きを一つずつ表示する

`-` の代わりに `*` を使うと、HTMLの発表画面で一項目ずつ表示できます。

```markdown
* どうして作ったのか
* どう動くのか
* 何を学んだのか
```

右矢印・Spaceで次の項目が表示され、左矢印で一つ前に戻れます。<br>
`-` の箇条書きは初めから全項目を表示します。<br>
サンプルの3ページ目で試せます。<br>
表示時は220msでフェードインし、少し下から現れます。<br>
ダーク・ライト両方に適用されます。<br>
端末で動きを減らす設定を使っている場合は、移動を省いた短いフェードになります。<br>
PDFでは全項目が静止表示されます。

## テーマ

Markdown先頭の `theme` を切り替えます。

```yaml
theme: mattyaski
```

```yaml
theme: mattyaski-light
```

共通レイアウトとダーク配色は `slides/themes/mattyaski.css`、ライト配色は `slides/themes/mattyaski-light.css` にあります。<br>
`marp.config.mjs` が両方のCSSを読み込むので、サンプルも `theme` の一行だけで切り替えられます。<br>
画面比率は16:9です。<br>
Canva資料のように、外側に24pxの余白を設け、内側の角を丸くしています。<br>
枠はダークでは深い緑、ライトでは淡い緑にし、本文とのコントラストを抑えています。

## フォント

Canva資料で使われていた「源柔ゴシック」を同梱しています。<br>
本文はRegular、見出しはMedium、強調はBoldです。<br>
ダーク・ライト両方で同じフォントを使い、OSへのフォントのインストールは不要です。<br>
`slides/fonts/` のWebフォントを使うため、初回表示では読込完了まで少し待つ場合があります。

元フォントは自家製フォント工房の源柔ゴシック20150607版です。<br>
[IIJのOSDNミラー](https://ftp.iij.ad.jp/pub/osdn.jp/users/8/8642/genjyuugothic-20150607.zip)から取得し、字形は変更せずWOFF2形式に変換しています。<br>
原本の説明とライセンスは `slides/fonts/` に同梱しています。

## HTMLに書き出す

```sh
mise exec -- pnpm build
```

| 内容 | 出力 |
| --- | --- |
| ダーク | `dist/slides.html` |
| ライト | `dist/slides-light.html` |
| 発表サンプル | `dist/demo.html` |
| 動きの比較サンプル | `dist/motion.html` |
| 動きの比較サンプル・ライト | `dist/motion-light.html` |

個別に書き出す場合は `mise exec -- pnpm build:dark`、`mise exec -- pnpm build:light`、`mise exec -- pnpm build:demo`、`mise exec -- pnpm build:motion` を使います。<br>
生成物と依存パッケージはGit管理から除外しています。<br>
HTMLを配布・移動する際は、フォントが入った `dist/fonts/` も含めて `dist/` ごと渡してください。

## PDFに書き出す

Chrome、Edge、Firefoxのいずれかが必要です。

```sh
mise exec -- pnpm pdf
```

ダーク版を `dist/slides.pdf` に出力します。<br>
PDF出力は、このリポジトリの作成環境では対応ブラウザーを検出できず未確認です。

## 利用範囲

`mise exec -- pnpm test` で、同じ内容の対応付け、違う見出しの区別、同一ページ内の重複、箇条書きの段階表示が維持されることを確認できます。

プレビューサーバーは利用中だけ起動してください。<br>
Marp標準サーバーはlocalhost以外でも待ち受けるため、インターネットへ公開しないでください。<br>
依存パッケージには既知の脆弱性が残っているため、自作資料のローカル編集用として利用してください。

## 配色の原案

- ダークは `@KawaneRio@mattyaski.co` による「かわねてぃーが作ったまっちゃすきーのテーマ」から、背景 `#252722`、文字 `#d1e4d4`、アクセント `#5c913b` を使用しています。
- ライトは `@nagiRuma@mattyaski.co` による「まっちゃすきーのテーマ/light版」から、背景 `#ebf0e3` と文字 `#29332a` を使用しています。
- 強調文字とリンクは、スライド上で読みやすい色に調整しています。

## 公式資料

- [Marp](https://marp.app/)
- [Marp CLI](https://github.com/marp-team/marp-cli)

### イラストと投稿配信の動き

いらすとやの出典と元資料を反映した点は `notes/visual-assets.html` にまとめています。
投稿例は架空の内容です。
2つのSNSの段階説明の後に、複数のSNSへ投稿が流れ続ける図があります。
配信図はTablerの封筒アイコンが3.5秒周期で流れます。
PDFと端末の「動きを減らす」設定では静止表示になります。
