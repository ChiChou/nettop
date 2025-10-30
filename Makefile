SRC=main.m
CC:=clang


all: tbd build

build: ${SRC}
	$(CC) $(SRC) -o nettop -fmodules -framework NetworkStatistics -F.

tbd:
	mkdir -p NetworkStatistics.framework
	ipsw dyld tbd /System/Volumes/Preboot/Cryptexes/OS/System/Library/dyld/dyld_shared_cache_arm64e NetworkStatistics -o NetworkStatistics.framework

format:
	clang-format -i $(SRC)
