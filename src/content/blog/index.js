// ブログ記事のレジストリ。新しい記事を追加したら、ここに import と配列への追加を行うこと。
// 配列は日付の新しい順に自動ソートされる。
import httpStatusCodes from './http-status-codes.js';
import regexBasics from './regex-basics.js';
import jsonSyntaxErrors from './json-syntax-errors.js';
import curlCheatsheet from './curl-cheatsheet.js';
import gitCommandReference from './git-command-reference.js';
import characterEncodingGuide from './character-encoding-guide.js';
import yamlVsJson from './yaml-vs-json.js';
import csvJsonConversionPitfalls from './csv-json-conversion-pitfalls.js';
import namingConventionGuide from './naming-convention-guide.js';
import cidrSubnetGuide from './cidr-subnet-guide.js';
import chmodPermissionGuide from './chmod-permission-guide.js';
import markdownCheatsheet from './markdown-cheatsheet.js';
import pxRemEmGuide from './px-rem-em-guide.js';
import typescriptTypeBasics from './typescript-type-basics.js';
import boxShadowDesignGuide from './box-shadow-design-guide.js';
import colorSchemeBasics from './color-scheme-basics.js';
import aspectRatioCssGuide from './aspect-ratio-css-guide.js';

export const posts = [
  httpStatusCodes,
  regexBasics,
  jsonSyntaxErrors,
  curlCheatsheet,
  gitCommandReference,
  characterEncodingGuide,
  yamlVsJson,
  csvJsonConversionPitfalls,
  namingConventionGuide,
  cidrSubnetGuide,
  chmodPermissionGuide,
  markdownCheatsheet,
  pxRemEmGuide,
  typescriptTypeBasics,
  boxShadowDesignGuide,
  colorSchemeBasics,
  aspectRatioCssGuide,
].sort((a, b) => (a.date < b.date ? 1 : -1));

export const postMap = Object.fromEntries(posts.map((p) => [p.slug, p]));
