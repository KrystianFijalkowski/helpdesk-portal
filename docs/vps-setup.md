# Serwer VPS - notatki z konfiguracji

Serwer pod moduł monitoringu. Oracle Cloud Free Tier (nie płacę nic),
Ubuntu 24.04, region Frankfurt, maszyna VM.Standard.E2.1.Micro.
Rozważałem też Mikrusa (~10 zł/mies.), ale darmowy Oracle wystarczył.

## Klucze SSH

Logowanie kluczem zamiast hasła. Klucz prywatny zostaje u mnie, publiczny
wkleja się przy tworzeniu maszyny.

```powershell
ssh-keygen -t ed25519
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub   # ten wolno udostępniać
```

## Tworzenie maszyny

W kreatorze: obraz Canonical Ubuntu 24.04, shape E2.1.Micro (Always Free),
nowa sieć VCN z publicznym subnetem, wklejony klucz SSH.

Była jedna pułapka: przy tworzeniu nowej sieci kreator blokuje przełącznik
"Automatically assign public IPv4 address" i maszyna wstaje bez publicznego
adresu. Naprawa po utworzeniu:

1. Instancja -> Networking -> Quick actions -> "Connect public subnet to
   internet" (ustawia routing do internet gateway)
2. Attached VNICs -> IP administration -> Edit przy adresie -> Ephemeral
   public IP

Adresu celowo nie wpisuję w dokumentacji.

## Pierwsze logowanie i zabezpieczenie

```bash
ssh ubuntu@ADRES_SERWERA

# aktualizacje
sudo apt update && sudo apt upgrade -y

# fail2ban - banuje IP po nieudanych próbach logowania
sudo apt install -y fail2ban
sudo systemctl enable --now fail2ban

# zakaz logowania na roota (hasła są wyłączone już domyślnie)
echo 'PermitRootLogin no' | sudo tee /etc/ssh/sshd_config.d/99-hardening.conf
sudo systemctl restart ssh

# firewall: obraz Oracle ma domyślnie otwarty tylko port 22,
# dokładam 8000 pod API i zapisuję na stałe
sudo iptables -I INPUT 5 -m state --state NEW -p tcp --dport 8000 -j ACCEPT
sudo netfilter-persistent save

sudo reboot   # po aktualizacji jądra
```

Po restarcie sprawdziłem, że fail2ban działa i reguły firewalla przetrwały.

Ważna rzecz, której się tu nauczyłem: firewall w chmurze ma dwie osobne
warstwy. Oprócz iptables w systemie trzeba jeszcze otworzyć port w konsoli
Oracle (Security List / NSG przy karcie sieciowej) - obie muszą przepuścić
ruch, inaczej nic nie przejdzie.

## Agent monitoringu

Katalog /opt/helpdesk-agent, venv z fastapi/uvicorn/psutil, kod z folderu
agent/ w repo. Działa jako usługa systemd (wzór unita też w repo), więc
wstaje sam po restarcie serwera. Klucz API siedzi w konfiguracji usługi,
nie w kodzie.

```bash
sudo systemctl status helpdesk-agent   # kontrola
curl -H "X-API-Key: KLUCZ" localhost:8000/metrics   # test na serwerze
```
