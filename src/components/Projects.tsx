import type { CollectionEntry } from "astro:content";
import { createEffect, createSignal, For } from "solid-js";
import ArrowCard from "@components/ArrowCard";
import { cn } from "@lib/utils";

type Props = {
  tags: string[];
  data: CollectionEntry<"projects">[];
};

export default function Projects({ data, tags }: Props) {
  const [filter, setFilter] = createSignal(new Set<string>());
  const [projects, setProjects] = createSignal<CollectionEntry<"projects">[]>(
    [],
  );

  createEffect(() => {
    setProjects(
      data.filter((entry) =>
        Array.from(filter()).every((value) =>
          entry.data.tags.some(
            (tag: string) => tag.toLowerCase() === String(value).toLowerCase(),
          ),
        ),
      ),
    );
  });

  function toggleTag(tag: string) {
    setFilter(
      (prev) =>
        new Set(
          prev.has(tag) ? [...prev].filter((t) => t !== tag) : [...prev, tag],
        ),
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <div className="col-span-3 sm:col-span-1">
        <div className="sticky top-24">
          <div className="mb-2 text-sm font-semibold text-black uppercase dark:text-white">
            Filter
          </div>
          <ul className="flex flex-wrap gap-1.5 sm:flex-col">
            <For each={tags}>
              {(tag) => (
                <li>
                  <button
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "w-full rounded-sm px-2 py-1",
                      "overflow-hidden text-ellipsis whitespace-nowrap",
                      "flex items-center gap-2",
                      "bg-black/5 dark:bg-white/10",
                      "hover:bg-black/10 dark:hover:bg-white/15",
                      "transition-colors duration-300 ease-in-out",
                      filter().has(tag) && "text-black dark:text-white",
                    )}
                  >
                    <svg
                      className={cn(
                        "size-5 fill-black/50 dark:fill-white/50",
                        "transition-colors duration-300 ease-in-out",
                        filter().has(tag) && "fill-black dark:fill-white",
                      )}
                    >
                      <use
                        href={`/ui.svg#square`}
                        className={cn(!filter().has(tag) ? "block" : "hidden")}
                      />
                      <use
                        href={`/ui.svg#square-check`}
                        className={cn(filter().has(tag) ? "block" : "hidden")}
                      />
                    </svg>
                    {tag}
                  </button>
                </li>
              )}
            </For>
          </ul>
        </div>
      </div>
      <div className="col-span-3 sm:col-span-2">
        <div className="flex flex-col">
          <div className="mb-2 text-sm uppercase">
            SHOWING {projects().length} OF {data.length} PROJECTS
          </div>
          <ul className="flex flex-col gap-3">
            {projects().map((project) => (
              <li>
                <ArrowCard entry={project} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
