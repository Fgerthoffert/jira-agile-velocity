#!/bin/bash
jav velocity
sleep 5
jav initiatives

#Keeping the container alive indefinitely (https://github.com/docker/compose/issues/1926)
while :; do :; done & kill -STOP $! && wait $!