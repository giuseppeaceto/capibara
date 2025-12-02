import Link from "next/link";

type ContentListItemData = {
  title: string;
  date: string;
  summary: string;
  tag: string;
  locked?: boolean;
  slug?: string;
  type?: "video" | "podcast" | "newsletter" | "article";
};

export default function ContentListItem({
  item,
}: {
  item: ContentListItemData;
}) {
  const getHref = () => {
    if (!item.slug || !item.type) return "#";
    if (item.type === "article") return `/articoli/${item.slug}`;
    return `/${item.type}/${item.slug}`;
  };

  const href = getHref();

  const Row = (
    <article className="content-list-item">
      <div className="flex flex-col gap-1.5">
        <div className="content-list-tag">
          <span>{item.tag}</span>
          {item.locked && (
            <span className="locked-badge">
              Abbonati
            </span>
          )}
        </div>
        <div className="content-list-title">{item.title}</div>
        {item.summary && (
          <p className="content-list-summary">
            {item.summary}
          </p>
        )}
      </div>
      <div className="content-list-date">
        {item.date}
      </div>
    </article>
  );

  if (item.slug && item.type) {
    return (
      <Link href={href} className="block">
        {Row}
      </Link>
    );
  }

  return Row;
}
