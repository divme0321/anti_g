// Gitコマンド逆引きリファレンス — ブログ記事コンテンツ定義
// body 内の HTML は h2/h3/p/ul/ol/li/table/thead/tbody/tr/th/td/code/pre/strong/a のみを使用し、style属性は使わないこと。
export default {
  slug: 'git-command-reference',
  title: 'Gitコマンド逆引きリファレンス【やりたいことから探す40例】',
  description:
    '「直前のコミットを修正したい」「間違えてmainにコミットした」など、やりたいことからGitコマンドを逆引きできるリファレンス。reset/revertの違いやstash、コンフリクト解消まで40例を実例付きで解説します。',
  date: '2026-07-09',
  category: 'リファレンス',
  tags: ['Git', 'バージョン管理', 'コマンドライン'],
  relatedTools: ['diff-checker'],
  body: `<p>Gitは「コマンドは知っているのに、いざトラブルが起きるとどれを使えばいいか分からない」ツールの代表格です。この記事では、開発現場で遭遇する場面を「やりたいこと」から逆引きできるよう、40のコマンド例をシチュエーション別に整理しました。reset と revert の違いや、間違えてmainにコミットしたときの復旧手順など、検索されがちな疑問に実例で答えます。</p>

<h2>直前のコミットを修正したい</h2>
<h3>1〜3. コミットメッセージや内容を直す</h3>
<pre><code># 直前のコミットメッセージだけ直す
git commit --amend -m "正しいメッセージ"

# ファイルの追加漏れを直前のコミットに含める
git add forgotten.js
git commit --amend --no-edit

# コミットの作者情報を直す
git commit --amend --author="Taro &lt;taro@example.com&gt;"</code></pre>
<p><code>--amend</code> は直前のコミットを「作り直す」操作です。<strong>コミットIDが変わるため、push済みのコミットに使うのは避けてください</strong>。</p>

<h2>コミットを取り消したい（reset と revert の違い）</h2>
<p>取り消し系で最も混乱しやすいのがこの2つです。まず違いを整理します。</p>
<table>
<thead><tr><th>コマンド</th><th>動作</th><th>履歴</th><th>使いどころ</th></tr></thead>
<tbody>
<tr><td><code>git reset</code></td><td>コミット自体を無かったことにする</td><td>書き換わる</td><td>push前のローカル作業</td></tr>
<tr><td><code>git revert</code></td><td>打ち消しコミットを新規作成する</td><td>残る</td><td>push済み・共有ブランチ</td></tr>
</tbody>
</table>
<h3>4〜7. reset の3モード</h3>
<pre><code># コミットだけ取り消し、変更はステージに残す
git reset --soft HEAD~1

# コミットとステージを取り消し、変更は作業ツリーに残す（既定）
git reset --mixed HEAD~1

# コミットも変更も完全に破棄する
git reset --hard HEAD~1

# 直近3コミットをまとめて取り消す
git reset --soft HEAD~3</code></pre>
<p><strong><code>--hard</code> は未コミットの変更ごと消えるため実行前に必ず <code>git status</code> で確認してください</strong>。</p>
<h3>8〜9. push済みのコミットを打ち消す</h3>
<pre><code># 指定コミットの打ち消しコミットを作る
git revert abc1234

# マージコミットを打ち消す（-m 1 で親を指定）
git revert -m 1 abc1234</code></pre>
<p>共有ブランチでは履歴を書き換えず、revert で安全に取り消すのが原則です。</p>

<h2>ブランチを操作したい</h2>
<h3>10〜16. 作成・切替・削除・リネーム</h3>
<pre><code># ブランチを作って切り替える
git switch -c feature/login

# 既存ブランチに切り替える
git switch main

# ブランチ一覧（リモート含む）
git branch -a

# マージ済みブランチを削除
git branch -d feature/login

# 未マージでも強制削除
git branch -D feature/login

# ブランチ名を変更
git branch -m old-name new-name

# リモートの削除済みブランチをローカルにも反映
git fetch --prune</code></pre>
<p><code>switch</code> は Git 2.23 以降で使える、checkout のブランチ切替専用コマンドです。</p>
<h3>17〜18. リモートとのやり取り</h3>
<pre><code># 新しいブランチを初回push（上流を設定）
git push -u origin feature/login

# リモートブランチをローカルに取り込む
git switch -c fix/bug origin/fix/bug</code></pre>
<p><code>-u</code> を付けると以降は <code>git push</code> だけで済みます。</p>

<h2>作業を一時退避したい（stash）</h2>
<h3>19〜23. stash の基本操作</h3>
<pre><code># 変更を退避する（メッセージ付き）
git stash push -m "ログイン画面の途中"

# 退避一覧を見る
git stash list

# 最新の退避を戻して削除
git stash pop

# 戻すが退避は残す
git stash apply stash@{1}

# 未追跡ファイルも含めて退避
git stash -u</code></pre>
<p>ブランチ切替前に未コミットの変更を退避する定番機能です。<code>pop</code> は適用に成功するとstashを削除し、<code>apply</code> は残します。</p>

<h2>特定ファイルだけ戻したい</h2>
<h3>24〜27. ファイル単位の復元</h3>
<pre><code># 作業ツリーの変更を最後のコミット状態に戻す
git restore src/app.js

# ステージから降ろす（変更は残る）
git restore --staged src/app.js

# 特定コミット時点の内容に戻す
git restore --source abc1234 src/app.js

# 削除してしまったファイルを復元
git checkout HEAD -- deleted-file.js</code></pre>
<p><code>restore</code> はファイル復元専用のコマンドです。戻す前に<a href="/diff-checker">差分チェックツール</a>やgit diffで変更内容を確認しておくと安心です。</p>

<h2>コンフリクトを解消したい</h2>
<h3>28〜31. 解消の流れ</h3>
<pre><code># コンフリクト中のファイルを確認
git status

# 相手側（マージしてくる側）の内容を採用
git checkout --theirs conflicted.js

# 自分側の内容を採用
git checkout --ours conflicted.js

# 編集後にマージを完了する
git add conflicted.js
git commit</code></pre>
<p>ファイル内の <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code> 〜 <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code> マーカーを手動で編集して解消するのが基本です。やり直したい場合は <code>git merge --abort</code> でマージ前の状態に戻れます。</p>

<h2>履歴を調べたい（log / blame）</h2>
<h3>32〜36. 履歴の検索</h3>
<pre><code># 1行表示でグラフ付き
git log --oneline --graph --all

# 特定ファイルの変更履歴
git log -p src/app.js

# コミットメッセージで検索
git log --grep="ログイン"

# コードの追加・削除を文字列で検索
git log -S "functionName"

# 各行を最後に変更した人とコミットを表示
git blame src/app.js</code></pre>
<p><code>-S</code>（pickaxe）は「この関数はいつ消えたのか」を調べるときに便利です。<code>blame</code> は行単位で変更者を特定でき、<code>-L 10,20</code> で行範囲も絞れます。</p>

<h2>間違えてmainにコミットした</h2>
<h3>37〜38. 正しいブランチへ移す</h3>
<pre><code># 1. 今の状態から新ブランチを作る（コミットはここに残る）
git branch feature/rescue

# 2. mainをコミット前の状態に戻す
git reset --hard HEAD~1

# 3. 新ブランチに切り替えて作業を続ける
git switch feature/rescue</code></pre>
<p>push前ならこの3ステップで安全に移せます。push済みの場合は main で <code>git revert</code> を使ってください。</p>
<h3>39〜40. 消えたコミットを探す・強制push</h3>
<pre><code># HEADの移動履歴からコミットIDを探して復元
git reflog
git reset --hard abc1234

# 履歴を書き換えた後の強制push（より安全な形）
git push --force-with-lease</code></pre>
<p><code>reflog</code> は reset --hard で消えたように見えるコミットの救出に使えます。<strong><code>push -f</code>（強制push）は他人のコミットを消す恐れがある危険な操作です</strong>。共有ブランチでは原則禁止とし、使う場合もリモートの状態を確認してから拒否してくれる <code>--force-with-lease</code> を選んでください。</p>

<h2>まとめ</h2>
<ul>
<li>push前の取り消しは <code>reset</code>、push後は <code>revert</code> と覚えるのが安全です。</li>
<li><code>--amend</code>・<code>reset</code>・強制pushなど履歴を書き換える操作は、共有済みコミットには使いません。</li>
<li>作業の一時退避は <code>stash</code>、ファイル単位の復元は <code>restore</code> が専用コマンドです。</li>
<li>困ったときは <code>git status</code> と <code>git reflog</code> を見れば、現状把握と復旧の糸口がつかめます。</li>
</ul>`,
};
