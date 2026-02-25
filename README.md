# Tehnički Intervju - zadaci

Repozitorijum sa rješenjima zadataka koje sam dobio u okviru tehničkog razgovora.

---

## Zadatak 1: Brojanje samoglasnika u tekstu

Skripta analizira tekstualni fajl i ispisuje broj pojavljivanja samoglasnika (`a, e, i, o, u`).

### Implementacija i performanse

* **Algoritam:** Koristi se `collections.Counter` za prebrojavanje u jednom prolazu ($O(n)$ kompleksnost).
* **Efikasnost:** Drastično brže od `str.count()` metode jer se tekst pretražuje samo jednom, a ne pet puta.
* **Napomena:** Za ekstremno velike fajlove, da ne bi došlo do pucanja programa, fajl bi se čitao u blokovima.

### Kako pokrenuti

Da bi skripta ispravno pronašla fajl, pokrenuti je iz njenog direktorijuma:
```bash
cd zad1
python rjesenje.py
```

---

## Zadatak 2: Brojanje HTML tagova (Web Scraping)

Skripta dohvaća sadržaj specifične stranice na Stack Overflow-u i ispisuje ukupan broj pojavljivanja `<script>` i `<meta>` tagova.

### Implementacija i performanse

* **Algoritam:** Koristi se `BeautifulSoup` s `html.parser` stablom za pretraživanje elemenata u jednom prolazu ($O(n)$ kompleksnost).
* **Efikasnost:** Namjenski HTML parser osigurava preciznost pri obradi DOM strukture, što je znatno pouzdanije i brže od korištenja regularnih izraza.
* **Napomena:** Kako bi se spriječilo blokiranje od strane servera (HTTP 403 Forbidden), može se koristi `User-Agent` zaglavlje. 

### Kako pokrenuti

Prije pokretanja potrebno je instalirati zavisne biblioteke:
```bash
pip install requests beautifulsoup4
```

Zatim pokrenuti skriptu:
```bash
cd zad2
python rjesenje.py
```

---

## Zadatak 3: Provjera prihvaćenog odgovora na Stack Overflow-u

Skripta provjerava da li određena Stack Overflow stranica ima prihvaćen odgovor i, ako ga ima, ispisuje broj glasova koje taj odgovor ima.

### Implementacija i performanse

* **Algoritam:** Koristi `BeautifulSoup` za parsiranje HTML-a i pronalaženje elementa s klasom `js-accepted-answer`. I ova klasa i `data-score` atribut su pronadjeni ručno.
* **Preciznost:** Broj glasova se direktno čita iz `data-score` atributa prihvaćenog odgovora, što osigurava tačnost podataka.
* **Napomena:** Kako bi se spriječilo blokiranje od strane servera (HTTP 403 Forbidden), može se koristi `User-Agent` zaglavlje. 

### Kako pokrenuti

Prije pokretanja potrebno je instalirati zavisne biblioteke:
```bash
pip install requests beautifulsoup4
```

Zatim pokrenuti skriptu:
```bash
cd zad3
python rjesenje.py
```

---

## Zadatak 4: 🥗 Calorie Tracker - Full Stack REST Aplikacija

Kompletan sistem za praćenje kalorija s RBAC-om, izgrađen korištenjem FastAPI (Python) na backendu i Vanilla JavaScript-a na frontend-u. Projekt demonstrira moderno razdvajanje slojeva aplikacije i sigurnosne standarde.

### 🏗️ Arhitektura sistema

Projekt je dizajniran prema principu razdvajanja odgovornosti (Separation of Concerns):

* **Backend:** FastAPI služi isključivo kao REST API. Koristi SQLAlchemy ORM za komunikaciju sa SQLite bazom podataka.
* **Frontend:** SPA (Single Page Application) princip koristeći čisti JavaScript, HTML5 i CSS3. Komunikacija se odvija putem JSON-a.
* **Autentifikacija:** Implementirana putem JWT (JSON Web Token) standarda sa `HS256` algoritmom.

### 🛠️ Instalacija i pokretanje

#### 1. Kloniranje i virtualno okruženje

Prvi korak je izolacija projekta kako bi se izbjegli sukobi s globalnim Python paketima:
```bash
# Kloniranje repozitorija
git clone 
cd zad4

# Kreiranje virtualnog okruženja (venv)
python -m venv venv

# Aktivacija (Windows)
venv\Scripts\activate

# Aktivacija (Mac/Linux)
source venv/bin/activate
```

#### 2. Instalacija zavisnosti
```bash
pip install fastapi uvicorn sqlalchemy passlib[bcrypt] python-jose[cryptography] python-multipart requests
```

#### 3. Pokretanje Backenda
```bash
cd backend
uvicorn main:app --reload
```

Aplikacija će pri startup-u provjeriti bazu i, ako je prazna, automatski kreirati tablice i početne korisnike.

#### 4. Pokretanje Frontenda

* Otvorite `frontend/index.html` u pretraživaču.

### 🔐 "Seed" podaci

Prilikom prvog pokretanja (brisanje `.db` datoteke simulira ovaj proces), sistem generiše sljedeće testne naloge:

| Username | Password | Role | Opis pristupa |
|----------|----------|------|---------------|
| `admin` | `admin123` | `admin` | Potpuni pristup svim obrocima i svim korisnicima. |
| `manager` | `manager123` | `manager` | Upravlja računima, ali nema pristup podacima o prehrani. |
| `user` | `user123` | `user` | Osobni unos obroka i praćenje limita (default: 1000 kcal). |

### 🧪 REST API i Funkcionalni testovi

Ovaj projekt naglašava važnost API sloja. Cijelim sistemom se može upravljati bez frontenda.

#### Pokretanje automatskog testa

U backend folderu projekta nalazi se `test_api.py`. Dok backend radi, pokrenite:
```bash
python test_api.py
```

**Što test provjerava?**

1. Uspješan Login i dobivanje Bearer tokena.
2. Dohvatanje liste obroka.
3. Kreiranje novog obroka putem POST zahtjeva.
4. Brisanje resursa putem DELETE zahtjeva.

#### Interaktivna dokumentacija

FastAPI automatski generiše Swagger dokumentaciju na:

👉 `http://127.0.0.1:8000/docs`

### 📝 Tehnički detalji klasa i modula

#### Backend (Python)

* **`models.py`:** Definiše `User` (id, username, password_hash, role) i `Meal` (text, calories, date, time) klase.
* **`auth.py`:** Sadrži logiku za hashing lozinki (`bcrypt`) i validaciju JWT tokena.
* **`main.py`:** Sadrži rute i `startup` event za inicijalizaciju baze podataka.

#### Frontend (JavaScript)

* **`app.js`:** Upravlja stanjem aplikacije. Sadrži globalni `userNamesMap` za pretvorbu ID-ova u imena (korisno za Admina) i logiku za dinamičko prikazivanje elemenata sučelja ovisno o ulogama.
* **`fetchWithAuth`:** Wrapper funkcija koja automatski dodaje Authorization zaglavlje svakom zahtjevu.

### 📊 Dodatne funkcionalnosti

* **Filtriranje obroka:** Po rasponu datuma (`date_from`, `date_to`) i vremena (`time_from`, `time_to`)
* **Dnevni limit kalorija:** Korisnici mogu postaviti očekivani broj kalorija po danu
* **Vizualna indikacija:** Dani se prikazuju zeleno ako je ukupan unos ispod limita, inače crveno
* **Automatska inicijalizacija:** Pri prvom pokretanju, baza se automatski puni testnim podacima

---


