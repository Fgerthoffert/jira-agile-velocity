#!/bin/bash
jav velocity
sleep 5
jav roadmap

#Keeping the container alive indefinitely (https://github.com/docker/compose/issues/1926)
while :; do :; done & kill -STOP $! && wait $!