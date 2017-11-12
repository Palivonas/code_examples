# A script to setup Node.js, Redis and Nginx on a fresh Ubuntu server

apt-get update
apt-get install -y nginx
apt-get install -y build-essential
apt-get install -y tcl8.5
apt-get install -y curl
curl -sL https://deb.nodesource.com/setup_8.x | bash
apt-get install -y nodejs

mkdir /.npm-global
chmod 755 /.npm-global
npm config set prefix '/.npm-global'
PATH=/.npm-global/bin:$PATH

tempcd=$(pwd)
cd /root
wget http://download.redis.io/releases/redis-stable.tar.gz
tar xzf redis-stable.tar.gz
rm -rf redis-stable.tar.gz
mv redis-stable redis-installer
cd redis-installer
make
make install
chmod +x utils/install_server.sh

PORT=6379
CONFIG_FILE=/etc/redis/6379.conf
LOG_FILE=/var/log/redis_6379.log
DATA_DIR=/var/lib/redis/6379
EXECUTABLE=/usr/local/bin/redis-server

echo -e \
"${PORT}\n${CONFIG_FILE}\n${LOG_FILE}\n${DATA_DIR}\n${EXECUTABLE}\n" | \
utils/install_server.sh

cd $tempcd

echo "include /home/*/nginx.conf;" > /etc/nginx/conf.d/include_user_configs.conf
sed -i 's:\(# \)\{0,2\}server_names_hash_bucket_size:server_names_hash_bucket_size:' /etc/nginx/nginx.conf
nginx -s reload

groupadd web
adduser --disabled-password --gecos "" website
usermod -aG web website
usermod -aG sudo website
