import { useState, useEffect, useMemo } from "react";
import {
  UserPlus,
  Search,
  Hash,
  Trash2,
  Users,
  LogOut,
  Plus,
  X,
  AlertTriangle,
  CheckCircle2,
  Info,
  RotateCcw,
} from "lucide-react";



const COLORS = {
  bg: "#F7F7F8",
  surface: "#FFFFFF",
  surfaceRaised: "#F1F1F3",
  border: "#E3E3E7",
  black: "#161616",
  textMuted: "#6E6E76",
  green: "#6FBE44",
  greenSoft: "rgba(111,190,68,0.10)",
  greenSoftStrong: "rgba(111,190,68,0.18)",
  danger: "#8C0E1F",
  dangerSoft: "rgba(140,14,31,0.08)",
  success: "#1E9E5A",
  successSoft: "rgba(30,158,90,0.08)",
  blue: "#1769FF",
  blueSoft: "rgba(23,105,255,0.08)",
};

const CONTACT_TYPES = [
  { value: "Family", label: "العائلة" },
  { value: "Personal", label: "شخصي" },
  { value: "Work", label: "العمل" },
  { value: "Other", label: "أخرى" },
];

const TYPE_STYLE = {
  Family: { bg: COLORS.greenSoft, fg: COLORS.green },
  Personal: { bg: COLORS.blueSoft, fg: COLORS.blue },
  Work: { bg: "rgba(22,22,22,0.07)", fg: COLORS.black },
  Other: { bg: "rgba(110,110,118,0.1)", fg: COLORS.textMuted },
};

const MENU = [
  { id: "all", label: "عرض جميع جهات الاتصال", icon: Users },
  { id: "add", label: "إضافة جهة اتصال", icon: UserPlus },
  { id: "searchName", label: "بحث بالاسم", icon: Search },
  { id: "searchNumber", label: "بحث بالرقم", icon: Hash },
  { id: "deleteName", label: "حذف بالاسم", icon: Trash2 },
  { id: "deleteNumber", label: "حذف برقم الهاتف", icon: Trash2 },
];

function levenshtein(a, b) {
  const m = a.length,
    n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function nameMatches(name, query) {
  const a = name.trim().toLowerCase();
  const b = query.trim().toLowerCase();
  if (!b) return false;
  if (a.includes(b)) return true;
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  return maxLen > 0 && dist <= Math.max(1, Math.floor(maxLen * 0.34));
}

function normalizeType(raw) {
  const trimmed = (raw || "").trim();
  const found = CONTACT_TYPES.find(
    (t) => t.value.toLowerCase() === trimmed.toLowerCase() || t.label === trimmed
  );
  if (found) return { type: found.value, adjusted: false };
  return { type: "Other", adjusted: true };
}

const NUMBER_PATTERN = /^[+\d][\d\s\-().]{5,}$/;

const SEED_CONTACTS = [
  { id: "seed-1", name: "محمد أبو شعبان", type: "Work", numbers: ["0599123456"] },
  { id: "seed-2", name: "Mohamed Khalil", type: "Family", numbers: ["0561112233", "0226789900"] },
  { id: "seed-3", name: "سارة العمري", type: "Personal", numbers: ["0567654321"] },
  { id: "seed-4", name: "Lina Hijazi", type: "Other", numbers: ["0599887766"] },
];

function LogoMark() {
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: COLORS.green }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 18C4 11.4 9.4 6 16 6"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M8 18C8 13.6 11.6 10 16 10"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.85"
        />
        <circle cx="16" cy="18" r="2.4" fill="#fff" />
      </svg>
    </div>
  );
}

function Badge({ type }) {
  const st = TYPE_STYLE[type] || TYPE_STYLE.Other;
  const label = CONTACT_TYPES.find((t) => t.value === type)?.label || type;
  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: st.bg, color: st.fg }}
    >
      {label}
    </span>
  );
}

