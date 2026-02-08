# D365 完了案件ダッシュボード

Dynamics 365 オンプレミス環境から完了したサポート案件を取得し、所有者別の件数を表示するWebアプリケーション

## 機能

- 本日または指定日の完了案件を取得
- 所有者別の完了件数を表示（割合付きプログレスバー）
- 完了案件一覧の表示

## セットアップ

### 必要条件

- Node.js 18+
- D365 オンプレミス環境へのネットワークアクセス

### 環境変数

`.env.local` ファイルを編集し、D365の接続情報を設定:

```env
# D365 Configuration
D365_BASE_URL=http://your-server:port/OrgName/api/data/v8.2

# Windows Authentication (NTLM)
D365_USERNAME=your_username
D365_PASSWORD=your_password
D365_DOMAIN=your_domain
```

### インストール

```bash
npm install
```

## 起動方法

### 開発サーバー

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く

### 本番ビルド

```bash
npm run build
npm run start
```

## API

### GET /api/incidents

完了案件を取得するAPIエンドポイント

#### パラメータ

| パラメータ | 説明 | 例 |
|-----------|------|-----|
| date | 対象日（省略時は本日） | `2026-02-07` |

#### レスポンス例

```json
{
  "success": true,
  "date": "today",
  "totalCount": 74,
  "ownerCounts": [
    { "owner": "是澤 英輔", "count": 12 },
    { "owner": "小島 桃", "count": 10 }
  ],
  "incidents": [
    {
      "callNumber": 12458308,
      "completedOn": "2026-02-08T03:32:00Z",
      "completedOnJST": "2026-02-08 12:32:00",
      "owner": "小島 桃",
      "title": "..."
    }
  ]
}
```

## 技術スタック

- Next.js 16
- TypeScript
- Tailwind CSS
- httpntlm (NTLM認証)

## D365 フィールドマッピング

| 表示項目 | D365フィールド | 説明 |
|---------|---------------|------|
| 案件番号 | `mjs_callnumber` | 8桁の案件番号 |
| 完了日時 | `enjoy_process_date6` | クローズ日時 |
| 所有者 | `owninguser.fullname` | 担当者名 |

## フィルタ条件

- `mjs_incidentstatus = 1` (サポート案件状態: クローズ)
- `enjoy_process_date6` が指定日に該当
