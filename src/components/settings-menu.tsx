import { useState, type CSSProperties, type FormEvent } from "react";
import { bubbleColor } from "@/lib/bubble-colors";
import type { UnitSystem } from "@/lib/convert-units";
import { DIET_IDS, DIET_RULES } from "@/lib/diets";
import { DEFAULT_PROFILE_ID } from "@/lib/profiles";
import type { useProfiles } from "@/lib/use-profiles";

type Api = ReturnType<typeof useProfiles>;

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}

function ProfileList({ api }: { api: Api }) {
  const [confirming, setConfirming] = useState(false);
  const removable = api.active.id !== DEFAULT_PROFILE_ID;
  return (
    <div className="set-block">
      <h3>Profile</h3>
      <ul className="set-profiles">
        {api.profiles.map((p) => (
          <li key={p.id}>
            <button className={p.id === api.active.id ? "on" : ""} aria-pressed={p.id === api.active.id} onClick={() => { setConfirming(false); api.switchTo(p.id); }}>
              {p.name}
              {p.username && <small> @{p.username}</small>}
              {p.phone && <small> · {p.phone}</small>}
            </button>
          </li>
        ))}
      </ul>
      {removable && !confirming && <button className="set-link" onClick={() => setConfirming(true)}>Remove {api.active.name}</button>}
      {removable && confirming && (
        <p className="set-confirm">
          This deletes {api.active.name}'s fridge, cabinet and Classics. <button onClick={() => { setConfirming(false); api.remove(api.active.id); }}>Delete</button>{" "}
          <button onClick={() => setConfirming(false)}>Keep</button>
        </p>
      )}
    </div>
  );
}

function HomeSettings({ api }: { api: Api }) {
  return (
    <div className="set-block">
      <h3>Household · {api.active.name}</h3>
      <label className="set-field">
        <span>People at home</span>
        <input type="number" min={1} max={12} inputMode="numeric" value={api.active.household ?? ""} onChange={(e) => api.setHousehold(e.target.value)} placeholder="Not set" />
      </label>
      <label className="set-field">
        <span>Measures</span>
        <select value={api.active.units ?? ""} onChange={(e) => api.setUnits((e.target.value || undefined) as UnitSystem | undefined)}>
          <option value="">As the recipe wrote them</option>
          <option value="us">US (cups, oz, °F)</option>
          <option value="metric">Metric (ml, g, °C)</option>
        </select>
      </label>
      <small>Dishes that serve fewer people than your household are marked. Measures change the amounts and oven temperatures in saved recipe copies; your Fridge is left as you typed it.</small>
    </div>
  );
}

function OrganicToggle({ api }: { api: Api }) {
  const on = Boolean(api.active.organic);
  return (
    <div className="set-block">
      <button type="button" className={`organic-btn ${on ? "on" : ""}`} aria-pressed={on} onClick={api.toggleOrganic}>
        Organic
      </button>
      <small>{on ? "On: Where to buy searches for organic and lists organic-focused stores first, in green." : "Prefer organic when looking for where to buy missing items."}</small>
    </div>
  );
}

function AvoidList({ api }: { api: Api }) {
  const [text, setText] = useState("");
  const avoided = api.active.avoid ?? [];

  function add(e: FormEvent) {
    e.preventDefault();
    api.addAvoid(text);
    setText("");
  }

  return (
    <form className="set-block" onSubmit={add}>
      <h3>Foods to avoid · {api.active.name}</h3>
      <div className="set-row">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. peanut, cilantro" aria-label="Food to avoid" />
        <button type="submit">Add</button>
      </div>
      {avoided.length > 0 && (
        <ul className="set-profiles">
          {avoided.map((w) => (
            <li key={w}>
              <button type="button" onClick={() => api.removeAvoid(w)} aria-label={`Stop avoiding ${w}`}>{w} ✕</button>
            </li>
          ))}
        </ul>
      )}
      <small>Any dish with that word in an ingredient is hidden, optional ingredients included.</small>
    </form>
  );
}

function UsernameField({ api }: { api: Api }) {
  const [text, setText] = useState(api.active.username ?? "");
  const [message, setMessage] = useState<string | null>(null);

  function save(e: FormEvent) {
    e.preventDefault();
    const problem = api.setUsername(text);
    setMessage(problem ?? "Saved.");
  }

  return (
    <form className="set-block" onSubmit={save}>
      <h3>Username · {api.active.name}</h3>
      <div className="set-row">
        <input value={text} onChange={(e) => { setText(e.target.value); setMessage(null); }} placeholder="@username" aria-label="Username" autoCapitalize="none" autoCorrect="off" />
        <button type="submit">Save</button>
      </div>
      {message && <small role="status">{message}</small>}
    </form>
  );
}

function AddProfile({ onAdd }: { onAdd: Api["add"] }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    const problem = onAdd(name, phone, username);
    setError(problem);
    if (problem) return;
    setName("");
    setUsername("");
    setPhone("");
  }

  return (
    <form className="set-block set-add" onSubmit={submit}>
      <h3>Add a profile</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" aria-label="Name" required />
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="@username (optional)" aria-label="New profile username" autoCapitalize="none" autoCorrect="off" />
      {error && <small role="alert">{error}</small>}
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number (optional)" aria-label="Phone number" type="tel" />
      <small>The number is only a label on this device. No text is sent and nothing is checked.</small>
      <button type="submit">Add and switch</button>
    </form>
  );
}

function DietPicker({ api }: { api: Api }) {
  const chosen = DIET_IDS.filter((d) => api.active.diets.includes(d) && DIET_RULES[d].note);
  return (
    <div className="set-block">
      <h3>Diet · {api.active.name}</h3>
      <div className="bubbles">
        {DIET_IDS.map((d) => {
          const on = api.active.diets.includes(d);
          return (
            <button key={d} type="button" className={`bubble ${on ? "on" : ""}`} style={{ "--bub": bubbleColor(d) } as CSSProperties} aria-pressed={on} onClick={() => api.toggleDiet(d)}>
              {DIET_RULES[d].label}
            </button>
          );
        })}
      </div>
      {chosen.map((d) => (
        <small key={d}>
          {DIET_RULES[d].label}: {DIET_RULES[d].note}
        </small>
      ))}
      <small>Dishes with an ingredient that breaks a chosen diet are hidden. Sous matches by ingredient name, so check anything important.</small>
    </div>
  );
}

/** Gear at the top left of Home: switch profile, add one, and set the diet that filters recipes. */
export function SettingsMenu({ api }: { api: Api }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="settings">
      <button className="settings-btn" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Settings">
        <GearIcon />
      </button>
      {open && (
        <div className="settings-panel" role="dialog" aria-label="Settings">
          <ProfileList api={api} />
          <UsernameField key={api.active.id} api={api} />
          <OrganicToggle api={api} />
          <DietPicker api={api} />
          <AvoidList api={api} />
          <HomeSettings api={api} />
          <AddProfile onAdd={api.add} />
        </div>
      )}
    </div>
  );
}
