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
import loremIpsum from './lorem-ipsum.js';
import qrCodeGenerator from './qr-code-generator.js';
import cssGradient from './css-gradient.js';
import metaTagGenerator from './meta-tag-generator.js';
import faviconGenerator from './favicon-generator.js';
import imageCompressor from './image-compressor.js';
import colorConverter from './color-converter.js';
import regexTester from './regex-tester.js';
import cronParser from './cron-parser.js';
import timestampConverter from './timestamp-converter.js';
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

export const categories = [
  { id: 'format', label: '変換・整形', desc: 'コードやテキストを読みやすく整形・変換するツール' },
  { id: 'encode', label: 'エンコード・ハッシュ', desc: 'Base64・URL・ハッシュなど各種エンコード処理' },
  { id: 'generate', label: 'ジェネレーター', desc: 'UUID・パスワード・QRコードなどをその場で生成' },
  { id: 'web', label: 'Web制作・デザイン', desc: 'CSS・配色・メタタグなどWeb制作を助けるツール' },
  { id: 'dev', label: '開発ユーティリティ', desc: '正規表現・cron・タイムスタンプなど開発の定番ツール' },
];

export const tools = [
  jsonFormatter,
  sqlFormatter,
  cssMinifier,
  markdownPreview,
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
  loremIpsum,
  qrCodeGenerator,
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
  timestampConverter,
  dateCalculator,
  wordCounter,
  textCaseConverter,
  lineSorter,
  yamlJsonConverter,
  numberBaseConverter,
  slugGenerator,
  cidrCalculator,
  chmodCalculator,
];

export const toolMap = Object.fromEntries(tools.map((t) => [t.slug, t]));

export function toolsByCategory(categoryId) {
  return tools.filter((t) => t.category === categoryId);
}
