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

Decyzja: próbujemy Oracle Cloud (darmowy na zawsze), plan B: Mikrus.

## 2. Klucze SSH (wykonane ✅)

Logowanie do serwera kluczem zamiast hasła — standard bezpieczeństwa.
Klucz prywatny zostaje na moim komputerze, publiczny wgrywa się na serwer.

```powershell
# wygenerowanie pary kluczy ed25519 (nowoczesny, krótki, szybki)
ssh-keygen -t ed25519 -f $env:USERPROFILE\.ssh\id_ed25519 -C "krystian-helpdesk-vps"

# podgląd klucza PUBLICZNEGO (ten wolno udostępniać)
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub
```

Zasada: **klucza prywatnego (`id_ed25519` bez `.pub`) nie udostępnia się nigdy i nikomu.**

## 3. Utworzenie maszyny w Oracle Cloud (w trakcie)

- [ ] Rejestracja konta na oracle.com/cloud/free (region domowy: Frankfurt lub Sztokholm)
- [ ] Compute → Instances → Create instance
- [ ] Obraz: Ubuntu 24.04 LTS (Canonical)
- [ ] Shape: VM.Standard.E2.1.Micro (Always Free)
- [ ] Wklejenie klucza publicznego SSH przy tworzeniu
- [ ] Zapisanie publicznego adresu IP

## 4. Pierwsze logowanie i zabezpieczenie serwera (planowane)

- [ ] `ssh ubuntu@<IP>` — pierwsze połączenie
- [ ] Aktualizacja systemu (`apt update && apt upgrade`)
- [ ] Firewall (ufw): tylko porty 22 (SSH) i 8000 (API)
- [ ] fail2ban — blokowanie prób zgadywania haseł
- [ ] Wyłączenie logowania hasłem (tylko klucze SSH)
