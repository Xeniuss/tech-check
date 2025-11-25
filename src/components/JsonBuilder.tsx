import { useState } from 'react';
import { Button, Textarea, TextInput, Group, Stack, Title, Card } from '@mantine/core';

type BuilderItem = {
    title: string;
    desc: string;
    codeLines: string; // multiline textarea, will be exported as array
    language?: string;
};

export const JsonBuilder = () => {
    const [items, setItems] = useState<BuilderItem[]>([
        { title: 'New Question', desc: 'Description...', codeLines: '// code here', language: 'tsx' },
    ]);
    const [output, setOutput] = useState('');

    const updateItem = (index: number, patch: Partial<BuilderItem>) => {
        setItems((s) => s.map((it, i) => (i === index ? { ...it, ...patch } : it)));
    };

    const addItem = () => setItems((s) => [...s, { title: 'New Question', desc: '', codeLines: '', language: 'tsx' }]);
    const removeItem = (index: number) => setItems((s) => s.filter((_, i) => i !== index));

    const buildJson = () => {
        const arr = items.map((it) => ({
            title: it.title,
            desc: it.desc,
            codeblock: {
                language: it.language || 'tsx',
                code: it.codeLines.split('\n'),
            },
        }));
        const json = JSON.stringify(arr, null, 2);
        setOutput(json);
        return json;
    };

    const copyToClipboard = async () => {
        const json = output || buildJson();
        await navigator.clipboard.writeText(json);
    };

    const downloadJson = () => {
        const json = output || buildJson();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'questions.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    return (
        <Stack>
            <Title order={3}>JSON Builder</Title>
            {items.map((it, idx) => (
                <Card key={idx} shadow="sm" padding="sm" className="holo-card">
                    <Stack>
                        <Group>
                            <TextInput value={it.title} onChange={(e) => updateItem(idx, { title: e.currentTarget.value })} style={{ flex: 1 }} />
                            <Button color="red" variant="light" onClick={() => removeItem(idx)} size="xs">Remove</Button>
                        </Group>
                        <Textarea value={it.desc} onChange={(e) => updateItem(idx, { desc: e.currentTarget.value })} minRows={3} autosize placeholder="Description (Markdown allowed)" />
                        <TextInput disabled value={it.language} onChange={(e) => updateItem(idx, { language: e.currentTarget.value })} placeholder="language (e.g. tsx)" />
                        <Textarea value={it.codeLines} onChange={(e) => updateItem(idx, { codeLines: e.currentTarget.value })} minRows={6} autosize placeholder="Code (multiple lines)" />
                    </Stack>
                </Card>
            ))}

            <Group style={{ justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: 8 }}>
                    <Button variant="light" leftSection="+" onClick={addItem}>Add Item</Button>
                    <Button onClick={buildJson}>Build JSON</Button>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <Button variant="outline" onClick={copyToClipboard}>Copy JSON</Button>
                    <Button variant="outline" onClick={downloadJson}>Download JSON</Button>
                </div>
            </Group>

            <div>
                <Title order={5}>Output (valid JSON)</Title>
                <Textarea readOnly value={output} minRows={8} autosize />
            </div>
        </Stack>
    );
};

export default JsonBuilder;
