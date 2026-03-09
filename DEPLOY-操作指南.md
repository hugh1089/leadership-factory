# 学习项目设计全景工作台 - 部署操作指南

> 部署前请**关闭 VPN**，否则 SSH 和 git push 可能失败。

---

## 一、首次部署（服务器尚未配置）

### 步骤 1：关闭 VPN

### 步骤 2：推送代码到 GitHub

```bash
cd /Users/robinlu/Desktop/00_MASTER_全景工具手册/learning-project-workbench
git push origin main
```

若提示 `Everything up-to-date` 表示已是最新，可继续。

### 步骤 3：运行首次初始化脚本

```bash
./00-first-time-setup-mac.sh
```

按提示操作：
- 域名 HOST：直接回车（默认 workbench.leadership-factory.cn）
- 端口 PORT：直接回车（默认 3010）
- 访问密码：输入 `Lead!Fact01`
- 管理员密码：输入 `Lead!Fact01`
- 数据库 DATABASE_URL：直接回车
- 确认继续：输入 `y`

### 步骤 4：配置 DNS（脚本完成后）

在阿里云 DNS 控制台添加 A 记录：
- 主机记录：`workbench`（或完整子域名）
- 记录值：`47.101.168.147`

### 步骤 5：配置 HTTPS（可选）

```bash
ssh aliyun
apt install -y certbot python3-certbot-nginx
certbot --nginx -d workbench.leadership-factory.cn
exit
```

---

## 二、日常部署（服务器已配置好）

每次改完代码后：

### 步骤 1：关闭 VPN

### 步骤 2：推送代码

```bash
cd /Users/robinlu/Desktop/00_MASTER_全景工具手册/learning-project-workbench
git add .
git commit -m "你的提交说明"
git push origin main
```

### 步骤 3：执行部署

```bash
./00-all-deploy-mac.sh
```

---

## 三、常见问题

| 现象 | 处理 |
|------|------|
| SSH 连接卡住/超时 | 关闭 VPN 后重试 |
| `Could not resolve host: github.com` | 关闭 VPN 后重试 `git push` |
| Prisma 7 报错 | 确保已 push 最新代码（含 Prisma 5.22.0 修复）再部署 |
| 在服务器上找不到脚本 | 脚本在 **Mac 本机** 运行，不要 SSH 进服务器后执行 |

---

## 四、快速检查清单

- [ ] VPN 已关闭
- [ ] 在 Mac 终端执行（非 SSH 会话）
- [ ] 当前目录：`learning-project-workbench`
- [ ] 代码已 push 到 GitHub
