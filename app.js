// ---------------------------------------------
// STORAGE KEYS
// ---------------------------------------------
const STORAGE = {
  leads: "ve_leads",
  projects: "ve_projects",
  profile: "ve_profile"
};

// ---------------------------------------------
// GLOBAL STATE
// ---------------------------------------------
const state = {
  leads: [],
  projects: [],
  profile: {
    businessName: "Vamika Estate",
    ownerName: "Hiren Gohel",
    phone: "7046869462"
  }
};

// ---------------------------------------------
// LOAD STORAGE
// ---------------------------------------------
function loadStorage() {
  try {
    const ls = localStorage.getItem(STORAGE.leads);
    if (ls) state.leads = JSON.parse(ls);

    const ps = localStorage.getItem(STORAGE.projects);
    if (ps) state.projects = JSON.parse(ps);

    const pf = localStorage.getItem(STORAGE.profile);
    if (pf) Object.assign(state.profile, JSON.parse(pf));
  } catch (e) {
    console.log("Storage load failed", e);
  }
}

loadStorage();

// ---------------------------------------------
// SAVE HELPERS
// ---------------------------------------------
function saveLeads() {
  localStorage.setItem(STORAGE.leads, JSON.stringify(state.leads));
  renderLeads();
}

function saveProjects() {
  localStorage.setItem(STORAGE.projects, JSON.stringify(state.projects));
}

function saveProfile() {
  localStorage.setItem(STORAGE.profile, JSON.stringify(state.profile));
}

// ---------------------------------------------
// SIDEBAR TOGGLE
// ---------------------------------------------
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const menuToggle = document.getElementById("menuToggle");

menuToggle.addEventListener("click", () => {
  sidebar.classList.add("open");
  sidebarOverlay.classList.add("open");
});

sidebarOverlay.addEventListener("click", () => {
  sidebar.classList.remove("open");
  sidebarOverlay.classList.remove("open");
});

// ---------------------------------------------
// TABS SWITCHING
// ---------------------------------------------
document.querySelectorAll(".sidebar-item").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".sidebar-item").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const id = btn.getAttribute("data-section");
    document.querySelectorAll(".tab-content").forEach(sec => sec.classList.remove("active"));
    document.getElementById(`tab-${id}`).classList.add("active");

    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("open");
  });
});

// ---------------------------------------------
// LEADS RENDER
// ---------------------------------------------
function formatDate(dt) {
  if (!dt) return "";
  const d = new Date(dt);
  if (isNaN(d)) return "";
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
}

function isDue(dt) {
  if (!dt) return false;
  const d = new Date(dt);
  return d <= new Date();
}

