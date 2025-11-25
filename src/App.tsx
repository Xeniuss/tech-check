
import '@mantine/core/styles.css';
import '@mantine/code-highlight/styles.css';
import './App.css'
import { Button, createTheme, MantineProvider, TextInput, Modal, Textarea, Text, Rating, AppShell, Grid } from '@mantine/core';
import { Question } from './components/question/Question';
import JsonBuilder from './components/JsonBuilder';
import Logo from './assets/logo.svg';
import { useState, useEffect } from 'react';
import { CodeHighlightAdapterProvider, createShikiAdapter } from '@mantine/code-highlight';
import { IconClipboardCheck } from '@tabler/icons-react';

type ParsedItem = {
  title: string;
  desc: string;
  codeblock?: { language?: string; code: string };
};

// Shiki requires async code to load the highlighter
async function loadShiki() {
  const { createHighlighter } = await import('shiki');
  const shiki = await createHighlighter({
    langs: ['tsx', 'scss', 'html', 'bash', 'json'],
    // You can load supported themes here
    themes: [],
  });

  return shiki;
}

const shikiAdapter = createShikiAdapter(loadShiki);

const theme = createTheme({
  fontFamily: 'Open Sans, sans-serif',
  primaryColor: "violet",
});
function App() {
  const [url, setUrl] = useState(localStorage.getItem('contentUrl') || '');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [route, setRoute] = useState<'questions' | 'builder'>('questions');
  const [ratings, setRatings] = useState<number[]>([]);
  const [summaryOpen, setSummaryOpen] = useState(false);

  useEffect(() => {
    // placeholder for any init logic
  }, []);

  const DEFAULT_URL = '/questions.json';

  const loadContent = async () => {
    const fetchUrl = (url && url.trim()) ? url.trim() : DEFAULT_URL;
    setLoading(true); setError(null); setData(null);
    try {
      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const contentType = res.headers.get('content-type') || '';
      let items: ParsedItem[] = [];

      if (fetchUrl.toLowerCase().endsWith('.json') || contentType.includes('application/json')) {
        // Prefer JSON format: expect an array of questions or object with items/questions
        const json = await res.json();
        const arr = Array.isArray(json) ? json : (json.items || json.questions || []);
        items = (arr || []).map((it: any) => {
          // Accept code as either a string or an array of lines for easier editing.
          let codeVal = it.codeblock?.code ?? it.code ?? (it.codeblock ?? undefined);
          if (Array.isArray(codeVal)) codeVal = codeVal.join('\n');
          // if codeblock is present as an object with language + code array/string
          const codeblock = codeVal ? { language: it.codeblock?.language || it.language || undefined, code: codeVal } : undefined;
          return {
            title: it.title || it.name || 'Question',
            desc: it.desc || it.description || it.body || '',
            codeblock,
          } as ParsedItem;
        });
      } else {
        // Fallback: treat as Markdown - split by top-level headings
        const text = await res.text();
        const parts = text.split(/(^|\n)#\s+/m).filter(Boolean).map(p => p.replace(/^\n/, ''));
        // parts may include stray content; map headings to items
        const mapped: ParsedItem[] = [];
        for (const p of parts) {
          const lines = p.split('\n');
          const title = lines[0].trim();
          const rest = lines.slice(1).join('\n').trim();
          const codeMatch = /```(\w*)\n([\s\S]*?)```/.exec(rest);
          const codeblock = codeMatch ? { language: codeMatch[1] || undefined, code: codeMatch[2].trim() } : undefined;
          const desc = rest.replace(/```[\s\S]*?```/g, '').trim();
          mapped.push({ title, desc, codeblock });
        }
        items = mapped;
      }

      console.log('parsed items count:', items.length, items.map(i => i.title));
      setData({ items });
      // initialize ratings for loaded items (0 = failed)
      setRatings(items.map(() => 0));
      localStorage.setItem('contentUrl', fetchUrl);
    } catch (e: any) {
      setError(e.message || 'Fetch failed');
    } finally {
      setLoading(false);
    }
  };

  // total score (sum of ratings) and maximum possible score
  const totalScore = (ratings || []).reduce((s, v) => s + (v ?? 0), 0);
  const maxScore = (data && data.items && data.items.length) ? data.items.length * 5 : 0;

  // Build a simple copy-ready text summary that includes the total and per-item ratings
  const summaryText = data && data.items && data.items.length ?
    `Total: ${totalScore} / ${maxScore} (${maxScore ? Math.round((totalScore / maxScore) * 100) : 0}%)\n\n` +
    data.items.map((it: ParsedItem, i: number) => `${i + 1}. ${it.title} — ${ratings[i] ?? 0}`).join('\n')
    : '';

  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <CodeHighlightAdapterProvider adapter={shikiAdapter}>
        <AppShell
          padding="sm"
          header={{ height: 60 }}
          navbar={{
            width: 260,
            breakpoint: 'sm',

          }}
        >
          <AppShell.Header>
            <div style={{ display: "flex", alignItems: 'center', justifyContent: "space-between", gap: 16 }}>
              <div style={{ height: 50 }}><Logo /></div>
              <div style={{ maxWidth: 600 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <TextInput placeholder="https://example.com/content.json or /questions.json" value={url} onChange={(e) => setUrl(e.currentTarget.value)} style={{ flex: 1 }} />
                  <Button onClick={loadContent} variant='light' loading={loading}>Load</Button>
                </div>
                {error && <div style={{ color: 'salmon' }}>{error}</div>}
              </div>
            </div>
          </AppShell.Header>

          <AppShell.Navbar>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12 }} className='navigation'>
              <Button variant={route === 'questions' ? 'light' : 'transparent'} onClick={() => setRoute('questions')}>Questions</Button>
              <Button variant={route === 'builder' ? 'light' : 'transparent'} onClick={() => setRoute('builder')}>Builder</Button>
            </div>
            <div style={{ marginTop: 'auto', padding: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--holo-muted)' }}>Total</div>
              <div style={{ fontWeight: 600 }}>{totalScore} / {maxScore}</div>
              <div style={{ fontSize: 12, color: 'var(--holo-muted)' }}>({maxScore ? Math.round((totalScore / maxScore) * 100) : 0}%)</div>
            </div>

            <div style={{ padding: 12 }}>
              <Button fullWidth onClick={() => setSummaryOpen(true)} leftSection={<IconClipboardCheck />}>Summary</Button>
            </div>

          </AppShell.Navbar>

          <AppShell.Main>
            {route === 'questions' ? (
              <Grid justify="flex-start" align="flex-start" maw={800}>
                {
                  data ? (
                    data.items ? (
                      data.items.map((item: ParsedItem, idx: number) => (
                        <Grid.Col span={12} key={idx}>
                          <Question
                            title={item.title}
                            content={item.desc}
                            codeBlock={item.codeblock as any}
                            rating={ratings[idx] ?? 0}
                            onRate={(v) => setRatings((r) => { const copy = [...r]; copy[idx] = v; return copy; })}
                          />
                        </Grid.Col>
                      ))
                    ) : (
                      <Grid.Col span={12} >
                        <Question title="Sample Question" content="This is a sample question content." rating={ratings[0] ?? 0} onRate={(v) => setRatings([v])} />
                      </Grid.Col>
                    )
                  ) : (
                    <Grid.Col span={12} >
                      <Question title="Sample Question" content="This is a sample question content." rating={ratings[0] ?? 0} onRate={(v) => setRatings([v])} />
                    </Grid.Col>
                  )
                }
              </Grid>
            ) : (
              <Grid justify="flex-start" align="flex-start" maw={800} gutter={16}>
                <JsonBuilder />
              </Grid>
            )}

            <Modal opened={summaryOpen} onClose={() => setSummaryOpen(false)} title="Questions Summary" size="lg">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ fontSize: 12, color: 'var(--holo-muted)' }}>Total</div>
                    <div style={{ fontWeight: 600 }}>{totalScore} / {maxScore}</div>
                    <div style={{ fontSize: 12, color: 'var(--holo-muted)' }}>({maxScore ? Math.round((totalScore / maxScore) * 100) : 0}%)</div>
                  </div>
                  <div>
                    <Button onClick={async () => { await navigator.clipboard.writeText(summaryText || ''); }} disabled={!summaryText}>Copy Summary</Button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {data && data.items && data.items.length ? (
                    data.items.map((it: ParsedItem, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <div style={{ flex: 1 }}>
                          <Text size="sm">{it.title}</Text>
                        </div>
                        <div style={{ marginLeft: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Rating value={ratings[i] ?? 0} readOnly />
                          <Text size="xs" color={(ratings[i] ?? 0) === 0 ? 'red' : 'dimmed'}>{ratings[i] ?? 0}</Text>
                        </div>
                      </div>
                    ))
                  ) : (
                    <Text>No questions loaded yet.</Text>
                  )}
                </div>

                <div style={{ marginTop: 8 }}>
                  <Text size="sm" style={{ fontWeight: 500 }}>Copy-ready text</Text>
                  <Textarea readOnly value={summaryText} minRows={6} autosize style={{ marginTop: 6 }} />
                </div>
              </div>
            </Modal>



          </AppShell.Main>
        </AppShell>

      </CodeHighlightAdapterProvider>
    </MantineProvider>
  );
}

export default App;
