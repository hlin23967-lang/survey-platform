# 问卷小平台

创建问卷 → 分享链接 → 手机填写 → 后台查看 / 导出 CSV。

## 公网分享（无需 Vercel）

本机先启动：

```bash
npm run dev
```

另开终端开隧道（无确认页）：

```bash
ssh -R 80:localhost:3000 nokey@localhost.run
```

终端里会出现类似 `https://xxxx.lhr.life` 的地址，把  
`https://xxxx.lhr.life/s/employee-satisfaction-demo` 发给别人即可。

注意：电脑要保持开机且这两个命令都在跑；关掉后链接失效，重新开隧道地址会变。

### 若以后能登录 Vercel（真正长期固定域名）

```bash
npx vercel --prod
```

在 Vercel 环境变量填入 `.env` 里的 `DATABASE_URL`、`ADMIN_PASSWORD`、`SESSION_SECRET`。

## 本地开发（也需 Postgres）

本地已改为 PostgreSQL（与线上一致）。在 `.env` 填 Neon 连接串后：

```bash
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

| 入口 | 说明 |
|------|------|
| `/admin/login` | 管理后台 |
| `/admin` | 问卷列表 |
| `/s/employee-satisfaction-demo` | 示例问卷 |

## 演示路径

1. 登录管理后台  
2. 复制已发布问卷链接发给他人（任意网络均可）  
3. 对方填写后，后台「答卷」刷新可见，可导出 CSV  
4. 可现场新建问卷再发布  
