all: bubblehash.js app.js

bubblehash.js: $(shell ./node_modules/.bin/smash --list src/BubbleHash/)
	./node_modules/.bin/smash src/BubbleHash/ > ./assets/scripts/__bubblehash.js
	./node_modules/.bin/js-beautify ./assets/scripts/__bubblehash.js > ./assets/scripts/bubblehash.js
	./node_modules/.bin/uglifyjs ./assets/scripts/__bubblehash.js > ./assets/scripts/bubblehash.min.js
	rm ./assets/scripts/__bubblehash.js
	
app.js: $(shell ./node_modules/.bin/smash --list src/app/)
	./node_modules/.bin/smash src/app/ > ./assets/scripts/__app.js
	./node_modules/.bin/js-beautify ./assets/scripts/__app.js > ./assets/scripts/app.js
	./node_modules/.bin/uglifyjs ./assets/scripts/__app.js > ./assets/scripts/app.min.js
	rm ./assets/scripts/__app.js