for i in {1..100}; do bun test; [ $? -eq 1 ] && echo "Stopped on run $i" && break; done
