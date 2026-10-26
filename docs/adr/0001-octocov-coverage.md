# Coverage reporting with octocov and GitHub Pages

Use octocov to aggregate LCOV reports from the UI, web, and crawler workspaces, replacing Codecov and its bundle analysis integration. Keep default behavior wherever possible; list the three report paths explicitly so every workspace contributes. Do not impose a coverage threshold.

Store reports in GitHub Actions artifacts for baseline comparisons and show results in pull request comments and job summaries. Publish the coverage badge through GitHub Pages only after successful tests and quality checks on main. Test failures must fail CI and must not publish a new badge. GitHub Pages uses the GitHub Actions source; no Codecov token is needed.

<details>
<summary>日本語</summary>

UI・Web・CrawlerのLCOVをoctocovで集計し、Codecovとそのバンドル分析を置き換えます。できる限りデフォルト設定を使用し、全ワークスペースを含めるため3つのレポートパスだけを明示します。カバレッジのしきい値は設定しません。

比較用レポートをGitHub Actionsのアーティファクトに保存し、PRコメントとジョブサマリーへ結果を表示します。mainのテストと品質チェックが成功した場合だけ、GitHub Pagesでバッジを公開します。テスト失敗はCIを失敗させ、バッジを更新しません。PagesのソースにはGitHub Actionsを使用し、Codecovトークンは不要になります。

</details>
