#!/bin/bash -ex
export config_PATH=/home/ubuntu/CoCreateDev/CoCreate-components/CoCreate-file-server/src/text.txt
sed -i 's/max_execution_time = 30/max_execution_time = 60/' $config_PATH
sed -i 's/memory_limit = 128M/memory_limit = 256M/' $config_PATH
