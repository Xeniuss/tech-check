import { useCallback, useEffect, useState } from 'react';

export type ParsedItem = {
    title: string;
    desc: string;
    codeblock?: { language?: string; code: string };
};
const DEFAULT_URL = '/tech-check/questions.json';

type LoadContentResult = {
    data: ParsedItem[] | null;
    isLoading: boolean;
    error: string | null;
    ratings: number[];
};

export const useLoadContent = ({ url, loadData }: { url?: string; loadData: boolean }) => {
    const [data, setData] = useState<ParsedItem[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ratings, setRatings] = useState<number[]>([]);

    const fetchAndParse = useCallback(async (fetchUrl: string, signal?: AbortSignal) => {
        try {
            const res = await fetch(fetchUrl, signal ? { signal } : undefined);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const contentType = res.headers.get('content-type') || '';
            let items: ParsedItem[] = [];

            if (fetchUrl.toLowerCase().endsWith('.json') || contentType.includes('application/json')) {
                const json = await res.json();
                const arr = Array.isArray(json) ? json : json.items || json.questions || [];
                items = (arr || []).map((it: any) => {
                    let codeVal = it.codeblock?.code ?? it.code ?? (it.codeblock ?? undefined);
                    if (Array.isArray(codeVal)) codeVal = codeVal.join('\n');
                    const codeblock = codeVal ? { language: it.codeblock?.language || it.language || undefined, code: codeVal } : undefined;
                    return {
                        title: it.title || it.name || 'Question',
                        desc: it.desc || it.description || it.body || '',
                        codeblock,
                    } as ParsedItem;
                });
            } else {
                const text = await res.text();
                const parts = text.split(/(^|\n)#\s+/m).filter(Boolean).map((p) => p.replace(/^\n/, ''));
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

            return { items, error: null } as { items: ParsedItem[]; error: null };
        } catch (e: any) {
            return { items: [] as ParsedItem[], error: e.message || 'Fetch failed' } as { items: ParsedItem[]; error: string };
        }
    }, []);

    const doLoad = useCallback(async (controllerSignal?: AbortSignal) => {
        const fetchUrl = url && url.trim() ? url.trim() : DEFAULT_URL;
        setIsLoading(true);
        setError(null);

        const { items, error: parseError } = await fetchAndParse(fetchUrl, controllerSignal);
        if (parseError) {
            setData(null);
            setRatings([]);
            setError(parseError);
            setIsLoading(false);
            return;
        }

        setData(items);
        setRatings(items.map(() => 0));
        setIsLoading(false);
        localStorage.setItem('contentUrl', fetchUrl);
    }, [fetchAndParse, url]);

    useEffect(() => {
        if (!loadData) return undefined;

        const controller = new AbortController();
        doLoad(controller.signal).catch(() => {
            /* errors handled in doLoad */
        });

        return () => controller.abort();
    }, [doLoad, loadData]);

    return { data, isLoading, error, ratings, refresh: () => doLoad() } as LoadContentResult & { refresh: () => Promise<void> };
};