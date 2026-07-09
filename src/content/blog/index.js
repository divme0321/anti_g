// ブログ記事のレジストリ。新しい記事を追加したら、ここに import と配列への追加を行うこと。
// 配列は日付の新しい順に自動ソートされる。
import httpStatusCodes from './http-status-codes.js';
import regexBasics from './regex-basics.js';
import jsonSyntaxErrors from './json-syntax-errors.js';
import curlCheatsheet from './curl-cheatsheet.js';
import gitCommandReference from './git-command-reference.js';
import characterEncodingGuide from './character-encoding-guide.js';

export const posts = [
  httpStatusCodes,
  regexBasics,
  jsonSyntaxErrors,
  curlCheatsheet,
  gitCommandReference,
  characterEncodingGuide,
].sort((a, b) => (a.date < b.date ? 1 : -1));

export const postMap = Object.fromEntries(posts.map((p) => [p.slug, p]));
