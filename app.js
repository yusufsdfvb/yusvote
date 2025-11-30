// ===============================
// YusVote — Enhanced Clean Version
// ===============================

// ----------- Helpers -----------

// إنشاء عنصر بسرعة
const el = (tag, props = {}, children = []) => {
    const e = document.createElement(tag);
    Object.assign(e, props);
    children.forEach(c => e.appendChild(c));
    return e;
};

// Base64
const b64EncodeUnicode = str => btoa(unescape(encodeURIComponent(str)));
const b64DecodeUnicode = str => decodeURIComponent(escape(atob(str)));

// تنسيق الخيار حسب النوع
function formatOptionLabel(type, idx, text) {
    if (type === "number") return `${idx + 1}. ${text}`;
    if (type === "letter") return `${String.fromCharCode(65 + idx)}. ${text}`;
    return text;
}

// عناصر DOM
const creatorCard = document.getElementById("creator");
const voterCard = document.getElementById("voter");
const optionsList = document.getElementById("options-list");

const newOption = document.getElementById("new-option");
const addOptionBtn = document.getElementById("add-option");

const createBtn = document.getElementById("create");
const createFbBtn = document.getElementById("create-firebase");

const shareArea = document.getElementById("share-area");
const shareLinkSpan = document.getElementById("share-link");

const qrImg = document.getElementById("qr-img");

const waBtn = document.getElementById("whatsapp");
const tgBtn = document.getElementById("telegram");
const igBtn = document.getElementById("instagram");
const copyBtn = document.getElementById("copy-link");
const dlQrBtn = document.getElementById("download-qr");

// voter
const vTitle = document.getElementById("v-title");
const vDesc = document.getElementById("v-desc");
const vOptions = document.getElementById("v-options");
const voteBtn = document.getElementById("vote-btn");
const vStatus = document.getElementById("v-status");

const resultsBox = document.getElementById("results");
const resultsList = document.getElementById("results-list");


// ----------- خيارات الإنشاء -----------
let options = [];

function renderOptionsInputs() {
    optionsList.innerHTML = "";

    options.forEach((opt, idx) => {
        const inp = el("input", {
            type: "text",
            value: opt,
            style: "flex:1",
            oninput: () => options[idx] = inp.value.trim()
        });

        const remove = el("button", {
            className: "small",
            textContent: "حذف",
            onclick: () => {
                options.splice(idx, 1);
                renderOptionsInputs();
            }
        });

        const row = el("div", { className: "option-item" }, [inp, remove]);
        optionsList.appendChild(row);
    });
}

addOptionBtn.onclick = () => {
    const v = newOption.value.trim();
    if (!v) return;
    options.push(v);
    newOption.value = "";
    renderOptionsInputs();
};

// ----------- إنشاء التصويت — نسخة محسنة -----------  
createBtn.onclick = () => {
    const title = document.getElementById("poll-title").value.trim();
    if (!title) return alert("اكتب سؤال التصويت");

    if (options.length < 1) return alert("أضف خياراً واحداً على الأقل");

    const type = document.getElementById("option-type").value;
    const desc = document.getElementById("poll-desc").value || "";
    const endInput = document.getElementById("end-time").value;
    const endTime = endInput ? new Date(endInput).toISOString() : null;

    const normalized = options.map((label, i) => ({
        id: i,
        label,
        votes: 0
    }));

    // 🔥 ID قصير بدل Base64 الضخم
    const pollId = Math.random().toString(36).substring(2, 8).toUpperCase();

    const poll = {
        id: pollId,
        title,
        desc,
        type,
        options: normalized,
        createdAt: new Date().toISOString(),
        endTime
    };

    // 🔥 تخزين محلي فقط
    localStorage.setItem("yusvote_poll_" + pollId, JSON.stringify(poll));

    // 🔥 رابط قصير جداً
    const url = location.origin + location.pathname + "#id=" + pollId;

    // عرض المشاركة
    shareLinkSpan.textContent = url;
    shareArea.style.display = "block";

    // QR سريع وموثوق
    qrImg.src =
        "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" +
        encodeURIComponent(url);
};

function loadFromHash() {
    const h = location.hash || "";
    if (!h.startsWith("#id=")) return false;

    const pollId = h.replace("#id=", "");
    const poll = JSON.parse(localStorage.getItem("yusvote_poll_" + pollId));

    if (!poll) {
        alert("هذا التصويت غير موجود");
        return false;
    }

    showPoll(poll);
    return true;
}

// ----------- عرض صفحة التصويت -----------
function showPoll(poll) {
    creatorCard.style.display = "none";
    voterCard.style.display = "block";

    vTitle.textContent = poll.title;
    vDesc.textContent = poll.desc || "";

    const now = new Date();
    const ended = poll.endTime ? (now >= new Date(poll.endTime)) : false;

    vOptions.innerHTML = "";

    poll.options.forEach((opt, idx) => {
        const radio = el("input", {
            type: "radio",
            name: "choice",
            value: idx
        });

        const label = el("label", {
            textContent: " " + formatOptionLabel(poll.type, idx, opt.label)
        });

        const wrap = el("div", { style: "margin-bottom:8px" }, [radio, label]);
        vOptions.appendChild(wrap);
    });

    if (ended) {
        voteBtn.disabled = true;
        vStatus.textContent = "انتهى التصويت";
        showResults(poll);
        return;
    }

    voteBtn.onclick = () => {
        const checked = document.querySelector('input[name="choice"]:checked');
        if (!checked) return alert("اختر خياراً");

        const idx = Number(checked.value);

        const voteKey = "yusvote_votes_" + poll.id;
        let votes = JSON.parse(localStorage.getItem(voteKey) || "[]");

        votes.push({ at: Date.now(), choice: idx });

        localStorage.setItem(voteKey, JSON.stringify(votes));

        poll.options[idx].votes++;
        localStorage.setItem("yusvote_poll_" + poll.id, JSON.stringify(poll));

        vStatus.textContent = "تم التصويت ✓";
        showResults(poll);
    };
}

// ----------- عرض النتائج -----------
function showResults(poll) {
    resultsBox.style.display = "block";
    resultsList.innerHTML = "";

    const total = poll.options.reduce((sum, o) => sum + o.votes, 0) || 1;

    poll.options.forEach((opt, idx) => {
        const percent = Math.round((opt.votes / total) * 100);

        const fill = el("div", {
            className: "results-fill",
            style: `width:${percent}%`
        });

        const bar = el("div", { className: "results-bar" }, [fill]);

        const row = el("div", {
            className: "result-row",
            innerHTML: `<strong>${formatOptionLabel(poll.type, idx, opt.label)}</strong> — ${percent}%`
        });

        row.appendChild(bar);
        resultsList.appendChild(row);
    });
}

// ----------- تشغيل تلقائي -----------
window.onload = () => loadFromHash();
