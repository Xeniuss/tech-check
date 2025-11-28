
import '@mantine/core/styles.css';
import '@mantine/code-highlight/styles.css';
import './App.css'
import { Button, createTheme, MantineProvider, TextInput, Modal, Textarea, Text, Rating, AppShell, NavLink } from '@mantine/core';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { CodeHighlightAdapterProvider, createShikiAdapter } from '@mantine/code-highlight';
import { IconBraces, IconClipboardCheck, IconHeartQuestion } from '@tabler/icons-react';
import { Builder } from './pages/Builder';
import { useLoadContent, type ParsedItem } from './hooks/useLoadContent';
import { Questions } from './pages/Quastions';


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
  const [loadData, setLoadData] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [ratings, setRatings] = useState<number[]>([]);


  const { data, ratings: initialRatings, isLoading, error } = useLoadContent({ url, loadData });


  useEffect(() => {
    setRatings(initialRatings);
  }, [initialRatings]);

  // sidebar link list needs to use router location so define a small child component
  const SidebarLinks = () => {
    const location = useLocation();
    return (
      <>
        <NavLink component={Link} to="/" label="Questions" leftSection={<IconHeartQuestion />} active={location.pathname === '/'} />
        <NavLink component={Link} to="/builder" label="JSON Builder" leftSection={<IconBraces />} active={location.pathname.startsWith('/builder')} />
      </>
    );
  };

  console.log('data', data)

  // total score (sum of ratings) and maximum possible score
  const totalScore = (ratings || []).reduce((s, v) => s + (v ?? 0), 0);
  const maxScore = (data && data.length) ? data.length * 5 : 0;

  // Build a simple copy-ready text summary that includes the total and per-item ratings
  const summaryText = data && data.length ?
    `Total: ${totalScore} / ${maxScore} (${maxScore ? Math.round((totalScore / maxScore) * 100) : 0}%)\n\n` +
    data.map((it: ParsedItem, i: number) => `${i + 1}. ${it.title} — ${ratings[i] ?? 0}`).join('\n')
    : '';

  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <CodeHighlightAdapterProvider adapter={shikiAdapter}>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <AppShell
            padding="sm"
            header={{ height: 60 }}
            navbar={{
              width: 260,
              breakpoint: 'sm',

            }}
          >
            <AppShell.Header>
              <div style={{ display: "flex", alignItems: 'center', justifyContent: "space-between", gap: 16, height: '100%', padding: '0 12px' }}>
                <div style={{ display: "flex", alignItems: 'center' }}>TECHECK</div>
                <div style={{ maxWidth: 600 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <TextInput placeholder="https://example.com/content.json or /questions.json" value={url} onChange={(e) => setUrl(e.currentTarget.value)} style={{ flex: 1 }} />
                    <Button onClick={() => setLoadData(true)} variant='light' loading={isLoading}>Load</Button>
                  </div>
                  {error && <div style={{ color: 'salmon' }}>{error}</div>}
                </div>
              </div>
            </AppShell.Header>

            <AppShell.Navbar>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12 }} className='navigation'>
                <SidebarLinks />
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
              <Routes>
                <Route path="/" element={<Questions data={data} ratings={ratings} setRatings={setRatings} />} />

                <Route path="/builder" element={(
                  <Builder />
                )} />
              </Routes>

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
                    {data && data.length ? (
                      data.map((it: ParsedItem, i: number) => (
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
        </BrowserRouter>

      </CodeHighlightAdapterProvider>
    </MantineProvider>
  );
}

export default App;
