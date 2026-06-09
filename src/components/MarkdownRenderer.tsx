import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

type MarkdownRendererProps = {
  content: string;
  className?: string;
};

export function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  return (
    <article
      className={[
        "prose prose-neutral dark:prose-invert max-w-none",
        "prose-headings:scroll-mt-20",
        "prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:p-4",
        "prose-code:rounded prose-code:px-1 prose-code:py-0.5",
        "prose-table:block prose-table:overflow-x-auto",
        className,
      ].join(" ")}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {content || ""}
      </ReactMarkdown>
    </article>
  );
}
