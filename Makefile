publish:
	yarn build
	rsync -avz --delete build/ talia:/usr/home/kameliya/www/hotcrossbun/
