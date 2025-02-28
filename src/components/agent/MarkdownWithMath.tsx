import { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';

type MarkdownWithMathProps = {
  content: string;
};

const MarkdownWithMath: FC<MarkdownWithMathProps> = ({ content }) => {
  // erase the \n inside the LaTex markdwon from llm, but keep the \n outside of the formula
  let processedMarkdown = content.replace(/\\\[([\s\S]*?)\\\]/g, (match, p1) => {
    return `\\[${p1.replace(/\n/g, '')}\\]`;
  });
  // change \\(...\\) to $ ... $, and \\[...\\] to $$ ... $$
  processedMarkdown = processedMarkdown
  .replace(/\\\((.*?)\\\)/g, '$$$1$$') // inline formula, add $ to ensure it is correctly parsed
  .replace(/\\\[(.*?)\\\]/g, '$$$$$1$$$$'); // block formula, add $$ to ensure it is correctly parsed

  try {
    return (
      <div style={{ fontFamily: 'Arial', lineHeight: 2 }}>
        <ReactMarkdown
          remarkPlugins={[
            remarkMath,
          ]}
          rehypePlugins={[
            remarkRehype, 
            rehypeKatex, 
            rehypeStringify,
          ]}
        >
          {processedMarkdown}
        </ReactMarkdown>
      </div>
    );
  } catch (error: any) {
    return <div>Render error: {error.message}</div>;
  }
};

export default MarkdownWithMath;