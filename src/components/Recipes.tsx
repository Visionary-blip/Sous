import { useState } from "react";
import { Browse } from "@/components/browse";
import { ClassicsList } from "@/components/classics-list";
import type { RecipeMatch } from "@/lib/match";
import { sortByTitle } from "@/lib/recipe-filters";
import type { useClassics } from "@/lib/use-classics";

type Section = "browse" | "classics" | "wishlist";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "browse", label: "Browse" },
  { id: "classics", label: "Classics" },
  { id: "wishlist", label: "Wishlist" },
];

interface Props {
  matches: RecipeMatch[];
  classics: ReturnType<typeof useClassics>;
  onOpen: (id: string) => void;
}

export function Recipes({ matches, classics: c, onOpen }: Props) {
  const [section, setSection] = useState<Section>("browse");
  const { classics, like, wish } = c;
  const pick = (ids: string[]) => sortByTitle(ids.flatMap((id) => matches.find((m) => m.recipe.id === id) ?? []));

  return (
    <section>
      <div className="filters" role="tablist" aria-label="Recipe sections">
        {SECTIONS.map((s) => (
          <button key={s.id} role="tab" aria-selected={section === s.id} className={`pill ${section === s.id ? "on" : ""}`} onClick={() => setSection(s.id)}>
            {s.label}
          </button>
        ))}
      </div>
      {section === "browse" && <Browse matches={matches} onOpen={onOpen} />}
      {section === "classics" && <ClassicsList kind="liked" matches={pick(classics.liked)} onOpen={onOpen} onLike={like} onRemove={like} />}
      {section === "wishlist" && <ClassicsList kind="wish" matches={pick(classics.wish)} onOpen={onOpen} onLike={like} onRemove={wish} />}
    </section>
  );
}
