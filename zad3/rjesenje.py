import requests
from bs4 import BeautifulSoup

def provjeri_prihvaceni_odgovor(url):
   
    try:
        response = requests.get(url)

        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        prihvaceni_odgovor = soup.find('div', class_='js-accepted-answer')
        
        if prihvaceni_odgovor:
            glasovi = prihvaceni_odgovor.get('data-score')
            print(f"Stranica ima prihvaćen odgovor.")
            print(f"Broj glasova prihvaćenog odgovora: {glasovi}")
        else:
            print("Stranica nema prihvaćen odgovor.")
            
    except requests.exceptions.RequestException as e:
        print(f"Greška: {e}")

if __name__ == "__main__":
    url = "https://stackoverflow.com/questions/38138100/addtransient-addscoped-and-addsingleton-services-differences/"
    provjeri_prihvaceni_odgovor(url)