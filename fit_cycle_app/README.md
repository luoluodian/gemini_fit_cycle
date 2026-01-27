Docker部署流程

- 生成镜像

- docker build --platform=linux/amd64 -t nestjs-app:latest .

- docker save -o nestjs-app.tar nestjs-app:latest

- docker images

- 上传服务器

- 导入镜像 docker load -i nestjs-app.tar

- 查看 docker images

-

- ```
  docker run -d --name nestjs-app -p 3001:3000 --env-file /home/cluoc/fit_cycle/.env nestjs-app:latest
  ```

docker run -d \

--name nestjs-app \

-p 3001:3000 \

--env-file /path/to/project/.env \

--add-host=host.docker.internal:host-gateway \

--platform=linux/amd64 \

nestjs-app:latest

DB_HOST=172.17.0.1 # 宿主机 Docker 网桥 IP

DB_PORT=3306

DB_USER=root

DB_PASSWORD=xxxx  # 统一使用 DB_PASSWORD（代码中已统一）

DB_NAME=fit_cycle
