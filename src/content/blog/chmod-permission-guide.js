// chmod・Linuxパーミッション入門 — ブログ記事コンテンツ定義
// body 内の HTML は h2/h3/p/ul/ol/li/table/thead/tbody/tr/th/td/code/pre/strong/a のみを使用し、style属性は使わないこと。
export default {
  slug: 'chmod-permission-guide',
  title: 'chmod 755とは？Linuxパーミッションの読み方と設定一覧',
  description:
    'chmod 755や644の意味をrwxと8進数の対応表で解説。ls -lの読み方、数値指定とシンボリック指定、SSH秘密鍵のPermission denied対処、777が危険な理由までまとめたLinuxパーミッション入門です。',
  date: '2026-07-19',
  category: '入門ガイド',
  tags: ['Linux', 'chmod', 'サーバー'],
  relatedTools: ['chmod-calculator'],
  body: `<p>Linuxサーバーの構築手順やエラー対処の記事で必ず登場するのが<code>chmod 755</code>や<code>chmod 644</code>といったコマンドです。この3桁の数字は、ファイルやディレクトリへのアクセス権限（パーミッション）を表しています。この記事では、rwxと8進数の対応ルール、755・644・600など頻出値の意味、<code>ls -l</code>の出力の読み方、そしてSSH秘密鍵で起きがちなエラーの対処法までを一通り解説します。数値の変換を手早く確認したいときは<a href="/chmod-calculator">chmod計算機</a>も併せて活用してください。</p>

<h2>パーミッションの基本 — 3種類の権限と3つの対象</h2>
<p>Linuxのパーミッションは「誰に」「何を許可するか」の組み合わせで表現されます。権限は次の3種類です。</p>
<ul>
<li><strong>r（read）</strong> — 読み取り。ファイルの内容を読む、ディレクトリなら中の一覧を見る権限です。</li>
<li><strong>w（write）</strong> — 書き込み。ファイルの編集、ディレクトリなら中のファイルの作成・削除の権限です。</li>
<li><strong>x（execute）</strong> — 実行。プログラムとして実行する、ディレクトリなら中に移動（<code>cd</code>）する権限です。</li>
</ul>
<p>この3種類を、<strong>所有者（user）・グループ（group）・その他（other）</strong>の3つの対象それぞれに設定します。つまり「3権限 × 3対象」の9個のオン/オフの組み合わせが、1つのファイルのパーミッションです。</p>

<h2>rwxと8進数の対応 — 755の計算方法</h2>
<p>数値指定では、r・w・xにそれぞれ次の値を割り当て、対象ごとに合計します。</p>
<table>
<thead><tr><th>権限</th><th>値</th><th>意味</th></tr></thead>
<tbody>
<tr><td><code>r</code></td><td>4</td><td>読み取り</td></tr>
<tr><td><code>w</code></td><td>2</td><td>書き込み</td></tr>
<tr><td><code>x</code></td><td>1</td><td>実行</td></tr>
</tbody>
</table>
<p>たとえば「読み取り＋書き込み＋実行」なら4+2+1=7、「読み取り＋実行」なら4+1=5です。755は「所有者に7（rwx）、グループに5（r-x）、その他に5（r-x）」を意味します。桁の並びは常に「所有者・グループ・その他」の順です。</p>

<h2>頻出パーミッション一覧</h2>
<p>実務でよく使う値を用途とセットで押さえておくと、ほとんどの場面で迷わなくなります。</p>
<table>
<thead><tr><th>数値</th><th>記号表記</th><th>主な用途</th></tr></thead>
<tbody>
<tr><td><code>755</code></td><td><code>rwxr-xr-x</code></td><td>ディレクトリ、実行スクリプトの標準。所有者だけが書き込め、他者は閲覧・実行のみ可能です。</td></tr>
<tr><td><code>644</code></td><td><code>rw-r--r--</code></td><td>HTML・画像・設定ファイルなど一般ファイルの標準。他者は読み取りのみ可能です。</td></tr>
<tr><td><code>600</code></td><td><code>rw-------</code></td><td>秘密鍵や認証情報など、所有者以外に見せてはいけないファイル。</td></tr>
<tr><td><code>700</code></td><td><code>rwx------</code></td><td>所有者専用のディレクトリやスクリプト。<code>~/.ssh</code>ディレクトリの標準です。</td></tr>
<tr><td><code>664</code></td><td><code>rw-rw-r--</code></td><td>グループでの共同編集を許可するファイル。</td></tr>
<tr><td><code>777</code></td><td><code>rwxrwxrwx</code></td><td>全員に全権限。<strong>原則使用禁止</strong>（後述）。</td></tr>
</tbody>
</table>

<h2>ls -l の出力の読み方</h2>
<p>現在のパーミッションは<code>ls -l</code>で確認できます。</p>
<pre><code>$ ls -l
-rw-r--r-- 1 taro www-data  1024 Jul 19 10:00 index.html
drwxr-xr-x 2 taro www-data  4096 Jul 19 10:00 images</code></pre>
<p>先頭の10文字がパーミッション情報です。1文字目はファイル種別（<code>-</code>は通常ファイル、<code>d</code>はディレクトリ、<code>l</code>はシンボリックリンク）で、続く9文字が「所有者3文字・グループ3文字・その他3文字」です。<code>-rw-r--r--</code>なら644、<code>drwxr-xr-x</code>ならディレクトリの755と読み替えられます。その後ろの<code>taro www-data</code>が所有者とグループです。</p>

<h2>chmodの使い方 — 数値指定とシンボリック指定</h2>
<h3>数値（8進数）指定</h3>
<p>9個の権限をまとめて一度に設定する方法です。設定後の状態が数値から一意に決まるため、手順書やドキュメントに書く場合に向いています。</p>
<pre><code>chmod 755 script.sh      # rwxr-xr-x に設定
chmod 644 index.html     # rw-r--r-- に設定
chmod -R 755 public/     # ディレクトリ以下を再帰的に変更</code></pre>
<h3>シンボリック（記号）指定</h3>
<p>対象（<code>u</code>=所有者、<code>g</code>=グループ、<code>o</code>=その他、<code>a</code>=全員）と操作（<code>+</code>追加、<code>-</code>削除、<code>=</code>設定）の組み合わせで、<strong>特定の権限だけを差分変更</strong>できます。</p>
<pre><code>chmod u+x deploy.sh      # 所有者に実行権限を追加
chmod go-w shared.txt    # グループとその他から書き込み権限を削除
chmod a+r README.md      # 全員に読み取り権限を追加</code></pre>
<p>「今の設定を保ったまま実行権限だけ足したい」ならシンボリック指定、「全体を決まった状態にしたい」なら数値指定、と使い分けるのが実務的です。</p>

<h2>SSH秘密鍵の Permission denied の対処</h2>
<p>SSH接続時に<code>WARNING: UNPROTECTED PRIVATE KEY FILE!</code>や<code>Permissions 0644 for 'id_rsa' are too open</code>と表示されて接続を拒否されることがあります。これはSSHクライアントが「他人に読める秘密鍵は安全でない」と判断して使用を拒否する仕様で、鍵ファイルの権限を絞れば解決します。</p>
<pre><code>chmod 600 ~/.ssh/id_rsa          # 秘密鍵は所有者のみ読み書き可
chmod 644 ~/.ssh/id_rsa.pub      # 公開鍵は644でよい
chmod 700 ~/.ssh                 # .sshディレクトリ自体は700
chmod 600 ~/.ssh/authorized_keys # 接続先サーバー側の許可鍵リスト</code></pre>
<p>鍵を配布・コピーした直後はパーミッションが644などに変わっていることが多いため、SSH関連のエラーではまずこの4点を確認してください。</p>

<h2>777が危険な理由</h2>
<p>「権限エラーが出たのでとりあえず<code>chmod 777</code>」は最も避けるべき対処です。777は「誰でも読み・書き・実行できる」状態であり、次のリスクを生みます。</p>
<ul>
<li>同じサーバー上の他のユーザーや、侵害された別プロセスからファイルを改ざんされる可能性があります。特にWeb公開ディレクトリではPHPファイル等を書き換えられ、マルウェア設置の温床になります。</li>
<li>設定ファイルや鍵が第三者に読まれ、認証情報が漏えいします。</li>
<li>SSHやcronなど、一部のプログラムは権限が緩いファイルの使用を拒否するため、かえって動かなくなることがあります。</li>
</ul>
<p>権限エラーの正しい対処は、「どのユーザーがアクセスできる必要があるのか」を特定し、<code>chown</code>で所有者・グループを合わせた上で、必要最小限の権限（ディレクトリ755・ファイル644を基本に、書き込みが必要な場合のみ拡張）を与えることです。</p>

<h2>まとめ</h2>
<ul>
<li>パーミッションは r=4 / w=2 / x=1 の合計を「所有者・グループ・その他」の順に3桁で表します。755は<code>rwxr-xr-x</code>です。</li>
<li>基本はディレクトリ755・一般ファイル644・秘密情報600と覚えておけば大半をカバーできます。</li>
<li>差分変更は<code>chmod u+x</code>のようなシンボリック指定、状態の固定は数値指定が便利です。</li>
<li>SSHのPermission deniedは秘密鍵600・<code>~/.ssh</code>700への修正で解決するケースが大半です。</li>
<li>777は改ざん・情報漏えいの温床です。<code>chown</code>で所有者を正してから最小限の権限を与えてください。数値と記号の変換は<a href="/chmod-calculator">chmod計算機</a>で確認できます。</li>
</ul>`,
};