function renderLeads(filter = "") {
  const wrap = document.getElementById("leadsList");
  const empty = document.getElementById("emptyLeads");

  const q = filter.trim().toLowerCase();
  const items = state.leads
    .slice()
    .sort((a,b) => (b.id || 0) - (a.id || 0))
    .filter(l => {
      if (!q) return true;
      const mix = (l.name + l.phone + (l.location || "")).toLowerCase();
      return mix.includes(q);
    });

  wrap.innerHTML = "";
  if (!items.length) {
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  items.forEach(lead => {
    const div = document.createElement("div");
    div.className = "item-card";

    div.addEventListener("click", () => openLeadDetail(lead.id));

    const head = document.createElement("div");
    head.className = "item-header-row";

    const title = document.createElement("div");
    title.className = "item-title";
    title.textContent = lead.name;

    const status = document.createElement("span");
    status.className = "status-pill";
    if (lead.nextFollow) {
      const due = isDue(lead.nextFollow);
      status.textContent = (due ? "Follow: " : "Next: ") + formatDate(lead.nextFollow);
      if (due) status.classList.add("overdue");
    } else {
      status.textContent = "No follow-up";
    }

    head.appendChild(title);
    head.appendChild(status);
    div.appendChild(head);

    const line1 = document.createElement("div");
    line1.className = "item-line";
    line1.textContent = lead.phone;
    div.appendChild(line1);

    const line2 = document.createElement("div");
    line2.className = "item-line";
    line2.textContent = `${lead.segment || ""} • ${lead.requirement || ""}`;
    div.appendChild(line2);

    wrap.appendChild(div);
  });
}

// ---------------------------------------------
// LEAD ADD + MODAL
// ---------------------------------------------
const leadModal = document.getElementById("leadModal");
let editingLeadId = null;

function openLeadForm(editId = null) {
  editingLeadId = editId;
  leadModal.innerHTML = `
    <div class="modal-panel">
      <div style="font-size:16px;font-weight:700;margin-bottom:8px;">
        ${editId ? "Edit Lead" : "Add Lead"}
      </div>

      <input id="lfName" class="field-input" placeholder="Name *"/>
      <input id="lfPhone" class="field-input" placeholder="Phone *"/>
      <input id="lfSegment" class="field-input" placeholder="Segment"/>
      <input id="lfReq" class="field-input" placeholder="BHK / Req"/>
      <input id="lfLoc" class="field-input" placeholder="Location"/>
      <input id="lfBudget" class="field-input" placeholder="Budget"/>
      <input id="lfNext" class="field-input" type="datetime-local"/>

      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px;">
        <button class="mini-btn" id="lfCancel">Cancel</button>
        <button class="primary-btn" id="lfSave">Save</button>
      </div>
    </div>
  `;
  leadModal.classList.remove("hidden");

  if (editId) {
    const l = state.leads.find(x => x.id === editId);
    document.getElementById("lfName").value = l.name;
    document.getElementById("lfPhone").value = l.phone;
    document.getElementById("lfSegment").value = l.segment;
    document.getElementById("lfReq").value = l.requirement;
    document.getElementById("lfLoc").value = l.location;
    document.getElementById("lfBudget").value = l.budget;
    document.getElementById("lfNext").value = l.nextFollow || "";
  }

  document.getElementById("lfCancel").onclick = () => leadModal.classList.add("hidden");
  document.getElementById("lfSave").onclick = saveLeadFromModal;
}

function saveLeadFromModal() {
  const n = document.getElementById("lfName").value.trim();
  const p = document.getElementById("lfPhone").value.trim();
  if (!n || !p) return alert("Name & Phone required");

  const obj = {
    id: editingLeadId || Date.now(),
    name: n,
    phone: p,
    segment: document.getElementById("lfSegment").value,
    requirement: document.getElementById("lfReq").value,
    location: document.getElementById("lfLoc").value,
    budget: document.getElementById("lfBudget").value,
    nextFollow: document.getElementById("lfNext").value,
    followups: []
  };

  if (editingLeadId) {
    const i = state.leads.findIndex(x => x.id === editingLeadId);
    state.leads[i] = obj;
  } else {
    state.leads.unshift(obj);
  }

  saveLeads();
  leadModal.classList.add("hidden");
}

// ---------------------------------------------
// HOOK LEAD BUTTONS
// ---------------------------------------------
document.getElementById("btnNewLead").onclick = () => openLeadForm(null);
document.getElementById("btnEmptyNewLead").onclick = () => openLeadForm(null);
document.getElementById("leadSearch").addEventListener("input", e => renderLeads(e.target.value));

// INITIAL RENDER
renderLeads();
// ---------------------------------------------
// LEAD DETAIL VIEW (FOLLOWUPS, CALL, DELETE)
// ---------------------------------------------
function openLeadDetail(leadId) {
  const L = state.leads.find(x => x.id === leadId);
  if (!L) return;

  leadModal.innerHTML = `
    <div class="modal-panel">
      <div style="font-size:16px;font-weight:700;margin-bottom:8px;">Lead Details</div>

      <div style="font-size:15px;font-weight:700;">${L.name}</div>
      <div style="font-size:13px;color:#94a3b8;margin-top:2px;">${L.phone}</div>
      <div class="item-line">${L.segment || ""} • ${L.requirement || ""}</div>
      <div class="item-line">${L.location || ""} • ${L.budget || ""}</div>

      <div style="margin-top:8px;font-weight:600;">Next Follow Up:</div>
      <div style="margin-bottom:8px;color:#94a3b8;">
        ${L.nextFollow ? formatDate(L.nextFollow) : "No follow-up"}
      </div>

      <div style="display:flex;gap:8px;margin:12px 0;">
        <button class="primary-btn" id="btnCall">📞 Call</button>
        <button class="primary-btn" id="btnWA">💬 WhatsApp</button>
        <button class="mini-btn" id="btnEditLead">✏ Edit</button>
        <button class="mini-btn" id="btnDeleteLead">🗑 Delete</button>
      </div>

      <div style="margin-top:4px;font-weight:600;">Follow-up Log</div>
      <div id="fuList" style="margin-top:6px;"></div>

      <textarea id="fuText" placeholder="Write follow-up note..." class="field-input" style="min-height:60px;"></textarea>
      <input id="fuDate" type="datetime-local" class="field-input"/>

      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:10px;">
        <button class="mini-btn" id="fuCancel">Close</button>
        <button class="primary-btn" id="fuSave">Save Followup</button>
      </div>
    </div>
  `;
  leadModal.classList.remove("hidden");

  // -------- Buttons actions
  document.getElementById("fuCancel").onclick = () => leadModal.classList.add("hidden");
  document.getElementById("btnEditLead").onclick = () => openLeadForm(leadId);
  document.getElementById("btnDeleteLead").onclick = () => deleteLead(leadId);

  document.getElementById("btnCall").onclick = () => {
    window.location.href = `tel:${L.phone}`;
  };

  document.getElementById("btnWA").onclick = () => {
    const msg = `Hello ${L.name},`;
    const ph = L.phone.replace(/\s+/g, "");
    window.open(`https://wa.me/${ph}?text=${encodeURIComponent(msg)}`);
  };

  renderFollowupLog(leadId);

  document.getElementById("fuSave").onclick = () => saveFollowup(leadId);
}

function deleteLead(leadId) {
  if (!confirm("Delete this lead?")) return;
  state.leads = state.leads.filter(l => l.id !== leadId);
  saveLeads();
  leadModal.classList.add("hidden");
}

// ---------------------------------------------
// FOLLOWUP LOG RENDER
// ---------------------------------------------
function renderFollowupLog(leadId) {
  const L = state.leads.find(x => x.id === leadId);
  const wrap = document.getElementById("fuList");
  if (!L) return;
  wrap.innerHTML = "";

  const items = L.followups || [];
  if (!items.length) {
    wrap.innerHTML = `<div style="color:#94a3b8;font-size:12px;">No followups yet</div>`;
    return;
  }

  items
    .slice()
    .sort((a,b)=> new Date(b.date)-new Date(a.date))
    .forEach(fu => {
      const d = document.createElement("div");
      d.className = "item-line";
      d.textContent = `${formatDate(fu.date)} — ${fu.text}`;
      wrap.appendChild(d);
    });
}

// ---------------------------------------------
// SAVE A FOLLOWUP
// ---------------------------------------------
function saveFollowup(leadId) {
  const L = state.leads.find(x => x.id === leadId);
  if (!L) return;

  const text = document.getElementById("fuText").value.trim();
  const date = document.getElementById("fuDate").value;
  if (!text || !date) return alert("Followup text + date required");

  if (!L.followups) L.followups = [];
  L.followups.unshift({ text, date });

  // update next follow date
  L.nextFollow = date;

  saveLeads();
  openLeadDetail(leadId);
}

// ---------------------------------------------
// RENDER FOLLOWUPS TAB
// ---------------------------------------------
function renderFollowupsTab() {
  const wrap = document.getElementById("followupsList");
  const empty = document.getElementById("emptyFollowups");

  const items = state.leads
    .filter(x => x.nextFollow)
    .slice()
    .sort((a,b)=> new Date(a.nextFollow) - new Date(b.nextFollow));

  wrap.innerHTML = "";
  if (!items.length) {
    empty.innerHTML = `<div class="empty-title">No followups pending</div>`;
    return;
  }

  empty.innerHTML = "";

  items.forEach(L => {
    const div = document.createElement("div");
    div.className = "item-card";
    div.onclick = () => openLeadDetail(L.id);

    const hdr = document.createElement("div");
    hdr.className = "item-header-row";

    const t = document.createElement("div");
    t.className = "item-title";
    t.textContent = L.name;

    const due = document.createElement("span");
    due.className = "status-pill";
    due.textContent = formatDate(L.nextFollow);
    if (isDue(L.nextFollow)) due.classList.add("overdue");

    hdr.appendChild(t);
    hdr.appendChild(due);

    div.appendChild(hdr);
    div.appendChild(document.createElement("div")).className = "item-line";
    div.lastChild.textContent = L.phone;

    wrap.appendChild(div);
  });
}
// ---------------------------------------------
// PROJECT MODULE
// ---------------------------------------------

// Render projects
function renderProjects(filter = "") {
  const wrap = document.getElementById("projectsList");
  const empty = document.getElementById("emptyProjects");
  const q = filter.trim().toLowerCase();

  const items = state.projects
    .slice()
    .sort((a,b)=>(b.id||0)-(a.id||0))
    .filter(p => {
      if (!q) return true;
      return (p.name + p.location).toLowerCase().includes(q);
    });

  wrap.innerHTML = "";
  if (!items.length) {
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  items.forEach(p => {
    const div = document.createElement("div");
    div.className = "item-card";

    div.onclick = () => openProjectDetail(p.id);

    const row = document.createElement("div");
    row.className = "item-header-row";

    const title = document.createElement("div");
    title.className = "item-title";
    title.textContent = p.name;

    const sub = document.createElement("div");
    sub.className = "item-line";
    sub.textContent = p.location || "";

    const conf = document.createElement("div");
    conf.className = "item-line";
    conf.textContent = p.configs || "";

    row.appendChild(title);
    div.appendChild(row);
    div.appendChild(sub);
    div.appendChild(conf);

    wrap.appendChild(div);
  });
}

// ------------------------------
// Open Add/Edit Project Form
// ------------------------------
const projectModal = document.getElementById("projectModal");
let editingProjectId = null;

function newProjectObject() {
  return {
    id: Date.now(),
    name: "",
    location: "",
    plotsize: "",
    configs: "",
    blocks: "",
    floors: "",
    units: "",
    architect: "",
    desc: "",

    basicRate: "",
    basicUnit: "sqft",
    otherRate: "",
    otherUnit: "sqft",
    mdeposit: "",
    mdepositUnit: "sqft",
    runningM: "",
    runningUnit: "sqft",

    plcGarden: "",
    plcRoad: "",
    plcBoth: "",

    frcFrom: "",
    frcValue: "",

    approx: ""
  };
}

function inputField(id, placeholder, val = "") {
  return `<input id="${id}" class="field-input" placeholder="${placeholder}" value="${val||""}"/>`;
}

function dropdownField(id, val) {
  return `
    <select id="${id}" class="field-select">
      <option value="sqft" ${val==="sqft"?"selected":""}>per sq.ft</option>
      <option value="sqyd" ${val==="sqyd"?"selected":""}>per sq.yd</option>
      <option value="flat" ${val==="flat"?"selected":""}>flat rate</option>
    </select>
  `;
}

function openProjectForm(pid=null) {
  editingProjectId = pid;
  let P = pid ? state.projects.find(x => x.id === pid) : newProjectObject();

  projectModal.innerHTML = `
    <button class="modal-close" onclick="closeProjectModal()">✕</button>

      <div style="font-size:16px;font-weight:700;margin-bottom:8px;">
        ${pid ? "Edit Project" : "Add Project"}
      </div>

      ${inputField("pfName", "Project Name *", P.name)}
      ${inputField("pfLoc", "Location *", P.location)}
      ${inputField("pfPlot", "Plot Size", P.plotsize)}
      ${inputField("pfConfig", "Configurations & sizes", P.configs)}
      ${inputField("pfBlocks", "Total Blocks", P.blocks)}
      ${inputField("pfFloors", "Total Floors", P.floors)}
      ${inputField("pfUnits", "Total Units", P.units)}
      ${inputField("pfArch", "Architect (optional)", P.architect)}

      <textarea id="pfDesc" class="field-input" placeholder="Description (max 10 lines)">${P.desc||""}</textarea>

      <div style="margin-top:12px;font-size:15px;font-weight:700;">💰 Rates</div>

      ${inputField("pfBasic", "Basic Rate ₹", P.basicRate)}
      ${dropdownField("pfBasicU", P.basicUnit)}

      ${inputField("pfOther", "Other Expense ₹", P.otherRate)}
      ${dropdownField("pfOtherU", P.otherUnit)}

      ${inputField("pfMDep", "Maintenance Deposit ₹", P.mdeposit)}
      ${dropdownField("pfMDepU", P.mdepositUnit)}

      ${inputField("pfRunM", "Running Maintenance ₹", P.runningM)}
      ${dropdownField("pfRunMU", P.runningUnit)}

      <div style="margin-top:12px;font-size:15px;font-weight:700;">📍 PLC</div>
      ${inputField("pfPLCg", "Garden Facing", P.plcGarden)}
      ${inputField("pfPLCr", "Road Facing", P.plcRoad)}
      ${inputField("pfPLCb", "Both", P.plcBoth)}

      <div style="margin-top:12px;font-size:15px;font-weight:700;">⬆ Floor Rise (FRC)</div>
      ${inputField("pfFRCfrom", "From which floor", P.frcFrom)}
      ${inputField("pfFRCval", "How much apply", P.frcValue)}

      ${inputField("pfApprox", "Approx Box Price", P.approx)}

      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px;">
        <button class="mini-btn" onclick="projectModal.classList.add('hidden')">Cancel</button>
        <button class="primary-btn" onclick="saveProjectForm()">Save</button>
      </div>
    </div>
  `;
  projectModal.classList.remove("hidden");
}

function saveProjectForm() {
  const P = {
    id: editingProjectId || Date.now(),
    name: gv("pfName"),
    location: gv("pfLoc"),
    plotsize: gv("pfPlot"),
    configs: gv("pfConfig"),
    blocks: gv("pfBlocks"),
    floors: gv("pfFloors"),
    units: gv("pfUnits"),
    architect: gv("pfArch"),
    desc: gv("pfDesc"),

    basicRate: gv("pfBasic"),
    basicUnit: gv("pfBasicU"),
    otherRate: gv("pfOther"),
    otherUnit: gv("pfOtherU"),
    mdeposit: gv("pfMDep"),
    mdepositUnit: gv("pfMDepU"),
    runningM: gv("pfRunM"),
    runningUnit: gv("pfRunMU"),

    plcGarden: gv("pfPLCg"),
    plcRoad: gv("pfPLCr"),
    plcBoth: gv("pfPLCb"),

    frcFrom: gv("pfFRCfrom"),
    frcValue: gv("pfFRCval"),
    approx: gv("pfApprox")
  };

  if (!P.name || !P.location) return alert("Name & Location required");

  if (editingProjectId) {
    const i = state.projects.findIndex(x => x.id === editingProjectId);
    state.projects[i] = P;
  } else {
    state.projects.unshift(P);
  }

  saveProjects();
  renderProjects();
  projectModal.classList.add("hidden");
}

function gv(id) {
  return document.getElementById(id)?.value?.trim() || "";
}

// ------------------------------
// PROJECT DETAIL + SHARE CONFIRM
// ------------------------------
function openProjectDetail(pid) {
  const P = state.projects.find(x => x.id === pid);
  if (!P) return;

  projectModal.innerHTML = `
    <div class="modal-panel">
      <div style="font-size:17px;font-weight:800;margin-bottom:6px;">${P.name}</div>
      <div class="item-line">${P.location}</div>
      <div class="item-line">${P.plotsize}</div>
      <div class="item-line">${P.configs}</div>

      <div style="display:flex;gap:8px;margin:12px 0;">
        <button class="primary-btn" onclick="shareProject(${pid})">📤 Share</button>
        <button class="mini-btn" onclick="openProjectForm(${pid})">✏ Edit</button>
        <button class="mini-btn" onclick="deleteProject(${pid})">🗑 Delete</button>
      </div>

      <div class="item-line">Blocks/Floors: ${P.blocks} / ${P.floors}</div>
      <div class="item-line">Units: ${P.units}</div>
      ${P.architect ? `<div class="item-line">Architect: ${P.architect}</div>` : ""}

      <div style="margin-top:10px;font-weight:600;">Description</div>
      <div style="white-space:pre-line;font-size:12px;color:#94a3b8;margin-bottom:8px;">
        ${P.desc||""}
      </div>

      <div style="font-size:10px;color:#94a3b8;margin-top:18px;">
        ID: ${pid}
      </div>
    </div>
  `;
  projectModal.classList.remove("hidden");
}

function deleteProject(pid) {
  if (!confirm("Delete this project?")) return;
  state.projects = state.projects.filter(x => x.id !== pid);
  saveProjects();
  renderProjects();
  projectModal.classList.add("hidden");
}

// ------------------------------
// SHARE POPUP
// ------------------------------
function shareProject(pid) {
  if (!confirm("Include rate details?")) {
    sendProjectShare(pid, false);
  } else {
    sendProjectShare(pid, true);
  }
}

function sendProjectShare(pid, includeRate) {
  const P = state.projects.find(x => x.id === pid);
  if (!P) return;

  let msg = `
🏢 ${P.name}
📍 ${P.location}
📐 ${P.plotsize}
🛏️ ${P.configs}

🏗️ Blocks: ${P.blocks} | Floors: ${P.floors}
🔢 Units: ${P.units}
  `.trim();

  if (P.architect) msg += `\n🎨 Architect: ${P.architect}`;

  if (P.desc) {
    msg += `\n\n📝 Description:\n${P.desc}`;
  }

  if (includeRate) {
    msg += `\n\n💰 Rates:\n`;
    msg += P.basicRate ? `• Basic: ₹${P.basicRate} / ${P.basicUnit}\n` : "";
    msg += P.otherRate ? `• Other: ₹${P.otherRate} / ${P.otherUnit}\n` : "";
    msg += P.mdeposit ? `• Deposit: ₹${P.mdeposit} / ${P.mdepositUnit}\n` : "";
    msg += P.runningM ? `• Running: ₹${P.runningM} / ${P.runningUnit}\n` : "";

    msg += `\n🏞 PLC:\n`;
    msg += P.plcGarden ? `• Garden: ₹${P.plcGarden}\n` : "";
    msg += P.plcRoad ? `• Road: ₹${P.plcRoad}\n` : "";
    msg += P.plcBoth ? `• Both: ₹${P.plcBoth}\n` : "";

    msg += `\n⬆ FRC:\n`;
    msg += P.frcFrom ? `• From: ${P.frcFrom}\n` : "";
    msg += P.frcValue ? `• Value: ${P.frcValue}\n` : "";

    msg += P.approx ? `\n📦 Approx: ${P.approx}` : "";
  }

  const wa = "https://wa.me/?text=" + encodeURIComponent(msg);
  window.open(wa);
}

// HOOKS
document.getElementById("btnNewProject").onclick = () => openProjectForm(null);
document.getElementById("btnEmptyNewProject").onclick = () => openProjectForm(null);
document.getElementById("projectSearch").addEventListener("input", e => renderProjects(e.target.value));

// first render
renderProjects();
// ---------------------------------------------
// SETTINGS / PROFILE MODULE
// ---------------------------------------------
function applyProfile() {
  document.getElementById("businessName").value = state.profile.businessName;
  document.getElementById("ownerName").value = state.profile.ownerName;
  document.getElementById("ownerPhone").value = state.profile.phone;

  document.getElementById("sidebarPhone").textContent = state.profile.phone;
  document.getElementById("headerOwner").textContent = state.profile.ownerName;
  document.getElementById("headerPhone").textContent = state.profile.phone;
}

document.getElementById("btnSaveProfile").onclick = () => {
  state.profile.businessName = document.getElementById("businessName").value.trim();
  state.profile.ownerName = document.getElementById("ownerName").value.trim();
  state.profile.phone = document.getElementById("ownerPhone").value.trim();

  saveProfile();
  applyProfile();
  alert("Profile saved");
};

applyProfile();


// ---------------------------------------------
// WHEN USER CLICKS FOLLOWUPS TAB → REFRESH
// ---------------------------------------------
document.querySelector('[data-section="followups"]').addEventListener("click", () => {
  renderFollowupsTab();
});


// ---------------------------------------------
// PWA INSTALL PROMPT
// ---------------------------------------------
let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById("installBtn");
  btn.style.display = "block";
});