function FeedbackBanner({ feedback, onClose }) {
  if (!feedback) return null;
  const map = {
    success: { bg: COLORS.successSoft, fg: COLORS.success, Icon: CheckCircle2 },
    error: { bg: COLORS.dangerSoft, fg: COLORS.danger, Icon: AlertTriangle },
    info: { bg: COLORS.blueSoft, fg: COLORS.blue, Icon: Info },
  };
  const { bg, fg, Icon } = map[feedback.type] || map.info;
  return (
    <div
      className="flex items-start gap-3 rounded-xl px-4 py-3 mb-6"
      style={{ background: bg, color: fg, border: `1px solid ${fg}26` }}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />
      <p className="text-sm leading-relaxed flex-1" style={{ fontFamily: "Cairo, sans-serif" }}>
        {feedback.text}
      </p>
      <button onClick={onClose} className="opacity-60 hover:opacity-100 shrink-0">
        <X size={16} />
      </button>
    </div>
  );
}

function SectionTitle({ children, sub }) {
  return (
    <div className="mb-6">
      <h2
        className="text-2xl font-bold"
        style={{ fontFamily: "Tajawal, sans-serif", color: COLORS.black }}
      >
        {children}
      </h2>
      {sub && (
        <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function TextField({ label, value, onChange, placeholder }) {
  return (
    <div className="mb-4">
      <label className="block text-sm mb-1.5 font-medium" style={{ color: COLORS.textMuted }}>
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg px-4 py-2.5 outline-none text-sm transition"
        style={{
          background: COLORS.surfaceRaised,
          border: `1px solid ${COLORS.border}`,
          color: COLORS.black,
          fontFamily: "Cairo, sans-serif",
        }}
      />
    </div>
  );
}

function PrimaryButton({ children, onClick, danger, full }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition active:scale-[0.98] ${
        full ? "w-full" : ""
      }`}
      style={{
        background: danger ? COLORS.danger : COLORS.green,
        color: "#FFFFFF",
        fontFamily: "Cairo, sans-serif",
      }}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-lg text-sm font-medium transition"
      style={{
        background: "transparent",
        border: `1px solid ${COLORS.border}`,
        color: COLORS.textMuted,
        fontFamily: "Cairo, sans-serif",
      }}
    >
      {children}
    </button>
  );
}

function ContactCard({ contact }) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-2"
      style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}
    >
      <div className="flex items-center justify-between gap-2">
        <h4
          className="font-semibold text-base"
          style={{ fontFamily: "Tajawal, sans-serif", color: COLORS.black }}
        >
          {contact.name}
        </h4>
        <Badge type={contact.type} />
      </div>
      <div className="flex flex-wrap gap-2 mt-1">
        {contact.numbers.map((n) => (
          <span
            key={n}
            className="text-xs px-2.5 py-1 rounded-md tracking-wide"
            style={{
              background: COLORS.surfaceRaised,
              color: COLORS.textMuted,
              fontFamily: "'IBM Plex Sans Arabic', sans-serif",
              direction: "ltr",
            }}
          >
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AddressBookApp() {
  const [contacts, setContacts] = useState(SEED_CONTACTS);
  const [action, setAction] = useState("all");
  const [feedback, setFeedback] = useState(null);
  const [letterFilter, setLetterFilter] = useState(null);

  const [addName, setAddName] = useState("");
  const [addType, setAddType] = useState("");
  const [addNumbers, setAddNumbers] = useState([""]);

  const [searchNameQuery, setSearchNameQuery] = useState("");
  const [searchNameResults, setSearchNameResults] = useState(null);

  const [searchNumberQuery, setSearchNumberQuery] = useState("");
  const [searchNumberResults, setSearchNumberResults] = useState(null);

  const [deleteNameQuery, setDeleteNameQuery] = useState("");
  const [confirmDeleteName, setConfirmDeleteName] = useState(false);

  const [deleteNumberQuery, setDeleteNumberQuery] = useState("");
  const [confirmDeleteNumber, setConfirmDeleteNumber] = useState(false);

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 5000);
    return () => clearTimeout(t);
  }, [feedback]);

  const totalNumbers = useMemo(
    () => contacts.reduce((sum, c) => sum + c.numbers.length, 0),
    [contacts]
  );

  const indexLetters = useMemo(() => {
    const set = new Set(contacts.map((c) => c.name.trim()[0]?.toUpperCase()).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ar"));
  }, [contacts]);

  const allSorted = useMemo(
    () => [...contacts].sort((a, b) => a.name.localeCompare(b.name, "ar")),
    [contacts]
  );

  const visibleAll = letterFilter
    ? allSorted.filter((c) => c.name.trim()[0]?.toUpperCase() === letterFilter)
    : allSorted;

  function goTo(id) {
    setAction(id);
    setFeedback(null);
    setConfirmDeleteName(false);
    setConfirmDeleteNumber(false);
  }

  function handleAddNumberField() {
    setAddNumbers((prev) => [...prev, ""]);
  }
  function handleRemoveNumberField(idx) {
    setAddNumbers((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)));
  }
  function handleChangeNumberField(idx, val) {
    setAddNumbers((prev) => prev.map((n, i) => (i === idx ? val : n)));
  }
  function handleAdd() {
    const name = addName.trim();
    if (!name) {
      setFeedback({ type: "error", text: "الرجاء إدخال اسم جهة الاتصال." });
      return;
    }
    const cleanNumbers = addNumbers.map((n) => n.trim()).filter(Boolean);
    if (cleanNumbers.length === 0) {
      setFeedback({ type: "error", text: "يجب إدخال رقم هاتف واحد على الأقل." });
      return;
    }
    const invalid = cleanNumbers.find((n) => !NUMBER_PATTERN.test(n));
    if (invalid) {
      setFeedback({
        type: "error",
        text: `الرقم "${invalid}" غير صالح. يجب أن يتكوّن من أرقام فقط (٧ خانات على الأقل).`,
      });
      return;
    }
    const dup = cleanNumbers.find((n, i) => cleanNumbers.indexOf(n) !== i);
    if (dup) {
      setFeedback({ type: "error", text: `الرقم "${dup}" مكرر داخل النموذج نفسه.` });
      return;
    }
    const existingNumbers = contacts.flatMap((c) => c.numbers);
    const reserved = cleanNumbers.find((n) => existingNumbers.includes(n));
    if (reserved) {
      setFeedback({
        type: "error",
        text: `تعذّر الحفظ: الرقم "${reserved}" مسجّل مسبقاً لجهة اتصال أخرى.`,
      });
      return;
    }
    const { type, adjusted } = normalizeType(addType);
    const newContact = { id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name, type, numbers: cleanNumbers };
    setContacts((prev) => [...prev, newContact]);
    setFeedback({
      type: "success",
      text: adjusted
        ? `تم حفظ "${name}" بنجاح. ملاحظة: النوع المُدخل غير معروف، يُسمح فقط بـ (العائلة، شخصي، العمل، أخرى) — تم تصنيفه تلقائياً كـ "أخرى".`
        : `تم حفظ "${name}" بنجاح.`,
    });
    setAddName("");
    setAddType("");
    setAddNumbers([""]);
  }

  function handleSearchName() {
    const q = searchNameQuery.trim();
    if (!q) {
      setFeedback({ type: "error", text: "أدخل نصاً للبحث عنه." });
      setSearchNameResults(null);
      return;
    }
    const results = contacts.filter((c) => nameMatches(c.name, q));
    setSearchNameResults(results);
    setFeedback(
      results.length
        ? { type: "success", text: `تم العثور على ${results.length} نتيجة مطابقة.` }
        : { type: "info", text: "Not found — لم يتم العثور على نتائج." }
    );
  }

  function handleSearchNumber() {
    const q = searchNumberQuery.trim();
    if (!q) {
      setFeedback({ type: "error", text: "أدخل رقماً للبحث عنه." });
      setSearchNumberResults(null);
      return;
    }
    const results = contacts.filter((c) => c.numbers.includes(q));
    setSearchNumberResults(results);
    setFeedback(
      results.length
        ? { type: "success", text: `تم العثور على ${results.length} نتيجة مطابقة.` }
        : { type: "info", text: "Not found — لم يتم العثور على نتيجة." }
    );
  }

  function handleDeleteName() {
    const q = deleteNameQuery.trim().toLowerCase();
    if (!q) {
      setFeedback({ type: "error", text: "أدخل الاسم المراد حذفه." });
      return;
    }
    const matches = contacts.filter((c) => c.name.trim().toLowerCase() === q);
    if (matches.length === 0) {
      setFeedback({ type: "info", text: "Not found — لم يتم العثور على جهة اتصال بهذا الاسم." });
      setConfirmDeleteName(false);
      return;
    }
    setContacts((prev) => prev.filter((c) => c.name.trim().toLowerCase() !== q));
    setFeedback({ type: "success", text: `تم حذف ${matches.length} جهة اتصال مطابقة بنجاح.` });
    setDeleteNameQuery("");
    setConfirmDeleteName(false);
  }

  function handleDeleteNumber() {
    const q = deleteNumberQuery.trim();
    if (!q) {
      setFeedback({ type: "error", text: "أدخل الرقم المراد حذفه." });
      return;
    }
    const match = contacts.find((c) => c.numbers.includes(q));
    if (!match) {
      setFeedback({ type: "info", text: "Not found — لم يتم العثور على رقم مطابق." });
      setConfirmDeleteNumber(false);
      return;
    }
    setContacts((prev) => prev.filter((c) => c.id !== match.id));
    setFeedback({ type: "success", text: `تم حذف جهة الاتصال "${match.name}" بنجاح.` });
    setDeleteNumberQuery("");
    setConfirmDeleteNumber(false);
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full flex flex-col"
      style={{ background: COLORS.bg, color: COLORS.black }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@500;700;800&family=Cairo:wght@400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: ${COLORS.textMuted}; opacity: 0.7; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 8px; }
      `}</style>

      <header
        className="flex items-center justify-between px-6 sm:px-10 py-5 shrink-0"
        style={{ borderBottom: `3px solid ${COLORS.green}`, background: COLORS.surface }}
      >
        <div className="flex items-center gap-3">
          <LogoMark />
          <div>
            <h1
              className="text-xl font-extrabold"
              style={{ fontFamily: "Tajawal, sans-serif", color: COLORS.green }}
            >
              جوال <span style={{ color: COLORS.black }}>| دفتر العناوين</span>
            </h1>
            <p className="text-xs" style={{ color: COLORS.textMuted }}>
              Jawwal Address Book
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-sm" style={{ color: COLORS.textMuted }}>
          <span>{contacts.length} جهة اتصال</span>
          <span style={{ color: COLORS.border }}>|</span>
          <span>{totalNumbers} رقم محفوظ</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <nav
          className="w-16 sm:w-60 shrink-0 flex flex-col gap-1 p-2 sm:p-4 overflow-y-auto"
          style={{ background: COLORS.surface, borderLeft: `1px solid ${COLORS.border}` }}
        >
          {MENU.map((item) => {
            const Icon = item.icon;
            const isActive = action === item.id;
            return (
              <button
                key={item.id}
                onClick={() => goTo(item.id)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition text-right"
                style={{
                  background: isActive ? COLORS.greenSoft : "transparent",
                  color: isActive ? COLORS.green : COLORS.textMuted,
                  fontFamily: "Cairo, sans-serif",
                }}
              >
                <Icon size={18} className="shrink-0" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
          <div className="flex-1" />
          <button
            onClick={() => goTo("exit")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition text-right"
            style={{
              background: action === "exit" ? COLORS.dangerSoft : "transparent",
              color: action === "exit" ? COLORS.danger : COLORS.textMuted,
              fontFamily: "Cairo, sans-serif",
            }}
          >
            <LogOut size={18} className="shrink-0" />
            <span className="hidden sm:inline">خروج</span>
          </button>
        </nav>

        <main className="flex-1 overflow-y-auto p-6 sm:p-10">
          <FeedbackBanner feedback={feedback} onClose={() => setFeedback(null)} />

          {action === "all" && (
            <div>
              <SectionTitle sub="جميع جهات الاتصال المحفوظة، مرتّبة أبجدياً.">
                جهات الاتصال {letterFilter ? `— حرف ${letterFilter}` : ""}
              </SectionTitle>
              {letterFilter && (
                <div className="mb-4">
                  <GhostButton onClick={() => setLetterFilter(null)}>إزالة التصفية بالحرف</GhostButton>
                </div>
              )}
              {visibleAll.length === 0 ? (
                <p className="text-sm" style={{ color: COLORS.textMuted }}>
                  لا توجد جهات اتصال لعرضها. استخدم «إضافة جهة اتصال» من القائمة.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {visibleAll.map((c) => (
                    <ContactCard key={c.id} contact={c} />
                  ))}
                </div>
              )}
            </div>
          )}

          {action === "add" && (
            <div className="max-w-md">
              <SectionTitle sub="أدخل الاسم والنوع، ويمكن إضافة أكثر من رقم لنفس جهة الاتصال.">
                إضافة جهة اتصال
              </SectionTitle>
              <TextField label="الاسم" value={addName} onChange={setAddName} placeholder="مثال: محمد أحمد" />

              <div className="mb-4">
                <label className="block text-sm mb-1.5 font-medium" style={{ color: COLORS.textMuted }}>
                  النوع
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {CONTACT_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setAddType(t.value)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition"
                      style={{
                        background: addType === t.value ? COLORS.greenSoftStrong : COLORS.surfaceRaised,
                        color: addType === t.value ? COLORS.green : COLORS.textMuted,
                        border: `1px solid ${COLORS.border}`,
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <input
                  value={addType}
                  onChange={(e) => setAddType(e.target.value)}
                  placeholder="أو اكتب النوع يدوياً"
                  className="w-full rounded-lg px-4 py-2.5 outline-none text-sm"
                  style={{
                    background: COLORS.surfaceRaised,
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.black,
                    fontFamily: "Cairo, sans-serif",
                  }}
                />
                <p className="text-xs mt-1.5" style={{ color: COLORS.textMuted }}>
                  أي قيمة غير (العائلة، شخصي، العمل، أخرى) ستُصنَّف تلقائياً كـ "أخرى".
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm mb-1.5 font-medium" style={{ color: COLORS.textMuted }}>
                  أرقام الهاتف
                </label>
                <div className="flex flex-col gap-2">
                  {addNumbers.map((num, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        value={num}
                        onChange={(e) => handleChangeNumberField(idx, e.target.value)}
                        placeholder="0599xxxxxx"
                        dir="ltr"
                        className="flex-1 rounded-lg px-4 py-2.5 outline-none text-sm"
                        style={{
                          background: COLORS.surfaceRaised,
                          border: `1px solid ${COLORS.border}`,
                          color: COLORS.black,
                          fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                        }}
                      />
                      {addNumbers.length > 1 && (
                        <button
                          onClick={() => handleRemoveNumberField(idx)}
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: COLORS.dangerSoft, color: COLORS.danger }}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleAddNumberField}
                  className="flex items-center gap-1.5 text-xs mt-2 font-semibold"
                  style={{ color: COLORS.green }}
                >
                  <Plus size={14} /> إضافة رقم آخر
                </button>
              </div>

              <PrimaryButton onClick={handleAdd} full>
                حفظ جهة الاتصال
              </PrimaryButton>
            </div>
          )}

          {action === "searchName" && (
            <div className="max-w-md">
              <SectionTitle sub="يبحث عن أي اسم يحتوي على النص المدخل أو يشبهه (مثل: محمد / محمّد).">
                بحث بالاسم
              </SectionTitle>
              <TextField
                label="اسم جهة الاتصال"
                value={searchNameQuery}
                onChange={setSearchNameQuery}
                placeholder="اكتب الاسم أو جزء منه"
              />
              <PrimaryButton onClick={handleSearchName}>بحث</PrimaryButton>

              {searchNameResults !== null && (
                <div className="mt-6 flex flex-col gap-3">
                  {searchNameResults.map((c) => (
                    <ContactCard key={c.id} contact={c} />
                  ))}
                </div>
              )}
            </div>
          )}

          {action === "searchNumber" && (
            <div className="max-w-md">
              <SectionTitle sub="يبحث عن تطابق كامل للرقم المدخل.">بحث بالرقم</SectionTitle>
              <TextField
                label="رقم الهاتف"
                value={searchNumberQuery}
                onChange={setSearchNumberQuery}
                placeholder="0599xxxxxx"
              />
              <PrimaryButton onClick={handleSearchNumber}>بحث</PrimaryButton>

              {searchNumberResults !== null && (
                <div className="mt-6 flex flex-col gap-3">
                  {searchNumberResults.map((c) => (
                    <ContactCard key={c.id} contact={c} />
                  ))}
                </div>
              )}
            </div>
          )}

          {action === "deleteName" && (
            <div className="max-w-md">
              <SectionTitle sub="يحذف كل جهات الاتصال التي يتطابق اسمها بالكامل مع النص المدخل.">
                حذف بالاسم
              </SectionTitle>
              <TextField
                label="الاسم"
                value={deleteNameQuery}
                onChange={setDeleteNameQuery}
                placeholder="اكتب الاسم كاملاً"
              />
              {!confirmDeleteName ? (
                <PrimaryButton danger onClick={() => setConfirmDeleteName(true)}>
                  حذف
                </PrimaryButton>
              ) : (
                <div
                  className="rounded-lg p-4 flex items-center justify-between gap-3"
                  style={{ background: COLORS.dangerSoft }}
                >
                  <span className="text-sm" style={{ color: COLORS.danger }}>
                    تأكيد حذف جميع جهات الاتصال بهذا الاسم؟
                  </span>
                  <div className="flex gap-2 shrink-0">
                    <PrimaryButton danger onClick={handleDeleteName}>
                      تأكيد
                    </PrimaryButton>
                    <GhostButton onClick={() => setConfirmDeleteName(false)}>إلغاء</GhostButton>
                  </div>
                </div>
              )}
            </div>
          )}

          {action === "deleteNumber" && (
            <div className="max-w-md">
              <SectionTitle sub="يحذف جهة الاتصال التي تحتوي على هذا الرقم بالضبط.">
                حذف برقم الهاتف
              </SectionTitle>
              <TextField
                label="رقم الهاتف"
                value={deleteNumberQuery}
                onChange={setDeleteNumberQuery}
                placeholder="0599xxxxxx"
              />
              {!confirmDeleteNumber ? (
                <PrimaryButton danger onClick={() => setConfirmDeleteNumber(true)}>
                  حذف
                </PrimaryButton>
              ) : (
                <div
                  className="rounded-lg p-4 flex items-center justify-between gap-3"
                  style={{ background: COLORS.dangerSoft }}
                >
                  <span className="text-sm" style={{ color: COLORS.danger }}>
                    تأكيد حذف جهة الاتصال المرتبطة بهذا الرقم؟
                  </span>
                  <div className="flex gap-2 shrink-0">
                    <PrimaryButton danger onClick={handleDeleteNumber}>
                      تأكيد
                    </PrimaryButton>
                    <GhostButton onClick={() => setConfirmDeleteNumber(false)}>إلغاء</GhostButton>
                  </div>
                </div>
              )}
            </div>
          )}

          {action === "exit" && (
            <div className="max-w-md flex flex-col items-start gap-4">
              <SectionTitle sub="شكراً لاستخدامك دفتر العناوين.">إنهاء الجلسة</SectionTitle>
              <p className="text-sm" style={{ color: COLORS.textMuted }}>
                تم حفظ {contacts.length} جهة اتصال بإجمالي {totalNumbers} رقم هاتف خلال هذه الجلسة.
              </p>
              <GhostButton onClick={() => goTo("all")}>
                <span className="flex items-center gap-2">
                  <RotateCcw size={14} /> الرجوع إلى القائمة
                </span>
              </GhostButton>
            </div>
          )}
        </main>

        <aside
          className="w-12 sm:w-14 shrink-0 flex flex-col items-center py-4 gap-1 overflow-y-auto"
          style={{ background: COLORS.surface, borderRight: `1px solid ${COLORS.border}` }}
        >
          {indexLetters.length === 0 ? (
            <span className="text-[10px] text-center px-1" style={{ color: COLORS.textMuted }}>
              الفهرس
            </span>
          ) : (
            indexLetters.map((letter) => (
              <button
                key={letter}
                onClick={() => {
                  setAction("all");
                  setLetterFilter(letter === letterFilter ? null : letter);
                }}
                className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold transition"
                style={{
                  background: letterFilter === letter ? COLORS.green : "transparent",
                  color: letterFilter === letter ? "#FFFFFF" : COLORS.green,
                  fontFamily: "Tajawal, sans-serif",
                }}
              >
                {letter}
              </button>
            ))
          )}
        </aside>
      </div>
    </div>
  );
}
