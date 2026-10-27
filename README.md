# 燼塔：卡牌遠征

[開始遊戲](https://alexander97915.github.io/ember-card-expedition/)

本儲存庫管理 GitHub Pages 發布。v387 從原 Sites 版本搬遷，保留現有角色、Boss、技能與動畫。公開內容為遊戲交付檔案，不含玩家存檔、原稿與開發歷史。

## 存檔搬遷

1. 在原本遊玩的網站開啟「存檔搬家」，下載 JSON 備份。
2. 關閉其他燼塔分頁。
3. 在[新站存檔搬家頁](https://alexander97915.github.io/ember-card-expedition/save-transfer.html)選擇備份並確認匯入。
4. 返回遊戲繼續遠征。

不同網址的本機存檔不會自動共用。請保留備份。

## 發布流程

- GitHub Release 保存完整靜態網站 tar.gz 封裝；Pages 不需連回舊站取得素材。
- deployment.json 指定選用的 release、附件、SHA-256、檔案數與總 bytes。
- main 分支更新 deployment.json 時，GitHub Actions 下載並驗證封裝，再部署 Pages；亦可手動執行工作。
- delivery-manifest.json 保留目前發布檔的逐檔 SHA-256。
- 後續更新先於開發專案執行素材准入、遊戲相關測試與靜態建置，產生新封裝，發布 Release 後再更新 deployment.json 與對應檔案清單。
- 維持 Pages 的 main 分支保護設定。回復舊版可將 deployment.json 改回保留的 Release 與校驗資料。

## 驗證

初次部署的封裝雜湊、1,345 個檔案及總大小檢查通過。Chrome 實際進入戰鬥，未發現缺圖；存檔匯出、匯入及返回戰鬥測試通過。未人工重玩完整遠征。
