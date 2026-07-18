/* ============================================
   COMMANDS.JS — Dynamic Command Generation
   ============================================ */

const Commands = (() => {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    const pathRegex = /^[\/~].+/;

    // Store current values globally for cross-step references
    const state = {
        iface: 'wlan0',
        ifaceMon: 'wlan0mon',
        bssid: '',
        channel: '6',
        client: '',
        wordlist: '/usr/share/wordlists/rockyou.txt',
        fileBase: 'captura_lab',
        essid: '',
        target: '192.168.1.100',
        targetUrl: 'http://192.168.1.100/index.php?id=1',
        lhost: '10.10.14.5',
        lport: '4444',
        user: 'admin',
    };

    function init() {
        // Bind all command inputs
        document.querySelectorAll('[data-cmd-input]').forEach(input => {
            input.addEventListener('input', () => {
                updateState();
                updateAllCommands();
            });
        });

        // Initialize state from current inputs
        updateState();
        updateAllCommands();

        // Setup copy buttons
        document.querySelectorAll('.btn-copy').forEach(btn => {
            btn.addEventListener('click', () => copyCommand(btn));
        });
    }

    function updateState() {
        const get = (id) => {
            const el = document.getElementById(id);
            return el ? el.value.trim() : '';
        };

        state.iface = get('iface') || 'wlan0';
        state.ifaceMon = state.iface.includes('mon') ? state.iface : state.iface + 'mon';
        state.bssid = get('bssid');
        state.channel = get('channel') || '6';
        state.client = get('client');
        state.wordlist = get('wordlist') || '/usr/share/wordlists/rockyou.txt';
        state.essid = get('essid');
        state.fileBase = 'captura_lab';
        state.target = get('target') || '192.168.1.100';
        state.targetUrl = get('targetUrl') || 'http://192.168.1.100/index.php?id=1';
        state.lhost = get('lhost') || '10.10.14.5';
        state.lport = get('lport') || '4444';
        state.user = get('user') || 'admin';

        // Validate MACs
        validateField('bssid', macRegex);
        validateField('client', macRegex);
    }

    function validateField(id, regex) {
        const el = document.getElementById(id);
        if (!el) return false;
        const val = el.value.trim();
        if (!val) {
            el.classList.remove('invalid');
            return false;
        }
        const valid = regex.test(val);
        el.classList.toggle('invalid', !valid);
        return valid;
    }

    function isMacValid(id) {
        const el = document.getElementById(id);
        if (!el) return false;
        return macRegex.test(el.value.trim());
    }

    function updateAllCommands() {
        const updates = document.querySelectorAll('[data-cmd]');
        updates.forEach(el => {
            const template = el.getAttribute('data-cmd');
            const rendered = renderTemplate(template);
            if (rendered) {
                el.textContent = rendered;
                el.classList.remove('cmd-error');
            }
        });
    }

    function renderTemplate(template) {
        // Replace placeholders like {iface}, {ifaceMon}, {bssid}, etc.
        let result = template;
        
        // Replace simple placeholders
        result = result.replace(/\{iface\}/g, state.iface);
        result = result.replace(/\{ifaceMon\}/g, state.ifaceMon);
        result = result.replace(/\{channel\}/g, state.channel);
        result = result.replace(/\{fileBase\}/g, state.fileBase);
        result = result.replace(/\{wordlist\}/g, state.wordlist);
        result = result.replace(/\{essid\}/g, state.essid);
        result = result.replace(/\{target\}/g, state.target);
        result = result.replace(/\{targetUrl\}/g, state.targetUrl);
        result = result.replace(/\{lhost\}/g, state.lhost);
        result = result.replace(/\{lport\}/g, state.lport);
        result = result.replace(/\{user\}/g, state.user);

        // Conditional: BSSID (requires validation)
        if (result.includes('{bssid}')) {
            if (isMacValid('bssid')) {
                result = result.replace(/\{bssid\}/g, state.bssid);
            } else {
                return result.replace(/\{bssid\}/g, '<BSSID>');
            }
        }

        // Conditional: Client MAC
        if (result.includes('{client}')) {
            if (isMacValid('client')) {
                result = result.replace(/\{client\}/g, state.client);
            } else {
                return result.replace(/\{client\}/g, '<CLIENT_MAC>');
            }
        }

        return result;
    }

    function copyCommand(btn) {
        const cmdBox = btn.closest('.command-box');
        const codeEl = cmdBox ? cmdBox.querySelector('code') : null;
        if (!codeEl) return;

        const text = codeEl.textContent;

        if (text.includes('<BSSID>') || text.includes('<CLIENT_MAC>')) {
            Components.toast('Preencha os campos corretamente primeiro.', 'error');
            return;
        }

        navigator.clipboard.writeText(text).then(() => {
            Components.toast('Comando copiado!', 'success');
            
            // Visual feedback on button
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Copiado!';
            btn.classList.add('copied');
            
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.classList.remove('copied');
            }, 1500);
        }).catch(() => {
            // Fallback for non-HTTPS
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            Components.toast('Comando copiado!', 'success');
        });
    }

    function copyAllTrailCommands() {
        const cmdNodes = document.querySelectorAll('[data-cmd]');
        if (!cmdNodes.length) {
            Components.toast('Nenhum comando encontrado nesta página.', 'info');
            return;
        }

        const lines = [];
        let index = 1;
        cmdNodes.forEach(el => {
            const txt = el.textContent.trim();
            if (txt) {
                lines.push(`# Passo ${index++}`);
                lines.push(txt);
                lines.push('');
            }
        });

        const fullScript = lines.join('\n');
        if (fullScript.includes('<BSSID>') || fullScript.includes('<CLIENT_MAC>')) {
            Components.toast('Preencha os campos obrigatorios antes de copiar.', 'warning');
        }

        navigator.clipboard.writeText(fullScript).then(() => {
            Components.toast('Todos os comandos copiados!', 'success');
        }).catch(() => {
            const textarea = document.createElement('textarea');
            textarea.value = fullScript;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            Components.toast('Todos os comandos copiados!', 'success');
        });
    }

    function downloadTrailScript(trailName = 'script_lab') {
        const cmdNodes = document.querySelectorAll('[data-cmd]');
        if (!cmdNodes.length) {
            Components.toast('Nenhum comando encontrado para exportar.', 'info');
            return;
        }

        const scriptHeader = [
            '#!/usr/bin/env bash',
            '# =========================================================',
            `# Lab Pentest Wi-Fi - Script de Automação (${trailName})`,
            '# Gerado automaticamente pelo Laboratório Aircrack-ng',
            '# =========================================================',
            '',
            'set -e',
            'echo "[+] Iniciando execução dos comandos do laboratório..."',
            ''
        ];

        const lines = [...scriptHeader];
        let step = 1;
        cmdNodes.forEach(el => {
            const txt = el.textContent.trim();
            if (txt) {
                lines.push(`echo -e "\\n\\e[1;34m[>] Passo ${step}: ${txt}\\e[0m"`);
                lines.push(txt);
                step++;
            }
        });

        lines.push('');
        lines.push('echo -e "\\n\\e[1;32m[✓] Execução do script finalizada com sucesso!\\e[0m"');

        const content = lines.join('\n');
        const blob = new Blob([content], { type: 'text/x-shellscript;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const filename = `${trailName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_script.sh`;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        Components.toast(`Script ${filename} baixado!`, 'success');
    }

    function getState() {
        return { ...state };
    }

    return { init, updateAllCommands, getState, copyCommand, copyAllTrailCommands, downloadTrailScript };
})();

