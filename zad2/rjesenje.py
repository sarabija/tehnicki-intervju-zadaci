import requests
from bs4 import BeautifulSoup

def prebroji_tagove(url):
    try:
        response = requests.get(url)
        
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')

        script_tags = soup.find_all('script')
        meta_tags = soup.find_all('meta')

        print(f"<script> tagova: {len(script_tags)}")
        print(f"<meta> tagova:   {len(meta_tags)}")

    except requests.exceptions.RequestException as e:
        print(f"Greška prilikom dohvaćanja stranice: {e}")

if __name__ == "__main__":
    ciljani_url = "https://stackoverflow.com/questions/3048154/indexes-and-multi-column-primary-keys/"
    prebroji_tagove(ciljani_url)