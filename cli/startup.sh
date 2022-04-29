#!/bin/bash
jav streams

#Keeping the container alive indefinitely (https://github.com/docker/compose/issues/1926)
while :; do :; done & kill -STOP $! && wait $!