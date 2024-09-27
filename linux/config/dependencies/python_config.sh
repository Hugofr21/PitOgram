#!/bin/bash

sudo apt-get install -y \
    build-essential \
    libssl-dev \
    zlib1g-dev \
    libncurses5-dev \
    libncursesw5-dev \
    libreadline-dev \
    libsqlite3-dev \
    libgdbm-dev \
    libdb5.3-dev \
    libbz2-dev \
    libexpat1-dev \
    liblzma-dev \
    tk-dev \
    libffi-dev \

wget  https://www.python.org/ftp/python/3.9.10/Python-3.9.10.tar.xz  

tar -xf Python-3.9.10.tgz
cd Python-3.9.10

./configure --enable-optimizations
make -j $(nproc)
sudo make altinstall

echo "alias python3='/usr/local/bin/python3.9'" >> ~/.bashrc
echo "alias pip3='/usr/local/bin/pip3.9'" >> ~/.bashrc

source ~/.bashrc

python_version=$(python --version)

echo -e "Version python: $1 $python_version\n"


