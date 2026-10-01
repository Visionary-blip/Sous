import { useState, type FormEvent } from "react";
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

function AddProfile({ onAdd }: { onAdd: Api["add"] }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    onAdd(name, phone);
    setName("");
    setPhone("");
  }

  return (
    <form className="set-block set-add" onSubmit={submit}>
      <h3>Add a profile</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" aria-label="Name" required />
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number (optional)" aria-label="Phone number" type="tel" />
      <small>The number is only a label on this device. No text is sent and nothing is checked.</small>
      <button type="submit">Add and switch</button>
    </form>
  );
}

function DietPicker({ api }: { api: Api }) {
  return (
    <div className="set-block">
      <h3>Diet · {api.active.name}</h3>
      {DIET_IDS.map((d) => (
        <label key={d} className="set-diet">
          <input type="checkbox" checked={api.active.diets.includes(d)} onChange={() => api.toggleDiet(d)} />
          <span>
            {DIET_RULES[d].label}
            {DIET_RULES[d].note && <small>{DIET_RULES[d].note}</small>}
          </span>
        </label>
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
          <DietPicker api={api} />
          <AddProfile onAdd={api.add} />
        </div>
      )}
    </div>
  );
}
