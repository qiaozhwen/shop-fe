# 部署说明（Docker + GitHub Actions）

## 一、服务器一次性准备

### 1. 安装 Docker

**通用一键安装（推荐，Ubuntu/Debian/CentOS/Alibaba Cloud Linux 都可用）**
```bash
curl -fsSL https://get.docker.com | sudo sh
sudo systemctl enable --now docker
sudo usermod -aG docker $USER     # 让当前用户免 sudo 跑 docker
newgrp docker                      # 立即生效（或重新登录）
docker --version
```

> ⚠️ CentOS/Alibaba Cloud Linux 上 `sudo yum install -y docker` 安装的是旧版且很可能报
> `Unit file docker.service does not exist.`，请直接用上面的官方脚本。

**如果上面脚本拉取慢，改用阿里云 yum 源：**
```bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
newgrp docker
```

**验证：**
```bash
docker --version
sudo docker run --rm hello-world
```

### 2. 配置 Docker 镜像加速（可选但强烈建议，国内拉取快）
阿里云镜像加速器在 阿里云控制台 → 容器镜像服务 → 镜像加速器 拿到地址，然后：
```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<EOF
{
  "registry-mirrors": ["https://<你的加速器ID>.mirror.aliyuncs.com"]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```

### 3. 创建一个部署专用 SSH 用户（推荐，不要用 root）
```bash
sudo adduser deploy
sudo usermod -aG docker deploy
sudo mkdir -p /home/deploy/.ssh && sudo chmod 700 /home/deploy/.ssh
```

### 4. 生成 SSH 密钥对（在你本地）
```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/shop_fe_deploy
# 公钥 shop_fe_deploy.pub 内容追加到服务器 /home/deploy/.ssh/authorized_keys
# 私钥 shop_fe_deploy 留着，配到 GitHub Secrets
```
服务器上：
```bash
sudo vi /home/deploy/.ssh/authorized_keys   # 粘贴公钥
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

### 5. 安全组开放 80 端口
阿里云/腾讯云控制台 → 实例 → 安全组 → 入方向 → 加规则：TCP 80。

---

## 二、镜像仓库准备（阿里云 ACR 示例）

1. 阿里云控制台 → 容器镜像服务 ACR → 创建**个人版**实例（免费）。
2. 创建命名空间，例如 `qz-shop`。
3. 创建镜像仓库，名字 `shop-fe`，类型选**私有**。
4. 在"访问凭证"里设置一个**固定密码**（用于 docker login）。
5. 记录以下信息：
   - 仓库地址：如 `registry.cn-hangzhou.aliyuncs.com`
   - 命名空间：`qz-shop`
   - 用户名：你的阿里云账号名（页面会显示）
   - 密码：刚才设置的固定密码

腾讯云 TCR 同理，仓库地址形如 `ccr.ccs.tencentyun.com`。

---

## 三、GitHub 仓库 Secrets 配置

进入 GitHub 仓库 → Settings → Secrets and variables → Actions → New repository secret，添加：

| Secret 名 | 示例值 | 说明 |
|---|---|---|
| `REGISTRY` | `registry.cn-hangzhou.aliyuncs.com` | 镜像仓库域名 |
| `REGISTRY_NAMESPACE` | `qz-shop` | 命名空间 |
| `REGISTRY_USERNAME` | `your_aliyun_account` | docker login 用户名 |
| `REGISTRY_PASSWORD` | `xxxxxx` | docker login 密码（不是阿里云登录密码） |
| `SSH_HOST` | `1.2.3.4` | ECS 公网 IP |
| `SSH_USER` | `deploy` | 部署用户 |
| `SSH_PORT` | `22` | SSH 端口 |
| `SSH_PRIVATE_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----...` | shop_fe_deploy 私钥**全文** |

---

## 四、触发部署

```bash
git add .
git commit -m "ci: setup docker deploy"
git push origin main
```

GitHub → Actions 页面看进度。成功后浏览器访问 `http://<ECS_IP>` 即可。

---

## 五、手动部署（兜底）

如果 GitHub Actions 不可用、或想手动回滚某个版本，把 [deploy.sh](deploy.sh) 复制到服务器执行：

```bash
# 一次性准备
scp deploy/deploy.sh deploy@<ECS_IP>:~/deploy.sh
ssh deploy@<ECS_IP> 'chmod +x ~/deploy.sh'

# 部署最新版
ssh deploy@<ECS_IP>
export REGISTRY_USERNAME=xxx REGISTRY_PASSWORD=xxx
./deploy.sh                # 拉 :latest 并重启
./deploy.sh a1b2c3d         # 回滚到指定 sha7 版本
```

---

## 六、常用运维命令（在服务器上）

```bash
docker ps                          # 查看容器
docker logs -f shop-fe             # 看日志
docker restart shop-fe             # 重启
docker rm -f shop-fe               # 删除容器
docker images                      # 看镜像
docker image prune -f              # 清理悬挂镜像
```

---

## 七、后续接入后端时

修改 [deploy/nginx.conf](nginx.conf) 解开 `/api/` 反向代理段，把 `proxy_pass` 指向后端容器或地址，
然后在 [.env.production](../.env.production) 把 `VITE_USE_MOCK` 改成 `false`，重新 push 即可。
