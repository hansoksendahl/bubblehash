all: bubblehash.js

ox.js: $(shell ./node_modules/.bin/smash --list src/)
	./node_modules/.bin/smash src/ > __bubblehash.js
	./node_modules/.bin/js-beautify __bubblehash.js > bubblehash.js
	./node_modules/.bin/uglifyjs __bubblehash.js > bubblehash.min.js
	rm __bubblehash.js