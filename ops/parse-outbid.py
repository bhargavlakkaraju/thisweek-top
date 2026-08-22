import re
html=open('/tmp/outbid.html').read()
html=re.sub(r'<script[\s\S]*?</script>','',html,flags=re.I)
html=re.sub(r'<style[\s\S]*?</style>','',html,flags=re.I)
text=re.sub(r'<[^>]+>',' ',html)
text=re.sub(r'\s+',' ',text)
print(text[:6000])
