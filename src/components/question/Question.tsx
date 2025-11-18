import { CodeHighlight } from "@mantine/code-highlight";
import { Rating } from "@mantine/core";
import { TypeScriptIcon } from '@mantinex/dev-icons';

const tsxCode = `
function Button() {
  return <button>Click me</button>;
}
`;
interface CodeBlock {
    code: string;
    language: string;
}
interface QuestionProps {
    title: string;
    content: string;
    codeBlock?: CodeBlock;
    rating?: number;
    onRate?: (value: number) => void;
}

export const Question = (
    { title, content, codeBlock, rating = 0, onRate }: QuestionProps
) => {
    const tsIcon = <TypeScriptIcon size={14} />;
    return (
        <div className="question-block holo-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}><div className="question-title">{title}</div>
                        <Rating value={rating} onChange={(v) => onRate && onRate(v ?? 0)} color="violet" /></div>
                    <div className="question-description">{content}</div>
                    {codeBlock ? <CodeHighlight code={codeBlock?.code ?? ""}
                        language={codeBlock?.language}
                        radius="md"
                        copyLabel="Copy code"
                        copiedLabel="Copied!" /> : null}
                </div>

            </div>
        </div>
    );
};
