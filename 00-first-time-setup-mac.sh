#!/usr/bin/env bash
# 首次服务器初始化 - 在 Mac 上运行，自动完成服务器端全部配置
# 你只需在提示时输入/确认信息即可
set -e

ENV_FILE="${1:-.deploy.env}"
# 公开仓库用 HTTPS；私有仓库需在服务器配置 deploy key 后改用：
# REPO_URL="git@github.com:hugh1089/leadership-factory.git"
REPO_URL="${REPO_URL:-https://github.com/hugh1089/leadership-factory.git}"

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: $ENV_FILE not found."
  echo "请确保 .deploy.env 存在（已配置 DEPLOY_SSH_HOST=aliyun 等）"
  exit 1
fi

export $(grep -v '^#' "$ENV_FILE" | xargs)
DEPLOY_SSH_HOST="${DEPLOY_SSH_HOST:-}"
DEPLOY_SSH_USER="${DEPLOY_SSH_USER:-root}"
DEPLOY_SERVER_DIR="${DEPLOY_SERVER_DIR:-/opt/leadership-factory}"
SSH_TARGET="${DEPLOY_SSH_USER}@${DEPLOY_SSH_HOST}"

echo "=========================================="
echo "  学习项目设计全景工作台 - 首次服务器初始化"
echo "=========================================="
echo "SSH 目标: $SSH_TARGET"
echo "服务器目录: $DEPLOY_SERVER_DIR"
echo ""

# 1. 测试 SSH 连接
echo "== 1/6 测试 SSH 连接 =="
if ! ssh -o ConnectTimeout=15 -o BatchMode=yes "$SSH_TARGET" "echo OK" 2>/dev/null; then
  echo ""
  echo "SSH 连接失败。请先手动测试："
  echo "  ssh $DEPLOY_SSH_HOST"
  echo ""
  echo "若连接卡住或超时，可尝试："
  echo "  ssh -v $DEPLOY_SSH_HOST    # 查看卡在哪一步"
  echo "  ssh -o ConnectTimeout=30 $DEPLOY_SSH_HOST"
  echo ""
  echo "常见原因："
  echo "  - 服务器防火墙未放行 22 端口"
  echo "  - 阿里云安全组未放行 22 端口"
  echo "  - 密钥 ~/.ssh/aliyun_ed25519 权限或路径错误"
  echo ""
  read -p "若已确认能连接，是否跳过测试继续？(y/n) " SKIP
  if [ "$SKIP" != "y" ] && [ "$SKIP" != "Y" ]; then
    exit 1
  fi
else
  echo "SSH 连接正常"
fi
echo ""

# 2. 收集环境变量（带默认值，直接回车即使用默认）
echo "== 2/6 配置环境变量 =="
echo "提示：直接回车 = 使用默认值，不要粘贴命令"
echo ""

read -p "1) 域名 HOST [workbench.leadership-factory.cn]: " HOST
HOST="${HOST:-workbench.leadership-factory.cn}"

read -p "2) 端口 PORT [3010]: " PORT
PORT="${PORT:-3010}"

read -p "3) 访问密码 ACCESS_PASSWORD [leadershipfactory]: " ACCESS_PASSWORD
ACCESS_PASSWORD="${ACCESS_PASSWORD:-leadershipfactory}"

read -p "4) 管理员密码 ADMIN_PASSWORD [Leadershipfactory]: " ADMIN_PASSWORD
ADMIN_PASSWORD="${ADMIN_PASSWORD:-Leadershipfactory}"

# NEXTAUTH_URL 自动根据 HOST 生成，不再单独询问
NEXTAUTH_URL="https://${HOST}"
echo "5) NEXTAUTH_URL = $NEXTAUTH_URL （已自动生成）"

# 自动生成 NEXTAUTH_SECRET
NEXTAUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64 2>/dev/null || echo "change-this-$(date +%s)")
echo "6) NEXTAUTH_SECRET 已自动生成"

read -p "7) 数据库 DATABASE_URL [file:./prod.db]（直接回车即可）: " DATABASE_URL
DATABASE_URL="${DATABASE_URL:-file:./prod.db}"

APP_ENV="production"
APP_NAME="leadership-factory-workbench"
DEPLOY_BRANCH="main"

