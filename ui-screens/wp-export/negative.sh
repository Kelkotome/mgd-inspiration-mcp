#!/bin/zsh
# Negative control: five deliberately broken copies of one theme. installtest.mjs must FAIL every one, or its passes mean nothing.
# usage: negative.sh <theme dir> <zips dir>
src=$1; zips=$2; base=${src:t}; work=$(mktemp -d "${TMPDIR:-.}/neg.XXXXXX")
mk() { d=$work/mgd-neg-$1; cp -R $src $d; grep -rl "$base" $d | grep -v '\.woff2$\|\.png$' | while read f; do sed -i '' "s/$base/mgd-neg-$1/g" "$f"; done; }
mk block; python3 -c "
import sys,glob,re
n=0
for p in sorted(glob.glob(sys.argv[1]+'/patterns/*.php')):
    s=open(p).read()
    t=re.sub(r'(<!-- wp:heading[^>]*-->\s*)<h([1-6])([^>]*)>(.*?)</h\2>', lambda m: m.group(1)+'<div'+m.group(3)+'>'+m.group(4)+'</div>', s, count=1, flags=re.S)
    if t!=s: open(p,'w').write(t); n+=1; break
assert n, 'no heading mutated'" $work/mgd-neg-block
mk overflow; echo '.wp-block-group main, main > * { min-width: 1800px; }' >> $work/mgd-neg-overflow/style.css
mk external; sed -i '' 's#</footer>#<img src="https://example.com/tracker.png" alt=""/></footer>#' $work/mgd-neg-external/parts/footer.html; grep -q example.com $work/mgd-neg-external/parts/footer.html || echo '<!-- wp:html --><img src="https://example.com/tracker.png" alt=""/><!-- /wp:html -->' >> $work/mgd-neg-external/parts/footer.html
mk php; printf '\nadd_action("wp_head", function () { echo $undefined_on_purpose; });\n' >> $work/mgd-neg-php/functions.php; grep -q '?>' $work/mgd-neg-php/functions.php && echo "functions.php closes PHP" 
mk layout; echo 'main { width: 42%; }' >> $work/mgd-neg-layout/style.css   # loads fine, no overflow, wrong layout: the fidelity check must catch it
for n in block overflow external php layout; do (cd $work && zip -qrX $zips/mgd-neg-$n.zip mgd-neg-$n); done; echo built $work
