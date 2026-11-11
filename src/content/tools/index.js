// 全ツールのレジストリ。新しいツールを追加したら、ここに import と配列への追加を行うこと。
import jsonFormatter from './json-formatter.js';
import sqlFormatter from './sql-formatter.js';
import cssMinifier from './css-minifier.js';
import markdownPreview from './markdown-preview.js';
import diffChecker from './diff-checker.js';
import csvJsonConverter from './csv-json-converter.js';
import base64 from './base64.js';
import urlEncoder from './url-encoder.js';
import htmlEntities from './html-entities.js';
import imageBase64 from './image-base64.js';
import jwtDecoder from './jwt-decoder.js';
import hashGenerator from './hash-generator.js';
import uuidGenerator from './uuid-generator.js';
import passwordGenerator from './password-generator.js';
import passwordStrengthChecker from './password-strength-checker.js';
import loremIpsum from './lorem-ipsum.js';
import qrCodeGenerator from './qr-code-generator.js';
import cssGradient from './css-gradient.js';
import metaTagGenerator from './meta-tag-generator.js';
import faviconGenerator from './favicon-generator.js';
import imageCompressor from './image-compressor.js';
import colorConverter from './color-converter.js';
import regexTester from './regex-tester.js';
import cronParser from './cron-parser.js';
import cronNextRun from './cron-next-run.js';
import timestampConverter from './timestamp-converter.js';
import timezoneConverter from './timezone-converter.js';
import wordCounter from './word-counter.js';
import cidrCalculator from './cidr-calculator.js';
import slugGenerator from './slug-generator.js';
import numberBaseConverter from './number-base-converter.js';
import yamlJsonConverter from './yaml-json-converter.js';
import textCaseConverter from './text-case-converter.js';
import jsonToTypescript from './json-to-typescript.js';
import dateCalculator from './date-calculator.js';
import lineSorter from './line-sorter.js';
import pxRemConverter from './px-rem-converter.js';
import chmodCalculator from './chmod-calculator.js';
import aspectRatioCalculator from './aspect-ratio-calculator.js';
import markdownTableGenerator from './markdown-table-generator.js';
import zenkakuHankaku from './zenkaku-hankaku.js';
import colorPaletteGenerator from './color-palette-generator.js';
import boxShadowGenerator from './box-shadow-generator.js';
import qrCodeReader from './qr-code-reader.js';
import markdownToText from './markdown-to-text.js';
import hexDumpViewer from './hex-dump-viewer.js';

export const categories = [
  {
    id: 'format',
    label: '変換・整形',
    desc: 'コードやテキストを読みやすく整形・変換するツール',
    intro:
      'APIのレスポンスを読みやすく整える、CSVをJSONに直す、2つの設定ファイルの差分を確かめる——コードやテキストの「形を変える」作業をまとめたカテゴリです。整形と圧縮、形式の相互変換、差分の確認、Markdownの下書きまで、エディタを開くほどでもない作業をブラウザだけで済ませられます。',
  },
  {
    id: 'encode',
    label: 'エンコード・ハッシュ',
    desc: 'Base64・URL・ハッシュなど各種エンコード処理',
    intro:
      'Base64やURLエンコード、HTMLエスケープ、ハッシュ値の計算、JWTの中身の確認など、データの表現を変えたり検証したりするツールのカテゴリです。エンコードは暗号化ではなく、誰でも元に戻せる変換である点に注意してください。動作確認にはダミーデータを使うことをおすすめします。',
  },
  {
    id: 'generate',
    label: 'ジェネレーター',
    desc: 'UUID・パスワード・QRコードなどをその場で生成',
    intro:
      'テストデータ用のUUID、推測されにくいパスワード、URLを載せたQRコード、デザインの仮置きテキストなど、「いま1つ必要」なものをその場で作るツールのカテゴリです。生成した結果はコピーやダウンロードでそのまま持ち出せます。',
  },
  {
    id: 'web',
    label: 'Web制作・デザイン',
    desc: 'CSS・配色・メタタグなどWeb制作を助けるツール',
    intro:
      'グラデーションや影のCSSを目で見ながら調整する、配色を組み立てる、pxとremを換算する、OGPのメタタグを用意する——Webサイトの見た目と公開準備に関わるツールのカテゴリです。プレビューで確かめた値を、そのままCSSやHTMLとしてコピーできます。',
  },
  {
    id: 'dev',
    label: '開発ユーティリティ',
    desc: '正規表現・cron・タイムスタンプなど開発の定番ツール',
    intro:
      '正規表現の動作確認、cron式の読み解きと次回実行時刻の確認、UNIXタイムスタンプやタイムゾーンの変換、サブネットやパーミッションの計算など、開発と運用で繰り返し出てくる確認作業のためのカテゴリです。頭の中で計算すると間違えやすいものを、入力するだけで確かめられます。',
  },
];

export const tools = [
  jsonFormatter,
  sqlFormatter,
  cssMinifier,
  markdownPreview,
  markdownToText,
  diffChecker,
  csvJsonConverter,
  jsonToTypescript,
  markdownTableGenerator,
  zenkakuHankaku,
  base64,
  urlEncoder,
  htmlEntities,
  imageBase64,
  jwtDecoder,
  hashGenerator,
  uuidGenerator,
  passwordGenerator,
  passwordStrengthChecker,
  loremIpsum,
  qrCodeGenerator,
  qrCodeReader,
  cssGradient,
  boxShadowGenerator,
  metaTagGenerator,
  faviconGenerator,
  imageCompressor,
  colorConverter,
  colorPaletteGenerator,
  pxRemConverter,
  aspectRatioCalculator,
  regexTester,
  cronParser,
  cronNextRun,
  timestampConverter,
  timezoneConverter,
  dateCalculator,
  wordCounter,
  textCaseConverter,
  lineSorter,
  yamlJsonConverter,
  numberBaseConverter,
  slugGenerator,
  cidrCalculator,
  chmodCalculator,
  hexDumpViewer,
];

export const toolMap = Object.fromEntries(tools.map((t) => [t.slug, t]));

export const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

export function toolsByCategory(categoryId) {
  return tools.filter((t) => t.category === categoryId);
}
