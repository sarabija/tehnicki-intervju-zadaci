from collections import Counter

def izbroj_samoglasnike(putanja_do_fajla):
    samoglasnici = "aeiou"
    
    try:
        with open(putanja_do_fajla, 'r', encoding='utf-8') as f:
     
            tekst = f.read().lower()
            brojac = Counter(tekst)
            rezultat = {s: brojac.get(s, 0) for s in samoglasnici}
            
            return rezultat
    except FileNotFoundError:
        return "Fajl nije pronađen."

print(izbroj_samoglasnike('zad1/unos.txt'))