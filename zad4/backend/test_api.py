import requests

BASE_URL = "http://127.0.0.1:8000"

def test_full_cycle():
    print("Testiranje REST API-ja...")

    print("\n[1] Testiranje Login-a...")
    login_data = {"username": "admin", "password": "admin123"}
    res = requests.post(f"{BASE_URL}/login", data=login_data)
    
    if res.status_code == 200:
        token = res.json()["access_token"]
        print(f"Login uspješan! Token dobijen.")
    else:
        print(f"Login neuspješan: {res.text}")
        return

    headers = {"Authorization": f"Bearer {token}"}

    print("\n[2] Dohvaćanje obroka...")
    res = requests.get(f"{BASE_URL}/meals/", headers=headers)
    print(f"Status: {res.status_code}. Broj obroka: {len(res.json())}")

    print("\n[3] Dodavanje novog obroka...")
    new_meal = {
        "text": "API Testni Ručak",
        "calories": 550,
        "date": "2023-10-27",
        "time": "14:00"
    }
    res = requests.post(f"{BASE_URL}/meals/", json=new_meal, headers=headers)
    if res.status_code == 200:
        meal_id = res.json()["id"]
        print(f"Obrok kreiran! ID: {meal_id}")
    else:
        print(f"Greška pri kreiranju: {res.text}")
        return

    print(f"\n[4] Brisanje obroka ID: {meal_id}...")
    res = requests.delete(f"{BASE_URL}/meals/{meal_id}", headers=headers)
    if res.status_code == 200:
        print("Obrok uspješno obrisan preko API-ja.")

    print("\nTestiranje završeno uspješno!")

if __name__ == "__main__":
    test_full_cycle()