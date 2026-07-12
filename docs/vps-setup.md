# Konfiguracja serwera VPS — dokumentacja

Cel: prawdziwy serwer Linux w chmurze, który będzie monitorowany przez moduł
Monitoring w portalu (Etap 5). Dokumentuję każdy krok tak, jak robi się to
w dziale IT — żeby każdy mógł powtórzyć konfigurację.

## 1. Wybór dostawcy

| Opcja | Koszt | Uwagi |
|---|---|---|
| **Oracle Cloud Free Tier** ✅ | 0 zł | VM "Always Free", wymaga karty do weryfikacji (bez opłat) |
| Mikrus | ~10 zł/mies. | polski, prosty, plan B |
| Hetzner | ~20 zł/mies. | profesjonalny standard, plan C |

Decyzja: Oracle Cloud Free Tier — rejestracja przeszła bez problemów.

## 2. Klucze SSH ✅

Logowanie do serwera kluczem zamiast hasła — standard bezpieczeństwa.
Klucz prywatny zostaje na moim komputerze, publiczny wgrywa się na serwer.

```powershell
# wygenerowanie pary kluczy ed25519 (nowoczesny, krótki, szybki)
ssh-keygen -t ed25519 -f $env:USERPROFILE\.ssh\id_ed25519 -C "krystian-helpdesk-vps"

# podgląd klucza PUBLICZNEGO (ten wolno udostępniać)
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub
```

Zasada: **klucza prywatnego (`id_ed25519` bez `.pub`) nie udostępnia się nigdy i nikomu.**

## 3. Utworzenie maszyny w Oracle Cloud ✅

- [x] Rejestracja konta na oracle.com/cloud/free (region domowy: Frankfurt)
- [x] Compute → Instances → Create instance
- [x] Obraz: Ubuntu 24.04 LTS (Canonical)
- [x] Shape: VM.Standard.E2.1.Micro (Always Free, 1 OCPU, 1 GB RAM)
- [x] Networking: nowy VCN + publiczny subnet (10.0.0.0/24)
- [x] Wklejenie klucza publicznego SSH przy tworzeniu
- [x] Status: RUNNING

### Problem: brak publicznego IP (i jak go rozwiązałem)

Kreator instancji przy tworzeniu **nowego** VCN blokuje przełącznik
"Automatically assign public IPv4 address" (znany kaprys konsoli OCI).
Maszyna wstała tylko z prywatnym adresem (10.0.0.99). Naprawa po utworzeniu:

1. **Instancja → Networking → Quick actions → "Connect public subnet to internet"**
   — skonfigurowało reguły routingu do bramy internetowej (Internet Gateway)
   i grupę bezpieczeństwa (NSG)
2. **Instancja → Networking → Attached VNICs → (VNIC) → IP administration**
   → menu ⋯ przy adresie → **Edit** → Public IP type: **Ephemeral public IP** → Update

Po tym instancja dostała publiczny adres IPv4. (Adres celowo nie jest
w publicznej dokumentacji — dobra praktyka: nie reklamować powierzchni ataku.)

Pojęcia: **VCN** = prywatna sieć w chmurze (jak firmowy LAN), **subnet** = jej
wydzielony fragment, **Internet Gateway** = brama łącząca VCN z internetem
(jak router brzegowy), **ephemeral IP** = adres przypisany "na czas życia"
instancji (w przeciwieństwie do rezerwowanego).

## 4. Pierwsze logowanie ✅

```powershell
ssh ubuntu@<PUBLICZNY_ADRES_IP>
```

Wynik: zalogowany jako `ubuntu` na hoście `helpdesk-vps` (Ubuntu 24.04.4 LTS).
Przy pierwszym połączeniu SSH zapisuje "odcisk palca" serwera do known_hosts —
przy kolejnych połączeniach wykryje, gdyby ktoś podszywał się pod serwer.

## 5. Zabezpieczenie serwera (następny krok)

- [ ] Aktualizacja systemu (`apt update && apt upgrade`)
- [ ] Firewall (ufw): tylko porty 22 (SSH) i 8000 (API)
- [ ] fail2ban — automatyczne banowanie prób włamań
- [ ] Weryfikacja: logowanie hasłem wyłączone (tylko klucze SSH)
