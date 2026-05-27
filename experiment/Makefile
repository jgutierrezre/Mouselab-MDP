# Compile coffeescript into javascript
exp: 
	npm exec -- coffee -o static/js -cb src/*
	uv run --directory .. python experiment/bin/make_trials.py

# Continuously recompiles as changes are made.
watch:
	npm exec -- coffee -o static/js -cbw src/*

deploy: exp
	rsync -av --delete-after --copy-links . cocosci@cocosci-fred.dreamhosters.com:/home/cocosci/cocosci.dreamhosters.com/webexpt/mouselab-demo