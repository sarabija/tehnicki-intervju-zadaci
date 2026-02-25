# Tehnički Intervju - zadaci

Repozitorijum sa rješenjima zadataka koje sam dobio u okviru tehničkog razgovora.

---

## Zadatak 1: Brojanje samoglasnika u tekstu
Skripta analizira tekstualni fajl i ispisuje broj pojavljivanja samoglasnika (`a, e, i, o, u`).

### Implementacija i performanse
* **Algoritam:** Koristi se `collections.Counter` za prebrojavanje u jednom prolazu ($O(n)$ kompleksnost).
* **Efikasnost:** Drastično brže od `str.count()` metode jer se tekst pretražuje samo jednom, a ne pet puta.
* **Napomena:** Za ekstremno velike fajlove, da ne bi došlo do pucanja programa fajl bi se čitao u blokovima.

### Kako pokrenuti
Da bi skripta ispravno pronašla fajl, pokrenuti je iz njenog direktorijuma:
```bash
cd zad1
python rjesenje.py

## Zadatak 2: Brojanje HTML tagova (Web Scraping)
Skripta dohvaća sadržaj specifične stranice na Stack Overflow-u i ispisuje ukupan broj pojavljivanja `<script>` i `<meta>` tagova.

### Implementacija i performanse
* **Algoritam:** Koristi se `BeautifulSoup` s `html.parser` stablom za pretraživanje elemenata u jednom prolazu ($O(n)$ kompleksnost).
* **Efikasnost:** Namjenski HTML parser osigurava preciznost pri obradi DOM strukture, što je znatno pouzdanije i brže od korištenja regularnih izraza.
* **Napomena:** Kako bi se spriječilo blokiranje od strane servera (HTTP 403 Forbidden), skripta koristi `User-Agent` zaglavlje. Također je postavljen `timeout` parametar kako bi se osigurala stabilnost u slučaju mrežnog zastoja.



### Kako pokrenuti
Prije pokretanja potrebno je instalirati zavisne biblioteke:
```bash
pip install requests beautifulsoup4
