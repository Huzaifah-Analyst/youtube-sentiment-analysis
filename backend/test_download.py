import ssl
import os

# Solution 1
ssl._create_default_https_context = ssl._create_unverified_context
os.environ['CURL_CA_BUNDLE'] = ''
os.environ['HF_HUB_DISABLE_SSL'] = '1'

print("Attempting to import transformers...")
try:
    from transformers import pipeline
    print("Import SUCCESS")
    print("Attempting to download model...")
    model = pipeline('sentiment-analysis', model='distilbert-base-uncased-finetuned-sst-2-english')
    print('SUCCESS - Model downloaded!')
except Exception as e:
    print(f'FAILURE - {e}')
