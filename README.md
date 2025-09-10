# NEO PORTFOLIO (Sci‑Fi Glow Template)

ローカルで `index.html` を開くだけで動作します。構成は次の通りです。

- `index.html` — ひな形（Hero / About / Projects / Contact）
- `css/style.css` — SF風グロー、ガラス質感、グリッド背景、レスポンシブ
- `js/main.js` — アクセント色トグル、スクロール表示、カード傾き
- `assets/images/` — 画像（サムネイル等）
- `assets/media/` — 動画・PDFなど配布物
- `assets/fonts/` — Webフォント（必要に応じて）

## カスタマイズ

- アクセント色はヘッダー右上の `Accent` ボタンで切替（ローカル保存）。
- プロジェクトカードは `#projects .cards` 内の `<article class="card">` を複製して追加。
- 画像は `assets/images/` に保存し、カードの `.card-media` を `<img>` に置き換えて利用可。

```html
<div class="card-media">
  <img src="assets/images/your-thumbnail.webp" alt="Project thumbnail" />
  <!-- 必要なら動画や<canvas>にも変更可能 -->
  
</div>
```

## フォント

プロジェクトに合うフォントを `assets/fonts/` に配置し、`@font-face` を `css/style.css` へ追加してください。

## 配布／公開

静的サイトとしてそのままホスティングできます（GitHub Pages等）。ビルド工程は不要です。

