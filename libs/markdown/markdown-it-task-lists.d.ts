declare module "markdown-it-task-lists" {
  import type MarkdownIt from "markdown-it";
  function taskLists(md: MarkdownIt, options?: { enabled?: boolean }): void;
  export = taskLists;
}
