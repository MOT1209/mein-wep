class VaultCalculator {
    constructor() {
        this.prevElement = document.getElementById('previous-operand');
        this.currElement = document.getElementById('current-operand');
        this.clear();

        this.secretCode = localStorage.getItem('vaultPassword');
        this.isSetupMode = !this.secretCode;
        this.setupStep = 0;
        this.tempCode = "";

        if (this.isSetupMode) {
            this.showTextDisplay("SET CODE");
        }
    }

    clear() {
        this.currentOperand = "0";
        this.previousOperand = "";
        this.operation = undefined;
        this.isTextMode = false;
    }

    showTextDisplay(text) {
        this.isTextMode = true;
        this.currentOperand = text;
        this.updateDisplay();
    }

    delete() {
        if (this.isTextMode) { this.clear(); this.updateDisplay(); return; }
        if (this.currentOperand === "0") return;
        this.currentOperand = this.currentOperand.toString().slice(0, -1) || "0";
        this.updateDisplay();
    }

    appendNumber(number) {
        if (this.isTextMode) this.clear();
        if (number === "." && this.currentOperand.includes(".")) return;
        if (this.currentOperand === "0") {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand += number.toString();
        }
        this.updateDisplay();
    }

    chooseOperation(op) {
        if (this.isTextMode) return;
        if (this.currentOperand === "0") return;
        if (this.previousOperand !== "") this.compute();
        this.operation = op;
        this.previousOperand = this.currentOperand;
        this.currentOperand = "0";
        this.updateDisplay();
    }

    compute() {
        let result;
        const prev = parseFloat(this.previousOperand);
        const curr = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(curr)) return;

        switch (this.operation) {
            case "+": result = prev + curr; break;
            case "-": result = prev - curr; break;
            case "*": result = prev * curr; break;
            case "/": result = curr === 0 ? "Error" : prev / curr; break;
            default: return;
        }

        this.currentOperand = result.toString();
        this.operation = undefined;
        this.previousOperand = "";
        this.updateDisplay();
    }

    handleEquals() {
        if (this.isSetupMode) {
            this.handleSetupProcedure();
            return;
        }

        if (this.currentOperand === this.secretCode) {
            openVault();
            this.clear();
            this.updateDisplay();
            return;
        }

        this.compute();
    }

    handleSetupProcedure() {
        const input = this.currentOperand;

        if (this.setupStep === 0 || this.isTextMode) {
            this.setupStep = 1;
            this.showTextDisplay("ENTER CODE");
            return;
        }

        if (this.setupStep === 1) {
            if (input.length < 4) {
                showNotif("الرمز يجب أن يكون 4 أرقام فأكثر");
                return;
            }
            this.tempCode = input;
            this.setupStep = 2;
            this.showTextDisplay("CONFIRM");
            return;
        }

        if (this.setupStep === 2) {
            if (input === this.tempCode) {
                localStorage.setItem('vaultPassword', input);
                this.secretCode = input;
                this.isSetupMode = false;
                showNotif("تم ضبط الرمز بنجاح!");
                this.showTextDisplay("SAVED");
                setTimeout(() => { this.clear(); this.updateDisplay(); }, 2000);
            } else {
                showNotif("الرموز غير متطابقة! حاول مجدداً");
                this.setupStep = 1;
                this.showTextDisplay("RE-ENTER");
            }
        }
    }

    updateDisplay() {
        this.currElement.innerText = this.currentOperand;
        this.prevElement.innerText = this.operation
            ? `${this.previousOperand} ${this.operation}`
            : "";
    }
}

// --- INIT ---
const calc = new VaultCalculator();

document.querySelectorAll('[data-number]').forEach(btn => {
    btn.addEventListener('click', () => calc.appendNumber(btn.innerText));
});

document.querySelectorAll('[data-operator]').forEach(btn => {
    btn.addEventListener('click', () => calc.chooseOperation(btn.getAttribute('data-operator')));
});

document.getElementById('equals-btn').addEventListener('click', () => calc.handleEquals());
document.querySelector('[data-action="clear"]').addEventListener('click', () => { calc.clear(); calc.updateDisplay(); });
document.querySelector('[data-action="delete"]').addEventListener('click', () => calc.delete());

// --- VAULT ---
function openVault() {
    const wrapper = document.getElementById('calc-wrapper');
    wrapper.style.transform = "scale(0.85) translateY(-60px)";
    wrapper.style.opacity = "0";
    setTimeout(() => {
        wrapper.classList.add('hidden');
        document.getElementById('vault-ui').classList.remove('hidden');
        loadSecretNote();
    }, 500);
}

document.getElementById('lock-vault').addEventListener('click', () => {
    const vaultUI = document.getElementById('vault-ui');
    vaultUI.classList.add('hidden');
    const wrapper = document.getElementById('calc-wrapper');
    wrapper.classList.remove('hidden');
    setTimeout(() => {
        wrapper.style.transform = "scale(1) translateY(0)";
        wrapper.style.opacity = "1";
    }, 50);
});

// --- NOTIFICATION ---
function showNotif(msg) {
    const n = document.getElementById('notif');
    n.innerText = msg;
    n.classList.remove('hidden');
    setTimeout(() => n.classList.add('hidden'), 3000);
}
const showNotification = showNotif;

// --- KEYBOARD ---
document.addEventListener('keydown', e => {
    if (calc.isTextMode && e.key !== 'Enter') calc.clear();
    if (e.key >= '0' && e.key <= '9') calc.appendNumber(e.key);
    if (e.key === '.') calc.appendNumber('.');
    if (['+', '-', '*', '/'].includes(e.key)) calc.chooseOperation(e.key);
    if (e.key === 'Enter' || e.key === '=') calc.handleEquals();
    if (e.key === 'Backspace') calc.delete();
});

// --- SECRET NOTE ---
const noteArea = document.getElementById('vault-note-area');
const saveNoteBtn = document.getElementById('save-note-btn');
const noteStatus = document.getElementById('note-status');

function loadSecretNote() {
    const savedNote = localStorage.getItem('vaultSecretNote') || "";
    if (noteArea) noteArea.value = savedNote;
}

if (saveNoteBtn) {
    saveNoteBtn.addEventListener('click', () => {
        const note = noteArea.value;
        localStorage.setItem('vaultSecretNote', note);
        noteStatus.style.opacity = "1";
        setTimeout(() => { noteStatus.style.opacity = "0"; }, 2000);
    });
}

// --- SIDEBAR ---
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        showNotification(`قسم "${btn.textContent.trim()}" — قيد التطوير`, 'info');
    });
});

// --- ADD FILE ---
let vaultFileInput = null;

document.querySelector('.add-btn').addEventListener('click', () => {
    if (!vaultFileInput) {
        vaultFileInput = document.createElement('input');
        vaultFileInput.type = 'file';
        vaultFileInput.multiple = true;
        vaultFileInput.style.display = 'none';
        vaultFileInput.accept = 'image/*,video/*,.pdf,.doc,.docx,.txt';
        document.body.appendChild(vaultFileInput);
        vaultFileInput.addEventListener('change', () => {
            const files = vaultFileInput.files;
            if (files.length > 0) {
                showNotification(`تمت إضافة ${files.length} ملف(ملفات)`, 'success');
            }
            vaultFileInput.value = '';
        });
    }
    vaultFileInput.click();
});
