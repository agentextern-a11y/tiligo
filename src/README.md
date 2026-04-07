# 🛵 TiliGo — Platforma e Dorëzimit të Ushqimit

TiliGo është platforma kryesore e dorëzimit të ushqimit dhe produkteve në Kosovë. Ndërfaqja është 100% në shqip dhe e dizajnuar për mobile-first.

---

## 🌐 Rreth Projektit

TiliGo mundëson porositjen e ushqimit nga restorantet dhe dyqanet lokale, me dorëzim të shpejtë brenda 30 minutash.

---

## 🏗️ Struktura e Platformës

| Portal               | Route                    | Përshkrim                                        |
|----------------------|--------------------------|--------------------------------------------------|
| 🏠 Klientët          | `/`                      | Shfleto, kërko dhe porosit                      |
| 🏪 Bizneset          | `/biznesi/dashboard`     | Menaxho produktet dhe porositë                  |
| 🛵 Dorëzuesit        | `/dorezuesi/dashboard`   | Merr dhe dorëzo porositë                        |
| 🔐 Administrata      | `/admin`                 | Paneli i plotë i administrimit                  |

---

## ⚙️ Teknologjitë

- **Frontend**: React 18, Tailwind CSS, Framer Motion
- **Backend**: Base44 BaaS (Entities, Auth, Integrations)
- **Animacione**: Framer Motion (scooter lanes, fade-in, stagger)
- **PWA**: Manifest + meta tags për iOS & Android
- **PDF**: jsPDF për fatura të porosive
- **Harta**: Nominatim reverse geocoding për lokacione

---

## 📦 Entitetet (Databaza)

| Entiteti     | Fusha kryesore                                                   |
|--------------|------------------------------------------------------------------|
| `Business`   | name, phone, address, password, category, status, is_open       |
| `Product`    | name, price, image_url, business_id, category, is_available      |
| `Order`      | order_code, customer_*, items[], total, status, delivery_id      |
| `Delivery`   | name, phone, password, vehicle, status, is_available             |

---

## 🔄 Rrjedha e Porosisë

```
Klient porosit → e_re → pranuar → ne_pergatitje → gati_per_dorezim → ne_rruge → dorezuar
```

---

## 🔐 Kredencialet e Testimit

| Role        | Phone/User   | Password     |
|-------------|-------------|--------------|
| Biznes      | +38344100001 | pizza123     |
| Biznes      | +38344100002 | burger123    |
| Admin       | root         | Jari!!2018   |

---

## 📲 PWA / Mobile

TiliGo është e gatshme si PWA:
- Instalo nga Safari (iOS): Share → Add to Home Screen
- Instalo nga Chrome (Android): Menu → Add to Home Screen

---

## ⬇️ Shkarko Projektin

Vizito `/download.zip` në aplikacion për të shkarkuar kodin burimor të plotë.

---

## 📞 Kontakti

- 📧 info@tiligo.app
- 📍 Prishtinë, Kosovë
- ☎️ +383 44 000 000

---

*© 2025 TiliGo. Të gjitha të drejtat e rezervuara.*