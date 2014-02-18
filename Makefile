all: bubblehash.js

bubblehash.js: $(shell ./node_modules/.bin/smash --list src/)
	./node_modules/.bin/smash src/ > ./assets/scripts/__bubblehash.js
	./node_modules/.bin/js-beautify ./assets/scripts/__bubblehash.js > ./assets/scripts/bubblehash.js
	./node_modules/.bin/uglifyjs ./assets/scripts/__bubblehash.js > ./assets/scripts/bubblehash.min.js
	rm ./assets/scripts/__bubblehash.js