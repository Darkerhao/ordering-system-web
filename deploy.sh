#!/bin/bash
# ============================================
# 点菜系统 一键部署脚本
# 用法: bash deploy.sh [start|update|stop|restart|status|logs]
# ============================================

set -e

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 配置（按需修改）
APP_NAME="ordering-system"
APP_PORT=3000
GIT_REPO=""  # 留空则使用本地代码

# 自动识别 docker compose 命令
if docker compose version &> /dev/null; then
  COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
  COMPOSE="docker-compose"
else
  COMPOSE=""
fi

# 打印带颜色的日志
log()   { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查 Docker 是否安装
check_docker() {
  if ! command -v docker &> /dev/null; then
    error "Docker 未安装，开始安装..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    log "Docker 安装完成"
  fi

  if [ -z "$COMPOSE" ]; then
    # 尝试安装 docker-compose 插件
    warn "docker compose 未找到，尝试安装..."
    mkdir -p ~/.docker/cli-plugins
    curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)" -o ~/.docker/cli-plugins/docker-compose
    chmod +x ~/.docker/cli-plugins/docker-compose
    COMPOSE="docker compose"
    log "docker compose 安装完成"
  fi
}

# 首次部署
start() {
  log "🚀 开始首次部署..."
  check_docker

  if [ -n "$GIT_REPO" ]; then
    if [ -d "$APP_NAME" ]; then
      warn "目录 $APP_NAME 已存在，跳过克隆"
    else
      log "克隆代码..."
      git clone "$GIT_REPO" "$APP_NAME"
    fi
    cd "$APP_NAME"
  fi

  log "构建并启动容器..."
  $COMPOSE up -d --build

  log "✅ 部署完成！"
  log "访问地址: http://$(get_ip):${APP_PORT}"
  show_accounts
}

# 更新部署
update() {
  log "🔄 开始更新..."

  if [ -n "$GIT_REPO" ]; then
    log "拉取最新代码..."
    git pull
  fi

  log "重新构建并重启..."
  $COMPOSE up -d --build

  log "✅ 更新完成！"
  log "访问地址: http://$(get_ip):${APP_PORT}"
}

# 停止服务
stop() {
  log "⏹ 停止服务..."
  $COMPOSE down
  log "服务已停止"
}

# 重启服务
restart() {
  log "🔄 重启服务..."
  $COMPOSE restart
  log "服务已重启"
}

# 查看状态
status() {
  log "📊 服务状态:"
  $COMPOSE ps
  echo ""
  log "💾 磁盘使用:"
  docker system df 2>/dev/null || true
  echo ""
  log "🌐 访问地址: http://$(get_ip):${APP_PORT}"
}

# 查看日志
logs() {
  $COMPOSE logs -f --tail=50
}

# 清理 Docker 缓存
clean() {
  warn "清理未使用的 Docker 资源..."
  docker system prune -f
  log "清理完成"
}

# 获取服务器 IP
get_ip() {
  hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost"
}

# 显示预置账号
show_accounts() {
  echo ""
  echo "📋 预置账号:"
  echo "  ┌─────────┬──────────┬───────────┐"
  echo "  │  角色   │  用户名  │   密码    │"
  echo "  ├─────────┼──────────┼───────────┤"
  echo "  │ 管理员  │  admin   │ admin123  │"
  echo "  │ 厨师    │  chef    │ chef123   │"
  echo "  │ 顾客    │  注册    │    -      │"
  echo "  └─────────┴──────────┴───────────┘"
}

# 帮助信息
help() {
  echo "🍽️  点菜系统 部署脚本"
  echo ""
  echo "用法: bash deploy.sh [命令]"
  echo ""
  echo "命令:"
  echo "  start    首次部署（构建并启动）"
  echo "  update   更新部署（拉取代码 + 重新构建）"
  echo "  stop     停止服务"
  echo "  restart  重启服务"
  echo "  status   查看状态"
  echo "  logs     查看实时日志"
  echo "  clean    清理 Docker 缓存"
  echo "  help     显示帮助"
  echo ""
  echo "示例:"
  echo "  bash deploy.sh start    # 首次部署"
  echo "  bash deploy.sh update   # 更新代码"
  echo "  bash deploy.sh logs     # 查看日志"
}

# 主入口
case "${1:-help}" in
  start)   start ;;
  update)  update ;;
  stop)    stop ;;
  restart) restart ;;
  status)  status ;;
  logs)    logs ;;
  clean)   clean ;;
  help|*)  help ;;
esac
