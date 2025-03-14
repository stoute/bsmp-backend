import type { CollectionEntry } from "astro:content";
import { useState, useEffect } from "react";
import ArrowCard from "@components/ArrowCard";
import { cn } from "@lib/utils";

type Props = {
  tags: string[];
  data: CollectionEntry<"blog">[];
};

export default function Blog({ data, tags }: Props) {
  const [filter, setFilter] = useState(new Set<string>());
  const [posts, setPosts] = useState<CollectionEntry<"blog">[]>(data);

  useEffect(() => {
    setPosts(
      data.filter((entry) =>
        Array.from(filter).every((value) =>
          entry.data.tags.some(
            (tag: string) => tag.toLowerCase() === String(value).toLowerCase(),
          ),
        ),
      ),
    );
  }, [filter, data]);

  const toggleTag = (tag: string) => {
    setFilter((prev) => {
      const newSet = new Set(prev);
      if (prev.has(tag)) {
        newSet.delete(tag);
      } else {
        newSet.add(tag);
      }
      return newSet;
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <div className="col-span-3 sm:col-span-1">
        <div className="sticky top-24">
          <div className="mb-2 text-sm font-semibold text-black uppercase dark:text-white">
            Filter
          </div>
          <ul className="flex flex-wrap gap-1.5 sm:flex-col">
            {tags.map((tag) => (
              <li key={tag}>
                <button
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "w-full rounded-sm px-2 py-1",
                    "overflow-hidden text-ellipsis whitespace-nowrap",
                    "flex items-center gap-2",
                    "bg-black/5 dark:bg-white/10",
                    "hover:bg-black/10 dark:hover:bg-white/15",
                    "transition-colors duration-300 ease-in-out",
                    filter.has(tag) && "text-black dark:text-white",
                  )}
                >
                  <svg
                    className={cn(
                      "size-5 fill-black/50 dark:fill-white/50",
                      "transition-colors duration-300 ease-in-out",
                      filter.has(tag) && "fill-black dark:fill-white",
                    )}
                  >
                    <use
                      href={`/ui.svg#square`}
                      className={cn(!filter.has(tag) ? "block" : "hidden")}
                    />
                    <use
                      href={`/ui.svg#square-check`}
                      className={cn(filter.has(tag) ? "block" : "hidden")}
                    />
                  </svg>
                  {tag}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="col-span-3 sm:col-span-2">
        <div className="flex flex-col">
          <div className="mb-2 text-sm uppercase">
            SHOWING {posts.length} OF {data.length} POSTS
          </div>
          <ul className="flex flex-col gap-3">
            {posts.map((post) => (
              <li key={post.slug}>
                <ArrowCard entry={post} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
