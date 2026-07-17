/* ============================================
   TERMINAL.JS — Simulated Terminal
   ============================================ */

const Terminal = (() => {
    const CHAR_DELAY = 8;     // ms per character for typewriter
    const LINE_DELAY = 60;    // ms between lines
    const instances = {};

    // Simulated outputs for each terminal
    const simulations = {
        'airmon-check-kill': {
            lines: [
                { type: 'output', text: 'Killing these processes:' },
                { type: 'output', text: '' },
                { type: 'header', text: '  PID Name' },
                { type: 'output', text: '  578 NetworkManager' },
                { type: 'output', text: '  831 wpa_supplicant' },
                { type: 'output', text: '  923 dhclient' },
                { type: 'success', text: '' },
                { type: 'success', text: 'All interfering processes killed.' },
            ]
        },
        'airmon-start': {
            lines: [
                { type: 'output', text: '' },
                { type: 'output', text: 'PHY\tInterface\tDriver\t\tChipset' },
                { type: 'output', text: '' },
                { type: 'highlight', text: 'phy0\t{ifaceMon}\tath9k_htc\tQualcomm Atheros AR9271' },
                { type: 'output', text: '' },
                { type: 'info', text: '\t\t(mac80211 monitor mode vif enabled for [phy0]{iface}' },
                { type: 'info', text: '\t\ton [phy0]{ifaceMon})' },
                { type: 'success', text: '' },
                { type: 'success', text: 'Monitor mode enabled on {ifaceMon}' },
            ]
        },
        'airodump-scan': {
            lines: [
                { type: 'output', text: '' },
                { type: 'info', text: ' CH  9 ][ Elapsed: 18 s ][ 2025-07-17 02:41' },
                { type: 'output', text: '' },
                { type: 'header', text: ' BSSID              PWR  Beacons  #Data, #/s  CH   MB   ENC    CIPHER  AUTH  ESSID' },
                { type: 'output', text: '' },
                { type: 'highlight', text: ' {bssid_or_demo}  -45     142      89    12   6   54e  WPA2   CCMP    PSK   LabPentest_5G' },
                { type: 'output', text: ' A0:B1:C2:D3:E4:F5  -62      98      23     3   1   54e  WPA2   CCMP    PSK   ViziNET-2.4G' },
                { type: 'dim', text: ' 11:22:33:44:55:66  -78      34       5     0  11   54e  WPA    TKIP    PSK   CLARO_GUEST' },
                { type: 'dim', text: ' FF:EE:DD:CC:BB:AA  -81      21       2     0   3   54e  WPA2   CCMP    PSK   NET_AP_3' },
                { type: 'output', text: '' },
                { type: 'header', text: ' BSSID              STATION            PWR   Rate    Lost  Frames  Notes  Probes' },
                { type: 'output', text: '' },
                { type: 'highlight', text: ' {bssid_or_demo}  {client_or_demo}  -28   54e-11     0      86         ' },
                { type: 'output', text: ' {bssid_or_demo}  66:77:88:99:AA:BB  -51   54e- 6     2      34         ' },
                { type: 'dim', text: ' A0:B1:C2:D3:E4:F5  CC:DD:EE:FF:00:11  -64   54e- 1     5      12         ' },
            ]
        },
        'aireplay-deauth': {
            lines: [
                { type: 'output', text: '02:41:30  Waiting for beacon frame (BSSID: {bssid_or_demo}) on channel {channel}' },
                { type: 'output', text: '02:41:30  Sending 64 directed DeAuth (code 7). STMAC: [{client_or_demo}]  [ 0|62 ACKs]' },
                { type: 'output', text: '02:41:31  Sending 64 directed DeAuth (code 7). STMAC: [{client_or_demo}]  [ 5|63 ACKs]' },
                { type: 'output', text: '02:41:31  Sending 64 directed DeAuth (code 7). STMAC: [{client_or_demo}]  [11|64 ACKs]' },
                { type: 'warning', text: '02:41:32  Sending 64 directed DeAuth (code 7). STMAC: [{client_or_demo}]  [23|61 ACKs]' },
                { type: 'output', text: '02:41:32  Sending 64 directed DeAuth (code 7). STMAC: [{client_or_demo}]  [31|64 ACKs]' },
                { type: 'output', text: '02:41:33  Sending 64 directed DeAuth (code 7). STMAC: [{client_or_demo}]  [42|63 ACKs]' },
                { type: 'output', text: '02:41:33  Sending 64 directed DeAuth (code 7). STMAC: [{client_or_demo}]  [50|64 ACKs]' },
                { type: 'output', text: '02:41:34  Sending 64 directed DeAuth (code 7). STMAC: [{client_or_demo}]  [57|62 ACKs]' },
                { type: 'output', text: '02:41:34  Sending 64 directed DeAuth (code 7). STMAC: [{client_or_demo}]  [61|64 ACKs]' },
                { type: 'success', text: '02:41:35  Sending 64 directed DeAuth (code 7). STMAC: [{client_or_demo}]  [64|64 ACKs]' },
            ]
        },
        'airodump-handshake': {
            lines: [
                { type: 'success', text: ' CH  {channel} ][ Elapsed: 42 s ][ 2025-07-17 02:41 ][ WPA handshake: {bssid_or_demo}' },
                { type: 'output', text: '' },
                { type: 'header', text: ' BSSID              PWR  RXQ  Beacons  #Data, #/s  CH   MB   ENC    CIPHER  AUTH  ESSID' },
                { type: 'output', text: '' },
                { type: 'highlight', text: ' {bssid_or_demo}  -45  100      312     256    18   {channel}   54e  WPA2   CCMP    PSK   LabPentest_5G' },
                { type: 'output', text: '' },
                { type: 'header', text: ' BSSID              STATION            PWR   Rate    Lost  Frames  Notes  Probes' },
                { type: 'output', text: '' },
                { type: 'highlight', text: ' {bssid_or_demo}  {client_or_demo}  -28   54e-11     0     186   EAPOL  ' },
            ]
        },
        'aircrack-crack': {
            lines: [
                { type: 'output', text: '                               Aircrack-ng 1.7' },
                { type: 'output', text: '' },
                { type: 'output', text: '      [00:00:03] 8243/14344392 keys tested (2891.42 k/s)' },
                { type: 'output', text: '' },
                { type: 'output', text: '      Time left: 1 hour, 22 minutes, 38 seconds               0.06%' },
                { type: 'output', text: '' },
                { type: 'output', text: '                       Current passphrase: butterfly2' },
                { type: 'output', text: '' },
                { type: 'output', text: '      Master Key     : A1 B2 C3 D4 E5 F6 07 18 29 3A 4B 5C 6D 7E 8F 90' },
                { type: 'output', text: '                       01 12 23 34 45 56 67 78 89 9A AB BC CD DE EF F0' },
                { type: 'output', text: '' },
                { type: 'output', text: '      Transient Key  : 0A 1B 2C 3D 4E 5F 60 71 82 93 A4 B5 C6 D7 E8 F9' },
                { type: 'output', text: '                       10 21 32 43 54 65 76 87 98 A9 BA CB DC ED FE 0F' },
                { type: 'output', text: '                       20 31 42 53 64 75 86 97 A8 B9 CA DB EC FD 0E 1F' },
                { type: 'output', text: '                       30 41 52 63 74 85 96 A7 B8 C9 DA EB FC 0D 1E 2F' },
                { type: 'output', text: '' },
                { type: 'output', text: '      EAPOL HMAC     : 55 66 77 88 99 AA BB CC DD EE FF 00 11 22 33 44' },
                { type: 'output', text: '' },
                { type: 'success', text: '                    KEY FOUND! [ password123 ]' },
                { type: 'output', text: '' },
            ]
        },
        // WPS Trail
        'wash-scan': {
            lines: [
                { type: 'info', text: 'Wash v1.7 WiFi Protected Setup Scan Tool' },
                { type: 'output', text: 'Copyright (c) 2011, Tactical Network Solutions' },
                { type: 'output', text: '' },
                { type: 'header', text: 'BSSID               Ch  dBm  WPS  Lck  Vendor    ESSID' },
                { type: 'header', text: '--------------------------------------------------------------------------------' },
                { type: 'highlight', text: '{bssid_or_demo}   {channel}  -45  2.0  No   RalinkTe  LabPentest_5G' },
                { type: 'output', text: 'A0:B1:C2:D3:E4:F5   1  -62  2.0  Yes  Broadcom  ViziNET-2.4G' },
                { type: 'dim', text: 'FF:EE:DD:CC:BB:AA   3  -78  1.0  No   Realtek   NET_AP_3' },
            ]
        },
        'reaver-attack': {
            lines: [
                { type: 'info', text: 'Reaver v1.6.6 WiFi Protected Setup Attack Tool' },
                { type: 'output', text: '[+] Waiting for beacon from {bssid_or_demo}' },
                { type: 'output', text: '[+] Received beacon from {bssid_or_demo}' },
                { type: 'output', text: '[+] Trying pin "12345670"' },
                { type: 'output', text: '[+] Sending EAPOL START request' },
                { type: 'output', text: '[+] Received identity request' },
                { type: 'output', text: '[+] Sending identity response' },
                { type: 'warning', text: '[!] WARNING: Failed to associate with {bssid_or_demo} (ESSID: LabPentest_5G)' },
                { type: 'output', text: '[+] Trying pin "00005678"' },
                { type: 'output', text: '[+] Sending EAPOL START request' },
                { type: 'output', text: '[+] Sending M2 message' },
                { type: 'output', text: '[+] Received M3 message' },
                { type: 'output', text: '[+] Sending M4 message' },
                { type: 'output', text: '[+] Received M5 message' },
                { type: 'output', text: '[+] Sending M6 message' },
                { type: 'output', text: '[+] Received M7 message' },
                { type: 'success', text: '[+] WPS PIN: \'00005678\'' },
                { type: 'success', text: '[+] WPA PSK: \'password123\'' },
                { type: 'success', text: '[+] AP SSID: \'LabPentest_5G\'' },
            ]
        },
        // PMKID Trail
        'hcxdumptool-capture': {
            lines: [
                { type: 'info', text: 'hcxdumptool 6.2.7 (C) 2022 ZeroBeat' },
                { type: 'output', text: 'start capturing (stop with ctrl+c)' },
                { type: 'output', text: 'INTERFACE..............: {ifaceMon}' },
                { type: 'output', text: 'FILTERLIST_AP..........: 1 MAC(s)' },
                { type: 'output', text: 'ERRORMAX...............: 100 errors' },
                { type: 'output', text: '' },
                { type: 'output', text: '[02:41:30] {bssid_or_demo} -> c6a0ffee1234 [PMKID]' },
                { type: 'success', text: '[02:41:30] FOUND PMKID CLIENT-LESS (ACTIVE): {bssid_or_demo}' },
                { type: 'output', text: '' },
                { type: 'highlight', text: 'CAPTURED PMKID: 1' },
                { type: 'output', text: 'packets captured: 2847' },
                { type: 'output', text: 'writing to: capture.pcapng' },
            ]
        },
        'hcxpcapngtool-convert': {
            lines: [
                { type: 'info', text: 'hcxpcapngtool 6.2.7 (C) 2022 ZeroBeat' },
                { type: 'output', text: '' },
                { type: 'output', text: 'reading from capture.pcapng...' },
                { type: 'output', text: '' },
                { type: 'output', text: 'summary capture file' },
                { type: 'output', text: '---------------------' },
                { type: 'output', text: 'file name................................: capture.pcapng' },
                { type: 'output', text: 'PMKID (usable)...........................: 1' },
                { type: 'output', text: 'EAPOL pairs (best).......................: 0' },
                { type: 'output', text: '' },
                { type: 'success', text: 'written to: hash.hc22000 (1 hash)' },
            ]
        },
        'hashcat-crack': {
            lines: [
                { type: 'output', text: 'hashcat (v6.2.6) starting' },
                { type: 'output', text: '' },
                { type: 'output', text: 'OpenCL API (OpenCL 3.0) - Platform #1 [NVIDIA Corporation]' },
                { type: 'output', text: '* Device #1: NVIDIA GeForce RTX 3060, 12288/12288 MB, 28MCU' },
                { type: 'output', text: '' },
                { type: 'output', text: 'Hash-mode: 22000 (WPA-PBKDF2-PMKID+EAPOL)' },
                { type: 'output', text: '' },
                { type: 'output', text: 'Speed.#1.........: 215.3 kH/s (8.12ms) @ Accel:64 Loops:128 Thr:1024 Vec:1' },
                { type: 'output', text: '' },
                { type: 'output', text: 'Session..........: hashcat' },
                { type: 'output', text: 'Status...........: Running' },
                { type: 'output', text: 'Progress.........: 1048576/14344392 (7.31%)' },
                { type: 'output', text: 'Estimated.Time...: 1 min, 2 sec' },
                { type: 'output', text: '' },
                { type: 'success', text: 'WPA*.01:{bssid_or_demo}:password123' },
                { type: 'output', text: '' },
                { type: 'success', text: 'Session..........: hashcat' },
                { type: 'success', text: 'Status...........: Cracked' },
                { type: 'highlight', text: 'Hash.Target......: WPA*01*{bssid_or_demo}*LabPentest_5G' },
            ]
        }
    };

    function initAll() {
        document.querySelectorAll('.terminal[data-sim]').forEach(termEl => {
            const simId = termEl.getAttribute('data-sim');
            const body = termEl.querySelector('.terminal-body');
            const runBtn = termEl.querySelector('.btn-simulate');
            const clearBtn = termEl.querySelector('.btn-clear');
            const copyBtn = termEl.querySelector('.btn-terminal-copy');

            if (!body || !simId) return;

            instances[simId] = { el: termEl, body, running: false };

            if (runBtn) {
                runBtn.addEventListener('click', () => runSimulation(simId));
            }
            if (clearBtn) {
                clearBtn.addEventListener('click', () => clearTerminal(simId));
            }
            if (copyBtn) {
                copyBtn.addEventListener('click', () => copyTerminalOutput(simId));
            }
        });
    }

    function resolveValue(text) {
        const cmdState = Commands.getState();
        const bssid = cmdState.bssid && /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(cmdState.bssid)
            ? cmdState.bssid : '00:11:22:33:44:55';
        const client = cmdState.client && /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(cmdState.client)
            ? cmdState.client : 'AA:BB:CC:DD:EE:FF';

        return text
            .replace(/\{bssid_or_demo\}/g, bssid)
            .replace(/\{client_or_demo\}/g, client)
            .replace(/\{ifaceMon\}/g, cmdState.ifaceMon || 'wlan0mon')
            .replace(/\{iface\}/g, cmdState.iface || 'wlan0')
            .replace(/\{channel\}/g, cmdState.channel || '6')
            .replace(/\{wordlist\}/g, cmdState.wordlist || '/usr/share/wordlists/rockyou.txt');
    }

    async function runSimulation(simId) {
        const instance = instances[simId];
        const sim = simulations[simId];
        if (!instance || !sim || instance.running) return;

        instance.running = true;
        const body = instance.body;
        const runBtn = instance.el.querySelector('.btn-simulate');
        
        if (runBtn) {
            runBtn.classList.add('running');
            runBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Executando...';
        }

        // Clear previous output but keep prompt
        body.innerHTML = '';

        for (const line of sim.lines) {
            const lineEl = document.createElement('span');
            lineEl.className = `term-line term-${line.type}`;
            const resolvedText = resolveValue(line.text);
            body.appendChild(lineEl);

            // Typewriter effect for non-empty lines
            if (resolvedText.length > 0) {
                await typewriterLine(lineEl, resolvedText, CHAR_DELAY);
            }

            await delay(LINE_DELAY);
            body.scrollTop = body.scrollHeight;
        }

        // Add cursor at end
        const cursor = document.createElement('span');
        cursor.className = 'term-cursor';
        body.appendChild(cursor);

        instance.running = false;
        if (runBtn) {
            runBtn.classList.remove('running');
            runBtn.innerHTML = '<i class="fa-solid fa-play"></i> Simular Execução';
        }
    }

    function typewriterLine(el, text, charDelay) {
        return new Promise(resolve => {
            let i = 0;
            const interval = setInterval(() => {
                el.textContent += text[i];
                i++;
                if (i >= text.length) {
                    clearInterval(interval);
                    resolve();
                }
            }, charDelay);
        });
    }

    function clearTerminal(simId) {
        const instance = instances[simId];
        if (!instance) return;
        instance.body.innerHTML = '<span class="term-cursor"></span>';
    }

    function copyTerminalOutput(simId) {
        const instance = instances[simId];
        if (!instance) return;
        const text = instance.body.innerText;
        navigator.clipboard.writeText(text).then(() => {
            Components.toast('Output copiado!', 'success');
        });
    }

    function delay(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    return { initAll, runSimulation, clearTerminal };
})();
