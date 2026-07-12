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

## 5. Zabezpieczenie serwera ✅

- [x] Aktualizacja systemu
- [x] Firewall: tylko porty 22 (SSH) i 8000 (API), reszta odrzucana
- [x] fail2ban — automatyczne banowanie prób włamań (jail: sshd)
- [x] Logowanie hasłem wyłączone (tylko klucze), logowanie na roota zablokowane
- [x] Restart i weryfikacja, że wszystko przetrwało reboot

### Wykonane komendy (z objaśnieniami)

```bash
# 1. Aktualizacja systemu — odpowiednik Windows Update
sudo apt-get update && sudo apt-get upgrade -y

# 2. fail2ban — czyta logi SSH i banuje IP po kilku nieudanych próbach logowania
sudo apt-get install -y fail2ban
sudo systemctl enable --now fail2ban
sudo fail2ban-client status sshd     # podgląd: ilu zbanowanych

# 3. Twardsze SSH: całkowity zakaz logowania na roota
echo 'PermitRootLogin no' | sudo tee /etc/ssh/sshd_config.d/99-hardening.conf
sudo systemctl restart ssh

# 4. Firewall — obrazy Oracle mają fabrycznie iptables z regułą REJECT;
#    dokładamy tylko port 8000 (API portalu) przed regułą odrzucającą
sudo iptables -I INPUT 5 -m state --state NEW -p tcp --dport 8000 -j ACCEPT
sudo netfilter-persistent save       # zapis reguł na stałe (przetrwają reboot)

# 5. Restart (wymagany po aktualizacji jądra) i weryfikacja
sudo reboot
```

Stan końcowy: `passwordauthentication no`, `permitrootlogin no`,
firewall przepuszcza wyłącznie 22 i 8000, fail2ban aktywny.

Uwaga na przyszłość (Etap 5): oprócz firewalla w systemie, port 8000 musi być
też otwarty w **Security List / NSG** w konsoli Oracle (firewall na poziomie
sieci chmurowej — dwie niezależne warstwy!).
