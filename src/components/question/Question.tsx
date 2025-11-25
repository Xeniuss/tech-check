import { CodeHighlight } from "@mantine/code-highlight";
import { Card, Rating, Title, Text } from "@mantine/core";

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
    return (
        <Card shadow="sm" padding="sm" radius="lg">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                <Title order={5}>{title}</Title >
                <Rating value={rating} onChange={(v) => onRate && onRate(v ?? 0)} color="violet" />
            </div>
            <Text size="md">{content}</Text>

            {codeBlock ? <CodeHighlight code={codeBlock?.code ?? ""}
                language={codeBlock?.language}
                radius="lg"
                copyLabel="Copy code"
                copiedLabel="Copied!" /> : null}
        </Card>
    );
};