echo ""
echo "将使用以下配置："
echo "  HOST=$HOST"
echo "  PORT=$PORT"
echo "  NEXTAUTH_URL=$NEXTAUTH_URL"
echo "  DATABASE_URL=$DATABASE_URL"
echo "  APP_NAME=$APP_NAME"
echo ""
read -p "确认继续部署？(y/n): " CONFIRM
CONFIRM=$(echo "$CONFIRM" | tr -d ' ')
if [ "${CONFIRM:0:1}" != "y" ] && [ "${CONFIRM:0:1}" != "Y" ]; then
  echo "已取消"
  exit 0
fi
echo ""

# 3. 构建 .env 内容
ENV_CONTENT="DATABASE_URL=\"$DATABASE_URL\"
NEXTAUTH_SECRET=\"$NEXTAUTH_SECRET\"
NEXTAUTH_URL=\"$NEXTAUTH_URL\"
ACCESS_PASSWORD=\"$ACCESS_PASSWORD\"
ADMIN_PASSWORD=\"$ADMIN_PASSWORD\"
APP_ENV=$APP_ENV
APP_NAME=$APP_NAME
PORT=$PORT
HOST=$HOST
DEPLOY_BRANCH=$DEPLOY_BRANCH
"

# 4. 远程执行：创建目录、克隆、写 .env、安装依赖、构建、启动
echo "== 3/6 创建目录并克隆仓库 =="
# GIT_TERMINAL_PROMPT=0 避免非交互式环境下 git 尝试索要凭据
if ! ssh "$SSH_TARGET" "mkdir -p $DEPLOY_SERVER_DIR && cd $DEPLOY_SERVER_DIR && if [ ! -d .git ]; then GIT_TERMINAL_PROMPT=0 git clone $REPO_URL .; else echo '仓库已存在，跳过 clone'; fi"; then
  echo ""
  echo "克隆失败。若仓库为私有，请任选其一："
  echo "  1) 在 GitHub 将该仓库设为公开（Settings -> General -> Danger Zone）"
  echo "  2) 在服务器配置 deploy key 后，用 SSH 地址重新运行："
  echo "     REPO_URL=git@github.com:hugh1089/leadership-factory.git ./00-first-time-setup-mac.sh"
  exit 1
fi

echo ""
echo "== 4/6 写入 .env 并安装 Node/PM2 =="
echo "$ENV_CONTENT" | ssh "$SSH_TARGET" "cat > $DEPLOY_SERVER_DIR/.env"
ssh "$SSH_TARGET" "echo '.env 已创建'"

# 检查并安装 Node.js（支持 Ubuntu/Debian 和 CentOS）
ssh "$SSH_TARGET" 'command -v node >/dev/null 2>&1 || (
  echo "正在安装 Node.js..."
  if command -v apt-get >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs
  elif command -v yum >/dev/null 2>&1; then
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash - && yum install -y nodejs
  else
    echo "ERROR: 请手动安装 Node.js 20+"
    exit 1
  fi
)'
ssh "$SSH_TARGET" "command -v pm2 >/dev/null 2>&1 || npm install -g pm2"

echo ""
echo "== 5/6 构建并启动应用 =="
ssh "$SSH_TARGET" "cd $DEPLOY_SERVER_DIR && bash ./00-all-deploy.sh"

echo ""
echo "== 6/6 配置 Nginx 反向代理 =="
NGINX_CFG="/etc/nginx/sites-available/leadership-factory-workbench"
cat <<NGINX_EOF | ssh "$SSH_TARGET" "cat > $NGINX_CFG"
server {
    listen 80;
    server_name $HOST;
    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX_EOF
ssh "$SSH_TARGET" "ln -sf $NGINX_CFG /etc/nginx/sites-enabled/ 2>/dev/null || true; nginx -t 2>/dev/null && systemctl reload nginx 2>/dev/null || echo '请手动配置 Nginx 并添加: server_name $HOST; proxy_pass http://127.0.0.1:$PORT;'"

echo ""
echo "=========================================="
echo "  初始化完成"
echo "=========================================="
echo ""
echo "后续步骤："
echo "  1. 在阿里云 DNS 添加 A 记录: $HOST -> 47.101.168.147"
echo "  2. 若需 HTTPS，可安装 certbot: apt install certbot python3-certbot-nginx && certbot --nginx -d $HOST"
echo "  3. 访问: https://$HOST （DNS 生效后）"
echo ""
echo "日常部署：推送代码到 GitHub 后运行: ./00-all-deploy-mac.sh"
echo ""