document.getElementById("installBtn").onclick = async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  document.getElementById("installBtn").style.display = "none";
};


// ---------------------------------------------
// FIRST LOAD TRIGGERS
// ---------------------------------------------
// ================================
// THEME SYSTEM – PRESETS + CUSTOM
// ================================

// Load saved theme if exists
const savedTheme = localStorage.getItem("ve_theme");
if (savedTheme) {
  document.documentElement.style.setProperty("--primary", savedTheme);
}

// Function to apply + save
function setTheme(color) {
  document.documentElement.style.setProperty("--primary", color);
  localStorage.setItem("ve_theme", color);
}

// Auto-inject Preset Colors + Picker into Settings tab
function injectThemeControls() {
  const parent = document.getElementById("tab-settings");
  if (!parent) return;

  // Title
  const title = document.createElement("div");
  title.style.marginTop = "14px";
  title.style.fontWeight = "700";
  title.textContent = "Theme Presets";
  parent.appendChild(title);

  // Preset Row
  const row = document.createElement("div");
  row.className = "palette-row";
  parent.appendChild(row);

  const presets = [
    "#3b82f6", // blue
    "#22c55e", // green
    "#ef4444", // red
    "#f59e0b", // gold
    "#a855f7"  // purple
  ];

  presets.forEach(c => {
    const btn = document.createElement("button");
    btn.className = "color-btn";
    btn.style.background = c;
    btn.onclick = () => setTheme(c);
    row.appendChild(btn);
  });

  // Custom picker title
  const ct = document.createElement("div");
  ct.style.marginTop = "14px";
  ct.style.fontWeight = "700";
  ct.textContent = "Custom Color";
  parent.appendChild(ct);

  // Custom HEX picker
  const input = document.createElement("input");
  input.type = "color";
  input.id = "customColor";
  input.value = savedTheme || "#3b82f6";
  input.oninput = e => setTheme(e.target.value);
  parent.appendChild(input);
}

// Run this after DOM sections exist
injectThemeControls();
renderLeads();
renderProjects();
