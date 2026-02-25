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
