# Tehnički Intervju - Zadaci

Repozitorijum sa optimizovanim rješenjima tipičnih programerskih zadataka.

---

## Zadatak 1: Brojanje samoglasnika u tekstu
Skripta analizira tekstualni fajl i ispisuje broj pojavljivanja samoglasnika (`a, e, i, o, u`).

### Implementacija i Performanse
* **Algoritam:** Koristi se `collections.Counter` za prebrojavanje u jednom prolazu ($O(n)$ kompleksnost).
* **Efikasnost:** Drastično brže od `str.count()` metode jer se tekst pretražuje samo jednom, a ne pet puta.
* **Memorija:** Implementiran `with` context manager za sigurno upravljanje resursima.

### Kako pokrenuti
Da bi skripta ispravno pronašla fajl, pokreni je iz njenog direktorijuma:
```bash
cd zad1
python rjesenje.py
